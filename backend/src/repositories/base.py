from typing import Any, List, Optional, Dict
from motor.motor_asyncio import AsyncIOMotorCollection
from bson import ObjectId

class BaseRepository:
    """Shim BaseRepository for ported Music-band code."""
    def __init__(self, collection: AsyncIOMotorCollection):
        self.collection = collection

    async def get_by_id(self, id: str) -> Optional[Dict[str, Any]]:
        doc = await self.collection.find_one({"_id": ObjectId(id)})
        if doc:
            doc["id"] = str(doc.pop("_id"))
        return doc

    async def get_all(self, query: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        query = query or {}
        cursor = self.collection.find(query)
        docs = []
        async for doc in cursor:
            doc["id"] = str(doc.pop("_id"))
            docs.append(doc)
        return docs

    async def create(self, data: Dict[str, Any]) -> Dict[str, Any]:
        result = await self.collection.insert_one(data)
        doc = await self.collection.find_one({"_id": result.inserted_id})
        if doc:
            doc["id"] = str(doc.pop("_id"))
        return doc

    async def update(self, id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        await self.collection.update_one({"_id": ObjectId(id)}, {"$set": data})
        return await self.get_by_id(id)

    async def delete(self, id: str) -> bool:
        result = await self.collection.delete_one({"_id": ObjectId(id)})
        return result.deleted_count > 0
