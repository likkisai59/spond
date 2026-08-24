from src.database.base_repository import BaseRepository
from src.constants.collections import (
    SPORTS_PLAYER_STATS, 
    BAND_ARTIST_ANALYTICS, 
    BAND_VENUE_ANALYTICS, 
    BAND_DASHBOARD_ANALYTICS
)

class PlayerStatsRepository(BaseRepository):
    collection_name = SPORTS_PLAYER_STATS
    
    async def ensure_indexes(self) -> None:
        await self.create_index([("player_id", 1)], unique=True)
        await self.create_index([("performance_score", -1)])

class BandArtistAnalyticsRepository(BaseRepository):
    collection_name = BAND_ARTIST_ANALYTICS
    
    async def ensure_indexes(self) -> None:
        await self.create_index([("artist_id", 1)], unique=True)

class BandVenueAnalyticsRepository(BaseRepository):
    collection_name = BAND_VENUE_ANALYTICS
    
    async def ensure_indexes(self) -> None:
        await self.create_index([("venue_id", 1)], unique=True)

class DashboardAnalyticsRepository(BaseRepository):
    collection_name = BAND_DASHBOARD_ANALYTICS
    
    async def ensure_indexes(self) -> None:
        await self.create_index([("module", 1)], unique=True)
