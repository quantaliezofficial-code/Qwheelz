from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict

PlanId = Literal["individual_free", "individual_premium", "dealer_basic", "dealer_pro", "dealer_enterprise"]


class PlanOut(BaseModel):
    id: str
    label: str
    audience: str
    price_inr: int | None
    billing_period: str
    features: list[str]


class SubscribeRequest(BaseModel):
    plan: PlanId


class SubscriptionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    plan: str
    status: str
    current_period_end: datetime | None


class PaymentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    purpose: str
    amount: Decimal
    status: str
    created_at: datetime
    confirmed_at: datetime | None
