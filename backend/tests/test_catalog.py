import pytest

from tests.conftest import auth_header

LISTING_PAYLOAD = {
    "title": "2022 Hyundai Creta SX",
    "description": "Single owner, garage kept, all services done on time at authorised centre.",
    "brand": "Hyundai",
    "model": "Creta",
    "year": 2022,
    "body_type": "suv",
    "fuel_type": "petrol",
    "transmission": "automatic",
    "km_driven": 18000,
    "owner_count": 1,
    "price": "1475000",
    "city": "Lucknow",
    "features": ["Sunroof", "Rear Camera"],
}


async def _make_seller(make_user_fn):
    return await make_user_fn(role="seller", participant_type="individual", is_verified=True)


async def _make_admin(make_user_fn):
    return await make_user_fn(role="admin")


async def test_new_listing_starts_pending_review_and_is_not_publicly_searchable(client, make_user_fn):
    seller = await _make_seller(make_user_fn)
    create = await client.post("/api/v1/listings", headers=auth_header(seller), json=LISTING_PAYLOAD)
    assert create.status_code == 201
    assert create.json()["status"] == "pending_review"

    search = await client.get("/api/v1/listings", params={"brand": "Hyundai"})
    assert search.json()["total"] == 0


async def test_admin_approve_makes_it_searchable(client, make_user_fn):
    seller = await _make_seller(make_user_fn)
    admin = await _make_admin(make_user_fn)
    created = (await client.post("/api/v1/listings", headers=auth_header(seller), json=LISTING_PAYLOAD)).json()

    approve = await client.post(f"/api/v1/admin/listings/{created['id']}/approve", headers=auth_header(admin))
    assert approve.status_code == 200
    assert approve.json()["status"] == "active"

    search = await client.get("/api/v1/listings", params={"brand": "Hyundai", "body_type": "suv"})
    assert search.json()["total"] == 1
    assert search.json()["results"][0]["slug"] == created["slug"]


async def test_admin_reject_sends_it_to_draft_with_a_reason(client, make_user_fn):
    seller = await _make_seller(make_user_fn)
    admin = await _make_admin(make_user_fn)
    created = (await client.post("/api/v1/listings", headers=auth_header(seller), json=LISTING_PAYLOAD)).json()

    reject = await client.post(
        f"/api/v1/admin/listings/{created['id']}/reject", headers=auth_header(admin), json={"reason": "Photos are too blurry to verify condition"}
    )
    assert reject.status_code == 200
    assert reject.json()["status"] == "draft"
    assert "blurry" in reject.json()["rejection_reason"]


async def test_material_edit_on_an_active_listing_sends_it_back_to_review(client, make_user_fn):
    seller = await _make_seller(make_user_fn)
    admin = await _make_admin(make_user_fn)
    created = (await client.post("/api/v1/listings", headers=auth_header(seller), json=LISTING_PAYLOAD)).json()
    await client.post(f"/api/v1/admin/listings/{created['id']}/approve", headers=auth_header(admin))

    update = await client.patch(f"/api/v1/listings/{created['id']}", headers=auth_header(seller), json={"price": "1400000"})
    assert update.status_code == 200
    assert update.json()["status"] == "pending_review"


async def test_a_seller_cannot_edit_someone_elses_listing(client, make_user_fn):
    seller_a = await _make_seller(make_user_fn)
    seller_b = await _make_seller(make_user_fn)
    created = (await client.post("/api/v1/listings", headers=auth_header(seller_a), json=LISTING_PAYLOAD)).json()

    resp = await client.patch(f"/api/v1/listings/{created['id']}", headers=auth_header(seller_b), json={"price": "1000000"})
    assert resp.status_code == 403


