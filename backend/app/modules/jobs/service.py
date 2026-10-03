from __future__ import annotations

import uuid
from typing import Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.core import BackgroundJob

async def enqueue_job(
    session: AsyncSession,
    job_type: str,
    payload: dict[str, Any] | None = None,
) -> BackgroundJob:
    """Enqueues a background job for async processing."""
    job = BackgroundJob(
        job_type=job_type,
        payload=payload,
    )
    session.add(job)
    return job
