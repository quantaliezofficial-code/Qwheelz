import pytest

from tests.conftest import auth_header


async def test_non_admin_cannot_reach_admin_routes(client, make_user_fn):
    buyer = await make_user_fn(role="buyer")
    resp = await client.get("/api/v1/admin/overview", headers=auth_header(buyer))
    assert resp.status_code == 403


async def test_overview_counts_reflect_platform_state(client, make_user_fn):
    admin = await make_user_fn(role="admin")
    seller = await make_user_fn(role="seller", participant_type="individual", is_verified=True)

    listing_payload = {
        "title": "2021 Mahindra XUV300 W8", "description": "Well maintained family SUV, no major repairs.",
        "brand": "Mahindra", "model": "XUV300", "year": 2021, "body_type": "suv", "fuel_type": "diesel",
        "transmission": "manual", "km_driven": 28000, "price": "950000", "city": "Lucknow",
    }
    created = (await client.post("/api/v1/listings", headers=auth_header(seller), json=listing_payload)).json()

    before = await client.get("/api/v1/admin/overview", headers=auth_header(admin))
    assert before.json()["listings_pending_review"] == 1
    assert before.json()["listings_active"] == 0

    await client.post(f"/api/v1/admin/listings/{created['id']}/approve", headers=auth_header(admin))

    after = await client.get("/api/v1/admin/overview", headers=auth_header(admin))
    assert after.json()["listings_pending_review"] == 0
    assert after.json()["listings_active"] == 1
    assert after.json()["total_users"] >= 2


async def test_suspended_user_cannot_log_in(client, make_user_fn):
    admin = await make_user_fn(role="admin")
    seller = await make_user_fn(role="seller", participant_type="individual", is_verified=True, phone="+919876512345")

    suspend = await client.post(
        f"/api/v1/admin/users/{seller.id}/suspend", headers=auth_header(admin), json={"reason": "Multiple buyer complaints"}
    )
    assert suspend.status_code == 200

    login = await client.post("/api/v1/auth/login", json={"login_id": "+919876512345", "password": "Password123!"})
    assert login.status_code == 401

    reactivate = await client.post(f"/api/v1/admin/users/{seller.id}/reactivate", headers=auth_header(admin))
    assert reactivate.status_code == 200

    login_again = await client.post("/api/v1/auth/login", json={"login_id": "+919876512345", "password": "Password123!"})
    assert login_again.status_code == 200


async def test_admin_cannot_suspend_another_admin(client, make_user_fn):
    admin_a = await make_user_fn(role="admin")
    admin_b = await make_user_fn(role="admin")
    resp = await client.post(f"/api/v1/admin/users/{admin_b.id}/suspend", headers=auth_header(admin_a), json={"reason": "test"})
    assert resp.status_code == 400


async def test_moderation_actions_are_captured_in_the_audit_log(client, make_user_fn):
    admin = await make_user_fn(role="admin")
    seller = await make_user_fn(role="seller", participant_type="individual", is_verified=True)
    listing_payload = {
        "title": "2020 Kia Seltos HTX", "description": "Clean title, single owner, dealer serviced throughout.",
        "brand": "Kia", "model": "Seltos", "year": 2020, "body_type": "suv", "fuel_type": "petrol",
        "transmission": "automatic", "km_driven": 40000, "price": "1150000", "city": "Lucknow",
    }
    created = (await client.post("/api/v1/listings", headers=auth_header(seller), json=listing_payload)).json()
    await client.post(f"/api/v1/admin/listings/{created['id']}/approve", headers=auth_header(admin))

    log = await client.get("/api/v1/admin/audit-log", headers=auth_header(admin), params={"entity_type": "vehicle_listing"})
    assert log.status_code == 200
    actions = [row["action"] for row in log.json()]
    assert "listing_approved" in actions


async def test_health_endpoints(client, make_user_fn):
    public = await client.get("/api/v1/health")
    assert public.status_code == 200

    admin = await make_user_fn(role="admin")
    admin_health = await client.get("/api/v1/admin/health", headers=auth_header(admin))
    assert admin_health.status_code == 200
    assert admin_health.json()["status"] == "ok"