async def test_search_filters_by_price_range_and_fuel_type(client, make_user_fn):
    seller = await _make_seller(make_user_fn)
    admin = await _make_admin(make_user_fn)

    cheap_diesel = {**LISTING_PAYLOAD, "title": "2019 Hyundai Creta Diesel", "fuel_type": "diesel", "price": "900000"}
    pricey_petrol = {**LISTING_PAYLOAD, "title": "2023 Hyundai Creta Petrol Top", "price": "1900000"}

    for payload in (cheap_diesel, pricey_petrol):
        created = (await client.post("/api/v1/listings", headers=auth_header(seller), json=payload)).json()
        await client.post(f"/api/v1/admin/listings/{created['id']}/approve", headers=auth_header(admin))

    diesel_only = await client.get("/api/v1/listings", params={"fuel_type": "diesel"})
    assert diesel_only.json()["total"] == 1

    under_1m = await client.get("/api/v1/listings", params={"price_max": 1000000})
    assert under_1m.json()["total"] == 1
    assert under_1m.json()["results"][0]["fuel_type"] == "diesel"


async def test_mark_sold_removes_it_from_active_search(client, make_user_fn):
    seller = await _make_seller(make_user_fn)
    admin = await _make_admin(make_user_fn)
    created = (await client.post("/api/v1/listings", headers=auth_header(seller), json=LISTING_PAYLOAD)).json()
    await client.post(f"/api/v1/admin/listings/{created['id']}/approve", headers=auth_header(admin))

    sold = await client.post(f"/api/v1/listings/{created['id']}/mark-sold", headers=auth_header(seller))
    assert sold.status_code == 200
    assert sold.json()["status"] == "sold"

    search = await client.get("/api/v1/listings", params={"brand": "Hyundai"})
    assert search.json()["total"] == 0


async def test_sold_listing_cannot_be_edited(client, make_user_fn):
    seller = await _make_seller(make_user_fn)
    admin = await _make_admin(make_user_fn)
    created = (await client.post("/api/v1/listings", headers=auth_header(seller), json=LISTING_PAYLOAD)).json()
    await client.post(f"/api/v1/admin/listings/{created['id']}/approve", headers=auth_header(admin))
    await client.post(f"/api/v1/listings/{created['id']}/mark-sold", headers=auth_header(seller))

    resp = await client.patch(f"/api/v1/listings/{created['id']}", headers=auth_header(seller), json={"price": "1"})
    assert resp.status_code == 409


async def test_seller_dashboard_lists_own_listings_with_enquiry_counts(client, make_user_fn):
    seller = await _make_seller(make_user_fn)
    buyer = await make_user_fn(role="buyer")
    admin = await _make_admin(make_user_fn)
    created = (await client.post("/api/v1/listings", headers=auth_header(seller), json=LISTING_PAYLOAD)).json()
    await client.post(f"/api/v1/admin/listings/{created['id']}/approve", headers=auth_header(admin))
    await client.post(f"/api/v1/listings/{created['id']}/enquiries", headers=auth_header(buyer), json={"message": "Is this still available?"})

    mine = await client.get("/api/v1/listings/mine", headers=auth_header(seller))
    assert mine.status_code == 200
    assert len(mine.json()) == 1
    assert mine.json()[0]["enquiry_count"] == 1


async def test_suspend_and_reactivate_listing(client, make_user_fn):
    seller = await _make_seller(make_user_fn)
    admin = await _make_admin(make_user_fn)
    created = (await client.post("/api/v1/listings", headers=auth_header(seller), json=LISTING_PAYLOAD)).json()
    await client.post(f"/api/v1/admin/listings/{created['id']}/approve", headers=auth_header(admin))

    suspend = await client.post(f"/api/v1/admin/listings/{created['id']}/suspend", headers=auth_header(admin), json={"reason": "Reported as a duplicate"})
    assert suspend.status_code == 200
    assert suspend.json()["status"] == "suspended"

    reactivate = await client.post(f"/api/v1/admin/listings/{created['id']}/reactivate", headers=auth_header(admin))
    assert reactivate.status_code == 200
    assert reactivate.json()["status"] == "active"


async def test_create_listing_with_optional_description(client, make_user_fn):
    seller = await _make_seller(make_user_fn)
    payload = dict(LISTING_PAYLOAD)
    payload["title"] = "2023 Tata Nexon EV"
    payload["description"] = None
    create = await client.post("/api/v1/listings", headers=auth_header(seller), json=payload)
    assert create.status_code == 201
    assert create.json()["description"] is None
