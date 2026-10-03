from __future__ import annotations

import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.auth import UserOut


class OverviewOut(BaseModel):
    total_users: int
    active_sellers: int
    active_dealers: int
    listings_active: int
    listings_pending_review: int
    listings_sold: int
    total_enquiries: int
    pending_seller_verifications: int
    open_reports: int
    active_subscriptions: int
    revenue_total_inr: float


class ReasonRequest(BaseModel):
    reason: str = Field(min_length=3, max_length=1000)


class FeatureToggleRequest(BaseModel):
    featured: bool


class ReportCreate(BaseModel):
    entity_type: Literal["listing", "user"]
    entity_id: uuid.UUID
    reason: str = Field(min_length=3, max_length=1000)


class ReportOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    entity_type: str
    entity_id: uuid.UUID
    reason: str
    status: str
    created_at: datetime
    reporter: UserOut


class ResolveReportRequest(BaseModel):
    outcome: Literal["resolved", "dismissed"]


class AuditLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    actor_id: uuid.UUID | None
    action: str
    entity_type: str
    entity_id: uuid.UUID | None
    extra_data: dict | None
    created_at: datetime
