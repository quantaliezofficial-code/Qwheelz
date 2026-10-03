"""
Seller-facing vehicle listing CRUD and public search. Admin moderation
actions (approve/reject/suspend/reactivate) intentionally live in
app/modules/admin/service.py, not here — the same split the original
codebase used for Venue: a seller writes and owns their own content,
an admin moderates someone else's, and keeping those two responsibilities
in different modules makes it obvious at a glance which side of that
line any given function is on.

The moderation *lifecycle itself* (material-change re-review via
pending_changes, rejection targeting 'draft') is unchanged in spirit
from Venue — see MIGRATION_NOTES.md. What's genuinely new here:
search filters are car attributes instead of venue attributes, and
increment_view_count/mark_sold have no Venue equivalent at all.
"""

from __future__ import annotations

import re
import uuid
from datetime import datetime, timezone
from decimal import Decimal

from fastapi import HTTPException
from sqlalchemy import Select, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.core import (
    User,
    VehicleDocument,
    VehicleEnquiry,
    VehicleFeature,
    VehicleImage,
    VehicleListing,
)

# Changing any of these on an already-active listing sends it back to
# pending_review — a buyer trusts that an active listing's core facts
# (what car, how much, how far driven) were checked, so a material edit
# has to be re-checked too. Photos/features changing does NOT trigger
# re-review on their own in this MVP1 cut (unlike Venue, which did
# re-review on amenity changes) — a deliberate scope trim, see
# MIGRATION_NOTES.md.
MATERIAL_FIELDS = {
    "title", "description", "brand", "model", "variant", "year",
    "price", "km_driven", "fuel_type", "transmission", "body_type", "city",
}

_LISTING_EAGER_LOAD = (
    selectinload(VehicleListing.images),
    selectinload(VehicleListing.documents),
    selectinload(VehicleListing.features),
    selectinload(VehicleListing.seller),
)


def _slugify(title: str, year: int, brand: str, model: str) -> str:
    base = re.sub(r"[^a-z0-9]+", "-", f"{year}-{brand}-{model}-{title}".lower()).strip("-")
    return f"{base}-{uuid.uuid4().hex[:6]}"


async def get_or_create_features(session: AsyncSession, names: list[str]) -> list[VehicleFeature]:
    """No admin-curated master list in MVP1 — features are get-or-created
    by name when a listing references one, same simplicity choice the
    original design made for venue amenities. Names are matched
    case-insensitively and stored with the caller's original casing on
    first creation, so "sunroof" and "Sunroof" resolve to one row."""
    if not names:
        return []
    cleaned = {n.strip() for n in names if n.strip()}
    if not cleaned:
        return []

    result = await session.execute(select(VehicleFeature).where(func.lower(VehicleFeature.name).in_({c.lower() for c in cleaned})))
    existing = {f.name.lower(): f for f in result.scalars().all()}

    features: list[VehicleFeature] = []
    for name in cleaned:
        found = existing.get(name.lower())
        if found is not None:
            features.append(found)
        else:
            new_feature = VehicleFeature(name=name)
            session.add(new_feature)
            await session.flush()
            features.append(new_feature)
    return features


async def create_listing(session: AsyncSession, seller: User, data: dict) -> VehicleListing:
    """Every new listing enters pending_review immediately — there is no
    separate 'save as draft, submit later' step in MVP1. 'draft' as a
    status is only ever reached by rejection (see reject_listing in
    admin/service.py); it means 'rejected, seller can fix and
    resubmit', not 'not yet submitted'."""
    feature_names = data.pop("features", [])
    listing = VehicleListing(
        seller_id=seller.id,
        status="pending_review",
        slug=_slugify(data["title"], data["year"], data["brand"], data["model"]),
        **data,
    )
    listing.features = await get_or_create_features(session, feature_names)
    session.add(listing)
    await session.flush()
    await session.refresh(listing, attribute_names=["id"])

    return await get_listing(session, listing.id)  # re-fetch with eager loads


async def get_listing(session: AsyncSession, listing_id: uuid.UUID) -> VehicleListing | None:
    result = await session.execute(
        select(VehicleListing).where(VehicleListing.id == listing_id).options(*_LISTING_EAGER_LOAD)
    )
    return result.scalar_one_or_none()


async def get_listing_by_slug(session: AsyncSession, slug: str) -> VehicleListing | None:
    result = await session.execute(
        select(VehicleListing).where(VehicleListing.slug == slug).options(*_LISTING_EAGER_LOAD)
    )
    return result.scalar_one_or_none()


