"""
Core SQLAlchemy models for Quantaliez Auto, as typed SQLAlchemy 2.0
models (Mapped/mapped_column) — catches type mismatches at dev time,
the same reasoning the original GroundBooking schema gave for this
style, which is domain-agnostic and worth keeping.

Design conventions carried over unchanged because they were good ideas
independent of domain:
  - UUID primary keys via Postgres gen_random_uuid()
  - created_at / updated_at on every mutable table
  - soft delete via nullable deleted_at rather than hard DELETE
  - suspension is a distinct, reversible state from soft delete/rejection
  - JSONB for structured-but-flexible payloads instead of narrow columns
    for every edge case
  - partial unique indexes to enforce "at most one X in state Y" at the
    database layer, not just in application code
  - get-or-create tag tables (features here, amenities before) rather
    than an admin-curated master list, as a deliberate MVP1 simplicity
    choice

See MIGRATION_NOTES.md for the full entity-by-entity mapping from the
venue-booking domain to the vehicle-marketplace domain, and for which
tables (InventoryUnit, the booking-hold fields, Payout's active wiring)
were deliberately dropped or left dormant rather than translated.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    CheckConstraint,
    Column,
    ForeignKey,
    Index,
    Numeric,
    Table,
    UniqueConstraint,
    text,
)
from sqlalchemy.dialects.postgresql import CITEXT, JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import (
    Base,
    BodyType,
    EnquiryStatus,
    FuelType,
    ListingStatus,
    PaymentPurpose,
    PaymentStatus,
    SellerType,
    ParticipantVerificationStatus,
    SubscriptionPlan,
    SubscriptionStatus,
    TransmissionType,
    UserRole,
    VehicleDocumentType,
    RequirementStatus,
    ProposalStatus,
)


class User(Base):
    """A single account table for buyers, sellers (individual or dealer)
    and admins — one role enum, not separate tables per role, same as
    the original design. seller_type/business_name/gst_number/
    avg_rating only ever populated once role == 'seller'; they stay
    NULL for buyers and admins rather than living on a separate 1:1
    table, because a join for every listing card render to fetch them
    would be wasteful and every one of them is optional anyway."""

    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")
    )
    name: Mapped[str]
    email: Mapped[str | None] = mapped_column(CITEXT, unique=True, nullable=True)
    phone: Mapped[str] = mapped_column(unique=True, nullable=False)
    password_hash: Mapped[str]
    role: Mapped[str] = mapped_column(UserRole, default="buyer")

    seller_type: Mapped[str | None] = mapped_column(SellerType)
    business_name: Mapped[str | None]
    gst_number: Mapped[str | None]
    avg_rating: Mapped[Decimal | None] = mapped_column(Numeric(3, 2))
    rating_count: Mapped[int] = mapped_column(default=0)

    is_verified: Mapped[bool] = mapped_column(default=False)
    suspended_at: Mapped[datetime | None]
    suspension_reason: Mapped[str | None]
    created_at: Mapped[datetime] = mapped_column(server_default=text("now()"))
    updated_at: Mapped[datetime] = mapped_column(server_default=text("now()"))
    deleted_at: Mapped[datetime | None]

    listings: Mapped[list["VehicleListing"]] = relationship(back_populates="seller")
    enquiries_made: Mapped[list["VehicleEnquiry"]] = relationship(
        back_populates="buyer", foreign_keys="VehicleEnquiry.buyer_id"
    )
    refresh_tokens: Mapped[list["RefreshToken"]] = relationship(back_populates="user")
    verification: Mapped["ParticipantVerification | None"] = relationship(
        back_populates="user", foreign_keys="ParticipantVerification.user_id", uselist=False
    )
    subscription: Mapped["Subscription | None"] = relationship(back_populates="user", uselist=False)
    reviews_received: Mapped[list["Review"]] = relationship(
        back_populates="seller", foreign_keys="Review.seller_id"
    )
    company_profile: Mapped["CompanyProfile | None"] = relationship(back_populates="user", uselist=False)
    requirements_posted: Mapped[list["TechnologyRequirement"]] = relationship(back_populates="customer")
    proposals_submitted: Mapped[list["Proposal"]] = relationship(back_populates="company")


class VehicleListing(Base):
    """The classifieds ad for one vehicle — blueprint Section 4 ('Car
    listing') and Section 16 ('VehicleListings'). Replaces Venue.

    The moderation lifecycle (draft -> pending_review -> active, with
    rejection_reason and a pending_changes diff so an already-live
    listing re-enters review on a material edit) is carried over
    unchanged from Venue: this is domain-agnostic marketplace-trust
    machinery, not venue-specific, and the blueprint's own Section 12
    ('Pending listings' moderation queue) asks for exactly this.

    Deliberately NOT carried over from Venue: unit_type, base_price as
    a per-slot rate, capacity as a booking concept, and the whole
    InventoryUnit relationship — a car is listed once and sold once, it
    is not rented out by the hour. See MIGRATION_NOTES.md."""

    __tablename__ = "vehicle_listings"
    __table_args__ = (
        CheckConstraint("price >= 0", name="chk_listing_price_nonneg"),
        CheckConstraint("km_driven >= 0", name="chk_listing_km_nonneg"),
        CheckConstraint("owner_count >= 1", name="chk_listing_owner_count_positive"),
        Index(
            "idx_listings_city_brand_status",
            "city",
            "brand",
            "status",
            postgresql_where=text("deleted_at IS NULL AND status = 'active'"),
        ),
        Index(
            "idx_listings_pending_review",
            "status",
            postgresql_where=text("status = 'pending_review'"),
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")
    )
    seller_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"))

    title: Mapped[str]
    slug: Mapped[str] = mapped_column(unique=True)
    description: Mapped[str | None]

    brand: Mapped[str]
    model: Mapped[str]
    variant: Mapped[str | None]
    year: Mapped[int]
    body_type: Mapped[str] = mapped_column(BodyType)
    fuel_type: Mapped[str] = mapped_column(FuelType)
    transmission: Mapped[str] = mapped_column(TransmissionType)
    km_driven: Mapped[int]
    owner_count: Mapped[int] = mapped_column(default=1)
    color: Mapped[str | None]
    seating_capacity: Mapped[int | None]
    registration_state: Mapped[str | None]
    specifications: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    price: Mapped[Decimal] = mapped_column(Numeric(12, 2))

    address: Mapped[str | None]
    city: Mapped[str]
    state: Mapped[str | None]
    pincode: Mapped[str | None]
    latitude: Mapped[Decimal | None] = mapped_column(Numeric(9, 6))
    longitude: Mapped[Decimal | None] = mapped_column(Numeric(9, 6))

    status: Mapped[str] = mapped_column(ListingStatus, default="draft")
    rejection_reason: Mapped[str | None]
    suspension_reason: Mapped[str | None]
    # Field-level diff from the most recent seller edit that caused the
    # listing to re-enter 'pending_review'. NULL for a listing entering
    # review for the first time. Cleared back to NULL once an admin acts
    # (approve/reject resolves the pending state).
    pending_changes: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    is_featured: Mapped[bool] = mapped_column(default=False)
    featured_until: Mapped[datetime | None]
    view_count: Mapped[int] = mapped_column(default=0)

    created_at: Mapped[datetime] = mapped_column(server_default=text("now()"))
    updated_at: Mapped[datetime] = mapped_column(server_default=text("now()"))
    deleted_at: Mapped[datetime | None]

    seller: Mapped["User"] = relationship(back_populates="listings")
    images: Mapped[list["VehicleImage"]] = relationship(
        back_populates="listing", order_by="VehicleImage.sort_order", cascade="all, delete-orphan"
    )
    documents: Mapped[list["VehicleDocument"]] = relationship(
        back_populates="listing", cascade="all, delete-orphan"
    )
    features: Mapped[list["VehicleFeature"]] = relationship(
        secondary="listing_features", back_populates="listings"
    )
    enquiries: Mapped[list["VehicleEnquiry"]] = relationship(back_populates="listing")
    favourited_by: Mapped[list["VehicleFavourite"]] = relationship(
        back_populates="listing", cascade="all, delete-orphan"
    )
    reviews: Mapped[list["Review"]] = relationship(back_populates="listing")


class VehicleImage(Base):
    """Same partial-unique-index pattern as VenueImage: at most one
    is_cover = true per listing, enforced by the database, not just by
    application code remembering to unset the previous cover."""

    __tablename__ = "vehicle_images"
    __table_args__ = (
        Index(
            "uq_one_cover_image_per_listing",
            "listing_id",
            unique=True,
            postgresql_where=text("is_cover = true"),
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")
    )
    listing_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("vehicle_listings.id", ondelete="CASCADE"))
    url: Mapped[str]
    is_cover: Mapped[bool] = mapped_column(default=False)
    sort_order: Mapped[int] = mapped_column(default=0)
    created_at: Mapped[datetime] = mapped_column(server_default=text("now()"))

    listing: Mapped["VehicleListing"] = relationship(back_populates="images")


class VehicleDocument(Base):
    """RC / insurance / PUC uploads — blueprint Section 11 ('Vehicle
    documents, Registration details') and Section 16
    ('VehicleDocuments'). New table: GroundBooking had no equivalent,
    a venue doesn't have a registration certificate."""

    __tablename__ = "vehicle_documents"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")
    )
    listing_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("vehicle_listings.id", ondelete="CASCADE"))
    doc_type: Mapped[str] = mapped_column(VehicleDocumentType)
    url: Mapped[str]
    created_at: Mapped[datetime] = mapped_column(server_default=text("now()"))

    listing: Mapped["VehicleListing"] = relationship(back_populates="documents")


