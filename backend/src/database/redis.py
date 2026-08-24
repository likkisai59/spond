import redis.asyncio as redis
from typing import AsyncGenerator
import logging

from src.core.config import settings

logger = logging.getLogger(__name__)

class RedisClient:
    _client: redis.Redis | None = None

    @classmethod
    async def connect(cls) -> None:
        if cls._client is None:
            try:
                cls._client = redis.from_url(settings.REDIS_URL, decode_responses=True)
                await cls._client.ping()
                logger.info("Successfully connected to Redis")
            except Exception as e:
                logger.error(f"Failed to connect to Redis: {e}")
                raise

    @classmethod
    async def close(cls) -> None:
        if cls._client is not None:
            await cls._client.aclose()
            logger.info("Closed Redis connection")

    @classmethod
    def get_client(cls) -> redis.Redis:
        if cls._client is None:
            raise RuntimeError("Redis client is not connected")
        return cls._client

async def get_redis() -> AsyncGenerator[redis.Redis, None]:
    yield RedisClient.get_client()
