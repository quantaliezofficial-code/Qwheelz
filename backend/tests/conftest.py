"""
Test fixtures. The single most important line in this file is the first
one: DATABASE_URL is pointed at quantaliez_auto_test *before* anything
under app/ is imported, so the module-level `settings` and `engine`
singletons (app/config.py, app/db.py) are correctly wired to the test
database from the moment they're constructed — no dependency_overrides
gymnastics needed in the FastAPI app itself.
"""

import os
import subprocess
import sys
import uuid
from pathlib import Path

os.environ["DATABASE_URL"] = os.environ.get(
    "TEST_DATABASE_URL",
    "postgresql+asyncpg://postgres:kritika%40123@localhost:5432/quantaliez_auto_test",
)
os.environ["JWT_SECRET_KEY"] = "test-only-secret-do-not-use-in-production"
os.environ["APP_BASE_URL"] = "http://testserver"

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import text

from app.db import AsyncSessionLocal, engine
from app.main import app
from app.models.core import User
from app.modules.auth.security import create_access_token, hash_password

BACKEND_DIR = Path(__file__).resolve().parent.parent

_TABLES_IN_FK_SAFE_TRUNCATE_ORDER = [
    "proposals", "technology_requirements", "company_profiles",
    "enquiry_messages", "vehicle_enquiries", "vehicle_favourites", "listing_features",
    "vehicle_images", "vehicle_documents", "reviews", "reports", "payments",
    "subscriptions", "participant_verifications", "notifications", "audit_logs",
    "refresh_tokens", "login_rate_limits", "vehicle_listings", "vehicle_features",
    "idempotency_keys", "system_configurations", "background_jobs", "users",
]


@pytest.fixture(scope="session", autouse=True)
def _migrate_test_db():
    """Runs the real Alembic migration chain against the test database
    once per test session. If the test database is unavailable, allows
    pure unit tests to proceed without crashing the entire session."""
    try:
        subprocess.run(
            [sys.executable, "-m", "alembic", "upgrade", "head"],
            cwd=str(BACKEND_DIR),
            env=os.environ.copy(),
            check=True,
            capture_output=True,
        )
    except Exception:
        pass
    yield


@pytest.fixture(autouse=True)
async def _clean_tables(request):
    """Function-scoped, runs after every test requiring a live database.
    TRUNCATE ... CASCADE rather than per-test transaction rollback."""
    yield
    if "db" in request.fixturenames or "client" in request.fixturenames:
        try:
            async with engine.begin() as conn:
                await conn.execute(text(f"TRUNCATE {', '.join(_TABLES_IN_FK_SAFE_TRUNCATE_ORDER)} RESTART IDENTITY CASCADE"))
        except Exception:
            pass


@pytest.fixture
async def db():
    async with AsyncSessionLocal() as session:
        yield session


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        yield ac


async def make_user(db, *, role="buyer", participant_type=None, name="Test User", phone=None, email=None, is_verified=False) -> User:
    phone = phone or f"+91{uuid.uuid4().int % 10_000_000_000:010d}"
    user = User(
        name=name, phone=phone, email=email, password_hash=hash_password("Password123!"),
        role=role, seller_type=participant_type, is_verified=is_verified,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


def auth_header(user: User) -> dict:
    return {"Authorization": f"Bearer {create_access_token(user.id, user.role)}"}


@pytest.fixture
def make_user_fn(db):
    async def _make(**kwargs):
        return await make_user(db, **kwargs)

    return _make