# Plain Table, not a mapped class — same reasoning as venue_amenities: a
# composite-PK join table with no columns of its own has no row identity
# worth its own ORM class.
listing_features = Table(
    "listing_features",
    Base.metadata,
    Column("listing_id", ForeignKey("vehicle_listings.id", ondelete="CASCADE"), primary_key=True),
    Column("feature_id", ForeignKey("vehicle_features.id", ondelete="CASCADE"), primary_key=True),
)


class VehicleFeature(Base):
    """Renamed from Amenity. Same get-or-create-by-name simplicity
    choice: no admin-curated master list in MVP1 — see
    app/modules/catalog/service.py. Sunroof / ABS / Rear Camera /
    Alloy Wheels / Cruise Control and similar tags."""

    __tablename__ = "vehicle_features"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")
    )
    name: Mapped[str] = mapped_column(unique=True)

    listings: Mapped[list["VehicleListing"]] = relationship(
        secondary=listing_features, back_populates="features"
    )


class VehicleFavourite(Base):
    """The 'Shortlist' / 'Save cars' feature — blueprint Section 2 (an
    Individual Buyer 'can save cars') and Section 16
    ('VehicleFavourites'). GroundBooking had no equivalent; this is new,
    deliberately minimal functionality: a composite-PK join row with a
    timestamp, nothing else."""

    __tablename__ = "vehicle_favourites"

    buyer_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    listing_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("vehicle_listings.id", ondelete="CASCADE"), primary_key=True
    )
    created_at: Mapped[datetime] = mapped_column(server_default=text("now()"))

    listing: Mapped["VehicleListing"] = relationship(back_populates="favourited_by")
    buyer: Mapped["User"] = relationship()


