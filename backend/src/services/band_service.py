from src.database.mongo import utc_now
from src.repositories.band import (
    ArtistRepository, BandRepository, VenueRepository, BandVenueBookingRepository
)
from src.exceptions.handlers import NotFoundError, AppException
from src.schemas.band import (
    ArtistCreateRequest, ArtistUpdateRequest,
    BandCreateRequest, BandUpdateRequest,
    VenueCreateRequest, VenueUpdateRequest,
    BookingCreateRequest, BookingUpdateRequest
)

class BandService:
    def __init__(self):
        self.artists = ArtistRepository()
        self.bands = BandRepository()
        self.venues = VenueRepository()
        self.bookings = BandVenueBookingRepository()

    # Artists
    async def create_artist(self, user_id: str, data: ArtistCreateRequest) -> dict:
        existing = await self.artists.find_one({"artist_name": data.artist_name})
        if existing:
            raise AppException(400, "Artist name already exists")
            
        doc = data.model_dump(exclude_unset=True)
        if doc.get("name") and not doc.get("artist_name"):
            doc["artist_name"] = doc["name"]
        elif doc.get("artist_name") and not doc.get("name"):
            doc["name"] = doc["artist_name"]
            
        doc.update({
            "created_by": user_id,
            "created_at": utc_now(),
            "updated_at": utc_now(),
            "availability": "Available",
            "verified": False,
            "completed_gigs": 0,
            "rating": 0.0,
            "review_count": 0
        })
        artist_id = await self.artists.insert(doc)
        return await self.artists.find_by_id(artist_id)

    async def list_artists(self) -> list[dict]:
        return await self.artists.find_many({})

    async def get_artist(self, artist_id: str) -> dict:
        artist = await self.artists.find_by_id(artist_id)
        if not artist:
            raise NotFoundError("Artist not found")
        return artist

    async def update_artist(self, artist_id: str, data: ArtistUpdateRequest) -> dict:
        update_data = data.model_dump(exclude_unset=True)
        if not update_data:
            return await self.get_artist(artist_id)
            
        update_data["updated_at"] = utc_now()
        updated = await self.artists.update_by_id(artist_id, update_data)
        if not updated:
            raise NotFoundError("Artist not found")
        return await self.get_artist(artist_id)

    async def delete_artist(self, artist_id: str) -> None:
        deleted = await self.artists.delete_by_id(artist_id)
        if not deleted:
            raise NotFoundError("Artist not found")

    # Bands
    async def create_band(self, user_id: str, data: BandCreateRequest) -> dict:
        existing = await self.bands.find_one({"band_name": data.band_name})
        if existing:
            raise AppException(400, "Band name already exists")
            
        doc = data.model_dump(exclude_unset=True)
        if doc.get("name") and not doc.get("band_name"):
            doc["band_name"] = doc["name"]
        elif doc.get("band_name") and not doc.get("name"):
            doc["name"] = doc["band_name"]

        doc.update({
            "created_by": user_id,
            "created_at": utc_now(),
            "updated_at": utc_now(),
            "availability": "Available",
            "verified": False,
            "completed_gigs": 0,
            "rating": 0.0,
            "review_count": 0
        })
        band_id = await self.bands.insert(doc)
        return await self.bands.find_by_id(band_id)

    async def list_bands(self) -> list[dict]:
        return await self.bands.find_many({})

    async def get_band(self, band_id: str) -> dict:
        band = await self.bands.find_by_id(band_id)
        if not band:
            raise NotFoundError("Band not found")
        return band

    async def update_band(self, band_id: str, data: BandUpdateRequest) -> dict:
        update_data = data.model_dump(exclude_unset=True)
        if not update_data:
            return await self.get_band(band_id)
            
        update_data["updated_at"] = utc_now()
        updated = await self.bands.update_by_id(band_id, update_data)
        if not updated:
            raise NotFoundError("Band not found")
        return await self.get_band(band_id)

    async def delete_band(self, band_id: str) -> None:
        deleted = await self.bands.delete_by_id(band_id)
        if not deleted:
            raise NotFoundError("Band not found")

    # Venues
    async def create_venue(self, user_id: str, data: VenueCreateRequest) -> dict:
        existing = await self.venues.find_one({"venue_name": data.venue_name})
        if existing:
            raise AppException(400, "Venue name already exists")
            
        doc = data.model_dump(exclude_unset=True)
        if doc.get("name") and not doc.get("venue_name"):
            doc["venue_name"] = doc["name"]
        elif doc.get("venue_name") and not doc.get("name"):
            doc["name"] = doc["venue_name"]

        doc.update({
            "created_by": user_id,
            "created_at": utc_now(),
            "updated_at": utc_now(),
            "available": True,
            "rating": 0.0,
            "review_count": 0
        })
        venue_id = await self.venues.insert(doc)
        return await self.venues.find_by_id(venue_id)

    async def list_venues(self) -> list[dict]:
        return await self.venues.find_many({})

    async def get_venue(self, venue_id: str) -> dict:
        venue = await self.venues.find_by_id(venue_id)
        if not venue:
            raise NotFoundError("Venue not found")
        return venue

    async def update_venue(self, venue_id: str, data: VenueUpdateRequest) -> dict:
        update_data = data.model_dump(exclude_unset=True)
        if not update_data:
            return await self.get_venue(venue_id)
            
        update_data["updated_at"] = utc_now()
        updated = await self.venues.update_by_id(venue_id, update_data)
        if not updated:
            raise NotFoundError("Venue not found")
        return await self.get_venue(venue_id)

    async def delete_venue(self, venue_id: str) -> None:
        deleted = await self.venues.delete_by_id(venue_id)
        if not deleted:
            raise NotFoundError("Venue not found")

    # Bookings
    async def create_booking(self, user_id: str, data: BookingCreateRequest) -> dict:
        doc = data.model_dump(exclude_unset=True)
        doc.update({
            "created_by": user_id,
            "created_at": utc_now(),
            "updated_at": utc_now(),
            "booking_status": "Requested",
            "timeline": [{
                "status": "Requested",
                "timestamp": utc_now(),
                "note": "Booking requested"
            }]
        })
        booking_id = await self.bookings.insert(doc)
        return await self.bookings.find_by_id(booking_id)

    async def list_bookings(self) -> list[dict]:
        return await self.bookings.find_many({})

    async def get_booking(self, booking_id: str) -> dict:
        booking = await self.bookings.find_by_id(booking_id)
        if not booking:
            raise NotFoundError("Booking not found")
        return booking

    async def update_booking(self, booking_id: str, data: BookingUpdateRequest) -> dict:
        update_data = data.model_dump(exclude_unset=True)
        if not update_data:
            return await self.get_booking(booking_id)
            
        update_data["updated_at"] = utc_now()
        
        # If status is updated, push to timeline
        if data.booking_status:
            await self.bookings.collection.update_one(
                {"_id": booking_id},
                {"$push": {"timeline": {
                    "status": data.booking_status,
                    "timestamp": utc_now(),
                    "note": data.note or "Status updated"
                }}}
            )
            update_data.pop("note", None)
            
        updated = await self.bookings.update_by_id(booking_id, update_data)
        if not updated:
            raise NotFoundError("Booking not found")
        return await self.get_booking(booking_id)

    async def delete_booking(self, booking_id: str) -> None:
        deleted = await self.bookings.delete_by_id(booking_id)
        if not deleted:
            raise NotFoundError("Booking not found")
