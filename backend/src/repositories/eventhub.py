from src.constants.collections import EVENTHUB_EVENTS
from src.database.base_repository import BaseRepository

class EventHubEventRepository(BaseRepository):
    collection_name = EVENTHUB_EVENTS

    async def ensure_indexes(self) -> None:
        await self.create_index([("customer_id", 1)])
        await self.create_index([("date", 1)])
        await self.create_index([("status", 1)])
