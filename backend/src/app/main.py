"""Unify Platform API — FastAPI application entrypoint.

Run: uvicorn src.app.main:app --reload --port 8000
"""
# ── SSL workaround for Python 3.13 / Windows broken cert store ──────────────
# Python 3.13 on Windows has a broken Windows certificate store integration
# that causes TLS handshake failures (TLSV1_ALERT_INTERNAL_ERROR) with
# MongoDB Atlas. We patch create_default_context to bypass verification in dev.
import ssl as _ssl
import os as _os

if _os.getenv("APP_ENV", "dev") in ("dev", "development"):
    _orig_create_default_context = _ssl.create_default_context

    def _patched_create_default_context(*args, **kwargs):
        ctx = _orig_create_default_context(*args, **kwargs)
        ctx.check_hostname = False
        ctx.verify_mode = _ssl.CERT_NONE
        return ctx

    _ssl.create_default_context = _patched_create_default_context
# ─────────────────────────────────────────────────────────────────────────────

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.app.api.v1.router import get_v1_router
from src.core import security
from src.core.config import settings
from src.database.mongo import mongo
from src.exceptions.handlers import register_exception_handlers
from src.middleware.request_context import RequestContextMiddleware
from src.models.user import new_user_document
from src.modules.system.routes import health, version
from src.repositories import UserRepository
from src.services.role_service import RoleService
from src.utils.logger import get_logger, setup_logging

setup_logging(settings.SERVICE_NAME, settings.APP_ENV)
logger = get_logger("unify.startup")


async def _bootstrap_super_admin() -> None:
    """Idempotent: ensure the bootstrap super admin exists (dev convenience)."""
    users = UserRepository()
    email = settings.BOOTSTRAP_SUPER_ADMIN_EMAIL.strip().lower()
    if await users.find_active_by_email(email) is None:
        await users.insert(
            new_user_document(
                full_name="Platform Owner",
                email=email,
                password_hash=security.hash_password(
                    settings.BOOTSTRAP_SUPER_ADMIN_PASSWORD
                ),
                role="super_admin",
                accessible_modules=["sports", "band"],
            )
        )
        logger.info("bootstrap super admin created email=%s", email)


@asynccontextmanager
async def lifespan(app: FastAPI):
    from src.database.redis import RedisClient
    logger.info(
        "starting service=%s version=%s env=%s",
        settings.SERVICE_NAME,
        settings.SERVICE_VERSION,
        settings.APP_ENV,
    )
    db_ready = False
    try:
        await mongo.connect()
        await RedisClient.connect()
        await UserRepository().ensure_indexes()
        from src.repositories import (
            RoleRepository, TokenRepository, AuditRepository,
            GroupRepository, GroupMemberRepository, EventRepository, RsvpRepository, AttendanceRepository,
            SportsVenueRepository, SportsSlotRepository, SportsBookingRepository,
            PaymentRepository, TransactionRepository, PaymentReceiptRepository,
            FileRepository, FolderRepository, NotificationRepository, NotificationLogRepository,
            MatchRepository, MatchSummaryRepository, PlayerStatsRepository,
            DashboardAnalyticsRepository
        )
        from src.repositories.eventhub import EventHubEventRepository

        for repo in (
            RoleRepository(), TokenRepository(), AuditRepository(),
            GroupRepository(), GroupMemberRepository(), EventRepository(), RsvpRepository(), AttendanceRepository(),
            EventHubEventRepository(),
            SportsVenueRepository(), SportsSlotRepository(), SportsBookingRepository(),
            PaymentRepository(), TransactionRepository(), PaymentReceiptRepository(),
            FileRepository(), FolderRepository(), NotificationRepository(), NotificationLogRepository(),
            MatchRepository(), MatchSummaryRepository(), PlayerStatsRepository(),
            DashboardAnalyticsRepository()
        ):
            await repo.ensure_indexes()
        await RoleService().seed_roles()
        await _bootstrap_super_admin()
        db_ready = True
    except Exception:
        logger.exception(
            "mongodb unavailable at startup — /health will report degraded "
            "until the database is reachable"
        )
    yield
    await mongo.close()
    await RedisClient.close()
    logger.info("service stopped db_was_ready=%s", db_ready)


app = FastAPI(
    title=settings.SERVICE_NAME,
    version=settings.SERVICE_VERSION,
    description="Unified Sports + Band platform backend — Phase 1 (Auth, Users, Roles, Platform Core)",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(RequestContextMiddleware)
register_exception_handlers(app)

app.include_router(get_v1_router(), prefix="/api")

# Spec-exposed root system endpoints (in addition to /api/v1/health, /version)
app.add_api_route("/health", health, methods=["GET"], tags=["System"])
app.add_api_route("/version", version, methods=["GET"], tags=["System"])

# Local uploads static file mounting
import os
from fastapi.staticfiles import StaticFiles
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
