from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

class CompanyProfileCreate(BaseModel):
    website: Optional[str] = None
    established_year: Optional[int] = Field(None, ge=1900, le=2100)
    employee_count: Optional[int] = Field(None, ge=1)
    description: Optional[str] = None

class CompanyProfileUpdate(CompanyProfileCreate):
    pass

class CompanyProfileOut(BaseModel):
    id: UUID
    user_id: UUID
    website: Optional[str]
    established_year: Optional[int]
    employee_count: Optional[int]
    description: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RequirementCreate(BaseModel):
    title: str = Field(..., min_length=5, max_length=150)
    description: str = Field(..., min_length=20)
    budget: Optional[Decimal] = Field(None, ge=0)
    timeline: Optional[str] = None

class RequirementUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=5, max_length=150)
    description: Optional[str] = Field(None, min_length=20)
    budget: Optional[Decimal] = Field(None, ge=0)
    timeline: Optional[str] = None
    status: Optional[str] = None

class RequirementOut(BaseModel):
    id: UUID
    customer_id: UUID
    title: str
    description: str
    budget: Optional[Decimal]
    timeline: Optional[str]
    status: str
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class ProposalCreate(BaseModel):
    cover_letter: str = Field(..., min_length=20)
    proposed_budget: Optional[Decimal] = Field(None, ge=0)
    proposed_timeline: Optional[str] = None

class ProposalUpdate(BaseModel):
    status: str

class ProposalOut(BaseModel):
    id: UUID
    requirement_id: UUID
    company_id: UUID
    cover_letter: str
    proposed_budget: Optional[Decimal]
    proposed_timeline: Optional[str]
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
