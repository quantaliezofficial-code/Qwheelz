from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.config import settings

engine = create_async_engine(settings.database_url, echo=False, pool_pre_ping=True)

AsyncSessionLocal = async_sessionmaker(bind=engine, expire_on_commit=False, autoflush=False)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """One transaction per request, not one per service call. A route
    handler often touches the session before calling into a service
    function (e.g. `user = await db.get(User, current.id)`), which
    triggers SQLAlchemy's autobegin — a *second*, explicit
    `session.begin()` inside a service function would then collide with
    that already-open transaction. So transaction ownership lives here,
    at the outermost scope, once: commit if the request completed
    without raising, roll back if it didn't. Service functions call
    `session.flush()` (not `commit()`) when a later step in the same
    request needs to see their writes — flush without commit keeps
    everything inside this one request-scoped transaction, so a
    same-request failure after a flush still rolls the flushed part
    back too.

    The two exceptions that commit early on purpose — login rate-limit
    counters and refresh-token-reuse revocation, both of which must
    survive even when the request they're part of goes on to fail — are
    documented at their call sites in app/modules/auth/service.py."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