class VehicleEnquiry(Base):
    """One buyer's line of contact with one seller about one listing —
    blueprint Section 10 ('direct buyer-seller communication') and
    Section 16 ('VehicleEnquiries'). Replaces Booking + InventoryUnit.

    Deliberately carries no price, hold, payment or refund state.
    Unlike a venue Booking, an enquiry never moves money on-platform —
    Quantaliez Auto connects buyer and seller, it does not process the
    sale. listing_title and seller_id are snapshotted at creation, same
    reasoning Booking used for venue_name/venue_category: admin
    oversight and the buyer's own enquiry history should survive the
    listing later being edited, marked sold, or removed."""

    __tablename__ = "vehicle_enquiries"
    __table_args__ = (
        Index("idx_enquiries_buyer_status", "buyer_id", "status"),
        Index("idx_enquiries_seller_status", "seller_id", "status"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")
    )
    listing_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("vehicle_listings.id", ondelete="RESTRICT"))
    listing_title: Mapped[str]
    seller_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"))
    buyer_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))

    status: Mapped[str] = mapped_column(EnquiryStatus, default="new")
    closed_at: Mapped[datetime | None]
    created_at: Mapped[datetime] = mapped_column(server_default=text("now()"))
    updated_at: Mapped[datetime] = mapped_column(server_default=text("now()"))

    listing: Mapped["VehicleListing"] = relationship(back_populates="enquiries")
    buyer: Mapped["User"] = relationship(back_populates="enquiries_made", foreign_keys=[buyer_id])
    seller: Mapped["User"] = relationship(foreign_keys=[seller_id])
    messages: Mapped[list["EnquiryMessage"]] = relationship(
        back_populates="enquiry", cascade="all, delete-orphan", order_by="EnquiryMessage.created_at"
    )


