import uuid
from datetime import datetime, timezone, timedelta
import pytest
from httpx import AsyncClient
from app.models.core import VehicleListing
from tests.conftest import auth_header

@pytest.fixture
async def sample_seller(make_user_fn):
    return await make_user_fn(name="Test Seller", role="seller", phone="+919876543210", email="seller@example.com")

@pytest.fixture
async def sample_buyer(make_user_fn):
    return await make_user_fn(name="Test Buyer", role="buyer", phone="+919876543211", email="buyer@example.com")

@pytest.fixture
async def sample_listing(db, sample_seller):
    listing = VehicleListing(
        seller_id=sample_seller.id,
        title="2022 Honda City ZX",
        slug="2022-honda-city-zx-test",
        brand="Honda",
        model="City",
        year=2022,
        body_type="sedan",
        fuel_type="petrol",
        transmission="manual",
        km_driven=15000,
        price=1150000,
        city="Mumbai",
        status="active",
    )
    db.add(listing)
    await db.commit()
    await db.refresh(listing)
    return listing

@pytest.mark.asyncio
async def test_appointment_lifecycle(client: AsyncClient, sample_seller, sample_buyer, sample_listing):
    buyer_headers = auth_header(sample_buyer)
    seller_headers = auth_header(sample_seller)

    # 1. Buyer books test drive appointment
    sched_time = (datetime.now(timezone.utc) + timedelta(days=2)).isoformat()
    res = await client.post(
        "/api/v1/appointments",
        headers=buyer_headers,
        json={
            "listing_id": str(sample_listing.id),
            "appointment_type": "test_drive",
            "scheduled_at": sched_time,
            "time_slot": "10:00 AM - 12:00 PM",
            "notes": "Looking forward to test drive."
        }
    )
    assert res.status_code == 201
    data = res.json()
    appt_id = data["id"]
    assert data["status"] == "requested"
    assert data["appointment_type"] == "test_drive"
    assert data["buyer_name"] == sample_buyer.name

    # 2. Seller views appointments
    res_seller = await client.get("/api/v1/appointments", headers=seller_headers)
    assert res_seller.status_code == 200
    appts = res_seller.json()
    assert len(appts) >= 1
    assert any(a["id"] == appt_id for a in appts)

    # 3. Seller confirms appointment
    res_confirm = await client.patch(
        f"/api/v1/appointments/{appt_id}/status",
        headers=seller_headers,
        json={"status": "confirmed", "notes": "Confirmed! See you at showroom."}
    )
    assert res_confirm.status_code == 200
    assert res_confirm.json()["status"] == "confirmed"

    # 4. Buyer cancels appointment
    res_cancel = await client.patch(
        f"/api/v1/appointments/{appt_id}/status",
        headers=buyer_headers,
        json={"status": "cancelled", "notes": "Need to reschedule later."}
    )
    assert res_cancel.status_code == 200
    assert res_cancel.json()["status"] == "cancelled"

@pytest.mark.asyncio
async def test_vehicle_offer_lifecycle(client: AsyncClient, sample_seller, sample_buyer, sample_listing):
    buyer_headers = auth_header(sample_buyer)
    seller_headers = auth_header(sample_seller)

    # 1. Buyer makes an offer
    res = await client.post(
        "/api/v1/offers",
        headers=buyer_headers,
        json={
            "listing_id": str(sample_listing.id),
            "offer_amount": 1050000,
            "message": "Ready to close deal this weekend."
        }
    )
    assert res.status_code == 201
    offer = res.json()
    offer_id = offer["id"]
    assert offer["status"] == "submitted"
    assert float(offer["offer_amount"]) == 1050000.0

    # 2. Seller views offers
    res_list = await client.get("/api/v1/offers", headers=seller_headers)
    assert res_list.status_code == 200
    assert len(res_list.json()) >= 1

    # 3. Seller counters offer
    res_counter = await client.post(
        f"/api/v1/offers/{offer_id}/counter",
        headers=seller_headers,
        json={"counter_amount": 1100000, "message": "Best I can do is 11 Lakhs."}
    )
    assert res_counter.status_code == 200
    assert res_counter.json()["status"] == "countered"
    assert float(res_counter.json()["counter_amount"]) == 1100000.0

    # 4. Seller accepts offer
    res_accept = await client.post(f"/api/v1/offers/{offer_id}/accept", headers=seller_headers)
    assert res_accept.status_code == 200
    assert res_accept.json()["status"] == "accepted"

@pytest.mark.asyncio
async def test_support_ticket_lifecycle(client: AsyncClient, sample_buyer, sample_listing):
    buyer_headers = auth_header(sample_buyer)

    # 1. Create support ticket with vehicle context
    res = await client.post(
        "/api/v1/support/tickets",
        headers=buyer_headers,
        json={
            "subject": "Question about RC Transfer",
            "category": "vehicle",
            "message": "Does QWheelz assist with inter-state RC transfer?",
            "listing_id": str(sample_listing.id),
        }
    )
    assert res.status_code == 201
    ticket = res.json()
    ticket_id = ticket["id"]
    assert ticket["status"] == "open"
    assert ticket["listing_title"] == sample_listing.title
    assert len(ticket["messages"]) == 1

    # 2. Get ticket details
    res_get = await client.get(f"/api/v1/support/tickets/{ticket_id}", headers=buyer_headers)
    assert res_get.status_code == 200
    assert res_get.json()["id"] == ticket_id

    # 3. Add message to ticket
    res_msg = await client.post(
        f"/api/v1/support/tickets/{ticket_id}/messages",
        headers=buyer_headers,
        json={"content": "Also wondering about NOC requirements."}
    )
    assert res_msg.status_code == 201
    assert res_msg.json()["content"] == "Also wondering about NOC requirements."

@pytest.mark.asyncio
async def test_saved_searches(client: AsyncClient, sample_buyer):
    buyer_headers = auth_header(sample_buyer)

    # 1. Create saved search
    res = await client.post(
        "/api/v1/saved-searches",
        headers=buyer_headers,
        json={"name": "Mumbai SUVs under 15L", "filters": {"city": "Mumbai", "body_type": "suv", "price_max": 1500000}}
    )
    assert res.status_code == 200
    search_id = res.json()["id"]

    # 2. List saved searches
    res_list = await client.get("/api/v1/saved-searches", headers=buyer_headers)
    assert res_list.status_code == 200
    assert any(s["id"] == search_id for s in res_list.json())

    # 3. Delete saved search
    res_del = await client.delete(f"/api/v1/saved-searches/{search_id}", headers=buyer_headers)
    assert res_del.status_code == 204
