"""
Buyer <-> seller contact and chat — blueprint Section 10
('Communication system') applied to one listing at a time. New module:
GroundBooking's Booking was a paid slot reservation, and nothing here
inherits from it — see VehicleEnquiry's docstring in models/core.py for
why the shapes are deliberately unrelated.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.core import EnquiryMessage, User, VehicleEnquiry, VehicleListing

_ENQUIRY_EAGER_LOAD = (
    selectinload(VehicleEnquiry.messages),
    selectinload(VehicleEnquiry.listing).selectinload(VehicleListing.images),
    selectinload(VehicleEnquiry.buyer),
    selectinload(VehicleEnquiry.seller),
)


async def create_enquiry(
    session: AsyncSession, listing: VehicleListing, buyer: User, message: str
) -> VehicleEnquiry:
    if listing.seller_id == buyer.id:
        raise HTTPException(status_code=400, detail="You can't enquire about your own listing")
    if listing.status not in ("active",):
        raise HTTPException(status_code=409, detail="This listing isn't currently available")

    # One open thread per buyer per listing — a second "Contact
    # Seller" click continues the existing conversation instead of
    # fragmenting it into a second thread the seller has to notice
    # separately.
    existing = await session.execute(
        select(VehicleEnquiry).where(
            VehicleEnquiry.listing_id == listing.id,
            VehicleEnquiry.buyer_id == buyer.id,
            VehicleEnquiry.status != "closed",
        )
    )
    enquiry = existing.scalar_one_or_none()

    if enquiry is None:
        enquiry = VehicleEnquiry(
            listing_id=listing.id,
            listing_title=listing.title,
            seller_id=listing.seller_id,
            buyer_id=buyer.id,
            status="new",
        )
        session.add(enquiry)
        await session.flush()

    session.add(EnquiryMessage(enquiry_id=enquiry.id, sender_id=buyer.id, content=message))
    enquiry.updated_at = datetime.now(timezone.utc)
    await session.flush()

    return await get_enquiry(session, enquiry.id)


async def get_enquiry(session: AsyncSession, enquiry_id: uuid.UUID) -> VehicleEnquiry | None:
    result = await session.execute(
        select(VehicleEnquiry).where(VehicleEnquiry.id == enquiry_id).options(*_ENQUIRY_EAGER_LOAD)
    )
    return result.scalar_one_or_none()


def require_participant(enquiry: VehicleEnquiry, user_id: uuid.UUID) -> None:
    if user_id not in (enquiry.buyer_id, enquiry.seller_id):
        raise HTTPException(status_code=403, detail="You don't have access to do this")


async def list_buyer_enquiries(session: AsyncSession, buyer_id: uuid.UUID) -> list[VehicleEnquiry]:
    result = await session.execute(
        select(VehicleEnquiry)
        .where(VehicleEnquiry.buyer_id == buyer_id)
        .options(*_ENQUIRY_EAGER_LOAD)
        .order_by(VehicleEnquiry.updated_at.desc())
    )
    return list(result.scalars().unique().all())


async def list_seller_enquiries(session: AsyncSession, seller_id: uuid.UUID) -> list[VehicleEnquiry]:
    result = await session.execute(
        select(VehicleEnquiry)
        .where(VehicleEnquiry.seller_id == seller_id)
        .options(*_ENQUIRY_EAGER_LOAD)
        .order_by(VehicleEnquiry.updated_at.desc())
    )
    return list(result.scalars().unique().all())


async def add_message(
    session: AsyncSession, enquiry: VehicleEnquiry, sender: User, content: str, attachment_url: str | None = None
) -> EnquiryMessage:
    require_participant(enquiry, sender.id)
    if enquiry.status == "closed":
        raise HTTPException(status_code=409, detail="This enquiry is closed")

    message = EnquiryMessage(
        enquiry_id=enquiry.id, sender_id=sender.id, content=content, attachment_url=attachment_url
    )
    session.add(message)
    if sender.id == enquiry.seller_id and enquiry.status == "new":
        enquiry.status = "seller_responded"
    enquiry.updated_at = datetime.now(timezone.utc)
    await session.flush()

    return message


async def mark_read(session: AsyncSession, enquiry: VehicleEnquiry, reader_id: uuid.UUID) -> None:
    require_participant(enquiry, reader_id)
    await session.execute(
        update(EnquiryMessage)
        .where(
            EnquiryMessage.enquiry_id == enquiry.id,
            EnquiryMessage.sender_id != reader_id,
            EnquiryMessage.read_at.is_(None),
        )
        .values(read_at=datetime.now(timezone.utc))
    )


async def close_enquiry(session: AsyncSession, enquiry: VehicleEnquiry, actor_id: uuid.UUID) -> VehicleEnquiry:
    require_participant(enquiry, actor_id)
    enquiry.status = "closed"
    enquiry.closed_at = datetime.now(timezone.utc)
    await session.flush()
    return enquiry
