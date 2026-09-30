from typing import List, Dict, Any, Optional
from src.database.mongo import utc_now
from src.repositories.favorites import FavoriteRepository
from src.schemas.favorite import CreateFavoritePayload

class FavoriteService:
    def __init__(self):
        self.favorites = FavoriteRepository()

    async def get_favorites(self, user_id: str) -> List[Dict[str, Any]]:
        return await self.favorites.find_many({"user_id": user_id}, sort=[("created_at", -1)])

    async def add_favorite(self, user_id: str, payload: CreateFavoritePayload) -> Dict[str, Any]:
        existing = await self.favorites.find_one({"user_id": user_id, "id": payload.id})
        if existing:
            return existing

        now = utc_now()
        doc = payload.model_dump()
        doc["user_id"] = user_id
        doc["created_at"] = now
        
        return await self.favorites.insert(doc)

    async def remove_favorite(self, user_id: str, item_id: str) -> bool:
        result = await self.favorites.delete_one({"user_id": user_id, "id": item_id})
        return result > 0
