"""
Quantaliez Auto API — every route in one file, same organizational
choice the original codebase made (a single main.py rather than
per-module APIRouters) because at this size it is easier to see the
entire API surface in one scroll than to jump between files, and this
size is not yet where that trade-off flips.

Section order mirrors the product blueprint: auth -> listings (catalog)
-> favourites -> enquiries -> seller verification -> billing -> reviews
-> reports -> notifications -> admin.
"""

from __future__ import annotations

import asyncio
import contextlib
import logging
import uuid
from decimal import Decimal
from datetime import datetime, timezone

from fastapi import Depends, FastAPI, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.db import get_db
from app.models.core import (
    Appointment,
    Booking,
    SavedSearch,
    Subscription,
    SupportMessage,
    SupportTicket,
    User,
    VehicleListing,
    VehicleOffer,
)
from app.modules.admin import service as admin_service
from app.modules.auth import service as auth_service
from app.modules.auth.dependencies import (
    CurrentUser,
    get_current_user,
    get_current_user_optional,
    get_current_user_row,
    require_role,
)
from app.modules.billing import service as billing_service
from app.modules.billing.pricing import PLANS
from app.modules.catalog import service as catalog_service
from app.modules.enquiries import service as enquiries_service
from app.modules.favourites import service as favourites_service
from app.modules.notifications import service as notifications_service
from app.modules.reviews import service as reviews_service
from app.modules.verification import service as verification_service
from app.modules.storage.base import UnsupportedFileError, default_storage
from app.schemas.admin import (
    AuditLogOut,
    FeatureToggleRequest,
    OverviewOut,
    ReasonRequest,
    ReportCreate,
    ReportOut,
    ResolveReportRequest,
)
from app.schemas.auth import (
    AccessTokenResponse,
    ForgotPasswordRequest,
    LoginRequest,
    RefreshRequest,
    ResetPasswordRequest,
    SignupRequest,
    TokenResponse,
    UserOut,
)
from app.schemas.billing import PaymentOut, PlanOut, SubscribeRequest, SubscriptionOut
from app.schemas.catalog import (
    DocType,
    ListingCreate,
    ListingOut,
    ListingSearchResult,
    ListingUpdate,
)
from app.schemas.enquiries import EnquiryCreate, EnquiryOut, MessageCreate, MessageOut
from app.schemas.notifications import NotificationOut, UnreadCountOut
from app.schemas.reviews import ReviewCreate, ReviewOut
from app.schemas.verification import VerificationOut, VerificationSubmit
from app.modules.tech import service as tech_service
from app.schemas.tech import (
    CompanyProfileCreate,
    CompanyProfileOut,
    RequirementCreate,
    RequirementOut,
    ProposalCreate,
    ProposalUpdate,
    ProposalOut
)

logger = logging.getLogger("quantaliez_auto")


# ---------------------------------------------------------------------
# Background sweep: time-bounded seller monetization state
#
# Replaces the old hold-sweep background task. There is no more "expire
# an unpaid booking hold" state in this domain — what now depends on
# wall-clock time rather than on the last write to a row is a
# Subscription past its current_period_end, or a listing past its
# featured_until. Same shape of problem, new subject; see
# app/config.py's billing_sweep_interval_minutes docstring.
# ---------------------------------------------------------------------


async def _run_billing_sweep_once(session: AsyncSession) -> None:
    now = datetime.now(timezone.utc)
    async with session.begin():
        await session.execute(
            update(Subscription)
            .where(Subscription.status == "active", Subscription.current_period_end < now)
            .values(status="expired")
        )
        await session.execute(
            update(VehicleListing)
            .where(VehicleListing.is_featured.is_(True), VehicleListing.featured_until < now)
            .values(is_featured=False, featured_until=None)
        )


async def _billing_sweep_loop() -> None:
    from app.db import AsyncSessionLocal

    interval_seconds = settings.billing_sweep_interval_minutes * 60
    while True:
        try:
            await asyncio.sleep(interval_seconds)
            async with AsyncSessionLocal() as session:
                await _run_billing_sweep_once(session)
        except asyncio.CancelledError:
            raise
        except Exception:  # noqa: BLE001 — a sweep failure must never crash the process
            logger.exception("billing sweep iteration failed")


@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(_billing_sweep_loop())
    yield
    task.cancel()
    with contextlib.suppress(asyncio.CancelledError):
        await task


