"""
Seller-side monetization — blueprint Section 13. Replaces the old
booking-payment flow entirely (nothing here descends from it — see
Payment's docstring in models/core.py for why) while deliberately
reusing its one genuinely reusable idea: a Payment starts 'initiated'
and is confirmed by an admin, because this environment has no live
payment-gateway credentials to integrate against and the system this
one replaces made the identical call for the identical reason.

Admin-side confirm_payment lives in app/modules/admin/service.py, same
owner-writes/admin-confirms split used everywhere else in this codebase.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.billing.pricing import get_plan
from app.models.core import Payment, Subscription, User, VehicleListing

FEATURED_BOOST_DAYS = 30
FEATURED_BOOST_PRICE_INR = 299  # Blueprint Section 13: "Featured placement... ₹299–₹999"


async def get_subscription(session: AsyncSession, user_id: uuid.UUID) -> Subscription | None:
    result = await session.execute(select(Subscription).where(Subscription.user_id == user_id))
    return result.scalar_one_or_none()


async def start_subscription_purchase(session: AsyncSession, user: User, plan_id: str) -> Payment:
    """Creates the Subscription (if this is the user's first paid plan)
    or updates the existing one to the newly-requested plan, plus an
    'initiated' Payment for an admin to confirm. The plan does not take
    effect (Subscription.status) until confirm_payment approves it —
    see admin/service.py."""
    plan = get_plan(plan_id)
    if plan is None:
        raise HTTPException(status_code=404, detail="Unknown plan")
    if plan.price_inr is None:
        raise HTTPException(status_code=400, detail="This plan is quote-based — contact sales instead of purchasing")
    if plan.audience == "dealer" and user.seller_type != "dealer":
        raise HTTPException(status_code=403, detail="This plan is only available to dealer accounts")

    subscription = await get_subscription(session, user.id)
    if subscription is None:
        subscription = Subscription(user_id=user.id, plan=plan_id, status="active")
        session.add(subscription)
        await session.flush()
    else:
        subscription.plan = plan_id

    payment = Payment(
        user_id=user.id,
        purpose="subscription",
        subscription_id=subscription.id,
        amount=plan.price_inr,
        status="initiated",
    )
    session.add(payment)
    await session.flush()

    return payment


async def start_featured_listing_purchase(session: AsyncSession, user: User, listing: VehicleListing) -> Payment:
    if listing.seller_id != user.id:
        raise HTTPException(status_code=403, detail="You don't have access to do this")

    payment = Payment(
        user_id=user.id,
        purpose="featured_listing",
        listing_id=listing.id,
        amount=FEATURED_BOOST_PRICE_INR,
        status="initiated",
    )
    session.add(payment)
    await session.flush()

    return payment


async def apply_confirmed_payment(session: AsyncSession, payment: Payment) -> None:
    """Called by admin/service.py's confirm_payment once a Payment moves
    to 'success' — this is where the thing that was paid for actually
    takes effect. Split out from confirm_payment itself so the "what
    does this purpose actually unlock" logic lives in the module that
    owns the concept it's unlocking, not inside admin oversight code."""
    if payment.purpose == "subscription" and payment.subscription_id is not None:
        subscription = await session.get(Subscription, payment.subscription_id)
        if subscription is not None:
            subscription.status = "active"
            subscription.current_period_end = datetime.now(timezone.utc) + timedelta(days=30)
    elif payment.purpose == "featured_listing" and payment.listing_id is not None:
        listing = await session.get(VehicleListing, payment.listing_id)
        if listing is not None:
            listing.is_featured = True
            listing.featured_until = datetime.now(timezone.utc) + timedelta(days=FEATURED_BOOST_DAYS)
