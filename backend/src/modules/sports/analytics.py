from fastapi import APIRouter, Depends
from typing import List, Dict, Any

from src.services.analytics_service import AnalyticsService
from src.middleware.auth import require_auth
from src.dependencies.auth import require_roles

router = APIRouter(prefix="/sports", tags=["Sports Analytics"])

@router.get("/dashboard/overview")
async def get_dashboard_overview(
    user: dict = Depends(require_auth),
    service: AnalyticsService = Depends()
) -> Dict[str, Any]:
    return await service.get_sports_dashboard_overview()

@router.get("/dashboard")
async def get_dashboard_full(
    user: dict = Depends(require_auth),
    service: AnalyticsService = Depends()
) -> Dict[str, Any]:
    overview = await service.get_sports_dashboard_overview()
    top_players = await service.get_top_players(limit=3)
    return {
        "overview": overview,
        "top_players": top_players,
        "upcoming_events": [],
        "recent_activities": [],
        "active_polls": []
    }

@router.get("/statistics/players")
async def list_players_stats(
    user: dict = Depends(require_auth),
    service: AnalyticsService = Depends()
) -> List[Dict[str, Any]]:
    return await service.get_top_players(limit=50)

@router.get("/statistics/player/{player_id}")
async def get_player_stats(
    player_id: str,
    user: dict = Depends(require_auth),
    service: AnalyticsService = Depends()
) -> Dict[str, Any]:
    return await service.get_player_stats(player_id)

@router.get("/statistics/leaderboard")
async def get_leaderboard(
    user: dict = Depends(require_auth),
    service: AnalyticsService = Depends()
) -> List[Dict[str, Any]]:
    return await service.get_top_players(limit=10)

@router.get("/statistics/top-performers")
async def get_top_performers(
    user: dict = Depends(require_auth),
    service: AnalyticsService = Depends()
) -> List[Dict[str, Any]]:
    return await service.get_top_players(limit=3)
