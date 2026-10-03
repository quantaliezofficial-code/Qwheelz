from __future__ import annotations

import hashlib
import json
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.core import IdempotencyKey

class IdempotencyManager:
    @staticmethod
    def _hash_payload(payload: dict | None) -> str:
        if not payload:
            return ""
        encoded = json.dumps(payload, sort_keys=True).encode("utf-8")
        return hashlib.sha256(encoded).hexdigest()

    @staticmethod
    async def claim_key(
        session: AsyncSession,
        key: str,
        user_id: uuid.UUID | None,
        request_path: str,
        payload: dict | None,
        ttl_seconds: int = 86400,
    ) -> IdempotencyKey | None:
        """
        Attempts to claim an idempotency key.
        Returns the existing key if found, or None if successfully claimed (created).
        """
        now = datetime.now(timezone.utc)
        params_hash = IdempotencyManager._hash_payload(payload)

        # We must use an explicit begin_nested() (savepoint) so that a UniqueViolation
        # doesn't abort the outer transaction. However, SQLAlchemy 2.0 with async requires
        # careful handling of nested transactions.
        
        # Check if exists first to avoid exception overhead in the happy path
        existing = await session.scalar(select(IdempotencyKey).where(IdempotencyKey.key == key))
        
        if existing:
            if existing.request_path != request_path or existing.request_params_hash != params_hash:
                raise HTTPException(status_code=400, detail="Idempotency key reused with different parameters")
            if existing.expires_at < now:
                # Key expired, we can take it over
                await session.execute(
                    update(IdempotencyKey)
                    .where(IdempotencyKey.key == key)
                    .values(
                        user_id=user_id,
                        request_path=request_path,
                        request_params_hash=params_hash,
                        status="in_progress",
                        response_status_code=None,
                        response_body=None,
                        locked_at=now,
                        expires_at=now + timedelta(seconds=ttl_seconds),
                    )
                )
                return None
            return existing
            
        new_key = IdempotencyKey(
            key=key,
            user_id=user_id,
            request_path=request_path,
            request_params_hash=params_hash,
            status="in_progress",
            locked_at=now,
            expires_at=now + timedelta(seconds=ttl_seconds),
        )
        session.add(new_key)
        try:
            await session.flush()
            return None
        except Exception:
            # If there's a race and someone else inserted it, we rollback and fetch
            await session.rollback()
            existing = await session.scalar(select(IdempotencyKey).where(IdempotencyKey.key == key))
            if existing:
                return existing
            raise

    @staticmethod
    async def finalize_key(
        session: AsyncSession,
        key: str,
        status_code: int,
        response_body: dict,
    ) -> None:
        await session.execute(
            update(IdempotencyKey)
            .where(IdempotencyKey.key == key)
            .values(
                status="completed",
                response_status_code=status_code,
                response_body=response_body,
            )
        )
