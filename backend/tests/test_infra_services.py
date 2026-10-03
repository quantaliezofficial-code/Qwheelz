import pytest
import uuid
from app.modules.audit.service import log_audit_event
from app.modules.config.service import get_config, set_config
from app.modules.jobs.service import enqueue_job
from app.models.core import AuditLog, SystemConfiguration, BackgroundJob

@pytest.mark.asyncio
async def test_log_audit_event(db, make_user_fn):
    user = await make_user_fn(role="admin")
    log = await log_audit_event(
        db,
        action="test_action",
        entity_type="listing",
        entity_id=uuid.uuid4(),
        actor_id=user.id,
        extra_data={"reason": "audit test"}
    )
    assert log is not None
    assert log.action == "test_action"
    assert log.entity_type == "listing"
    assert log.actor_id == user.id
    assert log.extra_data == {"reason": "audit test"}

@pytest.mark.asyncio
async def test_system_config_get_and_set(db):
    # Fallback to default when key not present
    val = await get_config(db, "non_existent_key", default="default_val")
    assert val == "default_val"

    # Set new config
    cfg = await set_config(db, "maintenance_mode", True, description="Maintenance mode toggle")
    assert cfg.key == "maintenance_mode"
    assert cfg.value == {"value": True}
    assert cfg.description == "Maintenance mode toggle"

    # Get config returns stored value
    retrieved = await get_config(db, "maintenance_mode")
    assert retrieved is True

    # Update existing config
    updated = await set_config(db, "maintenance_mode", False)
    assert updated.value == {"value": False}
    retrieved2 = await get_config(db, "maintenance_mode")
    assert retrieved2 is False

@pytest.mark.asyncio
async def test_enqueue_background_job(db):
    job = await enqueue_job(db, "billing_sweep", payload={"interval": 30})
    assert job is not None
    assert job.job_type == "billing_sweep"
    assert job.payload == {"interval": 30}
