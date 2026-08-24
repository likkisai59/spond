from fastapi import APIRouter, Depends
from typing import List, Dict, Any

from src.services.analytics_service import AnalyticsService
from src.middleware.auth import require_auth
from src.dependencies.auth import require_roles

router = APIRouter(prefix="/band", tags=["Band Analytics"])

@router.get("/dashboard/overview")
async def get_dashboard_overview(
    user: dict = Depends(require_auth),
    service: AnalyticsService = Depends()
) -> Dict[str, Any]:
    return await service.get_band_dashboard_overview()

@router.get("/dashboard")
async def get_dashboard_full(
    user: dict = Depends(require_auth),
    service: AnalyticsService = Depends()
) -> Dict[str, Any]:
    overview = await service.get_band_dashboard_overview()
    return {
        "overview": overview
    }

@router.get("/analytics/artists")
async def get_artists_analytics(
    user: dict = Depends(require_auth),
    service: AnalyticsService = Depends()
) -> List[Dict[str, Any]]:
    return await service.artist_analytics.find_many({})

@router.get("/analytics/venues")
async def get_venues_analytics(
    user: dict = Depends(require_auth),
    service: AnalyticsService = Depends()
) -> List[Dict[str, Any]]:
    return await service.venue_analytics.find_many({})
