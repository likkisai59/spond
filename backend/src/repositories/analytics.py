from src.database.base_repository import BaseRepository
from src.constants.collections import (
    SPORTS_PLAYER_STATS, 
    BAND_DASHBOARD_ANALYTICS
)

class PlayerStatsRepository(BaseRepository):
    collection_name = SPORTS_PLAYER_STATS
    
    async def ensure_indexes(self) -> None:
        await self.create_index([("player_id", 1)], unique=True)
        await self.create_index([("performance_score", -1)])


class DashboardAnalyticsRepository(BaseRepository):
    collection_name = BAND_DASHBOARD_ANALYTICS
    
    async def ensure_indexes(self) -> None:
        await self.create_index([("module", 1)], unique=True)
