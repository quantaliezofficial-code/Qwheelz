"""
In-app notifications. Domain-agnostic infrastructure, carried over
unchanged in shape from the original design — only the message
templates (listing/enquiry/verification/subscription wording instead of
venue/booking wording) are new. See Notification's docstring in
models/core.py for why this is in-app only.
"""

from __future__ import annotations

import uuid

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.core import Notification


async def create_notification(
    session: AsyncSession,
    user_id: uuid.UUID,
    type: str,
    message: str,
    entity_type: str | None = None,
    entity_id: uuid.UUID | None = None,
) -> Notification:
    notification = Notification(
        user_id=user_id, type=type, message=message, entity_type=entity_type, entity_id=entity_id
    )
    session.add(notification)
    await session.flush()
    return notification


async def list_notifications(session: AsyncSession, user_id: uuid.UUID, unread_only: bool = False) -> list[Notification]:
    stmt = select(Notification).where(Notification.user_id == user_id)
    if unread_only:
        stmt = stmt.where(Notification.read_at.is_(None))
    stmt = stmt.order_by(Notification.created_at.desc()).limit(50)
    result = await session.execute(stmt)
    return list(result.scalars().all())


async def count_unread(session: AsyncSession, user_id: uuid.UUID) -> int:
    result = await session.execute(
        select(func.count()).where(Notification.user_id == user_id, Notification.read_at.is_(None))
    )
    return result.scalar_one()


async def mark_read(session: AsyncSession, notification_id: uuid.UUID, user_id: uuid.UUID) -> None:
    await session.execute(
        update(Notification)
        .where(Notification.id == notification_id, Notification.user_id == user_id)
        .values(read_at=func.now())
    )


async def mark_all_read(session: AsyncSession, user_id: uuid.UUID) -> None:
    await session.execute(
        update(Notification)
        .where(Notification.user_id == user_id, Notification.read_at.is_(None))
        .values(read_at=func.now())
    )
