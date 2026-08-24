"""Motor (async MongoDB) connection singleton."""
import logging
from datetime import datetime, timezone

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from src.core.config import settings

logger = logging.getLogger("unify.db")


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class MongoDatabase:
    """Async MongoDB connection held for the app lifetime (lifespan-managed)."""

    _instance: "MongoDatabase | None" = None

    def __new__(cls) -> "MongoDatabase":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._client = None
            cls._instance._db = None
        return cls._instance

    @property
    def client(self) -> AsyncIOMotorClient:
        if self._client is None:
            raise RuntimeError("MongoDB not connected — call connect() in lifespan")
        return self._client

    @property
    def db(self) -> AsyncIOMotorDatabase:
        if self._db is None:
            raise RuntimeError("MongoDB not connected — call connect() in lifespan")
        return self._db

    async def connect(self) -> None:
        self._client = AsyncIOMotorClient(
            settings.MONGODB_URI,
            serverSelectionTimeoutMS=5000,
            maxPoolSize=50,
            minPoolSize=2,
        )
        self._db = self._client[settings.MONGODB_DB_NAME]
        await self.ping()

    async def ping(self) -> bool:
        try:
            await self.client.admin.command("ping")
            return True
        except Exception as exc:  # noqa: BLE001
            logger.error("mongodb ping failed: %s", exc)
            return False

    async def close(self) -> None:
        if self._client is not None:
            self._client.close()
            self._client = None
            self._db = None


mongo = MongoDatabase()
