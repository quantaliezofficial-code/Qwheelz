import pytest

from tests.conftest import auth_header

LISTING_PAYLOAD = {
    "title": "2022 Honda City ZX",
    "description": "Second owner, highway driven, excellent mileage, recently serviced.",
    "brand": "Honda",
    "model": "City",
    "year": 2022,
    "body_type": "sedan",
    "fuel_type": "petrol",
    "transmission": "cvt",
    "km_driven": 32000,
    "price": "1250000",
    "city": "Lucknow",
}


async def _active_listing(client, make_user_fn):
    seller = await make_user_fn(role="seller", participant_type="individual", is_verified=True)
    admin = await make_user_fn(role="admin")
    created = (await client.post("/api/v1/listings", headers=auth_header(seller), json=LISTING_PAYLOAD)).json()
    await client.post(f"/api/v1/admin/listings/{created['id']}/approve", headers=auth_header(admin))
    return seller, created


async def test_buyer_can_enquire_and_seller_sees_it(client, make_user_fn):
    seller, listing = await _active_listing(client, make_user_fn)
    buyer = await make_user_fn(role="buyer")

    enquiry = await client.post(f"/api/v1/listings/{listing['id']}/enquiries", headers=auth_header(buyer), json={"message": "Is the price negotiable?"})
    assert enquiry.status_code == 201
    assert enquiry.json()["status"] == "new"

    seller_view = await client.get("/api/v1/enquiries", headers=auth_header(seller))
    assert len(seller_view.json()) == 1
    assert seller_view.json()[0]["messages"][0]["content"] == "Is the price negotiable?"


async def test_seller_cannot_enquire_about_their_own_listing(client, make_user_fn):
    seller, listing = await _active_listing(client, make_user_fn)
    resp = await client.post(f"/api/v1/listings/{listing['id']}/enquiries", headers=auth_header(seller), json={"message": "hello?"})
    assert resp.status_code == 400


async def test_a_second_enquiry_from_the_same_buyer_continues_the_same_thread(client, make_user_fn):
    seller, listing = await _active_listing(client, make_user_fn)
    buyer = await make_user_fn(role="buyer")

    first = await client.post(f"/api/v1/listings/{listing['id']}/enquiries", headers=auth_header(buyer), json={"message": "Still available?"})
    second = await client.post(f"/api/v1/listings/{listing['id']}/enquiries", headers=auth_header(buyer), json={"message": "Any update?"})

    assert first.json()["id"] == second.json()["id"]
    assert len(second.json()["messages"]) == 2


async def test_seller_reply_flips_status_to_responded(client, make_user_fn):
    seller, listing = await _active_listing(client, make_user_fn)
    buyer = await make_user_fn(role="buyer")
    enquiry = (await client.post(f"/api/v1/listings/{listing['id']}/enquiries", headers=auth_header(buyer), json={"message": "Hi"})).json()

    reply = await client.post(f"/api/v1/enquiries/{enquiry['id']}/messages", headers=auth_header(seller), json={"content": "Yes it's available!"})
    assert reply.status_code == 201

    refreshed = await client.get(f"/api/v1/enquiries/{enquiry['id']}", headers=auth_header(buyer))
    assert refreshed.json()["status"] == "seller_responded"


async def test_a_stranger_cannot_read_someone_elses_enquiry(client, make_user_fn):
    seller, listing = await _active_listing(client, make_user_fn)
    buyer = await make_user_fn(role="buyer")
    stranger = await make_user_fn(role="buyer")
    enquiry = (await client.post(f"/api/v1/listings/{listing['id']}/enquiries", headers=auth_header(buyer), json={"message": "Hi"})).json()

    resp = await client.get(f"/api/v1/enquiries/{enquiry['id']}", headers=auth_header(stranger))
    assert resp.status_code == 403


async def test_closing_an_enquiry_blocks_further_messages(client, make_user_fn):
    seller, listing = await _active_listing(client, make_user_fn)
    buyer = await make_user_fn(role="buyer")
    enquiry = (await client.post(f"/api/v1/listings/{listing['id']}/enquiries", headers=auth_header(buyer), json={"message": "Hi"})).json()

    close = await client.post(f"/api/v1/enquiries/{enquiry['id']}/close", headers=auth_header(buyer))
    assert close.status_code == 200

    blocked = await client.post(f"/api/v1/enquiries/{enquiry['id']}/messages", headers=auth_header(seller), json={"content": "too late"})
    assert blocked.status_code == 409


async def test_favourite_add_list_remove(client, make_user_fn):
    seller, listing = await _active_listing(client, make_user_fn)
    buyer = await make_user_fn(role="buyer")

    add = await client.post(f"/api/v1/listings/{listing['id']}/favourite", headers=auth_header(buyer))
    assert add.status_code == 204

    mine = await client.get("/api/v1/me/favourites", headers=auth_header(buyer))
    assert len(mine.json()) == 1
    assert mine.json()[0]["is_favourited"] is True

    # Idempotent — favouriting again is not an error.
    again = await client.post(f"/api/v1/listings/{listing['id']}/favourite", headers=auth_header(buyer))
    assert again.status_code == 204

    remove = await client.delete(f"/api/v1/listings/{listing['id']}/favourite", headers=auth_header(buyer))
    assert remove.status_code == 204
    empty = await client.get("/api/v1/me/favourites", headers=auth_header(buyer))
    assert empty.json() == []


async def test_search_results_flag_favourited_listings_for_the_caller(client, make_user_fn):
    seller, listing = await _active_listing(client, make_user_fn)
    buyer = await make_user_fn(role="buyer")
    await client.post(f"/api/v1/listings/{listing['id']}/favourite", headers=auth_header(buyer))

    search = await client.get("/api/v1/listings", params={"brand": "Honda"}, headers=auth_header(buyer))
    assert search.json()["results"][0]["is_favourited"] is True

    anonymous_search = await client.get("/api/v1/listings", params={"brand": "Honda"})
    assert anonymous_search.json()["results"][0]["is_favourited"] is False
