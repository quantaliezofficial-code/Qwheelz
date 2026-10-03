from __future__ import annotations

import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.auth import UserOut

EnquiryStatus = Literal["new", "seller_responded", "closed"]


class EnquiryCreate(BaseModel):
    message: str = Field(min_length=1, max_length=4000)


class MessageCreate(BaseModel):
    content: str = Field(min_length=1, max_length=4000)
    attachment_url: str | None = None


class MessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    sender_id: uuid.UUID
    content: str
    attachment_url: str | None
    created_at: datetime
    read_at: datetime | None


class EnquiryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    listing_id: uuid.UUID
    listing_title: str
    status: EnquiryStatus
    created_at: datetime
    updated_at: datetime
    buyer: UserOut
    seller: UserOut
    messages: list[MessageOut]
