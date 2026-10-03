import pytest
from app.config import Settings


def test_dev_environment_permits_dev_secret():
    s = Settings(
        environment="dev",
        jwt_secret_key="dev-only-not-for-production-CHANGE-ME",
    )
    assert s.environment == "dev"
    assert s.jwt_secret_key == "dev-only-not-for-production-CHANGE-ME"


def test_production_environment_rejects_insecure_secrets():
    with pytest.raises(ValueError, match="CRITICAL SECURITY ERROR"):
        Settings(
            environment="production",
            jwt_secret_key="dev-only-not-for-production-CHANGE-ME",
        )

    with pytest.raises(ValueError, match="CRITICAL SECURITY ERROR"):
        Settings(
            environment="production",
            jwt_secret_key="short-key",
        )


def test_production_environment_accepts_secure_secret():
    secure_key = "a" * 64
    s = Settings(
        environment="production",
        jwt_secret_key=secure_key,
    )
    assert s.environment == "production"
    assert s.jwt_secret_key == secure_key
