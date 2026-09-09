"""V1 API aggregator — mounts every module router under /api/v1."""
from fastapi import APIRouter

from src.modules.auth.routes import router as auth_router
from src.modules.roles.routes import router as roles_router
from src.modules.system.routes import router as system_router
from src.modules.users.routes import router as users_router
from src.modules.sports.routes import router as sports_router

from src.modules.payments.routes import router as payments_router
from src.modules.files.routes import router as files_router
from src.modules.notifications.routes import router as notifications_router
from src.modules.sports.matches import router as matches_router
from src.modules.sports.analytics import router as sports_analytics_router

from src.modules.eventhub.routes import router as eventhub_router
from src.modules.band.routes import router as band_router

def get_v1_router() -> APIRouter:
    router = APIRouter(prefix="/v1")
    router.include_router(auth_router)
    router.include_router(users_router)
    router.include_router(roles_router)
    router.include_router(system_router)
    router.include_router(sports_router)
    router.include_router(matches_router)
    router.include_router(sports_analytics_router)

    router.include_router(eventhub_router)
    router.include_router(band_router)
    router.include_router(payments_router)
    router.include_router(files_router)
    router.include_router(notifications_router)
    return router
