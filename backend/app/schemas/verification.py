from __future__ import annotations

import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

SellerType = Literal["individual", "dealer"]
VerificationStatus = Literal["pending", "approved", "rejected"]


class VerificationSubmit(BaseModel):
    participant_type: SellerType
    identification_type: str = Field(description="e.g. Aadhaar, PAN, Driving Licence")
    identification_number: str
    document_url: str
    business_name: str | None = None
    gst_number: str | None = None


class VerificationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    participant_type: SellerType
    status: VerificationStatus
    rejection_reason: str | None
    business_name: str | None
    created_at: datetime
    reviewed_at: datetime | None