def _base_search_query() -> Select:
    return (
        select(VehicleListing)
        .where(VehicleListing.status == "active", VehicleListing.deleted_at.is_(None))
        .options(*_LISTING_EAGER_LOAD)
    )


async def search_listings(
    session: AsyncSession,
    *,
    city: str | None = None,
    brand: str | None = None,
    model: str | None = None,
    body_type: str | None = None,
    fuel_type: str | None = None,
    transmission: str | None = None,
    seller_type: str | None = None,
    verified_only: bool = False,
    price_min: Decimal | None = None,
    price_max: Decimal | None = None,
    year_min: int | None = None,
    year_max: int | None = None,
    km_max: int | None = None,
    owner_count_max: int | None = None,
    color: str | None = None,
    q: str | None = None,
    sort: str = "newest",
    limit: int = 20,
    offset: int = 0,
) -> tuple[list[VehicleListing], int]:
    """Every filter is optional and additive (AND'd together) — matches
    the blueprint's Section 5 filter list one-for-one, plus `q` for the
    free-text "SUV automatic under 15 lakh"-style search box (Section
    14's 'AI #5 — Smart Search' is a richer, NLP-driven version of the
    same idea; `q` here is the plain-text foundation that feature would
    sit on top of, not a replacement for it)."""
    stmt = _base_search_query()

    if city:
        stmt = stmt.where(func.lower(VehicleListing.city) == city.lower())
    if brand:
        stmt = stmt.where(func.lower(VehicleListing.brand) == brand.lower())
    if model:
        stmt = stmt.where(func.lower(VehicleListing.model) == model.lower())
    if body_type:
        stmt = stmt.where(VehicleListing.body_type == body_type)
    if fuel_type:
        stmt = stmt.where(VehicleListing.fuel_type == fuel_type)
    if transmission:
        stmt = stmt.where(VehicleListing.transmission == transmission)
    if price_min is not None:
        stmt = stmt.where(VehicleListing.price >= price_min)
    if price_max is not None:
        stmt = stmt.where(VehicleListing.price <= price_max)
    if year_min is not None:
        stmt = stmt.where(VehicleListing.year >= year_min)
    if year_max is not None:
        stmt = stmt.where(VehicleListing.year <= year_max)
    if km_max is not None:
        stmt = stmt.where(VehicleListing.km_driven <= km_max)
    if owner_count_max is not None:
        stmt = stmt.where(VehicleListing.owner_count <= owner_count_max)
    if color:
        stmt = stmt.where(func.lower(VehicleListing.color) == color.lower())
    if q:
        like = f"%{q.lower()}%"
        stmt = stmt.where(
            func.lower(VehicleListing.title).like(like)
            | func.lower(VehicleListing.brand).like(like)
            | func.lower(VehicleListing.model).like(like)
            | func.lower(VehicleListing.description).like(like)
        )
    if seller_type or verified_only:
        stmt = stmt.join(User, User.id == VehicleListing.seller_id)
        if seller_type:
            stmt = stmt.where(User.seller_type == seller_type)
        if verified_only:
            stmt = stmt.where(User.is_verified.is_(True))

    count_stmt = select(func.count()).select_from(stmt.with_only_columns(VehicleListing.id).subquery())
    total = (await session.execute(count_stmt)).scalar_one()

    if sort == "price_asc":
        stmt = stmt.order_by(VehicleListing.price.asc())
    elif sort == "price_desc":
        stmt = stmt.order_by(VehicleListing.price.desc())
    elif sort == "year_desc":
        stmt = stmt.order_by(VehicleListing.year.desc())
    elif sort == "km_asc":
        stmt = stmt.order_by(VehicleListing.km_driven.asc())
    else:
        # "newest", the default, and the fallback for an unrecognized
        # value — an unknown sort key degrading gracefully to a
        # reasonable default beats a 422 over something this low-stakes.
        stmt = stmt.order_by(VehicleListing.is_featured.desc(), VehicleListing.created_at.desc())

    stmt = stmt.limit(limit).offset(offset)
    results = (await session.execute(stmt)).scalars().unique().all()
    return list(results), total


