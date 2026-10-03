import pytest
from sqlalchemy import select
from decimal import Decimal
from app.models.core import User, CompanyProfile, TechnologyRequirement, Proposal

@pytest.mark.asyncio
async def test_tech_domain_models(db, make_user_fn):
    # Setup users
    customer = await make_user_fn(role="customer", name="Tech Customer")
    it_company = await make_user_fn(role="it_company", name="Super IT Solutions")

    # 1. Company Profile
    profile = CompanyProfile(
        user_id=it_company.id,
        website="https://superit.example.com",
        employee_count=50,
        established_year=2015,
        description="We build fast and reliable software."
    )
    db.add(profile)
    await db.commit()
    await db.refresh(profile)

    from sqlalchemy.orm import selectinload
    # Re-fetch to test relationship
    it_company_db = (await db.execute(select(User).options(selectinload(User.company_profile)).where(User.id == it_company.id))).scalar_one()
    assert it_company_db.company_profile is not None
    
    # 2. Technology Requirement
    req = TechnologyRequirement(
        customer_id=customer.id,
        title="Need a marketplace",
        description="Dual-marketplace for cars and code.",
        budget=Decimal("50000.00"),
        timeline="3 months"
    )
    db.add(req)
    await db.commit()
    await db.refresh(req)
    assert req.status == "draft"

    # 3. Proposal
    prop = Proposal(
        requirement_id=req.id,
        company_id=it_company.id,
        cover_letter="We can build this.",
        proposed_budget=Decimal("45000.00"),
        proposed_timeline="2.5 months"
    )
    db.add(prop)
    await db.commit()
    await db.refresh(prop)
    assert prop.status == "submitted"

    # Fetch with relationships
    prop_db = (await db.execute(select(Proposal).options(selectinload(Proposal.requirement), selectinload(Proposal.company)).where(Proposal.id == prop.id))).scalar_one()
    assert prop_db.requirement.title == "Need a marketplace"
    assert prop_db.company.name == "Super IT Solutions"
