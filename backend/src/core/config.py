"""Application configuration (env-driven, Pydantic v2 Settings)."""
from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    # Service
    SERVICE_NAME: str = "unify-platform-api"
    SERVICE_VERSION: str = "1.0.0"
    APP_ENV: str = "dev"  # dev | test | prod
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # MongoDB (Motor)
    MONGODB_URI: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "unify_platform"

    # JWT
    JWT_SECRET_KEY: str = "change-me-in-env"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    RESET_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS (comma separated)
    CORS_ORIGINS: str = "http://localhost:3000"

    # Redis (Phase 2+ cache; container provisioned now)
    REDIS_URL: str = "redis://localhost:6379/0"

    # Storage / Payments (Phase 2+ placeholders, config-ready)
    AWS_REGION: str = "ap-south-1"
    AWS_S3_BUCKET: str = ""
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""

    # Bootstrap super admin (created on startup if missing; dev convenience)
    BOOTSTRAP_SUPER_ADMIN_EMAIL: str = "admin@unify.local"
    BOOTSTRAP_SUPER_ADMIN_PASSWORD: str = "Admin@12345"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
