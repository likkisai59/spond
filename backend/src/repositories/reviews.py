from src.database.base_repository import BaseRepository

class ReviewRepository(BaseRepository):
    collection_name = "reviews"

    async def ensure_indexes(self):
        await self.create_index([("reviewer_id", 1)])
        await self.create_index([("reviewee_id", 1)])
        await self.create_index([("booking_id", 1)])
        await self.create_index([("artist_profile_id", 1)])
        await self.create_index([("venue_id", 1)])
