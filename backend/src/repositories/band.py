from src.database.base_repository import BaseRepository
from src.constants.collections import BAND_VENUE_BOOKINGS

class BandVenueBookingRepository(BaseRepository):
    collection_name = BAND_VENUE_BOOKINGS

    async def ensure_indexes(self) -> None:
        await self.create_index([("event_id", 1)])
