"""
Admin-side actions across every entity in the platform. Owner/seller-
writes-their-own-content lives in catalog/enquiries/verification/
billing/reviews service modules; this module is specifically the
admin-moderates-someone-else's-content half of each of those, mirroring
exactly how the original codebase split Venue CRUD from admin Venue
oversight.

Every action here that changes someone else's state also writes an
AuditLog row and, where the affected person would want to know, a
Notification — carried over unchanged as a principle: admin power is
only trustworthy if every use of it leaves a trail.

None of these functions open their own transaction — app.db.get_db owns
one transaction per request; see that module's docstring.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.audit.service import log_audit_event
from app.modules.billing.service import apply_confirmed_payment
from app.modules.notifications.service import create_notification
from app.models.core import (
    AuditLog,
    Payment,
    Report,
    Review,
    ParticipantVerification,
    Subscription,
    User,
    VehicleEnquiry,
    VehicleListing,
)


async def _audit(
    session: AsyncSession, actor_id: uuid.UUID, action: str, entity_type: str, entity_id: uuid.UUID | None, extra: dict | None = None
) -> None:
    await log_audit_event(
        session,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        actor_id=actor_id,
        extra_data=extra,
    )


# ---------------------------------------------------------------------
# Overview
# ---------------------------------------------------------------------


async def get_overview(session: AsyncSession) -> dict:
    """Backs the blueprint's Section 12 admin dashboard headline
    numbers: total/active users, cars listed/sold, active companies
    (dealers here), proposals (enquiries here), revenue, reports."""

    async def scalar(stmt) -> int:
        return (await session.execute(stmt)).scalar_one()

    total_users = await scalar(select(func.count()).select_from(User).where(User.deleted_at.is_(None)))
    active_sellers = await scalar(
        select(func.count()).select_from(User).where(User.role == "seller", User.is_verified.is_(True), User.deleted_at.is_(None))
    )
    active_dealers = await scalar(
        select(func.count()).select_from(User).where(User.seller_type == "dealer", User.is_verified.is_(True), User.deleted_at.is_(None))
    )
    listings_active = await scalar(select(func.count()).select_from(VehicleListing).where(VehicleListing.status == "active"))
    listings_pending = await scalar(select(func.count()).select_from(VehicleListing).where(VehicleListing.status == "pending_review"))
    listings_sold = await scalar(select(func.count()).select_from(VehicleListing).where(VehicleListing.status == "sold"))
    total_enquiries = await scalar(select(func.count()).select_from(VehicleEnquiry))
    pending_verifications = await scalar(select(func.count()).select_from(ParticipantVerification).where(ParticipantVerification.status == "pending"))
    open_reports = await scalar(select(func.count()).select_from(Report).where(Report.status == "open"))
    active_subscriptions = await scalar(select(func.count()).select_from(Subscription).where(Subscription.status == "active"))

    revenue_result = await session.execute(select(func.coalesce(func.sum(Payment.amount), 0)).where(Payment.status == "success"))
    revenue_total = revenue_result.scalar_one()

    return {
        "total_users": total_users,
        "active_sellers": active_sellers,
        "active_dealers": active_dealers,
        "listings_active": listings_active,
        "listings_pending_review": listings_pending,
        "listings_sold": listings_sold,
        "total_enquiries": total_enquiries,
        "pending_seller_verifications": pending_verifications,
        "open_reports": open_reports,
        "active_subscriptions": active_subscriptions,
        "revenue_total_inr": revenue_total,
    }


# ---------------------------------------------------------------------
# Users
# ---------------------------------------------------------------------


async def list_users(session: AsyncSession, role: str | None = None, q: str | None = None) -> list[User]:
    stmt = select(User).where(User.deleted_at.is_(None))
    if role:
        stmt = stmt.where(User.role == role)
    if q:
        like = f"%{q.lower()}%"
        stmt = stmt.where(func.lower(User.name).like(like) | func.lower(User.email).like(like) | User.phone.like(f"%{q}%"))
    stmt = stmt.order_by(User.created_at.desc())
    return list((await session.execute(stmt)).scalars().all())


async def suspend_user(session: AsyncSession, admin_id: uuid.UUID, user_id: uuid.UUID, reason: str) -> User:
    user = await session.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role == "admin":
        raise HTTPException(status_code=400, detail="Admin accounts can't be suspended from here")
    user.suspended_at = datetime.now(timezone.utc)
    user.suspension_reason = reason
    await _audit(session, admin_id, "user_suspended", "user", user_id, {"reason": reason})
    await create_notification(session, user_id, "account_suspended", f"Your account was suspended: {reason}")
    await session.flush()
    return user


async def reactivate_user(session: AsyncSession, admin_id: uuid.UUID, user_id: uuid.UUID) -> User:
    user = await session.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    user.suspended_at = None
    user.suspension_reason = None
    await _audit(session, admin_id, "user_reactivated", "user", user_id)
    await session.flush()
    return user


# ---------------------------------------------------------------------
# Listings — approval queue & moderation
# ---------------------------------------------------------------------

_LISTING_EAGER_LOAD = (
    selectinload(VehicleListing.images),
    selectinload(VehicleListing.documents),
    selectinload(VehicleListing.features),
    selectinload(VehicleListing.seller),
)


async def list_listings(session: AsyncSession, status: str | None = None) -> list[VehicleListing]:
    stmt = select(VehicleListing).options(*_LISTING_EAGER_LOAD).order_by(VehicleListing.created_at.desc())
    if status:
        stmt = stmt.where(VehicleListing.status == status)
    return list((await session.execute(stmt)).scalars().unique().all())


async def approve_listing(session: AsyncSession, admin_id: uuid.UUID, listing_id: uuid.UUID) -> VehicleListing:
    listing = await session.get(VehicleListing, listing_id, options=list(_LISTING_EAGER_LOAD))
    if listing is None:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.status != "pending_review":
        raise HTTPException(status_code=409, detail="Only a listing pending review can be approved")
    listing.status = "active"
    listing.rejection_reason = None
    listing.pending_changes = None
    await _audit(session, admin_id, "listing_approved", "vehicle_listing", listing_id)
    await create_notification(
        session, listing.seller_id, "listing_approved", f"Your listing '{listing.title}' is now live.",
        entity_type="listing", entity_id=listing_id,
    )
    await session.flush()
    return listing


async def reject_listing(session: AsyncSession, admin_id: uuid.UUID, listing_id: uuid.UUID, reason: str) -> VehicleListing:
    """Rejection targets 'draft' (editable, not publicly visible) rather
    than a dead-end 'rejected' status — the seller can fix the listing
    and resubmit, which just means editing a draft back into
    pending_review, the same path any other edit takes."""
    listing = await session.get(VehicleListing, listing_id, options=list(_LISTING_EAGER_LOAD))
    if listing is None:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.status != "pending_review":
        raise HTTPException(status_code=409, detail="Only a listing pending review can be rejected")
    listing.status = "draft"
    listing.rejection_reason = reason
    await _audit(session, admin_id, "listing_rejected", "vehicle_listing", listing_id, {"reason": reason})
    await create_notification(
        session, listing.seller_id, "listing_rejected", f"Your listing '{listing.title}' needs changes: {reason}",
        entity_type="listing", entity_id=listing_id,
    )
    await session.flush()
    return listing


async def suspend_listing(session: AsyncSession, admin_id: uuid.UUID, listing_id: uuid.UUID, reason: str) -> VehicleListing:
    listing = await session.get(VehicleListing, listing_id, options=list(_LISTING_EAGER_LOAD))
    if listing is None:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.status not in ("active",):
        raise HTTPException(status_code=409, detail="Only an active listing can be suspended")
    listing.status = "suspended"
    listing.suspension_reason = reason
    await _audit(session, admin_id, "listing_suspended", "vehicle_listing", listing_id, {"reason": reason})
    await create_notification(
        session, listing.seller_id, "listing_suspended", f"Your listing '{listing.title}' was suspended: {reason}",
        entity_type="listing", entity_id=listing_id,
    )
    await session.flush()
    return listing


async def reactivate_listing(session: AsyncSession, admin_id: uuid.UUID, listing_id: uuid.UUID) -> VehicleListing:
    listing = await session.get(VehicleListing, listing_id, options=list(_LISTING_EAGER_LOAD))
    if listing is None:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.status != "suspended":
        raise HTTPException(status_code=409, detail="Only a suspended listing can be reactivated")
    listing.status = "active"
    listing.suspension_reason = None
    await _audit(session, admin_id, "listing_reactivated", "vehicle_listing", listing_id)
    await create_notification(
        session, listing.seller_id, "listing_reactivated", f"Your listing '{listing.title}' is active again.",
        entity_type="listing", entity_id=listing_id,
    )
    await session.flush()
    return listing


async def set_listing_featured(session: AsyncSession, admin_id: uuid.UUID, listing_id: uuid.UUID, featured: bool) -> VehicleListing:
    """A manual admin override alongside the seller-paid path in
    billing/service.py's apply_confirmed_payment — e.g. to comp a
    listing, or to pull a featured slot early for a policy reason."""
    listing = await session.get(VehicleListing, listing_id, options=list(_LISTING_EAGER_LOAD))
    if listing is None:
        raise HTTPException(status_code=404, detail="Listing not found")
    listing.is_featured = featured
    if not featured:
        listing.featured_until = None
    await _audit(session, admin_id, "listing_feature_toggled", "vehicle_listing", listing_id, {"featured": featured})
    await session.flush()
    return listing


# ---------------------------------------------------------------------
# Seller verification
# ---------------------------------------------------------------------


async def list_seller_verifications(session: AsyncSession, status: str | None = None) -> list[ParticipantVerification]:
    stmt = select(ParticipantVerification).options(selectinload(ParticipantVerification.user)).order_by(ParticipantVerification.created_at.desc())
    if status:
        stmt = stmt.where(ParticipantVerification.status == status)
    return list((await session.execute(stmt)).scalars().all())


async def approve_seller_verification(session: AsyncSession, admin_id: uuid.UUID, verification_id: uuid.UUID) -> ParticipantVerification:
    verification = await session.get(ParticipantVerification, verification_id)
    if verification is None:
        raise HTTPException(status_code=404, detail="Verification request not found")
    if verification.status != "pending":
        raise HTTPException(status_code=409, detail="Only a pending request can be approved")

    verification.status = "approved"
    verification.reviewed_by = admin_id
    verification.reviewed_at = datetime.now(timezone.utc)

    user = await session.get(User, verification.user_id)
    user.role = "seller"
    user.seller_type = verification.participant_type
    user.is_verified = True
    if verification.business_name:
        user.business_name = verification.business_name
    if verification.gst_number:
        user.gst_number = verification.gst_number

    await _audit(session, admin_id, "seller_verification_approved", "seller_verification", verification_id)
    await create_notification(session, user.id, "verification_approved", "You're verified! You can now list vehicles for sale.")
    await session.flush()

    return verification


async def reject_seller_verification(
    session: AsyncSession, admin_id: uuid.UUID, verification_id: uuid.UUID, reason: str
) -> ParticipantVerification:
    verification = await session.get(ParticipantVerification, verification_id)
    if verification is None:
        raise HTTPException(status_code=404, detail="Verification request not found")
    if verification.status != "pending":
        raise HTTPException(status_code=409, detail="Only a pending request can be rejected")

    verification.status = "rejected"
    verification.rejection_reason = reason
    verification.reviewed_by = admin_id
    verification.reviewed_at = datetime.now(timezone.utc)

    await _audit(session, admin_id, "seller_verification_rejected", "seller_verification", verification_id, {"reason": reason})
    await create_notification(session, verification.user_id, "verification_rejected", f"Your verification needs changes: {reason}")
    await session.flush()

    return verification


# ---------------------------------------------------------------------
# Enquiries — oversight only, no admin write path into a conversation
# ---------------------------------------------------------------------


async def list_enquiries(session: AsyncSession, status: str | None = None) -> list[VehicleEnquiry]:
    stmt = (
        select(VehicleEnquiry)
        .options(selectinload(VehicleEnquiry.buyer), selectinload(VehicleEnquiry.seller), selectinload(VehicleEnquiry.messages))
        .order_by(VehicleEnquiry.updated_at.desc())
    )
    if status:
        stmt = stmt.where(VehicleEnquiry.status == status)
    return list((await session.execute(stmt)).scalars().unique().all())


# ---------------------------------------------------------------------
# Finance: payments & subscriptions
# ---------------------------------------------------------------------


async def list_payments(session: AsyncSession, status: str | None = None) -> list[Payment]:
    stmt = select(Payment).options(selectinload(Payment.user)).order_by(Payment.created_at.desc())
    if status:
        stmt = stmt.where(Payment.status == status)
    return list((await session.execute(stmt)).scalars().all())


async def confirm_payment(session: AsyncSession, admin_id: uuid.UUID, payment_id: uuid.UUID) -> Payment:
    """The offline-payment-confirmation step — see Payment's docstring
    in models/core.py for why this exists instead of a webhook."""
    payment = await session.get(Payment, payment_id)
    if payment is None:
        raise HTTPException(status_code=404, detail="Payment not found")
    if payment.status != "initiated":
        raise HTTPException(status_code=409, detail="Only an initiated payment can be confirmed")

    payment.status = "success"
    payment.confirmed_by = admin_id
    payment.confirmed_at = datetime.now(timezone.utc)
    await apply_confirmed_payment(session, payment)

    await _audit(session, admin_id, "payment_confirmed", "payment", payment_id, {"amount": str(payment.amount)})
    await create_notification(session, payment.user_id, "subscription_confirmed", "Your payment was confirmed — thanks!")
    await session.flush()

    return payment


async def list_subscriptions(session: AsyncSession, status: str | None = None) -> list[Subscription]:
    stmt = select(Subscription).options(selectinload(Subscription.user)).order_by(Subscription.created_at.desc())
    if status:
        stmt = stmt.where(Subscription.status == status)
    return list((await session.execute(stmt)).scalars().all())


# ---------------------------------------------------------------------
# Moderation: reports & reviews
# ---------------------------------------------------------------------


async def create_report(session: AsyncSession, reporter_id: uuid.UUID, entity_type: str, entity_id: uuid.UUID, reason: str) -> Report:
    if entity_type not in ("listing", "user"):
        raise HTTPException(status_code=422, detail="entity_type must be 'listing' or 'user'")
    report = Report(reporter_id=reporter_id, entity_type=entity_type, entity_id=entity_id, reason=reason)
    session.add(report)
    await session.flush()
    return report


async def list_reports(session: AsyncSession, status: str | None = None) -> list[Report]:
    stmt = select(Report).options(selectinload(Report.reporter)).order_by(Report.created_at.desc())
    if status:
        stmt = stmt.where(Report.status == status)
    return list((await session.execute(stmt)).scalars().all())


async def resolve_report(session: AsyncSession, admin_id: uuid.UUID, report_id: uuid.UUID, outcome: str) -> Report:
    if outcome not in ("resolved", "dismissed"):
        raise HTTPException(status_code=422, detail="outcome must be 'resolved' or 'dismissed'")
    report = await session.get(Report, report_id, options=[selectinload(Report.reporter)])
    if report is None:
        raise HTTPException(status_code=404, detail="Report not found")
    report.status = outcome
    report.resolved_by = admin_id
    report.resolved_at = datetime.now(timezone.utc)
    await session.flush()
    return report


async def list_reviews(session: AsyncSession) -> list[Review]:
    result = await session.execute(select(Review).options(selectinload(Review.buyer), selectinload(Review.seller)).order_by(Review.created_at.desc()))
    return list(result.scalars().all())


async def delete_review(session: AsyncSession, admin_id: uuid.UUID, review_id: uuid.UUID) -> None:
    from app.modules.reviews.service import _recalculate_seller_rating

    review = await session.get(Review, review_id)
    if review is None:
        raise HTTPException(status_code=404, detail="Review not found")
    seller_id = review.seller_id
    await session.delete(review)
    await session.flush()
    await _recalculate_seller_rating(session, seller_id)
    await _audit(session, admin_id, "review_removed", "review", review_id)
    await session.flush()


# ---------------------------------------------------------------------
# Audit log & health
# ---------------------------------------------------------------------


async def get_audit_log(session: AsyncSession, entity_type: str | None = None, limit: int = 100) -> list[AuditLog]:
    stmt = select(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit)
    if entity_type:
        stmt = stmt.where(AuditLog.entity_type == entity_type)
    return list((await session.execute(stmt)).scalars().all())


async def health_check(session: AsyncSession) -> dict:
    await session.execute(select(1))
    return {"status": "ok"}
