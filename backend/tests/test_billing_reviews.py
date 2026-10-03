import pytest

from tests.conftest import auth_header


async def test_seller_verification_submit_and_admin_approve_grants_seller_role(client, make_user_fn):
    buyer = await make_user_fn(role="buyer")
    admin = await make_user_fn(role="admin")

    submit = await client.post(
        "/api/v1/seller/verification",
        headers=auth_header(buyer),
        json={
            "participant_type": "individual", "identification_type": "Aadhaar", "identification_number": "1234-5678-9012",
            "document_url": "http://testserver/uploads/fake-id.pdf",
        },
    )
    assert submit.status_code == 201
    verification_id = submit.json()["id"]

    approve = await client.post(f"/api/v1/admin/seller-verifications/{verification_id}/approve", headers=auth_header(admin))
    assert approve.status_code == 200

    me = await client.get("/api/v1/users/me", headers=auth_header(buyer))
    assert me.json()["role"] == "seller"
    assert me.json()["seller_type"] == "individual"


async def test_a_second_pending_verification_is_rejected(client, make_user_fn):
    buyer = await make_user_fn(role="buyer")
    payload = {
        "participant_type": "individual", "identification_type": "PAN", "identification_number": "ABCDE1234F",
        "document_url": "http://testserver/uploads/id.pdf",
    }
    first = await client.post("/api/v1/seller/verification", headers=auth_header(buyer), json=payload)
    assert first.status_code == 201
    second = await client.post("/api/v1/seller/verification", headers=auth_header(buyer), json=payload)
    assert second.status_code == 409


async def test_rejected_verification_can_be_resubmitted(client, make_user_fn):
    buyer = await make_user_fn(role="buyer")
    admin = await make_user_fn(role="admin")
    payload = {
        "participant_type": "individual", "identification_type": "PAN", "identification_number": "ABCDE1234F",
        "document_url": "http://testserver/uploads/id.pdf",
    }
    submitted = (await client.post("/api/v1/seller/verification", headers=auth_header(buyer), json=payload)).json()
    await client.post(
        f"/api/v1/admin/seller-verifications/{submitted['id']}/reject", headers=auth_header(admin), json={"reason": "Document is unreadable"}
    )

    resubmit = await client.post("/api/v1/seller/verification", headers=auth_header(buyer), json=payload)
    assert resubmit.status_code == 201
    assert resubmit.json()["status"] == "pending"
    assert resubmit.json()["id"] == submitted["id"]


async def test_dealer_plan_rejected_for_individual_seller(client, make_user_fn):
    seller = await make_user_fn(role="seller", participant_type="individual", is_verified=True)
    resp = await client.post("/api/v1/seller/subscribe", headers=auth_header(seller), json={"plan": "dealer_pro"})
    assert resp.status_code == 403


async def test_subscription_purchase_and_admin_confirmation_activates_it(client, make_user_fn):
    seller = await make_user_fn(role="seller", participant_type="individual", is_verified=True)
    admin = await make_user_fn(role="admin")

    purchase = await client.post("/api/v1/seller/subscribe", headers=auth_header(seller), json={"plan": "individual_premium"})
    assert purchase.status_code == 201
    assert purchase.json()["status"] == "initiated"
    payment_id = purchase.json()["id"]

    confirm = await client.post(f"/api/v1/admin/payments/{payment_id}/confirm", headers=auth_header(admin))
    assert confirm.status_code == 200
    assert confirm.json()["status"] == "success"

    sub = await client.get("/api/v1/seller/subscription", headers=auth_header(seller))
    assert sub.json()["plan"] == "individual_premium"
    assert sub.json()["status"] == "active"


async def test_enterprise_plan_is_not_self_serve(client, make_user_fn):
    seller = await make_user_fn(role="seller", participant_type="dealer", is_verified=True)
    resp = await client.post("/api/v1/seller/subscribe", headers=auth_header(seller), json={"plan": "dealer_enterprise"})
    assert resp.status_code == 400


async def test_review_updates_seller_average_rating(client, make_user_fn):
    seller = await make_user_fn(role="seller", participant_type="individual", is_verified=True)
    buyer_1 = await make_user_fn(role="buyer")
    buyer_2 = await make_user_fn(role="buyer")

    await client.post(f"/api/v1/sellers/{seller.id}/reviews", headers=auth_header(buyer_1), json={"rating": 5, "content": "Great, honest seller."})
    await client.post(f"/api/v1/sellers/{seller.id}/reviews", headers=auth_header(buyer_2), json={"rating": 3, "content": "Car was okay."})

    reviews = await client.get(f"/api/v1/sellers/{seller.id}/reviews")
    assert len(reviews.json()) == 2

    me = await client.get("/api/v1/users/me", headers=auth_header(seller))
    assert float(me.json()["avg_rating"]) == 4.0


async def test_cannot_review_yourself(client, make_user_fn):
    seller = await make_user_fn(role="seller", participant_type="individual", is_verified=True)
    resp = await client.post(f"/api/v1/sellers/{seller.id}/reviews", headers=auth_header(seller), json={"rating": 5, "content": "nice"})
    assert resp.status_code == 400


async def test_report_a_listing_and_admin_resolves_it(client, make_user_fn):
    seller = await make_user_fn(role="seller", participant_type="dealer", is_verified=True)
    buyer = await make_user_fn(role="buyer")
    admin = await make_user_fn(role="admin")

    listing_payload = {
        "title": "2020 Tata Nexon XZ", "description": "Reported as a duplicate ad by another dealer nearby.",
        "brand": "Tata", "model": "Nexon", "year": 2020, "body_type": "suv", "fuel_type": "diesel",
        "transmission": "manual", "km_driven": 45000, "price": "800000", "city": "Lucknow",
    }
    listing = (await client.post("/api/v1/listings", headers=auth_header(seller), json=listing_payload)).json()

    report = await client.post(
        "/api/v1/reports", headers=auth_header(buyer),
        json={"entity_type": "listing", "entity_id": listing["id"], "reason": "This looks like a duplicate of another ad"},
    )
    assert report.status_code == 201

    open_reports = await client.get("/api/v1/admin/reports", headers=auth_header(admin), params={"status": "open"})
    assert len(open_reports.json()) == 1

    resolve = await client.post(
        f"/api/v1/admin/reports/{open_reports.json()[0]['id']}/resolve", headers=auth_header(admin), json={"outcome": "resolved"}
    )
    assert resolve.status_code == 200
    assert resolve.json()["status"] == "resolved"