app = FastAPI(title="Quantaliez Auto API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allowed_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response


# Backs LocalFileStorage's returned URLs (app/modules/storage/base.py) —
# dev/test only, see that module's docstring for the production swap.
app.mount("/uploads", StaticFiles(directory=default_storage.base_dir), name="uploads")


@app.get("/")
@app.get("/health")
@app.get("/api/v1/health")
async def health_check():
    return {"status": "ok", "service": "Quantaliez Auto API", "version": "1.0.0"}


# =======================================================================
# Auth
# =======================================================================


@app.post("/api/v1/auth/signup", response_model=TokenResponse, status_code=201)
async def signup(payload: SignupRequest, db: AsyncSession = Depends(get_db)):
    user = await auth_service.signup(db, payload.name, payload.phone, payload.password, payload.email)
    _, access_token, refresh_token = await auth_service.login(db, payload.phone, payload.password)
    return TokenResponse(access_token=access_token, refresh_token=refresh_token, user=UserOut.model_validate(user))


@app.post("/api/v1/auth/login", response_model=TokenResponse)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    await auth_service.check_login_rate_limit(db, f"ratelimit:login:{payload.login_id.lower()}")
    user, access_token, refresh_token = await auth_service.login(db, payload.login_id, payload.password)
    return TokenResponse(access_token=access_token, refresh_token=refresh_token, user=UserOut.model_validate(user))


@app.post("/api/v1/auth/refresh", response_model=AccessTokenResponse)
async def refresh(payload: RefreshRequest, db: AsyncSession = Depends(get_db)):
    new_refresh, user = await auth_service.rotate_refresh_token(db, payload.refresh_token)
    from app.modules.auth.security import create_access_token

    return AccessTokenResponse(access_token=create_access_token(user.id, user.role), refresh_token=new_refresh)


@app.post("/api/v1/auth/logout", status_code=204)
async def logout(payload: RefreshRequest, db: AsyncSession = Depends(get_db)):
    await auth_service.logout(db, payload.refresh_token)


@app.post("/api/v1/auth/forgot-password", status_code=202)
async def forgot_password(payload: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    token = await auth_service.request_password_reset(db, payload.email)
    if token:
        # No email provider is configured in this sandbox — see
        # request_password_reset()'s docstring. Logging stands in for
        # "an email was sent" until a real provider is wired in.
        logger.info("password reset requested for %s — reset token: %s", payload.email, token)
    return {"detail": "If an account exists for that email, a reset link has been sent."}


@app.post("/api/v1/auth/reset-password", status_code=204)
async def reset_password(payload: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    await auth_service.reset_password(db, payload.token, payload.new_password)


@app.get("/api/v1/users/me", response_model=UserOut)
async def get_me(user: User = Depends(get_current_user_row)):
    return UserOut.model_validate(user)


# =======================================================================
# Catalog: vehicle listings
# =======================================================================


def _apply_favourite_flags(listings: list[VehicleListing], favourited_ids: set[uuid.UUID]) -> list[ListingOut]:
    out = []
    for listing in listings:
        data = ListingOut.model_validate(listing).model_copy(update={"is_favourited": listing.id in favourited_ids})
        out.append(data)
    return out


@app.post("/api/v1/listings", response_model=ListingOut, status_code=201)
async def create_listing(
    payload: ListingCreate,
    current: CurrentUser = Depends(require_role("seller", "admin")),
    db: AsyncSession = Depends(get_db),
):
    seller = await db.get(User, current.id)
    listing = await catalog_service.create_listing(db, seller, payload.model_dump())
    return ListingOut.model_validate(listing)


@app.get("/api/v1/listings", response_model=ListingSearchResult)
async def search_listings(
    city: str | None = None,
    brand: str | None = None,
    model: str | None = None,
    body_type: str | None = None,
    fuel_type: str | None = None,
    transmission: str | None = None,
    seller_type: str | None = None,
    verified_only: bool = False,
    price_min: float | None = None,
    price_max: float | None = None,
    year_min: int | None = None,
    year_max: int | None = None,
    km_max: int | None = None,
    owner_count_max: int | None = None,
    color: str | None = None,
    q: str | None = None,
    sort: str = "newest",
    limit: int = Query(default=20, le=100),
    offset: int = Query(default=0, ge=0),
    current: CurrentUser | None = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db),
):
    listings, total = await catalog_service.search_listings(
        db,
        city=city, brand=brand, model=model, body_type=body_type, fuel_type=fuel_type,
        transmission=transmission, seller_type=seller_type, verified_only=verified_only,
        price_min=price_min, price_max=price_max, year_min=year_min, year_max=year_max,
        km_max=km_max, owner_count_max=owner_count_max, color=color, q=q, sort=sort,
        limit=limit, offset=offset,
    )
    favourited_ids: set[uuid.UUID] = set()
    if current is not None:
        favourited_ids = await favourites_service.get_favourited_ids(db, current.id, [listing.id for listing in listings])
    return ListingSearchResult(results=_apply_favourite_flags(listings, favourited_ids), total=total, limit=limit, offset=offset)


@app.get("/api/v1/listings/mine", response_model=list[dict])
async def my_listings(current: CurrentUser = Depends(require_role("seller", "admin")), db: AsyncSession = Depends(get_db)):
    rows = await catalog_service.list_seller_listings(db, current.id)
    return [{"listing": ListingOut.model_validate(row["listing"]), "enquiry_count": row["enquiry_count"]} for row in rows]


@app.get("/api/v1/listings/slug/{slug}", response_model=ListingOut)
async def get_listing_by_slug(slug: str, current: CurrentUser | None = Depends(get_current_user_optional), db: AsyncSession = Depends(get_db)):
    listing = await catalog_service.get_listing_by_slug(db, slug)
    if listing is None:
        raise HTTPException(status_code=404, detail="Listing not found")
    await catalog_service.increment_view_count(db, listing.id)
    favourited_ids = set()
    if current is not None:
        favourited_ids = await favourites_service.get_favourited_ids(db, current.id, [listing.id])
    return _apply_favourite_flags([listing], favourited_ids)[0]


@app.get("/api/v1/listings/{listing_id}", response_model=ListingOut)
async def get_listing(listing_id: uuid.UUID, current: CurrentUser | None = Depends(get_current_user_optional), db: AsyncSession = Depends(get_db)):
    listing = await catalog_service.get_listing(db, listing_id)
    if listing is None:
        raise HTTPException(status_code=404, detail="Listing not found")
    favourited_ids = set()
    if current is not None:
        favourited_ids = await favourites_service.get_favourited_ids(db, current.id, [listing.id])
    return _apply_favourite_flags([listing], favourited_ids)[0]


async def _get_owned_listing(db: AsyncSession, listing_id: uuid.UUID) -> VehicleListing:
    listing = await catalog_service.get_listing(db, listing_id)
    if listing is None:
        raise HTTPException(status_code=404, detail="Listing not found")
    return listing


@app.patch("/api/v1/listings/{listing_id}", response_model=ListingOut)
async def update_listing(
    listing_id: uuid.UUID, payload: ListingUpdate, current: CurrentUser = Depends(require_role("seller", "admin")), db: AsyncSession = Depends(get_db)
):
    listing = await _get_owned_listing(db, listing_id)
    updated = await catalog_service.update_listing(db, listing, current.id, payload.model_dump(exclude_unset=True))
    return ListingOut.model_validate(updated)


@app.delete("/api/v1/listings/{listing_id}", status_code=204)
async def delete_listing(listing_id: uuid.UUID, current: CurrentUser = Depends(require_role("seller", "admin")), db: AsyncSession = Depends(get_db)):
    listing = await _get_owned_listing(db, listing_id)
    await catalog_service.soft_delete_listing(db, listing, current.id)


@app.post("/api/v1/listings/{listing_id}/mark-sold", response_model=ListingOut)
async def mark_listing_sold(listing_id: uuid.UUID, current: CurrentUser = Depends(require_role("seller", "admin")), db: AsyncSession = Depends(get_db)):
    listing = await _get_owned_listing(db, listing_id)
    updated = await catalog_service.mark_sold(db, listing, current.id)
    return ListingOut.model_validate(updated)


@app.post("/api/v1/listings/{listing_id}/images", response_model=ListingOut)
async def upload_listing_image(
    listing_id: uuid.UUID, file: UploadFile, is_cover: bool = False,
    current: CurrentUser = Depends(require_role("seller", "admin")), db: AsyncSession = Depends(get_db),
):
    listing = await _get_owned_listing(db, listing_id)
    content = await file.read()
    try:
        url = await default_storage.save(content, file.content_type or "", key_prefix=f"listings/{listing_id}/images")
    except UnsupportedFileError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    await catalog_service.add_listing_image(db, listing, current.id, url, is_cover)
    refreshed = await catalog_service.get_listing(db, listing_id)
    return ListingOut.model_validate(refreshed)


@app.post("/api/v1/listings/{listing_id}/documents", response_model=ListingOut)
async def upload_listing_document(
    listing_id: uuid.UUID, file: UploadFile, doc_type: DocType = "rc_registration",
    current: CurrentUser = Depends(require_role("seller", "admin")), db: AsyncSession = Depends(get_db),
):
    listing = await _get_owned_listing(db, listing_id)
    content = await file.read()
    try:
        url = await default_storage.save(content, file.content_type or "", key_prefix=f"listings/{listing_id}/documents")
    except UnsupportedFileError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    await catalog_service.add_listing_document(db, listing, current.id, url, doc_type)
    refreshed = await catalog_service.get_listing(db, listing_id)
    return ListingOut.model_validate(refreshed)


# =======================================================================
# Favourites (shortlist)
# =======================================================================


@app.post("/api/v1/listings/{listing_id}/favourite", status_code=204)
async def favourite_listing(listing_id: uuid.UUID, current: CurrentUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await favourites_service.add_favourite(db, current.id, listing_id)


@app.delete("/api/v1/listings/{listing_id}/favourite", status_code=204)
async def unfavourite_listing(listing_id: uuid.UUID, current: CurrentUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await favourites_service.remove_favourite(db, current.id, listing_id)


@app.get("/api/v1/me/favourites", response_model=list[ListingOut])
async def my_favourites(current: CurrentUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    listings = await favourites_service.list_favourites(db, current.id)
    return _apply_favourite_flags(listings, {listing.id for listing in listings})


# =======================================================================
# Enquiries & messaging
# =======================================================================


@app.post("/api/v1/listings/{listing_id}/enquiries", response_model=EnquiryOut, status_code=201)
async def create_enquiry(listing_id: uuid.UUID, payload: EnquiryCreate, current: CurrentUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    listing = await _get_owned_listing(db, listing_id)
    buyer = await db.get(User, current.id)
    enquiry = await enquiries_service.create_enquiry(db, listing, buyer, payload.message)
    await notifications_service.create_notification(
        db, enquiry.seller_id, "enquiry_received", f"New enquiry on '{listing.title}'", entity_type="enquiry", entity_id=enquiry.id
    )
    return EnquiryOut.model_validate(enquiry)


@app.get("/api/v1/enquiries", response_model=list[EnquiryOut])
async def list_my_enquiries(current: CurrentUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current.role == "seller":
        enquiries = await enquiries_service.list_seller_enquiries(db, current.id)
    else:
        enquiries = await enquiries_service.list_buyer_enquiries(db, current.id)
    return [EnquiryOut.model_validate(e) for e in enquiries]


async def _get_enquiry_or_404(db: AsyncSession, enquiry_id: uuid.UUID):
    enquiry = await enquiries_service.get_enquiry(db, enquiry_id)
    if enquiry is None:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    return enquiry


@app.get("/api/v1/enquiries/{enquiry_id}", response_model=EnquiryOut)
async def get_enquiry(enquiry_id: uuid.UUID, current: CurrentUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    enquiry = await _get_enquiry_or_404(db, enquiry_id)
    enquiries_service.require_participant(enquiry, current.id)
    await enquiries_service.mark_read(db, enquiry, current.id)
    return EnquiryOut.model_validate(enquiry)


@app.post("/api/v1/enquiries/{enquiry_id}/messages", response_model=MessageOut, status_code=201)
async def send_message(enquiry_id: uuid.UUID, payload: MessageCreate, current: CurrentUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    enquiry = await _get_enquiry_or_404(db, enquiry_id)
    sender = await db.get(User, current.id)
    message = await enquiries_service.add_message(db, enquiry, sender, payload.content, payload.attachment_url)
    other_party_id = enquiry.seller_id if sender.id == enquiry.buyer_id else enquiry.buyer_id
    await notifications_service.create_notification(
        db, other_party_id, "enquiry_message", f"New message about '{enquiry.listing_title}'", entity_type="enquiry", entity_id=enquiry.id
    )
    return MessageOut.model_validate(message)


@app.post("/api/v1/enquiries/{enquiry_id}/close", response_model=EnquiryOut)
async def close_enquiry(enquiry_id: uuid.UUID, current: CurrentUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    enquiry = await _get_enquiry_or_404(db, enquiry_id)
    updated = await enquiries_service.close_enquiry(db, enquiry, current.id)
    return EnquiryOut.model_validate(updated)


# =======================================================================
# Seller verification
# =======================================================================


@app.post("/api/v1/seller/verification", response_model=VerificationOut, status_code=201)
async def submit_verification(payload: VerificationSubmit, current: CurrentUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    user = await db.get(User, current.id)
    verification = await verification_service.submit_verification(
        db, user, payload.participant_type, payload.document_url, payload.identification_type,
        payload.identification_number, payload.business_name, payload.gst_number,
    )
    return VerificationOut.model_validate(verification)


@app.get("/api/v1/seller/verification", response_model=VerificationOut | None)
async def get_my_verification(current: CurrentUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    verification = await verification_service.get_verification_for_user(db, current.id)
    return VerificationOut.model_validate(verification) if verification else None


# =======================================================================
# Billing: plans, subscriptions, payments
# =======================================================================


@app.get("/api/v1/plans", response_model=list[PlanOut])
async def list_plans():
    return [PlanOut(**vars(plan)) for plan in PLANS.values()]


@app.post("/api/v1/seller/subscribe", response_model=PaymentOut, status_code=201)
async def subscribe(payload: SubscribeRequest, current: CurrentUser = Depends(require_role("seller")), db: AsyncSession = Depends(get_db)):
    user = await db.get(User, current.id)
    payment = await billing_service.start_subscription_purchase(db, user, payload.plan)
    return PaymentOut.model_validate(payment)


@app.get("/api/v1/seller/subscription", response_model=SubscriptionOut | None)
async def get_my_subscription(current: CurrentUser = Depends(require_role("seller")), db: AsyncSession = Depends(get_db)):
    subscription = await billing_service.get_subscription(db, current.id)
    return SubscriptionOut.model_validate(subscription) if subscription else None


@app.post("/api/v1/listings/{listing_id}/promote", response_model=PaymentOut, status_code=201)
async def promote_listing(listing_id: uuid.UUID, current: CurrentUser = Depends(require_role("seller")), db: AsyncSession = Depends(get_db)):
    listing = await _get_owned_listing(db, listing_id)
    user = await db.get(User, current.id)
    payment = await billing_service.start_featured_listing_purchase(db, user, listing)
    return PaymentOut.model_validate(payment)


# =======================================================================
# Reviews (seller ratings)
# =======================================================================


@app.post("/api/v1/sellers/{seller_id}/reviews", response_model=ReviewOut, status_code=201)
async def create_review(seller_id: uuid.UUID, payload: ReviewCreate, current: CurrentUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    review = await reviews_service.create_review(db, seller_id, current.id, payload.rating, payload.content, payload.listing_id)
    await db.refresh(review, attribute_names=["buyer"])
    return ReviewOut.model_validate(review)


@app.get("/api/v1/sellers/{seller_id}/reviews", response_model=list[ReviewOut])
async def list_seller_reviews(seller_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    reviews = await reviews_service.list_reviews_for_seller(db, seller_id)
    return [ReviewOut.model_validate(r) for r in reviews]


# =======================================================================
# Reports
# =======================================================================


@app.post("/api/v1/reports", response_model=ReportOut, status_code=201)
async def create_report(payload: ReportCreate, current: CurrentUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    report = await admin_service.create_report(db, current.id, payload.entity_type, payload.entity_id, payload.reason)
    await db.refresh(report, attribute_names=["reporter"])
    return ReportOut.model_validate(report)


# =======================================================================
# Notifications
# =======================================================================


@app.get("/api/v1/notifications", response_model=list[NotificationOut])
async def list_notifications(unread_only: bool = False, current: CurrentUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    notifications = await notifications_service.list_notifications(db, current.id, unread_only)
    return [NotificationOut.model_validate(n) for n in notifications]


@app.get("/api/v1/notifications/unread-count", response_model=UnreadCountOut)
async def unread_count(current: CurrentUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return UnreadCountOut(count=await notifications_service.count_unread(db, current.id))


@app.post("/api/v1/notifications/{notification_id}/read", status_code=204)
async def mark_notification_read(notification_id: uuid.UUID, current: CurrentUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await notifications_service.mark_read(db, notification_id, current.id)


@app.post("/api/v1/notifications/read-all", status_code=204)
async def mark_all_notifications_read(current: CurrentUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await notifications_service.mark_all_read(db, current.id)


# =======================================================================
# Tech Domain: Company Profiles, Requirements, Proposals
# =======================================================================

@app.post("/api/v1/tech/profile", response_model=CompanyProfileOut)
async def create_company_profile(
    data: CompanyProfileCreate, 
    current: CurrentUser = Depends(require_role("it_company")), 
    db: AsyncSession = Depends(get_db)
):
    return await tech_service.create_company_profile(db, current.id, data)

@app.get("/api/v1/tech/profile/{user_id}", response_model=CompanyProfileOut)
async def get_company_profile(
    user_id: uuid.UUID, 
    db: AsyncSession = Depends(get_db)
):
    profile = await tech_service.get_company_profile(db, user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Company profile not found")
    return profile

@app.post("/api/v1/tech/requirements", response_model=RequirementOut)
async def create_requirement(
    data: RequirementCreate, 
    current: CurrentUser = Depends(require_role("customer")), 
    db: AsyncSession = Depends(get_db)
):
    return await tech_service.create_requirement(db, current.id, data)

@app.get("/api/v1/tech/requirements", response_model=list[RequirementOut])
async def list_requirements(
    status: str | None = None, 
    db: AsyncSession = Depends(get_db)
):
    return await tech_service.list_requirements(db, status)

@app.get("/api/v1/tech/requirements/{req_id}", response_model=RequirementOut)
async def get_requirement(
    req_id: uuid.UUID, 
    db: AsyncSession = Depends(get_db)
):
    return await tech_service.get_requirement(db, req_id)

@app.post("/api/v1/tech/requirements/{req_id}/proposals", response_model=ProposalOut)
async def submit_proposal(
    req_id: uuid.UUID, 
    data: ProposalCreate, 
    current: CurrentUser = Depends(require_role("it_company")), 
    db: AsyncSession = Depends(get_db)
):
    return await tech_service.create_proposal(db, current.id, req_id, data)

@app.get("/api/v1/tech/requirements/{req_id}/proposals", response_model=list[ProposalOut])
async def list_proposals(
    req_id: uuid.UUID, 
    current: CurrentUser = Depends(require_role("customer")), 
    db: AsyncSession = Depends(get_db)
):
    # Enforce that only the customer who posted it can see the proposals, or admins
    req = await tech_service.get_requirement(db, req_id)
    if req.customer_id != current.id and current.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to view proposals for this requirement")
    return await tech_service.list_proposals(db, req_id)

@app.patch("/api/v1/tech/proposals/{prop_id}/status", response_model=ProposalOut)
async def update_proposal_status(
    prop_id: uuid.UUID, 
    data: ProposalUpdate, 
    current: CurrentUser = Depends(require_role("customer")), 
    db: AsyncSession = Depends(get_db)
):
    if data.status not in ("shortlisted", "accepted", "rejected"):
        raise HTTPException(status_code=400, detail="Invalid status transition by customer")
    return await tech_service.update_proposal_status(db, prop_id, current.id, data.status)


# =======================================================================
# Admin
# =======================================================================


@app.get("/api/v1/admin/overview", response_model=OverviewOut)
async def admin_overview(current: CurrentUser = Depends(require_role("admin")), db: AsyncSession = Depends(get_db)):
    return OverviewOut(**await admin_service.get_overview(db))


@app.get("/api/v1/admin/users", response_model=list[UserOut])
async def admin_list_users(role: str | None = None, q: str | None = None, current: CurrentUser = Depends(require_role("admin")), db: AsyncSession = Depends(get_db)):
    return [UserOut.model_validate(u) for u in await admin_service.list_users(db, role, q)]


@app.post("/api/v1/admin/users/{user_id}/suspend", response_model=UserOut)
async def admin_suspend_user(user_id: uuid.UUID, payload: ReasonRequest, current: CurrentUser = Depends(require_role("admin")), db: AsyncSession = Depends(get_db)):
    user = await admin_service.suspend_user(db, current.id, user_id, payload.reason)
    return UserOut.model_validate(user)


@app.post("/api/v1/admin/users/{user_id}/reactivate", response_model=UserOut)
async def admin_reactivate_user(user_id: uuid.UUID, current: CurrentUser = Depends(require_role("admin")), db: AsyncSession = Depends(get_db)):
    user = await admin_service.reactivate_user(db, current.id, user_id)
    return UserOut.model_validate(user)


@app.get("/api/v1/admin/listings", response_model=list[ListingOut])
async def admin_list_listings(status: str | None = None, current: CurrentUser = Depends(require_role("admin")), db: AsyncSession = Depends(get_db)):
    return [ListingOut.model_validate(l) for l in await admin_service.list_listings(db, status)]


@app.post("/api/v1/admin/listings/{listing_id}/approve", response_model=ListingOut)
async def admin_approve_listing(listing_id: uuid.UUID, current: CurrentUser = Depends(require_role("admin")), db: AsyncSession = Depends(get_db)):
    listing = await admin_service.approve_listing(db, current.id, listing_id)
    return ListingOut.model_validate(listing)


@app.post("/api/v1/admin/listings/{listing_id}/reject", response_model=ListingOut)
async def admin_reject_listing(listing_id: uuid.UUID, payload: ReasonRequest, current: CurrentUser = Depends(require_role("admin")), db: AsyncSession = Depends(get_db)):
    listing = await admin_service.reject_listing(db, current.id, listing_id, payload.reason)
    return ListingOut.model_validate(listing)


@app.post("/api/v1/admin/listings/{listing_id}/suspend", response_model=ListingOut)
async def admin_suspend_listing(listing_id: uuid.UUID, payload: ReasonRequest, current: CurrentUser = Depends(require_role("admin")), db: AsyncSession = Depends(get_db)):
    listing = await admin_service.suspend_listing(db, current.id, listing_id, payload.reason)
    return ListingOut.model_validate(listing)


@app.post("/api/v1/admin/listings/{listing_id}/reactivate", response_model=ListingOut)
async def admin_reactivate_listing(listing_id: uuid.UUID, current: CurrentUser = Depends(require_role("admin")), db: AsyncSession = Depends(get_db)):
    listing = await admin_service.reactivate_listing(db, current.id, listing_id)
    return ListingOut.model_validate(listing)


@app.post("/api/v1/admin/listings/{listing_id}/feature", response_model=ListingOut)
async def admin_feature_listing(listing_id: uuid.UUID, payload: FeatureToggleRequest, current: CurrentUser = Depends(require_role("admin")), db: AsyncSession = Depends(get_db)):
    listing = await admin_service.set_listing_featured(db, current.id, listing_id, payload.featured)
    return ListingOut.model_validate(listing)


@app.get("/api/v1/admin/seller-verifications", response_model=list[VerificationOut])
async def admin_list_verifications(status: str | None = None, current: CurrentUser = Depends(require_role("admin")), db: AsyncSession = Depends(get_db)):
    return [VerificationOut.model_validate(v) for v in await admin_service.list_seller_verifications(db, status)]


@app.post("/api/v1/admin/seller-verifications/{verification_id}/approve", response_model=VerificationOut)
async def admin_approve_verification(verification_id: uuid.UUID, current: CurrentUser = Depends(require_role("admin")), db: AsyncSession = Depends(get_db)):
    verification = await admin_service.approve_seller_verification(db, current.id, verification_id)
    return VerificationOut.model_validate(verification)


@app.post("/api/v1/admin/seller-verifications/{verification_id}/reject", response_model=VerificationOut)
async def admin_reject_verification(verification_id: uuid.UUID, payload: ReasonRequest, current: CurrentUser = Depends(require_role("admin")), db: AsyncSession = Depends(get_db)):
    verification = await admin_service.reject_seller_verification(db, current.id, verification_id, payload.reason)
    return VerificationOut.model_validate(verification)


@app.get("/api/v1/admin/enquiries", response_model=list[EnquiryOut])
async def admin_list_enquiries(status: str | None = None, current: CurrentUser = Depends(require_role("admin")), db: AsyncSession = Depends(get_db)):
    return [EnquiryOut.model_validate(e) for e in await admin_service.list_enquiries(db, status)]


@app.get("/api/v1/admin/payments", response_model=list[PaymentOut])
async def admin_list_payments(status: str | None = None, current: CurrentUser = Depends(require_role("admin")), db: AsyncSession = Depends(get_db)):
    return [PaymentOut.model_validate(p) for p in await admin_service.list_payments(db, status)]


@app.post("/api/v1/admin/payments/{payment_id}/confirm", response_model=PaymentOut)
async def admin_confirm_payment(payment_id: uuid.UUID, current: CurrentUser = Depends(require_role("admin")), db: AsyncSession = Depends(get_db)):
    payment = await admin_service.confirm_payment(db, current.id, payment_id)
    return PaymentOut.model_validate(payment)


@app.get("/api/v1/admin/subscriptions", response_model=list[SubscriptionOut])
async def admin_list_subscriptions(status: str | None = None, current: CurrentUser = Depends(require_role("admin")), db: AsyncSession = Depends(get_db)):
    return [SubscriptionOut.model_validate(s) for s in await admin_service.list_subscriptions(db, status)]


@app.get("/api/v1/admin/reports", response_model=list[ReportOut])
async def admin_list_reports(status: str | None = None, current: CurrentUser = Depends(require_role("admin")), db: AsyncSession = Depends(get_db)):
    return [ReportOut.model_validate(r) for r in await admin_service.list_reports(db, status)]


@app.post("/api/v1/admin/reports/{report_id}/resolve", response_model=ReportOut)
async def admin_resolve_report(report_id: uuid.UUID, payload: ResolveReportRequest, current: CurrentUser = Depends(require_role("admin")), db: AsyncSession = Depends(get_db)):
    report = await admin_service.resolve_report(db, current.id, report_id, payload.outcome)
    return ReportOut.model_validate(report)


@app.get("/api/v1/admin/reviews", response_model=list[ReviewOut])
async def admin_list_reviews(current: CurrentUser = Depends(require_role("admin")), db: AsyncSession = Depends(get_db)):
    return [ReviewOut.model_validate(r) for r in await admin_service.list_reviews(db)]


@app.delete("/api/v1/admin/reviews/{review_id}", status_code=204)
async def admin_delete_review(review_id: uuid.UUID, current: CurrentUser = Depends(require_role("admin")), db: AsyncSession = Depends(get_db)):
    await admin_service.delete_review(db, current.id, review_id)


@app.get("/api/v1/admin/audit-log", response_model=list[AuditLogOut])
async def admin_audit_log(entity_type: str | None = None, current: CurrentUser = Depends(require_role("admin")), db: AsyncSession = Depends(get_db)):
    return [AuditLogOut.model_validate(a) for a in await admin_service.get_audit_log(db, entity_type)]


@app.get("/api/v1/admin/health")
async def admin_health(current: CurrentUser = Depends(require_role("admin")), db: AsyncSession = Depends(get_db)):
    return await admin_service.health_check(db)


@app.get("/api/v1/health")
async def health():
    """Unauthenticated liveness probe — deliberately separate from
    /admin/health, which touches the database and requires a token."""
    return {"status": "ok", "service": "quantaliez-auto-api"}

# --- Phase 5: Booking System & Phase 8: Saved Searches ---

from pydantic import BaseModel, ConfigDict
from typing import Dict, Any

class BookingCreate(BaseModel):
    listing_id: uuid.UUID
    amount: float = 999.0

class BookingResponse(BaseModel):
    id: uuid.UUID
    listing_id: uuid.UUID
    buyer_id: uuid.UUID
    amount: float
    status: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

@app.post("/api/v1/bookings", response_model=BookingResponse)
async def create_booking(
    booking: BookingCreate,
    current_user: CurrentUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    from app.models.core import Booking, VehicleListing
    # Ensure listing exists
    listing = await session.get(VehicleListing, booking.listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail='Listing not found')
    
    new_booking = Booking(
        listing_id=booking.listing_id,
        buyer_id=current_user.id,
        amount=booking.amount,
        status='confirmed' # Mocking instant confirmation
    )
    session.add(new_booking)
    await session.commit()
    await session.refresh(new_booking)
    return new_booking


class SavedSearchCreate(BaseModel):
    name: str
    filters: Dict[str, Any]

class SavedSearchResponse(BaseModel):
    id: uuid.UUID
    name: str
    filters: Dict[str, Any]
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

@app.post("/api/v1/saved-searches", response_model=SavedSearchResponse)
async def create_saved_search(
    req: SavedSearchCreate,
    current_user: CurrentUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    from app.models.core import SavedSearch
    new_search = SavedSearch(
        user_id=current_user.id,
        name=req.name,
        filters=req.filters
    )
    session.add(new_search)
    await session.commit()
    await session.refresh(new_search)
    return new_search

@app.get("/api/v1/saved-searches", response_model=list[SavedSearchResponse])
async def list_saved_searches(
    current_user: CurrentUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    from app.models.core import SavedSearch
    stmt = select(SavedSearch).where(SavedSearch.user_id == current_user.id).order_by(SavedSearch.created_at.desc())
    result = await session.scalars(stmt)
    return list(result.all())

@app.delete("/api/v1/saved-searches/{search_id}", status_code=204)
async def delete_saved_search(
    search_id: uuid.UUID,
    current_user: CurrentUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    from app.models.core import SavedSearch
    search = await session.get(SavedSearch, search_id)
    if not search or search.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Saved search not found")
    await session.delete(search)
    await session.commit()


# =======================================================================
# Feature Book Module 8: Appointments & Test Drives
# =======================================================================

class AppointmentCreate(BaseModel):
    listing_id: uuid.UUID
    appointment_type: str = "test_drive"  # test_drive | inspection
    scheduled_at: datetime
    time_slot: str | None = None
    notes: str | None = None

class AppointmentStatusUpdate(BaseModel):
    status: str  # confirmed | rescheduled | cancelled | completed | no_show
    notes: str | None = None
    scheduled_at: datetime | None = None
    time_slot: str | None = None

class AppointmentOut(BaseModel):
    id: uuid.UUID
    listing_id: uuid.UUID
    listing_title: str
    listing_slug: str
    buyer_id: uuid.UUID
    buyer_name: str
    buyer_phone: str
    seller_id: uuid.UUID
    seller_name: str
    seller_phone: str
    appointment_type: str
    scheduled_at: datetime
    time_slot: str | None
    status: str
    notes: str | None
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

@app.post("/api/v1/appointments", response_model=AppointmentOut, status_code=201)
async def create_appointment(
    payload: AppointmentCreate,
    current: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.models.core import Appointment, VehicleListing
    listing = await db.get(VehicleListing, payload.listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Vehicle listing not found")
    if listing.seller_id == current.id:
        raise HTTPException(status_code=400, detail="Cannot book appointment on your own listing")
    
    seller = await db.get(User, listing.seller_id)
    buyer = await db.get(User, current.id)

    appt = Appointment(
        listing_id=listing.id,
        buyer_id=current.id,
        seller_id=listing.seller_id,
        appointment_type=payload.appointment_type,
        scheduled_at=payload.scheduled_at,
        time_slot=payload.time_slot,
        status="requested",
        notes=payload.notes,
    )
    db.add(appt)
    await db.commit()
    await db.refresh(appt)

    buyer_name = buyer.name if buyer else "Buyer"
    buyer_phone = buyer.phone if buyer else ""
    await notifications_service.create_notification(
        db, listing.seller_id, "appointment_requested",
        f"New {payload.appointment_type.replace('_', ' ')} requested for '{listing.title}' by {buyer_name}",
        entity_type="appointment", entity_id=appt.id
    )

    return AppointmentOut(
        id=appt.id,
        listing_id=listing.id,
        listing_title=listing.title,
        listing_slug=listing.slug,
        buyer_id=current.id,
        buyer_name=buyer_name,
        buyer_phone=buyer_phone,
        seller_id=seller.id if seller else listing.seller_id,
        seller_name=seller.name if seller else "Seller",
        seller_phone=seller.phone if seller else "",
        appointment_type=appt.appointment_type,
        scheduled_at=appt.scheduled_at,
        time_slot=appt.time_slot,
        status=appt.status,
        notes=appt.notes,
        created_at=appt.created_at,
        updated_at=appt.updated_at,
    )

@app.get("/api/v1/appointments", response_model=list[AppointmentOut])
async def list_appointments(
    status: str | None = None,
    current: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.models.core import Appointment, VehicleListing
    stmt = (
        select(Appointment, VehicleListing, User)
        .join(VehicleListing, Appointment.listing_id == VehicleListing.id)
        .join(User, Appointment.buyer_id == User.id)
        .order_by(Appointment.scheduled_at.desc())
    )
    if current.role == "seller":
        stmt = stmt.where(Appointment.seller_id == current.id)
    elif current.role == "admin":
        pass
    else:
        stmt = stmt.where(Appointment.buyer_id == current.id)
    
    if status:
        stmt = stmt.where(Appointment.status == status)

    result = await db.execute(stmt)
    rows = result.all()
    
    out = []
    for appt, listing, buyer in rows:
        seller = await db.get(User, appt.seller_id)
        out.append(AppointmentOut(
            id=appt.id,
            listing_id=listing.id,
            listing_title=listing.title,
            listing_slug=listing.slug,
            buyer_id=buyer.id,
            buyer_name=buyer.name,
            buyer_phone=buyer.phone,
            seller_id=appt.seller_id,
            seller_name=seller.name if seller else "Seller",
            seller_phone=seller.phone if seller else "",
            appointment_type=appt.appointment_type,
            scheduled_at=appt.scheduled_at,
            time_slot=appt.time_slot,
            status=appt.status,
            notes=appt.notes,
            created_at=appt.created_at,
            updated_at=appt.updated_at,
        ))
    return out

@app.patch("/api/v1/appointments/{appointment_id}/status", response_model=AppointmentOut)
async def update_appointment_status(
    appointment_id: uuid.UUID,
    payload: AppointmentStatusUpdate,
    current: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.models.core import Appointment, VehicleListing
    appt = await db.get(Appointment, appointment_id)
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    if current.role != "admin" and current.id != appt.seller_id and current.id != appt.buyer_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this appointment")
    
    appt.status = payload.status
    if payload.notes:
        appt.notes = payload.notes
    if payload.scheduled_at:
        appt.scheduled_at = payload.scheduled_at
    if payload.time_slot:
        appt.time_slot = payload.time_slot
    appt.updated_at = datetime.now(timezone.utc)
    
    await db.commit()
    await db.refresh(appt)

    listing = await db.get(VehicleListing, appt.listing_id)
    buyer = await db.get(User, appt.buyer_id)
    seller = await db.get(User, appt.seller_id)

    target_id = appt.buyer_id if current.id == appt.seller_id else appt.seller_id
    await notifications_service.create_notification(
        db, target_id, "appointment_status",
        f"Appointment for '{listing.title if listing else 'vehicle'}' updated to: {payload.status}",
        entity_type="appointment", entity_id=appt.id
    )

    return AppointmentOut(
        id=appt.id,
        listing_id=appt.listing_id,
        listing_title=listing.title if listing else "Vehicle",
        listing_slug=listing.slug if listing else "",
        buyer_id=buyer.id if buyer else appt.buyer_id,
        buyer_name=buyer.name if buyer else "Buyer",
        buyer_phone=buyer.phone if buyer else "",
        seller_id=seller.id if seller else appt.seller_id,
        seller_name=seller.name if seller else "Seller",
        seller_phone=seller.phone if seller else "",
        appointment_type=appt.appointment_type,
        scheduled_at=appt.scheduled_at,
        time_slot=appt.time_slot,
        status=appt.status,
        notes=appt.notes,
        created_at=appt.created_at,
        updated_at=appt.updated_at,
    )

@app.get("/api/v1/admin/appointments", response_model=list[AppointmentOut])
async def admin_list_appointments(
    current: CurrentUser = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    from app.models.core import Appointment, VehicleListing
    stmt = (
        select(Appointment, VehicleListing, User)
        .join(VehicleListing, Appointment.listing_id == VehicleListing.id)
        .join(User, Appointment.buyer_id == User.id)
        .order_by(Appointment.created_at.desc())
    )
    result = await db.execute(stmt)
    rows = result.all()
    out = []
    for appt, listing, buyer in rows:
        seller = await db.get(User, appt.seller_id)
        out.append(AppointmentOut(
            id=appt.id,
            listing_id=listing.id,
            listing_title=listing.title,
            listing_slug=listing.slug,
            buyer_id=buyer.id,
            buyer_name=buyer.name,
            buyer_phone=buyer.phone,
            seller_id=appt.seller_id,
            seller_name=seller.name if seller else "Seller",
            seller_phone=seller.phone if seller else "",
            appointment_type=appt.appointment_type,
            scheduled_at=appt.scheduled_at,
            time_slot=appt.time_slot,
            status=appt.status,
            notes=appt.notes,
            created_at=appt.created_at,
            updated_at=appt.updated_at,
        ))
    return out


# =======================================================================
# Feature Book Module 8: Vehicle Offers (Negotiated Sale)
# =======================================================================

class OfferCreate(BaseModel):
    listing_id: uuid.UUID
    offer_amount: Decimal
    message: str | None = None

class OfferCounterRequest(BaseModel):
    counter_amount: Decimal
    message: str | None = None

class OfferOut(BaseModel):
    id: uuid.UUID
    listing_id: uuid.UUID
    listing_title: str
    listing_slug: str
    listing_price: Decimal
    buyer_id: uuid.UUID
    buyer_name: str
    seller_id: uuid.UUID
    seller_name: str
    offer_amount: Decimal
    counter_amount: Decimal | None
    status: str
    message: str | None
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

@app.post("/api/v1/offers", response_model=OfferOut, status_code=201)
async def create_offer(
    payload: OfferCreate,
    current: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.models.core import VehicleOffer, VehicleListing
    listing = await db.get(VehicleListing, payload.listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Vehicle listing not found")
    if listing.seller_id == current.id:
        raise HTTPException(status_code=400, detail="Cannot make an offer on your own vehicle")
    
    buyer = await db.get(User, current.id)
    buyer_name = buyer.name if buyer else "Buyer"

    offer = VehicleOffer(
        listing_id=listing.id,
        buyer_id=current.id,
        seller_id=listing.seller_id,
        offer_amount=payload.offer_amount,
        status="submitted",
        message=payload.message,
    )
    db.add(offer)
    await db.commit()
    await db.refresh(offer)

    seller = await db.get(User, listing.seller_id)
    await notifications_service.create_notification(
        db, listing.seller_id, "offer_received",
        f"New offer of ₹{payload.offer_amount:,.0f} received on '{listing.title}'",
        entity_type="offer", entity_id=offer.id
    )

    return OfferOut(
        id=offer.id,
        listing_id=listing.id,
        listing_title=listing.title,
        listing_slug=listing.slug,
        listing_price=listing.price,
        buyer_id=current.id,
        buyer_name=buyer_name,
        seller_id=listing.seller_id,
        seller_name=seller.name if seller else "Seller",
        offer_amount=offer.offer_amount,
        counter_amount=offer.counter_amount,
        status=offer.status,
        message=offer.message,
        created_at=offer.created_at,
        updated_at=offer.updated_at,
    )

@app.get("/api/v1/offers", response_model=list[OfferOut])
async def list_offers(
    current: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.models.core import VehicleOffer, VehicleListing
    stmt = (
        select(VehicleOffer, VehicleListing, User)
        .join(VehicleListing, VehicleOffer.listing_id == VehicleListing.id)
        .join(User, VehicleOffer.buyer_id == User.id)
        .order_by(VehicleOffer.created_at.desc())
    )
    if current.role == "seller":
        stmt = stmt.where(VehicleOffer.seller_id == current.id)
    elif current.role == "admin":
        pass
    else:
        stmt = stmt.where(VehicleOffer.buyer_id == current.id)

    result = await db.execute(stmt)
    rows = result.all()
    out = []
    for offer, listing, buyer in rows:
        seller = await db.get(User, offer.seller_id)
        out.append(OfferOut(
            id=offer.id,
            listing_id=listing.id,
            listing_title=listing.title,
            listing_slug=listing.slug,
            listing_price=listing.price,
            buyer_id=buyer.id,
            buyer_name=buyer.name,
            seller_id=offer.seller_id,
            seller_name=seller.name if seller else "Seller",
            offer_amount=offer.offer_amount,
            counter_amount=offer.counter_amount,
            status=offer.status,
            message=offer.message,
            created_at=offer.created_at,
            updated_at=offer.updated_at,
        ))
    return out

@app.post("/api/v1/offers/{offer_id}/accept", response_model=OfferOut)
async def accept_offer(
    offer_id: uuid.UUID,
    current: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.models.core import VehicleOffer, VehicleListing
    offer = await db.get(VehicleOffer, offer_id)
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    if current.id != offer.seller_id and current.role != "admin":
        raise HTTPException(status_code=403, detail="Only the vehicle seller can accept this offer")
    
    offer.status = "accepted"
    offer.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(offer)

    listing = await db.get(VehicleListing, offer.listing_id)
    buyer = await db.get(User, offer.buyer_id)
    seller = await db.get(User, offer.seller_id)

    await notifications_service.create_notification(
        db, offer.buyer_id, "offer_accepted",
        f"Congratulations! Your offer on '{listing.title if listing else 'vehicle'}' was accepted by the seller.",
        entity_type="offer", entity_id=offer.id
    )

    return OfferOut(
        id=offer.id,
        listing_id=offer.listing_id,
        listing_title=listing.title if listing else "Vehicle",
        listing_slug=listing.slug if listing else "",
        listing_price=listing.price if listing else offer.offer_amount,
        buyer_id=offer.buyer_id,
        buyer_name=buyer.name if buyer else "Buyer",
        seller_id=offer.seller_id,
        seller_name=seller.name if seller else "Seller",
        offer_amount=offer.offer_amount,
        counter_amount=offer.counter_amount,
        status=offer.status,
        message=offer.message,
        created_at=offer.created_at,
        updated_at=offer.updated_at,
    )

@app.post("/api/v1/offers/{offer_id}/reject", response_model=OfferOut)
async def reject_offer(
    offer_id: uuid.UUID,
    current: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.models.core import VehicleOffer, VehicleListing
    offer = await db.get(VehicleOffer, offer_id)
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    if current.id != offer.seller_id and current.role != "admin":
        raise HTTPException(status_code=403, detail="Only the vehicle seller can reject this offer")
    
    offer.status = "rejected"
    offer.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(offer)

    listing = await db.get(VehicleListing, offer.listing_id)
    buyer = await db.get(User, offer.buyer_id)
    seller = await db.get(User, offer.seller_id)

    await notifications_service.create_notification(
        db, offer.buyer_id, "offer_rejected",
        f"Your offer on '{listing.title if listing else 'vehicle'}' was declined.",
        entity_type="offer", entity_id=offer.id
    )

    return OfferOut(
        id=offer.id,
        listing_id=offer.listing_id,
        listing_title=listing.title if listing else "Vehicle",
        listing_slug=listing.slug if listing else "",
        listing_price=listing.price if listing else offer.offer_amount,
        buyer_id=offer.buyer_id,
        buyer_name=buyer.name if buyer else "Buyer",
        seller_id=offer.seller_id,
        seller_name=seller.name if seller else "Seller",
        offer_amount=offer.offer_amount,
        counter_amount=offer.counter_amount,
        status=offer.status,
        message=offer.message,
        created_at=offer.created_at,
        updated_at=offer.updated_at,
    )

@app.post("/api/v1/offers/{offer_id}/counter", response_model=OfferOut)
async def counter_offer(
    offer_id: uuid.UUID,
    payload: OfferCounterRequest,
    current: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.models.core import VehicleOffer, VehicleListing
    offer = await db.get(VehicleOffer, offer_id)
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    if current.id != offer.seller_id and current.role != "admin":
        raise HTTPException(status_code=403, detail="Only the vehicle seller can counter this offer")
    
    offer.counter_amount = payload.counter_amount
    offer.status = "countered"
    if payload.message:
        offer.message = payload.message
    offer.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(offer)

    listing = await db.get(VehicleListing, offer.listing_id)
    buyer = await db.get(User, offer.buyer_id)
    seller = await db.get(User, offer.seller_id)

    await notifications_service.create_notification(
        db, offer.buyer_id, "offer_countered",
        f"The seller made a counter-offer of ₹{payload.counter_amount:,.0f} for '{listing.title if listing else 'vehicle'}'",
        entity_type="offer", entity_id=offer.id
    )

    return OfferOut(
        id=offer.id,
        listing_id=offer.listing_id,
        listing_title=listing.title if listing else "Vehicle",
        listing_slug=listing.slug if listing else "",
        listing_price=listing.price if listing else offer.offer_amount,
        buyer_id=offer.buyer_id,
        buyer_name=buyer.name if buyer else "Buyer",
        seller_id=offer.seller_id,
        seller_name=seller.name if seller else "Seller",
        offer_amount=offer.offer_amount,
        counter_amount=offer.counter_amount,
        status=offer.status,
        message=offer.message,
        created_at=offer.created_at,
        updated_at=offer.updated_at,
    )


# =======================================================================
# Feature Book Module 11: Support Tickets with Context Inheritance
# =======================================================================

class SupportTicketCreate(BaseModel):
    subject: str
    category: str = "general"
    message: str
    listing_id: uuid.UUID | None = None
    appointment_id: uuid.UUID | None = None

class SupportMessageCreate(BaseModel):
    content: str

class SupportTicketStatusUpdate(BaseModel):
    status: str

class SupportMessageOut(BaseModel):
    id: uuid.UUID
    ticket_id: uuid.UUID
    sender_id: uuid.UUID
    sender_name: str
    sender_role: str
    content: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class SupportTicketOut(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    user_name: str
    user_email: str | None
    subject: str
    category: str
    listing_id: uuid.UUID | None
    listing_title: str | None
    appointment_id: uuid.UUID | None
    status: str
    created_at: datetime
    updated_at: datetime
    messages: list[SupportMessageOut] = []
    model_config = ConfigDict(from_attributes=True)

@app.post("/api/v1/support/tickets", response_model=SupportTicketOut, status_code=201)
async def create_support_ticket(
    payload: SupportTicketCreate,
    current: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    user = await db.get(User, current.id)
    user_name = user.name if user else "User"
    user_email = user.email if user else None

    ticket = SupportTicket(
        user_id=current.id,
        subject=payload.subject,
        category=payload.category,
        listing_id=payload.listing_id,
        appointment_id=payload.appointment_id,
        status="open",
    )
    db.add(ticket)
    await db.flush()

    first_msg = SupportMessage(
        ticket_id=ticket.id,
        sender_id=current.id,
        content=payload.message,
    )
    db.add(first_msg)
    await db.commit()
    await db.refresh(ticket)
    await db.refresh(first_msg)

    listing_title = None
    if payload.listing_id:
        listing = await db.get(VehicleListing, payload.listing_id)
        if listing:
            listing_title = listing.title

    msg_out = SupportMessageOut(
        id=first_msg.id,
        ticket_id=ticket.id,
        sender_id=current.id,
        sender_name=user_name,
        sender_role=current.role,
        content=first_msg.content,
        created_at=first_msg.created_at,
    )

    return SupportTicketOut(
        id=ticket.id,
        user_id=current.id,
        user_name=user_name,
        user_email=user_email,
        subject=ticket.subject,
        category=ticket.category,
        listing_id=ticket.listing_id,
        listing_title=listing_title,
        appointment_id=ticket.appointment_id,
        status=ticket.status,
        created_at=ticket.created_at,
        updated_at=ticket.updated_at,
        messages=[msg_out],
    )

@app.get("/api/v1/support/tickets", response_model=list[SupportTicketOut])
async def list_support_tickets(
    status: str | None = None,
    current: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.models.core import SupportTicket, SupportMessage, VehicleListing
    stmt = select(SupportTicket).order_by(SupportTicket.updated_at.desc())
    if current.role != "admin":
        stmt = stmt.where(SupportTicket.user_id == current.id)
    if status:
        stmt = stmt.where(SupportTicket.status == status)

    result = await db.scalars(stmt)
    tickets = list(result.all())

    out = []
    for t in tickets:
        user = await db.get(User, t.user_id)
        listing_title = None
        if t.listing_id:
            listing = await db.get(VehicleListing, t.listing_id)
            if listing:
                listing_title = listing.title

        msg_stmt = select(SupportMessage).where(SupportMessage.ticket_id == t.id).order_by(SupportMessage.created_at.asc())
        msgs = list((await db.scalars(msg_stmt)).all())
        msg_outs = []
        for m in msgs:
            sender = await db.get(User, m.sender_id)
            msg_outs.append(SupportMessageOut(
                id=m.id,
                ticket_id=m.ticket_id,
                sender_id=m.sender_id,
                sender_name=sender.name if sender else "User",
                sender_role=sender.role if sender else "buyer",
                content=m.content,
                created_at=m.created_at,
            ))

        out.append(SupportTicketOut(
            id=t.id,
            user_id=t.user_id,
            user_name=user.name if user else "User",
            user_email=user.email if user else None,
            subject=t.subject,
            category=t.category,
            listing_id=t.listing_id,
            listing_title=listing_title,
            appointment_id=t.appointment_id,
            status=t.status,
            created_at=t.created_at,
            updated_at=t.updated_at,
            messages=msg_outs,
        ))
    return out

@app.get("/api/v1/support/tickets/{ticket_id}", response_model=SupportTicketOut)
async def get_support_ticket(
    ticket_id: uuid.UUID,
    current: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.models.core import SupportTicket, SupportMessage, VehicleListing
    t = await db.get(SupportTicket, ticket_id)
    if not t:
        raise HTTPException(status_code=404, detail="Ticket not found")
    if current.role != "admin" and t.user_id != current.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this ticket")

    user = await db.get(User, t.user_id)
    listing_title = None
    if t.listing_id:
        listing = await db.get(VehicleListing, t.listing_id)
        if listing:
            listing_title = listing.title

    msg_stmt = select(SupportMessage).where(SupportMessage.ticket_id == t.id).order_by(SupportMessage.created_at.asc())
    msgs = list((await db.scalars(msg_stmt)).all())
    msg_outs = []
    for m in msgs:
        sender = await db.get(User, m.sender_id)
        msg_outs.append(SupportMessageOut(
            id=m.id,
            ticket_id=m.ticket_id,
            sender_id=m.sender_id,
            sender_name=sender.name if sender else "User",
            sender_role=sender.role if sender else "buyer",
            content=m.content,
            created_at=m.created_at,
        ))

    return SupportTicketOut(
        id=t.id,
        user_id=t.user_id,
        user_name=user.name if user else "User",
        user_email=user.email if user else None,
        subject=t.subject,
        category=t.category,
        listing_id=t.listing_id,
        listing_title=listing_title,
        appointment_id=t.appointment_id,
        status=t.status,
        created_at=t.created_at,
        updated_at=t.updated_at,
        messages=msg_outs,
    )

@app.post("/api/v1/support/tickets/{ticket_id}/messages", response_model=SupportMessageOut, status_code=201)
async def add_support_ticket_message(
    ticket_id: uuid.UUID,
    payload: SupportMessageCreate,
    current: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.models.core import SupportTicket, SupportMessage
    ticket = await db.get(SupportTicket, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    if current.role != "admin" and ticket.user_id != current.id:
        raise HTTPException(status_code=403, detail="Not authorized to reply to this ticket")

    sender = await db.get(User, current.id)
    sender_name = sender.name if sender else "User"

    msg = SupportMessage(
        ticket_id=ticket.id,
        sender_id=current.id,
        content=payload.content,
    )
    db.add(msg)
    ticket.updated_at = datetime.now(timezone.utc)
    if current.role == "admin" and ticket.status == "open":
        ticket.status = "in_progress"
    await db.commit()
    await db.refresh(msg)

    if current.role == "admin":
        await notifications_service.create_notification(
            db, ticket.user_id, "support_reply",
            f"Support reply received on ticket: '{ticket.subject}'",
            entity_type="support_ticket", entity_id=ticket.id
        )

    return SupportMessageOut(
        id=msg.id,
        ticket_id=ticket.id,
        sender_id=current.id,
        sender_name=sender_name,
        sender_role=current.role,
        content=msg.content,
        created_at=msg.created_at,
    )

@app.patch("/api/v1/support/tickets/{ticket_id}/status", response_model=SupportTicketOut)
async def update_support_ticket_status(
    ticket_id: uuid.UUID,
    payload: SupportTicketStatusUpdate,
    current: CurrentUser = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    from app.models.core import SupportTicket
    ticket = await db.get(SupportTicket, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    ticket.status = payload.status
    ticket.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(ticket)

    await notifications_service.create_notification(
        db, ticket.user_id, "support_status",
        f"Your support ticket '{ticket.subject}' has been marked as {payload.status}.",
        entity_type="support_ticket", entity_id=ticket.id
    )

    return await get_support_ticket(ticket_id, current, db)

