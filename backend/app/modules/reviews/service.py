"""
Seller ratings. Re-keyed to the seller rather than the listing — see
Review's docstring in models/core.py. Admin's delete_review lives in
admin/service.py.
"""

from __future__ import annotations

import uuid
from decimal import Decimal

from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.core import Review, User


async def _recalculate_seller_rating(session: AsyncSession, seller_id: uuid.UUID) -> None:
    result = await session.execute(
        select(func.avg(Review.rating), func.count(Review.rating)).where(Review.seller_id == seller_id)
    )
    avg_rating, count = result.one()
    seller = await session.get(User, seller_id)
    if seller is not None:
        seller.avg_rating = Decimal(str(round(avg_rating, 2))) if avg_rating is not None else None
        seller.rating_count = count


async def create_review(
    session: AsyncSession,
    seller_id: uuid.UUID,
    buyer_id: uuid.UUID,
    rating: int,
    content: str,
    listing_id: uuid.UUID | None = None,
) -> Review:
    if seller_id == buyer_id:
        raise HTTPException(status_code=400, detail="You can't review yourself")
    if not 1 <= rating <= 5:
        raise HTTPException(status_code=422, detail="Rating must be between 1 and 5")

    review = Review(seller_id=seller_id, buyer_id=buyer_id, rating=rating, content=content, listing_id=listing_id)
    session.add(review)
    await session.flush()
    await _recalculate_seller_rating(session, seller_id)

    return review


async def list_reviews_for_seller(session: AsyncSession, seller_id: uuid.UUID) -> list[Review]:
    result = await session.execute(
        select(Review)
        .where(Review.seller_id == seller_id)
        .options(selectinload(Review.buyer))
        .order_by(Review.created_at.desc())
    )
    return list(result.scalars().all())
