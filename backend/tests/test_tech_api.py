import pytest
from httpx import AsyncClient
from uuid import uuid4

from tests.conftest import auth_header

@pytest.mark.asyncio
async def test_tech_domain_api(client: AsyncClient, make_user_fn):
    customer = await make_user_fn(role="customer", name="Cust A")
    it_company = await make_user_fn(role="it_company", name="IT A")

    # 1. Company Profile Create
    resp = await client.post(
        "/api/v1/tech/profile",
        json={
            "website": "https://example.com",
            "employee_count": 10,
            "established_year": 2020,
            "description": "A cool company"
        },
        headers=auth_header(it_company)
    )
    assert resp.status_code == 200
    assert resp.json()["website"] == "https://example.com"

    # Should not create twice
    resp = await client.post(
        "/api/v1/tech/profile",
        json={"website": "https://example2.com"},
        headers=auth_header(it_company)
    )
    assert resp.status_code == 400

    # 2. Customer creates requirement
    resp = await client.post(
        "/api/v1/tech/requirements",
        json={
            "title": "Need a React native app",
            "description": "Looking for a marketplace builder with 5 years experience.",
            "budget": "5000.00",
            "timeline": "2 months"
        },
        headers=auth_header(customer)
    )
    assert resp.status_code == 200
    req_id = resp.json()["id"]

    # 3. List requirements
    resp = await client.get("/api/v1/tech/requirements")
    assert resp.status_code == 200
    assert len(resp.json()) == 1

    # 4. IT Company submits proposal
    resp = await client.post(
        f"/api/v1/tech/requirements/{req_id}/proposals",
        json={
            "cover_letter": "Hello! We can definitely build this app for you perfectly.",
            "proposed_budget": "4500.00",
            "proposed_timeline": "1.5 months"
        },
        headers=auth_header(it_company)
    )
    assert resp.status_code == 200
    prop_id = resp.json()["id"]

    # 5. Customer views proposals
    resp = await client.get(
        f"/api/v1/tech/requirements/{req_id}/proposals",
        headers=auth_header(customer)
    )
    assert resp.status_code == 200
    assert len(resp.json()) == 1

    # IT company cannot view proposals
    resp = await client.get(
        f"/api/v1/tech/requirements/{req_id}/proposals",
        headers=auth_header(it_company)
    )
    assert resp.status_code == 403

    # 6. Customer accepts proposal
    resp = await client.patch(
        f"/api/v1/tech/proposals/{prop_id}/status",
        json={"status": "accepted"},
        headers=auth_header(customer)
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "accepted"

    # Requirement should now be in_progress
    resp = await client.get(f"/api/v1/tech/requirements/{req_id}")
    assert resp.status_code == 200
    assert resp.json()["status"] == "in_progress"
