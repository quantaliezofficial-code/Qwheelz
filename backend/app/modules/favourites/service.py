"""
The 'Shortlist' / 'Save cars' feature — blueprint Sections 2 & 16. New
module; GroundBooking had no equivalent concept for a venue.
"""

from __future__ import annotations

import uuid

from sqlalchemy import delete, select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.core import VehicleFavourite, VehicleListing

_LISTING_EAGER_LOAD = (
    selectinload(VehicleListing.images),
    selectinload(VehicleListing.documents),
    selectinload(VehicleListing.features),
    selectinload(VehicleListing.seller),
)


async def add_favourite(session: AsyncSession, buyer_id: uuid.UUID, listing_id: uuid.UUID) -> None:
    """Idempotent — favouriting an already-favourited listing is a no-op,
    not a 409, since the frontend's shortlist toggle shouldn't have to
    track state that precisely to avoid an error."""
    stmt = (
        pg_insert(VehicleFavourite)
        .values(buyer_id=buyer_id, listing_id=listing_id)
        .on_conflict_do_nothing(index_elements=["buyer_id", "listing_id"])
    )
    await session.execute(stmt)


async def remove_favourite(session: AsyncSession, buyer_id: uuid.UUID, listing_id: uuid.UUID) -> None:
    await session.execute(
        delete(VehicleFavourite).where(
            VehicleFavourite.buyer_id == buyer_id, VehicleFavourite.listing_id == listing_id
        )
    )


async def list_favourites(session: AsyncSession, buyer_id: uuid.UUID) -> list[VehicleListing]:
    result = await session.execute(
        select(VehicleListing)
        .join(VehicleFavourite, VehicleFavourite.listing_id == VehicleListing.id)
        .where(VehicleFavourite.buyer_id == buyer_id, VehicleListing.deleted_at.is_(None))
        .options(*_LISTING_EAGER_LOAD)
        .order_by(VehicleFavourite.created_at.desc())
    )
    return list(result.scalars().unique().all())


async def get_favourited_ids(session: AsyncSession, buyer_id: uuid.UUID, listing_ids: list[uuid.UUID]) -> set[uuid.UUID]:
    """For a search results page to mark which cards the caller has
    already shortlisted, in one query instead of N."""
    if not listing_ids:
        return set()
    result = await session.execute(
        select(VehicleFavourite.listing_id).where(
            VehicleFavourite.buyer_id == buyer_id, VehicleFavourite.listing_id.in_(listing_ids)
        )
    )
    return set(result.scalars().all())
