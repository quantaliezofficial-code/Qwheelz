import uuid
from typing import Sequence
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

from app.models.core import CompanyProfile, TechnologyRequirement, Proposal, User
from app.schemas.tech import (
    CompanyProfileCreate, CompanyProfileUpdate,
    RequirementCreate, RequirementUpdate,
    ProposalCreate, ProposalUpdate
)

async def create_company_profile(db: AsyncSession, user_id: uuid.UUID, data: CompanyProfileCreate) -> CompanyProfile:
    # Check if exists
    existing = await db.execute(select(CompanyProfile).where(CompanyProfile.user_id == user_id))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Company profile already exists")
    
    profile = CompanyProfile(
        user_id=user_id,
        website=data.website,
        established_year=data.established_year,
        employee_count=data.employee_count,
        description=data.description
    )
    db.add(profile)
    await db.flush()
    return profile

async def get_company_profile(db: AsyncSession, user_id: uuid.UUID) -> CompanyProfile | None:
    result = await db.execute(select(CompanyProfile).where(CompanyProfile.user_id == user_id))
    return result.scalar_one_or_none()

async def create_requirement(db: AsyncSession, customer_id: uuid.UUID, data: RequirementCreate) -> TechnologyRequirement:
    req = TechnologyRequirement(
        customer_id=customer_id,
        title=data.title,
        description=data.description,
        budget=data.budget,
        timeline=data.timeline,
        status="open"  # Default to open immediately for MVP simplicity
    )
    db.add(req)
    await db.flush()
    return req

async def list_requirements(db: AsyncSession, status: str | None = None) -> Sequence[TechnologyRequirement]:
    query = select(TechnologyRequirement).where(TechnologyRequirement.deleted_at.is_(None))
    if status:
        query = query.where(TechnologyRequirement.status == status)
    result = await db.execute(query.order_by(TechnologyRequirement.created_at.desc()))
    return result.scalars().all()

async def get_requirement(db: AsyncSession, req_id: uuid.UUID) -> TechnologyRequirement:
    result = await db.execute(select(TechnologyRequirement).where(
        TechnologyRequirement.id == req_id, 
        TechnologyRequirement.deleted_at.is_(None)
    ))
    req = result.scalar_one_or_none()
    if not req:
        raise HTTPException(status_code=404, detail="Requirement not found")
    return req

async def create_proposal(db: AsyncSession, company_id: uuid.UUID, req_id: uuid.UUID, data: ProposalCreate) -> Proposal:
    # Verify requirement exists and is open
    req = await get_requirement(db, req_id)
    if req.status != "open":
        raise HTTPException(status_code=400, detail="Requirement is not open for proposals")

    # Check for existing proposal from this company
    existing = await db.execute(select(Proposal).where(Proposal.requirement_id == req_id, Proposal.company_id == company_id))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="You have already submitted a proposal for this requirement")

    prop = Proposal(
        requirement_id=req_id,
        company_id=company_id,
        cover_letter=data.cover_letter,
        proposed_budget=data.proposed_budget,
        proposed_timeline=data.proposed_timeline,
        status="submitted"
    )
    db.add(prop)
    await db.flush()
    return prop

async def list_proposals(db: AsyncSession, req_id: uuid.UUID) -> Sequence[Proposal]:
    result = await db.execute(
        select(Proposal).where(Proposal.requirement_id == req_id).order_by(Proposal.created_at.desc())
    )
    return result.scalars().all()

async def get_proposal(db: AsyncSession, prop_id: uuid.UUID) -> Proposal:
    result = await db.execute(select(Proposal).where(Proposal.id == prop_id))
    prop = result.scalar_one_or_none()
    if not prop:
        raise HTTPException(status_code=404, detail="Proposal not found")
    return prop

async def update_proposal_status(db: AsyncSession, prop_id: uuid.UUID, customer_id: uuid.UUID, new_status: str) -> Proposal:
    prop = await get_proposal(db, prop_id)
    req = await get_requirement(db, prop.requirement_id)
    
    if req.customer_id != customer_id:
        raise HTTPException(status_code=403, detail="Only the customer who posted the requirement can update proposal status")
    
    if new_status == "accepted":
        # Reject all other proposals for this requirement
        await db.execute(
            select(Proposal).where(Proposal.requirement_id == req.id, Proposal.id != prop.id)
        )
        # Note: In a real app we'd do an update statement, but let's just update all fetched objects
        others = await db.execute(select(Proposal).where(Proposal.requirement_id == req.id, Proposal.id != prop.id))
        for other_prop in others.scalars():
            other_prop.status = "rejected"
        
        req.status = "in_progress"
        
    prop.status = new_status
    await db.flush()
    return prop
