"""
Settings, sourced entirely from environment variables / .env — never
hardcoded, unchanged principle from the original codebase.

Renamed/removed relative to the venue-booking version: everything about
booking holds, cancellation refund tiers and platform commission is gone,
because none of it has an equivalent once "book a slot, pay, get
refunded on a tiered schedule" stops being the core transaction — a
vehicle listing is contacted, not booked. See MIGRATION_NOTES.md.
"""

from pydantic import model_validator
from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = Field(
        default="postgresql+asyncpg://quantaliez:devpassword@localhost:5433/quantaliez_auto",
        description="Async database connection string"
    )
    jwt_secret_key: str = "dev-only-not-for-production-CHANGE-ME"
    environment: str = "dev"

    # No CORS config existed to copy from scratch, so this is carried over
    # unchanged: allow_credentials=True (the refresh token travels as an
    # httpOnly cookie) means this can never be "*" — CORS itself forbids
    # combining a wildcard origin with credentials.
    cors_allowed_origins: str = "http://localhost:3000,http://localhost:5173"

    # What LocalFileStorage (app/modules/storage/base.py) prefixes onto the
    # /uploads static mount to produce a real, fetchable image/document
    # URL. Change to the real deployed origin outside local dev.
    app_base_url: str = "http://localhost:8000"

    # Replaces the old hold_sweep_interval_minutes. There is no more
    # "expire an unpaid hold" state to sweep for — the thing that now
    # needs a periodic background pass is time-bounded seller
    # monetization: a Subscription past its current_period_end should
    # flip ACTIVE -> EXPIRED, and a listing past its featured_until
    # should stop being featured. Same shape of problem (a row's status
    # depends on wall-clock time, not just on the last write to it), new
    # subject.
    billing_sweep_interval_minutes: int = 30

    # Placeholder INR prices from the product blueprint, Section 13.
    # Deliberately env-configurable rather than hardcoded in billing
    # logic, same reasoning the original codebase applied to every
    # not-yet-confirmed business number: correcting a price should be a
    # config change, not a redeploy. See app/modules/billing/pricing.py.
    price_individual_premium_inr: int = 499
    price_dealer_basic_inr: int = 1999
    price_dealer_pro_inr: int = 4999

    @model_validator(mode="after")
    def validate_production_secrets(self) -> "Settings":
        insecure_keys = {
            "dev-only-not-for-production-CHANGE-ME",
            "change-me-to-a-long-random-string-in-production",
            "secret",
            "",
        }
        if self.environment.lower() in {"production", "prod"}:
            if self.jwt_secret_key in insecure_keys or len(self.jwt_secret_key) < 32:
                raise ValueError(
                    "CRITICAL SECURITY ERROR: In production environment, "
                    "JWT_SECRET_KEY must be a cryptographically secure random secret of at least 32 characters."
                )
        return self


settings = Settings()
