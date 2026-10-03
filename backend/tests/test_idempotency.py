import uuid
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import APIRouter, Depends
from app.main import app
from app.modules.idempotency.service import IdempotencyManager

router = APIRouter()

from app.db import get_db

@router.post("/test-idempotency")
async def dummy_endpoint(payload: dict, db: AsyncSession = Depends(get_db)):
    key = payload.get("key")
    existing = await IdempotencyManager.claim_key(
        session=db,
        key=key,
        user_id=None,
        request_path="/test-idempotency",
        payload=payload
    )
    if existing:
        return {"status": "reused"}
    await IdempotencyManager.finalize_key(db, key, 200, {"status": "new"})
    return {"status": "new"}

app.include_router(router)

@pytest.mark.asyncio
async def test_idempotency_key_prevents_duplicate_execution(client: AsyncClient):
    key = str(uuid.uuid4())
    payload = {"key": key, "data": "123"}
    
    # First request
    res1 = await client.post("/test-idempotency", json=payload)
    assert res1.json()["status"] == "new"
    
    # Second request with same key
    res2 = await client.post("/test-idempotency", json=payload)
    assert res2.json()["status"] == "reused"

    # Different key
    payload2 = {"key": str(uuid.uuid4()), "data": "123"}
    res3 = await client.post("/test-idempotency", json=payload2)
    assert res3.json()["status"] == "new"
