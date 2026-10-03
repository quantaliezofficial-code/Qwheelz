from __future__ import annotations

from typing import Any
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.core import SystemConfiguration

async def get_config(session: AsyncSession, key: str, default: Any = None) -> Any:
    """Retrieves a system configuration value."""
    result = await session.scalar(select(SystemConfiguration).where(SystemConfiguration.key == key))
    if result:
        return result.value.get("value")
    return default

async def set_config(session: AsyncSession, key: str, value: Any, description: str | None = None) -> SystemConfiguration:
    """Sets a system configuration value."""
    existing = await session.scalar(select(SystemConfiguration).where(SystemConfiguration.key == key))
    if existing:
        existing.value = {"value": value}
        if description:
            existing.description = description
        await session.flush()
        return existing
        
    new_config = SystemConfiguration(
        key=key,
        value={"value": value},
        description=description,
    )
    session.add(new_config)
    await session.flush()
    return new_config