class EnquiryMessage(Base):
    """One chat message inside an enquiry thread — blueprint Section 10
    ('Text chat, Image/document sharing'). attachment_url covers the
    document/image-sharing bullet with one optional attachment per
    message rather than a separate Attachments table — enough for an
    MVP1 launch, and additive to extend later if a message ever needs
    more than one."""

    __tablename__ = "enquiry_messages"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")
    )
    enquiry_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("vehicle_enquiries.id", ondelete="CASCADE"))
    sender_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    content: Mapped[str]
    attachment_url: Mapped[str | None]
    read_at: Mapped[datetime | None]
    created_at: Mapped[datetime] = mapped_column(server_default=text("now()"))

    enquiry: Mapped["VehicleEnquiry"] = relationship(back_populates="messages")
    sender: Mapped["User"] = relationship()


class ParticipantVerification(Base):
    """Renamed from ParticipantVerification, same workflow shape: pending /
    approved / rejected, with a resubmission after rejection updating
    this same row rather than creating a new one; `users.is_verified`
    stays the simple gate this table's approval flips.

    participant_type is captured on the application itself (not read live off
    `users.seller_type`) so a change of mind between 'individual' and
    'dealer' before approval doesn't silently retarget an
    already-submitted application. business_name/gst_number cover the
    blueprint's dealer-specific 'Company verification: GST' bullet;
    they stay NULL for an individual seller's application."""

    __tablename__ = "participant_verifications"
    __table_args__ = (
        Index(
            "uq_one_pending_verification_per_user",
            "user_id",
            unique=True,
            postgresql_where=text("status = 'pending'"),
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")
    )
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    participant_type: Mapped[str] = mapped_column(SellerType)
    document_url: Mapped[str]
    identification_type: Mapped[str | None]
    identification_number: Mapped[str | None]
    business_name: Mapped[str | None]
    gst_number: Mapped[str | None]
    status: Mapped[str] = mapped_column(ParticipantVerificationStatus, default="pending")
    rejection_reason: Mapped[str | None]
    reviewed_by: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    reviewed_at: Mapped[datetime | None]
    created_at: Mapped[datetime] = mapped_column(server_default=text("now()"))

    user: Mapped["User"] = relationship(back_populates="verification", foreign_keys=[user_id])
    reviewer: Mapped["User | None"] = relationship(foreign_keys=[reviewed_by])


class Subscription(Base):
    """A seller's current monetization plan — blueprint Section 13.
    One row per seller (a plan change updates this row; history of past
    plans isn't needed for MVP1) rather than an append-only ledger,
    mirroring the same single-current-row choice ParticipantVerification
    makes for the same reason."""

    __tablename__ = "subscriptions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")
    )
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    plan: Mapped[str] = mapped_column(SubscriptionPlan)
    status: Mapped[str] = mapped_column(SubscriptionStatus, default="active")
    started_at: Mapped[datetime] = mapped_column(server_default=text("now()"))
    current_period_end: Mapped[datetime | None]
    cancelled_at: Mapped[datetime | None]
    created_at: Mapped[datetime] = mapped_column(server_default=text("now()"))
    updated_at: Mapped[datetime] = mapped_column(server_default=text("now()"))

    user: Mapped["User"] = relationship(back_populates="subscription")
    payments: Mapped[list["Payment"]] = relationship(back_populates="subscription")


