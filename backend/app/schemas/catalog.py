from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.auth import UserOut

BodyType = Literal["hatchback", "sedan", "suv", "muv_mpv", "coupe", "convertible", "pickup_truck", "van", "other", "bike"]
FuelType = Literal["petrol", "diesel", "electric", "cng", "hybrid"]
Transmission = Literal["manual", "automatic", "amt", "cvt"]
DocType = Literal["rc_registration", "insurance", "puc", "other"]
ListingStatus = Literal["draft", "pending_review", "active", "sold", "suspended"]


class ListingCreate(BaseModel):
    title: str = Field(min_length=5, max_length=255)
    description: str | None = Field(default=None, max_length=5000)
    brand: str
    model: str
    variant: str | None = None
    year: int = Field(ge=1980, le=2100)
    body_type: BodyType
    fuel_type: FuelType
    transmission: Transmission
    km_driven: int = Field(ge=0)
    owner_count: int = Field(default=1, ge=1)
    color: str | None = None
    seating_capacity: int | None = Field(default=None, ge=1, le=60)
    registration_state: str | None = None
    specifications: dict | None = None
    price: Decimal = Field(gt=0)
    address: str | None = None
    city: str
    state: str | None = None
    pincode: str | None = None
    latitude: Decimal | None = None
    longitude: Decimal | None = None
    features: list[str] = Field(default_factory=list)


class ListingUpdate(BaseModel):
    """Every field optional — this is a PATCH. Only fields the client
    actually sends are applied; see main.py's use of model_dump(exclude_unset=True)."""

    title: str | None = Field(default=None, min_length=5, max_length=255)
    description: str | None = Field(default=None, max_length=5000)
    brand: str | None = None
    model: str | None = None
    variant: str | None = None
    year: int | None = Field(default=None, ge=1980, le=2100)
    body_type: BodyType | None = None
    fuel_type: FuelType | None = None
    transmission: Transmission | None = None
    km_driven: int | None = Field(default=None, ge=0)
    owner_count: int | None = Field(default=None, ge=1)
    color: str | None = None
    seating_capacity: int | None = Field(default=None, ge=1, le=60)
    registration_state: str | None = None
    specifications: dict | None = None
    price: Decimal | None = Field(default=None, gt=0)
    address: str | None = None
    city: str | None = None
    state: str | None = None
    pincode: str | None = None
    latitude: Decimal | None = None
    longitude: Decimal | None = None
    features: list[str] | None = None


class ImageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    url: str
    is_cover: bool
    sort_order: int


class DocumentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    url: str
    doc_type: DocType


class FeatureOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str


class ListingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    slug: str
    title: str
    description: str | None
    brand: str
    model: str
    variant: str | None
    year: int
    body_type: str
    fuel_type: str
    transmission: str
    km_driven: int
    owner_count: int
    color: str | None
    seating_capacity: int | None
    registration_state: str | None
    specifications: dict | None
    price: Decimal
    address: str | None
    city: str
    state: str | None
    pincode: str | None
    status: ListingStatus
    rejection_reason: str | None
    is_featured: bool
    view_count: int
    created_at: datetime
    seller: UserOut
    images: list[ImageOut]
    documents: list[DocumentOut]
    features: list[FeatureOut]
    is_favourited: bool = False


class ListingSearchResult(BaseModel):
    results: list[ListingOut]
    total: int
    limit: int
    offset: int


class MarkImageCoverRequest(BaseModel):
    is_cover: bool = True
