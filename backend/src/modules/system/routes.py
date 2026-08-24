"""System endpoints (health / version) — public."""
from fastapi import APIRouter

from src.core.config import settings
from src.database.mongo import mongo

router = APIRouter(tags=["System"])


@router.get("/health", summary="Liveness + MongoDB connectivity")
async def health() -> dict:
    db_ok = await mongo.ping()
    return {
        "status": "success" if db_ok else "degraded",
        "data": {
            "service": settings.SERVICE_NAME,
            "environment": settings.APP_ENV,
            "database": "connected" if db_ok else "disconnected",
        },
    }


@router.get("/version", summary="Service version")
async def version() -> dict:
    return {
        "status": "success",
        "data": {
            "service": settings.SERVICE_NAME,
            "version": settings.SERVICE_VERSION,
            "environment": settings.APP_ENV,
        },
    }