class Payment(Base):
    """A seller/dealer paying Quantaliez — for a subscription plan or a
    one-off featured-listing boost (purpose distinguishes the two;
    exactly one of subscription_id/listing_id is set to match).

    Confirmed offline by an admin (confirmed_by/confirmed_at), the same
    'admin confirms a payment that happened outside this codebase'
    pattern the original Payment/booking flow used — this environment
    has no live payment-gateway credentials to integrate against, and
    that was already true of the system this one replaces. Wiring a
    real Razorpay checkout (blueprint Section 15) against
    gateway_payment_id is the natural next step once real keys exist;
    see MIGRATION_NOTES.md.

    There is deliberately no Payout alongside this — see
    app/modules/payout/service.py for why that machinery was kept but
    left dormant rather than deleted."""

    __tablename__ = "payments"
    __table_args__ = (
        CheckConstraint("amount >= 0", name="chk_payment_amount_nonneg"),
        CheckConstraint(
            "(subscription_id IS NOT NULL) OR (listing_id IS NOT NULL)",
            name="chk_payment_has_a_purpose_target",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")
    )
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"))
    purpose: Mapped[str] = mapped_column(PaymentPurpose)
    subscription_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("subscriptions.id", ondelete="SET NULL"))
    listing_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("vehicle_listings.id", ondelete="SET NULL"))
    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    currency: Mapped[str] = mapped_column(default="INR")
    gateway: Mapped[str] = mapped_column(default="razorpay")
    gateway_payment_id: Mapped[str | None] = mapped_column(unique=True)
    status: Mapped[str] = mapped_column(PaymentStatus, default="initiated")
    raw_payload: Mapped[dict | None] = mapped_column(JSONB)
    confirmed_by: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    confirmed_at: Mapped[datetime | None]
    created_at: Mapped[datetime] = mapped_column(server_default=text("now()"))
    updated_at: Mapped[datetime] = mapped_column(server_default=text("now()"))

    user: Mapped["User"] = relationship(foreign_keys=[user_id])
    subscription: Mapped["Subscription | None"] = relationship(back_populates="payments")


class Review(Base):
    """Re-keyed to the seller rather than the listing (unlike the old
    venue Review): buying a used car is trust in the person or dealer
    you deal with directly, not in one ad, and the blueprint's own
    trust framing (Section 11: 'trust will determine whether people use
    the platform') is about sellers, not individual listings.
    listing_id is kept as an optional pointer to *which* deal a review
    is about, for context, without being the review's identity.

    avg_rating on User is recalculated in-app on create/delete, same
    non-trigger choice the original design made — a simple AVG query is
    fast enough for MVP1 volumes."""

    __tablename__ = "reviews"
    __table_args__ = (
        CheckConstraint("rating BETWEEN 1 AND 5", name="chk_review_rating_range"),
        Index("idx_reviews_seller_id_created_at", "seller_id", "created_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")
    )
    seller_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    buyer_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    listing_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("vehicle_listings.id", ondelete="SET NULL"))
    rating: Mapped[int]
    content: Mapped[str]
    created_at: Mapped[datetime] = mapped_column(server_default=text("now()"))

    seller: Mapped["User"] = relationship(back_populates="reviews_received", foreign_keys=[seller_id])
    buyer: Mapped["User"] = relationship(foreign_keys=[buyer_id])
    listing: Mapped["VehicleListing | None"] = relationship(back_populates="reviews")


class Report(Base):
    """A buyer flagging a listing or a user — blueprint Section 12's
    Moderation list ('Reported listings', 'Suspicious users', 'Spam').
    New table; GroundBooking had no equivalent.

    entity_type/entity_id is a deliberately lightweight polymorphic
    reference (a type discriminator plus a bare UUID, no FK constraint)
    rather than two nullable foreign keys (listing_id, reported_user_id)
    — a report needs to point at exactly one of two different tables,
    and two always-one-NULL columns model that less clearly than one
    column that says which table to look in. The trade-off is explicit:
    the database can't enforce that entity_id actually exists, so
    admin/service.py's list_reports() resolves it defensively and skips
    (rather than errors on) a report whose target was hard-deleted."""

    __tablename__ = "reports"
    __table_args__ = (CheckConstraint("entity_type IN ('listing', 'user')", name="chk_report_entity_type"),)

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")
    )
    reporter_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    entity_type: Mapped[str]
    entity_id: Mapped[uuid.UUID]
    reason: Mapped[str]
    status: Mapped[str] = mapped_column(default="open")  # open | resolved | dismissed
    resolved_by: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    resolved_at: Mapped[datetime | None]
    created_at: Mapped[datetime] = mapped_column(server_default=text("now()"))

    reporter: Mapped["User"] = relationship(foreign_keys=[reporter_id])


