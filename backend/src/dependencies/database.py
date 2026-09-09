from src.database.mongo import MongoDatabase
from motor.motor_asyncio import AsyncIOMotorDatabase

async def get_db_client() -> AsyncIOMotorDatabase:
    """Dependency to get the Motor database instance."""
    mongo = MongoDatabase()
    return mongo.db
