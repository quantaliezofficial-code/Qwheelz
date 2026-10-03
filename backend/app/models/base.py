"""
Base declarative class + the native Postgres ENUM types for the Quantaliez
Auto schema. create_type=False on every enum because the actual CREATE
TYPE statements run via Alembic migrations, not via
Base.metadata.create_all() — never run create_all() against a real
database; use `alembic upgrade head`.
"""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, Text
from sqlalchemy.dialects.postgresql import ENUM as PGEnum
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    type_annotation_map = {
        str: Text,
        datetime: DateTime(timezone=True),
    }

UserRole = PGEnum(
    "buyer", "seller", "admin", "customer", "it_company",
    name="user_role", create_type=False,
)

SellerType = PGEnum(
    "individual", "dealer",
    name="seller_type", create_type=False,
)

ListingStatus = PGEnum(
    "draft", "pending_review", "active", "sold", "suspended",
    name="listing_status", create_type=False,
)

BodyType = PGEnum(
    "hatchback", "sedan", "suv", "muv_mpv", "coupe", "convertible", "pickup_truck", "van", "other", "bike",
    name="body_type", create_type=False,
)

FuelType = PGEnum(
    "petrol", "diesel", "electric", "cng", "hybrid",
    name="fuel_type", create_type=False,
)

TransmissionType = PGEnum(
    "manual", "automatic", "amt", "cvt",
    name="transmission_type", create_type=False,
)

VehicleDocumentType = PGEnum(
    "rc_registration", "insurance", "puc", "other",
    name="vehicle_document_type", create_type=False,
)

EnquiryStatus = PGEnum(
    "new", "seller_responded", "closed",
    name="enquiry_status", create_type=False,
)

ParticipantVerificationStatus = PGEnum(
    "pending", "approved", "rejected",
    name="seller_verification_status", create_type=False,
)

SubscriptionPlan = PGEnum(
    "individual_free", "individual_premium", "dealer_basic", "dealer_pro", "dealer_enterprise",
    name="subscription_plan", create_type=False,
)

SubscriptionStatus = PGEnum(
    "active", "expired", "cancelled",
    name="subscription_status", create_type=False,
)

PaymentPurpose = PGEnum(
    "subscription", "featured_listing",
    name="payment_purpose", create_type=False,
)

PaymentStatus = PGEnum(
    "initiated", "success", "failed", "refunded",
    name="payment_status", create_type=False,
)

RequirementStatus = PGEnum(
    "draft", "open", "in_progress", "completed", "cancelled",
    name="requirement_status", create_type=False,
)

ProposalStatus = PGEnum(
    "submitted", "shortlisted", "accepted", "rejected", "withdrawn",
    name="proposal_status", create_type=False,
)