class RefreshToken(Base):
    """Rotating refresh tokens with reuse detection. Pure auth
    infrastructure — nothing about the vehicle-vs-venue rebrand touches
    this table; carried over unchanged."""

    __tablename__ = "refresh_tokens"
    __table_args__ = (
        Index(
            "idx_refresh_tokens_active_by_user",
            "user_id",
            postgresql_where=text("revoked_at IS NULL"),
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")
    )
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    token_hash: Mapped[str] = mapped_column(unique=True)
    expires_at: Mapped[datetime]
    revoked_at: Mapped[datetime | None]
    replaced_by_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("refresh_tokens.id", ondelete="SET NULL"))
    created_at: Mapped[datetime] = mapped_column(server_default=text("now()"))

    user: Mapped["User"] = relationship(back_populates="refresh_tokens", foreign_keys=[user_id])


class LoginRateLimit(Base):
    """Postgres-backed fixed-window login throttle, one row per
    rate-limited key (f"ratelimit:login:{email}"), upserted atomically
    by check_login_rate_limit() in app/modules/auth/service.py. Pure
    infrastructure bookkeeping, not domain data — carried over
    unchanged."""

    __tablename__ = "login_rate_limits"

    key: Mapped[str] = mapped_column(primary_key=True)
    window_start: Mapped[datetime]
    attempt_count: Mapped[int] = mapped_column(default=1)


class Notification(Base):
    """In-app notification so a seller/buyer finds out when something of
    theirs changed state (listing approved/rejected/suspended, a new
    enquiry, verification decided, subscription confirmed) without
    asking support. In-app only, not email/SMS — this sandbox has no
    route to an external delivery provider, and a real notification
    pipeline is a separate, larger decision than this pass covers.
    `type` is a free-form string (not an enum) so new notification
    types don't need a migration each time; `entity_type`/`entity_id`
    let the frontend build the right link without a URL being stored
    (and potentially going stale) here."""

    __tablename__ = "notifications"
    __table_args__ = (Index("ix_notifications_user_id_created_at", "user_id", "created_at"),)

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")
    )
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    type: Mapped[str]
    message: Mapped[str]
    entity_type: Mapped[str | None]
    entity_id: Mapped[uuid.UUID | None]
    read_at: Mapped[datetime | None]
    created_at: Mapped[datetime] = mapped_column(server_default=text("now()"))

    user: Mapped["User"] = relationship()


class AuditLog(Base):
    """Sensitive actions (listing approval/rejection, suspensions,
    payment confirmation, verification decisions) are written here.
    Immutable by convention: no updated_at, no update path anywhere in
    this codebase — a row, once written, is never changed, only read."""

    __tablename__ = "audit_logs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")
    )
    actor_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    action: Mapped[str]
    entity_type: Mapped[str]
    entity_id: Mapped[uuid.UUID | None]
    # Python attribute is `extra_data`, not `metadata` — DeclarativeBase
    # already reserves `metadata` for Base.metadata.
    extra_data: Mapped[dict | None] = mapped_column("metadata", JSONB)
    created_at: Mapped[datetime] = mapped_column(server_default=text("now()"))


class SystemConfiguration(Base):
    """Global system configuration replacing hardcoded values."""

    __tablename__ = "system_configurations"

    key: Mapped[str] = mapped_column(primary_key=True)
    value: Mapped[dict] = mapped_column(JSONB)
    description: Mapped[str | None]
    updated_at: Mapped[datetime] = mapped_column(server_default=text("now()"))


class IdempotencyKey(Base):
    """PostgreSQL-backed idempotency protection for external mutations."""

    __tablename__ = "idempotency_keys"

    key: Mapped[str] = mapped_column(primary_key=True)
    user_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    request_path: Mapped[str]
    request_params_hash: Mapped[str]
    status: Mapped[str] = mapped_column(default="in_progress")  # in_progress | completed
    response_status_code: Mapped[int | None]
    response_body: Mapped[dict | None] = mapped_column(JSONB)
    locked_at: Mapped[datetime] = mapped_column(server_default=text("now()"))
    expires_at: Mapped[datetime]