async def list_seller_listings(session: AsyncSession, seller_id: uuid.UUID) -> list[dict]:
    """Returns each listing plus its live enquiry_count — the blueprint's
    seller dashboard table (Section 6) shows Vehicle / Views / Enquiries
    / Status side by side, so the count is computed here rather than
    making the frontend issue one request per row."""
    listing_stmt = (
        select(VehicleListing)
        .where(VehicleListing.seller_id == seller_id, VehicleListing.deleted_at.is_(None))
        .options(*_LISTING_EAGER_LOAD)
        .order_by(VehicleListing.created_at.desc())
    )
    listings = (await session.execute(listing_stmt)).scalars().unique().all()
    if not listings:
        return []

    counts_stmt = (
        select(VehicleEnquiry.listing_id, func.count())
        .where(VehicleEnquiry.listing_id.in_([listing.id for listing in listings]))
        .group_by(VehicleEnquiry.listing_id)
    )
    counts = dict((row[0], row[1]) for row in (await session.execute(counts_stmt)).all())

    return [{"listing": listing, "enquiry_count": counts.get(listing.id, 0)} for listing in listings]


def _require_owned_and_editable(listing: VehicleListing, seller_id: uuid.UUID) -> None:
    if listing.seller_id != seller_id:
        raise HTTPException(status_code=403, detail="You don't have access to do this")
    if listing.status in ("sold", "suspended"):
        raise HTTPException(status_code=409, detail=f"A {listing.status} listing can't be edited")


async def update_listing(
    session: AsyncSession, listing: VehicleListing, seller_id: uuid.UUID, patch: dict
) -> VehicleListing:
    _require_owned_and_editable(listing, seller_id)

    diff: dict = {}
    feature_names = patch.pop("features", None)
    for field, new_value in patch.items():
        old_value = getattr(listing, field)
        if old_value != new_value:
            if field in MATERIAL_FIELDS:
                diff[field] = {"old": str(old_value), "new": str(new_value)}
            setattr(listing, field, new_value)

    if feature_names is not None:
        listing.features = await get_or_create_features(session, feature_names)

    if diff:
        listing.pending_changes = diff
        listing.status = "pending_review"
        listing.rejection_reason = None
    listing.updated_at = datetime.now(timezone.utc)
    await session.flush()

    return await get_listing(session, listing.id)


async def add_listing_image(
    session: AsyncSession, listing: VehicleListing, seller_id: uuid.UUID, url: str, is_cover: bool
) -> VehicleImage:
    _require_owned_and_editable(listing, seller_id)
    if is_cover:
        await session.execute(
            VehicleImage.__table__.update()
            .where(VehicleImage.listing_id == listing.id)
            .values(is_cover=False)
        )
    sort_order = len(listing.images)
    image = VehicleImage(listing_id=listing.id, url=url, is_cover=is_cover, sort_order=sort_order)
    session.add(image)
    await session.flush()
    return image


async def add_listing_document(
    session: AsyncSession, listing: VehicleListing, seller_id: uuid.UUID, url: str, doc_type: str
) -> VehicleDocument:
    _require_owned_and_editable(listing, seller_id)
    document = VehicleDocument(listing_id=listing.id, url=url, doc_type=doc_type)
    session.add(document)
    await session.flush()
    return document


async def mark_sold(session: AsyncSession, listing: VehicleListing, seller_id: uuid.UUID) -> VehicleListing:
    """A seller's own action, not an admin one — 'mark as sold' is
    housekeeping on your own inventory (blueprint Section 6), not
    content moderation."""
    if listing.seller_id != seller_id:
        raise HTTPException(status_code=403, detail="You don't have access to do this")
    if listing.status not in ("active", "pending_review"):
        raise HTTPException(status_code=409, detail=f"A {listing.status} listing can't be marked sold")
    listing.status = "sold"
    await session.flush()
    return listing


async def soft_delete_listing(session: AsyncSession, listing: VehicleListing, seller_id: uuid.UUID) -> None:
    if listing.seller_id != seller_id:
        raise HTTPException(status_code=403, detail="You don't have access to do this")
    listing.deleted_at = datetime.now(timezone.utc)
    await session.flush()


async def increment_view_count(session: AsyncSession, listing_id: uuid.UUID) -> None:
    """Fire-and-forget from the public detail-page route. Not
    IP-deduplicated in MVP1 (a refresh counts twice) — a known,
    acceptable simplification flagged here rather than silently, same
    treatment the original codebase gave every other placeholder
    business number."""
    await session.execute(
        VehicleListing.__table__.update()
        .where(VehicleListing.id == listing_id)
        .values(view_count=VehicleListing.view_count + 1)
    )
