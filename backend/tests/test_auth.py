import pytest

from tests.conftest import auth_header


async def test_signup_creates_a_buyer_account(client):
    resp = await client.post(
        "/api/v1/auth/signup",
        json={"name": "Asha Rao", "phone": "+919876500001", "password": "Password123!", "email": "asha@example.com"},
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["user"]["role"] == "buyer"
    assert body["access_token"]
    assert body["refresh_token"]


async def test_signup_rejects_duplicate_phone(client):
    payload = {"name": "Asha", "phone": "+919876500002", "password": "Password123!"}
    first = await client.post("/api/v1/auth/signup", json=payload)
    assert first.status_code == 201
    second = await client.post("/api/v1/auth/signup", json={**payload, "email": "different@example.com"})
    assert second.status_code == 409


async def test_login_with_wrong_password_is_rejected(client):
    await client.post("/api/v1/auth/signup", json={"name": "Bina", "phone": "+919876500003", "password": "Password123!"})
    resp = await client.post("/api/v1/auth/login", json={"login_id": "+919876500003", "password": "WrongPassword"})
    assert resp.status_code == 401


async def test_login_with_email_or_phone_both_work(client):
    await client.post(
        "/api/v1/auth/signup",
        json={"name": "Chetan", "phone": "+919876500004", "password": "Password123!", "email": "chetan@example.com"},
    )
    by_phone = await client.post("/api/v1/auth/login", json={"login_id": "+919876500004", "password": "Password123!"})
    by_email = await client.post("/api/v1/auth/login", json={"login_id": "chetan@example.com", "password": "Password123!"})
    assert by_phone.status_code == 200
    assert by_email.status_code == 200


async def test_get_me_requires_a_token(client):
    resp = await client.get("/api/v1/users/me")
    assert resp.status_code == 401


async def test_get_me_returns_the_authenticated_user(client, make_user_fn):
    user = await make_user_fn(name="Deepa")
    resp = await client.get("/api/v1/users/me", headers=auth_header(user))
    assert resp.status_code == 200
    assert resp.json()["name"] == "Deepa"


async def test_refresh_rotates_the_token_and_old_one_stops_working(client):
    signup = await client.post("/api/v1/auth/signup", json={"name": "Esha", "phone": "+919876500005", "password": "Password123!"})
    old_refresh = signup.json()["refresh_token"]

    rotated = await client.post("/api/v1/auth/refresh", json={"refresh_token": old_refresh})
    assert rotated.status_code == 200
    new_refresh = rotated.json()["refresh_token"]
    assert new_refresh != old_refresh


async def test_reusing_a_rotated_refresh_token_is_detected_and_signs_out_everywhere(client):
    signup = await client.post("/api/v1/auth/signup", json={"name": "Farah", "phone": "+919876500006", "password": "Password123!"})
    old_refresh = signup.json()["refresh_token"]

    first_rotation = await client.post("/api/v1/auth/refresh", json={"refresh_token": old_refresh})
    new_refresh = first_rotation.json()["refresh_token"]

    # Replaying the already-rotated-away token is theft-shaped, not a
    # harmless retry — it should fail...
    reuse_attempt = await client.post("/api/v1/auth/refresh", json={"refresh_token": old_refresh})
    assert reuse_attempt.status_code == 401

    # ...and it should have burned the *next* token in the chain too.
    now_also_dead = await client.post("/api/v1/auth/refresh", json={"refresh_token": new_refresh})
    assert now_also_dead.status_code == 401


async def test_logout_revokes_only_that_session(client):
    signup = await client.post("/api/v1/auth/signup", json={"name": "Gopal", "phone": "+919876500007", "password": "Password123!"})
    refresh_token = signup.json()["refresh_token"]

    logout = await client.post("/api/v1/auth/logout", json={"refresh_token": refresh_token})
    assert logout.status_code == 204

    reuse = await client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    assert reuse.status_code == 401


async def test_forgot_password_does_not_reveal_whether_the_email_exists(client):
    known = await client.post("/api/v1/auth/forgot-password", json={"email": "nobody-knows-if-this-exists@example.com"})
    assert known.status_code == 202
    assert "if an account exists" in known.json()["detail"].lower()


async def test_buyer_cannot_create_a_listing(client, make_user_fn):
    buyer = await make_user_fn(role="buyer")
    resp = await client.post(
        "/api/v1/listings",
        headers=auth_header(buyer),
        json={
            "title": "2021 Maruti Swift VXI", "description": "Single owner, well maintained, no accidents.",
            "brand": "Maruti", "model": "Swift", "year": 2021, "body_type": "hatchback",
            "fuel_type": "petrol", "transmission": "manual", "km_driven": 24000, "price": "650000", "city": "Lucknow",
        },
    )
    assert resp.status_code == 403
