"""
Seller verification — the seller-facing half. Renamed from
owner_onboarding. Admin approve/reject lives in app/modules/admin/
service.py, same owner-writes/admin-moderates split as catalog vs.
admin for listings.

Selling is a separate step from signup (see auth/service.py's signup()
docstring) precisely so this module exists: `users.is_verified` starts
False for everyone, and submitting + being approved here is what a
buyer account does to start listing vehicles.
"""

from __future__ import annotations

import uuid

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.core import ParticipantVerification, User


async def get_verification_for_user(session: AsyncSession, user_id: uuid.UUID) -> ParticipantVerification | None:
    result = await session.execute(select(ParticipantVerification).where(ParticipantVerification.user_id == user_id))
    return result.scalar_one_or_none()


async def submit_verification(
    session: AsyncSession,
    user: User,
    seller_type: str,
    document_url: str,
    identification_type: str,
    identification_number: str,
    business_name: str | None = None,
    gst_number: str | None = None,
) -> ParticipantVerification:
    existing = await get_verification_for_user(session, user.id)

    if existing is not None and existing.status == "pending":
        raise HTTPException(status_code=409, detail="You already have a verification request pending review")

    if existing is not None:
        # Resubmission after a rejection, or a reapplication after
        # approval (e.g. an individual seller upgrading to a
        # dealer profile) — update the same row rather than create
        # a second one, so there's exactly one verification
        # history per user to review, not a growing list.
        existing.participant_type = seller_type
        existing.document_url = document_url
        existing.identification_type = identification_type
        existing.identification_number = identification_number
        existing.business_name = business_name
        existing.gst_number = gst_number
        existing.status = "pending"
        existing.rejection_reason = None
        existing.reviewed_by = None
        existing.reviewed_at = None
        verification = existing
    else:
        verification = ParticipantVerification(
            user_id=user.id,
            participant_type=seller_type,
            document_url=document_url,
            identification_type=identification_type,
            identification_number=identification_number,
            business_name=business_name,
            gst_number=gst_number,
            status="pending",
        )
        session.add(verification)

    await session.flush()
    return verification
