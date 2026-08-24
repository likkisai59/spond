from src.database.base_repository import BaseRepository
from src.constants.collections import SPORTS_MATCHES, SPORTS_MATCH_SUMMARY

class MatchRepository(BaseRepository):
    collection_name = SPORTS_MATCHES

    async def ensure_indexes(self) -> None:
        await self.create_index([("group_id", 1)])
        await self.create_index([("event_id", 1)])
        await self.create_index([("status", 1)])

class MatchSummaryRepository(BaseRepository):
    collection_name = SPORTS_MATCH_SUMMARY

    async def ensure_indexes(self) -> None:
        await self.create_index([("match_id", 1)], unique=True)
