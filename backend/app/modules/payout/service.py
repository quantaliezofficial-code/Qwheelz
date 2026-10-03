"""
DORMANT — not wired into any route in main.py. Kept, not deleted,
because it is exactly the ledger shape (gross/commission/net per
recipient per period, a two-state pending/paid lifecycle) a future
commission-based revenue model would need, and rebuilding it from
scratch would just reproduce this file.

Why it has nothing to attach to right now: Quantaliez Auto connects a
buyer and a seller directly (blueprint Sections 2 & 10) and never
handles the vehicle-sale payment itself, so there is no marketplace-
collected amount to ever pay a seller *out of* — every Payment in this
codebase (app/modules/billing/service.py) flows seller -> Quantaliez,
never the reverse. The old GroundBooking Payout existed because that
marketplace *did* collect the booking payment and had to remit the
venue owner's share.

The two places this would plug back in without redesign, if the
business model changes:
  - A per-completed-sale commission, if Quantaliez Auto ever starts
    processing the vehicle payment itself instead of only connecting
    buyer and seller (a materially bigger scope change than anything
    else in this codebase).
  - A referral/lead-commission payout to a seller or affiliate, if one
    is introduced — closer to this shape as-is, since it wouldn't
    require Quantaliez to touch the vehicle-sale payment at all.

If you're wiring this back in: the run_payout_for_period-style
aggregation this table was built to support in the original codebase
grouped Payment rows by owner and period, converting a NULL
`payout_id` into "not yet included in a settlement run" the same way
this Payment model's own confirmed_at/confirmed_by fields distinguish
"initiated" from "settled" today.
"""

from __future__ import annotations

import uuid
from datetime import date
from decimal import Decimal

from sqlalchemy import Column, Date, ForeignKey, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.core import Base


class Payout(Base):
    """Not registered anywhere else — this class exists so the shape is
    version-controlled and ready, not so Alembic generates a table for
    it. Do not import this into app/models/__init__.py or main.py
    without also deciding the commission model it would compute
    against; see the module docstring above."""

    __tablename__ = "payouts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    recipient_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"))
    period_start: Mapped[date]
    period_end: Mapped[date]
    gross_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    commission_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    net_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    status: Mapped[str] = mapped_column(String(20), default="pending")
    paid_at: Mapped[date | None]
