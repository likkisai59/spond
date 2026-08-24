from src.constants.collections import (
    BAND_ARTISTS,
    BAND_BANDS,
    BAND_VENUES,
    BAND_BOOKINGS,
    BAND_VENUE_BOOKINGS
)
from src.database.base_repository import BaseRepository

class ArtistRepository(BaseRepository):
    collection_name = BAND_ARTISTS

    async def ensure_indexes(self) -> None:
        await self.create_index([("artist_name", 1)], unique=True)

class BandRepository(BaseRepository):
    collection_name = BAND_BANDS

    async def ensure_indexes(self) -> None:
        await self.create_index([("band_name", 1)], unique=True)

class VenueRepository(BaseRepository):
    collection_name = BAND_VENUES

    async def ensure_indexes(self) -> None:
        await self.create_index([("venue_name", 1)], unique=True)

class BookingRepository(BaseRepository):
    collection_name = BAND_BOOKINGS

    async def ensure_indexes(self) -> None:
        await self.create_index([("band_id", 1)])
        await self.create_index([("venue_id", 1)])

class BandVenueBookingRepository(BaseRepository):
    collection_name = BAND_VENUE_BOOKINGS

    async def ensure_indexes(self) -> None:
        await self.create_index([("band_id", 1)])
        await self.create_index([("venue_id", 1)])
