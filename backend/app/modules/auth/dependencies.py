"""
Every state-changing route is protected by a dependency like
require_role('seller', 'admin'), not just get_current_user — being
logged in and being *the right kind of* logged in are different checks,
and routes must never conflate them (e.g. a buyer account must not be
able to create a listing just because it holds a valid token).
"""

from __future__ import annotations

import uuid

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models.core import User
from app.modules.auth.security import InvalidTokenError, decode_access_token

_bearer_scheme = HTTPBearer(auto_error=False)


class CurrentUser:
    """Lightweight — built from JWT claims, not a full User row, since the
    JWT is already signed proof of identity+role and a DB round-trip on
    every request defeats half the point of using JWTs at all. Routes that
    need the full row (seller business_name, avg_rating, etc.) fetch it
    themselves via get_current_user_row."""

    def __init__(self, id: uuid.UUID, role: str):
        self.id = id
        self.role = role


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_scheme),
) -> CurrentUser:
    if credentials is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = decode_access_token(credentials.credentials)
    except InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return CurrentUser(id=uuid.UUID(payload["sub"]), role=payload["role"])


async def get_current_user_optional(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_scheme),
) -> CurrentUser | None:
    """For routes that are public but behave differently when the caller
    happens to be authenticated (e.g. a listing search that also marks
    which results the caller has already favourited). If a token is
    provided it MUST be valid (a 401 so the frontend can refresh it); if
    none is provided this safely returns None."""
    if credentials is None:
        return None
    try:
        payload = decode_access_token(credentials.credentials)
    except InvalidTokenError:
        return None
    return CurrentUser(id=uuid.UUID(payload["sub"]), role=payload["role"])


def require_role(*allowed_roles: str):
    """Usage: Depends(require_role('seller', 'admin')). A factory, not a
    single dependency, because the allowed-roles set differs per route."""

    async def _dependency(current_user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        if current_user.role not in allowed_roles:
            raise HTTPException(status_code=403, detail="You don't have access to do this")
        return current_user

    return _dependency


async def get_current_user_row(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> User:
    """For the routes that need the full row, not just id+role."""
    result = await db.execute(select(User).where(User.id == current_user.id))
    user = result.scalar_one_or_none()
    if user is None or user.deleted_at is not None:
        raise HTTPException(status_code=401, detail="Account no longer exists")
    if user.suspended_at is not None:
        raise HTTPException(status_code=403, detail="This account has been suspended")
    return user
