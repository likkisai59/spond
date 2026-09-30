from src.database.base_repository import BaseRepository

class FavoriteRepository(BaseRepository):
    collection_name = "favorites"

    async def ensure_indexes(self):
        await self.create_index([("user_id", 1)])
        # ensure unique index for user and entity
        await self.create_index([("user_id", 1), ("id", 1)], unique=True)
