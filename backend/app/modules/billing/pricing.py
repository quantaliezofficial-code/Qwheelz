"""
Plan catalog for blueprint Section 13. Kept as a small in-code table
rather than an admin-editable database table, deliberately, for the
same reason the original codebase kept booking_hold_duration_minutes
and the refund tiers as env-configurable constants instead of database
rows: MVP1's actual open question is "does this pricing model work at
all," not "can an admin self-serve edit prices without a deploy" — that
capability is real scope, worth building once the plans themselves have
been validated, not before.

'individual_free' is not sold (no Payment is ever created for it) — it
is the default every seller implicitly has and exists in this table
only so the plan enum and the frontend's pricing page have one
complete, uniform list to render.

Enterprise is deliberately NOT self-serve (price is None) — the
blueprint itself says "Custom pricing" for Dealer Enterprise; the
buy button for that tier should route to a sales contact form, not a
checkout call, which is exactly what a None price signals to the
frontend.
"""

from __future__ import annotations

from dataclasses import dataclass

from app.config import settings


@dataclass(frozen=True)
class Plan:
    id: str
    label: str
    audience: str  # "individual" | "dealer"
    price_inr: int | None  # None => contact sales, not self-serve
    billing_period: str  # "one_time" | "monthly"
    features: tuple[str, ...]


PLANS: dict[str, Plan] = {
    "individual_free": Plan(
        id="individual_free",
        label="Free",
        audience="individual",
        price_inr=0,
        billing_period="monthly",
        features=("1 active listing", "Basic visibility", "Buyer enquiries"),
    ),
    "individual_premium": Plan(
        id="individual_premium",
        label="Premium",
        audience="individual",
        price_inr=settings.price_individual_premium_inr,
        billing_period="one_time",
        features=("Featured placement", "More photographs", "Higher visibility", "Priority listing"),
    ),
    "dealer_basic": Plan(
        id="dealer_basic",
        label="Dealer Basic",
        audience="dealer",
        price_inr=settings.price_dealer_basic_inr,
        billing_period="monthly",
        features=("Multiple listings", "Dealer dashboard", "Lead management"),
    ),
    "dealer_pro": Plan(
        id="dealer_pro",
        label="Dealer Pro",
        audience="dealer",
        price_inr=settings.price_dealer_pro_inr,
        billing_period="monthly",
        features=("Everything in Basic", "More leads", "Advanced profile", "Analytics"),
    ),
    "dealer_enterprise": Plan(
        id="dealer_enterprise",
        label="Dealer Enterprise",
        audience="dealer",
        price_inr=None,
        billing_period="monthly",
        features=("Priority leads", "Advanced matching", "Multiple users", "Featured company"),
    ),
}


def get_plan(plan_id: str) -> Plan | None:
    return PLANS.get(plan_id)
