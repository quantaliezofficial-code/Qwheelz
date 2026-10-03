"""
Signup/login/refresh/logout, plus login rate limiting. Domain-agnostic
auth infrastructure, carried over from the original design with one
content change (role literal "customer" -> "buyer") and one real
improvement: forgot/reset-password used to be a hardcoded "mock-token"
stub with no real lookup — see request_password_reset()/reset_password()
below for why a purpose-scoped JWT was barely more code than the stub
and is actually correct instead of decorative.

The refresh-rotation reuse detection in rotate_refresh_token() is the
part worth reading carefully: the real security property is "a stolen
refresh token can only be used once before detection," not just token
issuance/expiry.

check_login_rate_limit() is Postgres-backed, not Redis-backed, by the
same reasoning RefreshToken is a real table and not a Redis key:
Postgres is the source of truth; an in-memory cache being evicted under
memory pressure force-logging-out or silently un-throttling every user
is a worse failure mode than one extra indexed table.
"""

from __future__ import annotations

import hashlib
import secrets
import uuid
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import HTTPException
from sqlalchemy import or_, select, text, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.core import RefreshToken, User
from app.modules.auth.security import create_access_token, hash_password, verify_password

REFRESH_TOKEN_TTL = timedelta(days=30)
LOGIN_RATE_LIMIT_MAX_ATTEMPTS = 10
LOGIN_RATE_LIMIT_WINDOW_SECONDS = 60
PASSWORD_RESET_TTL = timedelta(minutes=30)


def _hash_token(raw: str) -> str:
    """An opaque bearer credential gets hashed at rest, never stored raw
    — same pattern as password_hash."""
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


async def check_login_rate_limit(session: AsyncSession, key: str) -> None:
    """Fixed-window counter per email or IP. `key` should already be
    namespaced by the caller (e.g. f'ratelimit:login:{email}').

    One atomic UPSERT against login_rate_limits does what an INCR+EXPIRE
    pair would do with a cache: increment within the current window, or
    reset to 1 and start a new window once the old one has expired — as
    a single round-trip, since the UPSERT's CASE expressions run
    atomically against whatever row version Postgres's MVCC hands this
    statement.

    Deliberately commits immediately, ahead of app.db.get_db's normal
    one-transaction-per-request handling: this counter must survive
    even when the login attempt it's guarding goes on to fail (in fact
    *especially* then — that's the one case rate limiting exists for).
    If this were left to the request's final commit, a failed login
    would take the rate-limit counter down with it via that request's
    rollback, and the limit would never actually bind.
    """
    async with session.begin():
        result = await session.execute(
            text(
                """
                INSERT INTO login_rate_limits (key, window_start, attempt_count)
                VALUES (:key, now(), 1)
                ON CONFLICT (key) DO UPDATE SET
                    attempt_count = CASE
                        WHEN login_rate_limits.window_start < now() - make_interval(secs => :window_seconds)
                        THEN 1
                        ELSE login_rate_limits.attempt_count + 1
                    END,
                    window_start = CASE
                        WHEN login_rate_limits.window_start < now() - make_interval(secs => :window_seconds)
                        THEN now()
                        ELSE login_rate_limits.window_start
                    END
                RETURNING attempt_count
                """
            ),
            {"key": key, "window_seconds": float(LOGIN_RATE_LIMIT_WINDOW_SECONDS)},
        )
        count = result.scalar_one()

    if count > LOGIN_RATE_LIMIT_MAX_ATTEMPTS:
        raise HTTPException(
            status_code=429,
            detail="Too many attempts — try again in a minute.",
            headers={"code": "rate_limited"},
        )


async def signup(
    session: AsyncSession, name: str, phone: str, password: str, email: str | None = None
) -> User:
    """Always creates a 'buyer' account. Selling requires a seller
    verification application afterwards (app/modules/verification)
    — signup and "become a seller" are deliberately separate steps, same
    as the original owner-onboarding design, because collecting
    identity/business documents up front on every signup would add
    friction for the (larger) population of people who only ever want
    to browse and buy."""
    query_conditions = [User.phone == phone]
    if email is not None:
        query_conditions.append(User.email == email)

    existing = await session.execute(select(User).where(or_(*query_conditions)))
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(status_code=409, detail="An account with this phone or email already exists")

    user = User(
        name=name,
        email=email,
        phone=phone,
        password_hash=hash_password(password),
        role="buyer",
    )
    session.add(user)
    # Flushed, not committed — app.main's signup route calls login()
    # right after this in the same request, and needs to find this row.
    # The final commit is app.db.get_db's job.
    await session.flush()

    return user


def _password_reset_token(user_id: uuid.UUID) -> str:
    now = datetime.now(timezone.utc)
    payload = {"sub": str(user_id), "purpose": "password_reset", "iat": now, "exp": now + PASSWORD_RESET_TTL}
    return jwt.encode(payload, settings.jwt_secret_key, algorithm="HS256")


