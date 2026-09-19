"""Generic async repository base over Motor."""
from datetime import datetime
from typing import Any
from uuid import uuid4

from bson import ObjectId

from src.database.mongo import mongo, utc_now


def new_id() -> str:
    return uuid4().hex


def to_object_id(value: str) -> ObjectId:
    try:
        return ObjectId(value)
    except Exception as exc:  # noqa: BLE001
        raise ValueError("Invalid id format") from exc


def serialize(document: dict[str, Any] | None) -> dict[str, Any] | None:
    if document is None:
        return None
    out = dict(document)
    if "_id" in out:
        out["id"] = str(out.pop("_id"))
    return out


class BaseRepository:
    collection_name: str = ""

    @property
    def collection(self):
        return mongo.db[self.collection_name]

    async def insert(self, document: dict[str, Any], session=None) -> dict[str, Any]:
        now = utc_now()
        document.setdefault("created_at", now)
        document.setdefault("updated_at", now)
        result = await self.collection.insert_one(document, session=session)
        res = serialize({**document, "_id": result.inserted_id})
        assert res is not None
        return res

    async def find_by_id(self, entity_id: str) -> dict[str, Any] | None:
        return serialize(
            await self.collection.find_one({"_id": to_object_id(entity_id)})
        )

    async def find_one(self, query: dict[str, Any]) -> dict[str, Any] | None:
        return serialize(await self.collection.find_one(query))

    async def find_many(
        self,
        query: dict[str, Any],
        sort: list[tuple[str, int]] | None = None,
        skip: int = 0,
        limit: int = 0,
    ) -> list[dict[str, Any]]:
        cursor = self.collection.find(query)
        if sort:
            cursor = cursor.sort(sort)
        if skip:
            cursor = cursor.skip(skip)
        if limit:
            cursor = cursor.limit(limit)
        results: list[dict[str, Any]] = []
        async for doc in cursor:
            s = serialize(doc)
            if s is not None:
                results.append(s)
        return results

    async def count(self, query: dict[str, Any]) -> int:
        return await self.collection.count_documents(query)

    async def update_by_id(
        self, entity_id: str, update: dict[str, Any]
    ) -> dict[str, Any] | None:
        update["updated_at"] = utc_now()
        return serialize(
            await self.collection.find_one_and_update(
                {"_id": to_object_id(entity_id)},
                {"$set": update},
                return_document=True,
            )
        )

    async def update_one(
        self, query: dict[str, Any], update: dict[str, Any]
    ) -> None:
        update.setdefault("$set", {})["updated_at"] = datetime.now().isoformat()
        await self.collection.update_one(query, update)

    async def delete_one(self, query: dict[str, Any]) -> int:
        result = await self.collection.delete_one(query)
        return result.deleted_count

    async def delete_by_id(self, entity_id: str) -> bool:
        result = await self.collection.delete_one({"_id": to_object_id(entity_id)})
        return result.deleted_count > 0

    async def create_index(self, keys: list[tuple[str, int]], **kwargs) -> str:
        return await self.collection.create_index(keys, **kwargs)