class BackgroundJob(Base):
    """Generic async background job tracker."""

    __tablename__ = "background_jobs"
    __table_args__ = (Index("idx_background_jobs_status", "status"),)

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")
    )
    job_type: Mapped[str]
    payload: Mapped[dict | None] = mapped_column(JSONB)
    status: Mapped[str] = mapped_column(default="pending")  # pending | processing | completed | failed
    result: Mapped[dict | None] = mapped_column(JSONB)
    error_details: Mapped[str | None]
    run_at: Mapped[datetime] = mapped_column(server_default=text("now()"))
    started_at: Mapped[datetime | None]
    completed_at: Mapped[datetime | None]
    created_at: Mapped[datetime] = mapped_column(server_default=text("now()"))
class CompanyProfile(Base):
    """Details for an IT Company."""
    __tablename__ = "company_profiles"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    website: Mapped[str | None]
    established_year: Mapped[int | None]
    employee_count: Mapped[int | None]
    description: Mapped[str | None]
    created_at: Mapped[datetime] = mapped_column(server_default=text("now()"))
    updated_at: Mapped[datetime] = mapped_column(server_default=text("now()"))

    user: Mapped["User"] = relationship(back_populates="company_profile")

class TechnologyRequirement(Base):
    """A tech requirement posted by a customer."""
    __tablename__ = "technology_requirements"
    __table_args__ = (
        CheckConstraint("budget >= 0", name="chk_requirement_budget_nonneg"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    customer_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"))
    title: Mapped[str]
    description: Mapped[str]
    budget: Mapped[Decimal | None] = mapped_column(Numeric(12, 2))
    timeline: Mapped[str | None]
    status: Mapped[str] = mapped_column(RequirementStatus, default="draft")
    created_at: Mapped[datetime] = mapped_column(server_default=text("now()"))
    updated_at: Mapped[datetime] = mapped_column(server_default=text("now()"))
    deleted_at: Mapped[datetime | None]

    customer: Mapped["User"] = relationship(back_populates="requirements_posted")
    proposals: Mapped[list["Proposal"]] = relationship(back_populates="requirement", cascade="all, delete-orphan")

class Proposal(Base):
    """A proposal submitted by an IT company for a tech requirement."""
    __tablename__ = "proposals"
    __table_args__ = (
        CheckConstraint("proposed_budget >= 0", name="chk_proposal_budget_nonneg"),
        UniqueConstraint("requirement_id", "company_id", name="uq_one_proposal_per_company_per_requirement"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    requirement_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("technology_requirements.id", ondelete="CASCADE"))
    company_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    cover_letter: Mapped[str]
    proposed_budget: Mapped[Decimal | None] = mapped_column(Numeric(12, 2))
    proposed_timeline: Mapped[str | None]
    status: Mapped[str] = mapped_column(ProposalStatus, default="submitted")
    created_at: Mapped[datetime] = mapped_column(server_default=text("now()"))
    updated_at: Mapped[datetime] = mapped_column(server_default=text("now()"))

    requirement: Mapped["TechnologyRequirement"] = relationship(back_populates="proposals")
    company: Mapped["User"] = relationship(back_populates="proposals_submitted")

class Booking(Base):
    """A reservation/booking placed on a vehicle listing."""
    __tablename__ = 'bookings'

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=text('gen_random_uuid()'))
    listing_id: Mapped[uuid.UUID] = mapped_column(ForeignKey('vehicle_listings.id', ondelete='CASCADE'))
    buyer_id: Mapped[uuid.UUID] = mapped_column(ForeignKey('users.id', ondelete='CASCADE'))
    amount: Mapped[float]
    status: Mapped[str] = mapped_column(default='pending') # pending, confirmed, cancelled
    payment_reference: Mapped[str | None]
    created_at: Mapped[datetime] = mapped_column(server_default=text('now()'))

    listing: Mapped["VehicleListing"] = relationship()
    buyer: Mapped["User"] = relationship()

class SavedSearch(Base):
    """A saved search configuration for a buyer."""
    __tablename__ = 'saved_searches'

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=text('gen_random_uuid()'))
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey('users.id', ondelete='CASCADE'))
    name: Mapped[str]
    filters: Mapped[dict] = mapped_column(JSONB)
    created_at: Mapped[datetime] = mapped_column(server_default=text('now()'))

    user: Mapped["User"] = relationship()