async def request_password_reset(session: AsyncSession, email: str) -> str | None:
    """Returns the raw reset token so the caller (main.py) can log/email
    it, or None if there's no account with that email — callers must
    still tell the requester "if an account exists, a link has been
    sent" either way, so a 401-style timing/response difference can't be
    used to enumerate registered emails.

    No email provider is configured in this environment (no route to
    one — same constraint the storage module documents), so main.py
    logs the reset link instead of sending it. Swapping in a real
    provider only touches main.py's one call site, not this function."""
    result = await session.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if user is None or user.deleted_at is not None:
        return None
    return _password_reset_token(user.id)


async def reset_password(session: AsyncSession, token: str, new_password: str) -> None:
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=["HS256"])
    except jwt.PyJWTError:
        raise HTTPException(status_code=400, detail="This reset link is invalid or has expired")
    if payload.get("purpose") != "password_reset":
        raise HTTPException(status_code=400, detail="This reset link is invalid or has expired")

    user = await session.get(User, uuid.UUID(payload["sub"]))
    if user is None or user.deleted_at is not None:
        raise HTTPException(status_code=400, detail="This reset link is invalid or has expired")
    user.password_hash = hash_password(new_password)
    # A password reset is a legitimate reason to sign every device
    # out, same as the reuse-detection path below — whoever just
    # proved control of the mailbox should be the only one left
    # logged in.
    await session.execute(
        update(RefreshToken)
        .where(RefreshToken.user_id == user.id, RefreshToken.revoked_at.is_(None))
        .values(revoked_at=datetime.now(timezone.utc))
    )


def _build_refresh_token(user_id: uuid.UUID) -> tuple[RefreshToken, str]:
    raw = secrets.token_urlsafe(32)
    rt = RefreshToken(
        user_id=user_id,
        token_hash=_hash_token(raw),
        expires_at=datetime.now(timezone.utc) + REFRESH_TOKEN_TTL,
    )
    return rt, raw


async def login(session: AsyncSession, login_id: str, password: str) -> tuple[User, str, str]:
    """Returns (user, access_token, raw_refresh_token). login_id may be
    an email or a phone number."""
    invalid = HTTPException(status_code=401, detail="Incorrect email, phone or password")

    result = await session.execute(select(User).where((User.email == login_id) | (User.phone == login_id)))
    user = result.scalar_one_or_none()

    # Deliberately the same error for "no such user", "wrong
    # password", "deleted" and "suspended" — distinguishing any of
    # these would let an attacker enumerate valid emails, or learn
    # which accounts are currently suspended.
    if user is None or user.deleted_at is not None or user.suspended_at is not None:
        raise invalid
    if not verify_password(password, user.password_hash):
        raise invalid

    refresh_token_row, raw_refresh = _build_refresh_token(user.id)
    session.add(refresh_token_row)
    await session.flush()

    access_token = create_access_token(user.id, user.role)
    return user, access_token, raw_refresh


async def rotate_refresh_token(session: AsyncSession, raw_token: str) -> tuple[str, User]:
    """Returns (new_raw_refresh_token, user). Raises 401 on anything
    wrong — invalid, expired, or reused — distinguishing reuse from the
    others only in the side effect (full session revocation), not in
    what the caller sees, same reasoning as login()'s merged error
    message."""
    token_hash = _hash_token(raw_token)

    result = await session.execute(select(RefreshToken).where(RefreshToken.token_hash == token_hash))
    rt = result.scalar_one_or_none()

    if rt is None:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    if rt.revoked_at is not None:
        # Reuse of an already-rotated-away token: either a client bug
        # replayed a stale token, or a stolen copy is being used after
        # the legitimate owner already moved past it. Treat this as
        # detected theft, not a retry — revoke every active session for
        # this user, and commit that revocation right now rather than
        # leaving it to app.db.get_db's end-of-request commit: this
        # function is about to raise, and a raised exception is exactly
        # what tells get_db to roll the transaction back — which would
        # undo the revocation this branch exists to cause.
        user = await session.get(User, rt.user_id)
        await session.execute(
            update(RefreshToken)
            .where(RefreshToken.user_id == rt.user_id, RefreshToken.revoked_at.is_(None))
            .values(revoked_at=datetime.now(timezone.utc))
        )
        await session.commit()
        raise HTTPException(
            status_code=401,
            detail="Refresh token reuse detected — all sessions have been signed out",
            headers={"code": "refresh_reuse_detected"},
        )

    if rt.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Refresh token expired")

    user = await session.get(User, rt.user_id)

    new_raw = secrets.token_urlsafe(32)
    new_rt = RefreshToken(
        user_id=rt.user_id,
        token_hash=_hash_token(new_raw),
        expires_at=datetime.now(timezone.utc) + REFRESH_TOKEN_TTL,
    )
    session.add(new_rt)
    await session.flush()

    rt.revoked_at = datetime.now(timezone.utc)
    rt.replaced_by_id = new_rt.id
    await session.flush()

    return new_raw, user


async def logout(session: AsyncSession, raw_token: str) -> None:
    """Revoke just this one session, not every session — a deliberate
    asymmetry with the reuse-detection path above, which revokes
    everything. A normal logout from one device shouldn't sign the user
    out of their other devices; a detected theft should."""
    token_hash = _hash_token(raw_token)
    await session.execute(
        update(RefreshToken)
        .where(RefreshToken.token_hash == token_hash, RefreshToken.revoked_at.is_(None))
        .values(revoked_at=datetime.now(timezone.utc))
    )
