from __future__ import annotations

import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.core import AuditLog

async def log_audit_event(
    session: AsyncSession,
    action: str,
    entity_type: str,
    entity_id: uuid.UUID | None = None,
    actor_id: uuid.UUID | None = None,
    extra_data: dict | None = None,
) -> AuditLog:
    """Universally records sensitive mutations."""
    log = AuditLog(
        actor_id=actor_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        extra_data=extra_data,
    )
    session.add(log)
    return log
