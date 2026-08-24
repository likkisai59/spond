from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

class CamelModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )

# --- Artists ---
class ArtistResponse(CamelModel):
    id: str
    artist_name: str
    name: str | None = None  # alias
    bio: str
    profile_image: str | None = None
    genres: list[str] = []
    location: str | None = None
    rating: float = 0.0
    review_count: int = 0
    price_from: int = 0
    availability: str = "Available"
    verified: bool = False
    completed_gigs: int = 0
    created_by: str
    created_at: datetime
    updated_at: datetime

class ArtistCreateRequest(CamelModel):
    artist_name: str
    name: str | None = None
    bio: str
    profile_image: str | None = None
    genres: list[str] = []
    location: str | None = None
    price_from: int = 0

class ArtistUpdateRequest(CamelModel):
    artist_name: str | None = None
    name: str | None = None
    bio: str | None = None
    profile_image: str | None = None
    genres: list[str] | None = None
    location: str | None = None
    price_from: int | None = None
    availability: str | None = None

# --- Bands ---
class BandResponse(CamelModel):
    id: str
    band_name: str
    name: str | None = None # alias
    description: str
    bio: str | None = None
    profile_image: str | None = None
    genres: list[str] = []
    location: str | None = None
    members: int = 1
    rating: float = 0.0
    review_count: int = 0
    price_from: int = 0
    availability: str = "Available"
    next_available: str | None = None
    verified: bool = False
    completed_gigs: int = 0
    created_by: str
    created_at: datetime
    updated_at: datetime

class BandCreateRequest(CamelModel):
    band_name: str
    name: str | None = None
    description: str
    bio: str | None = None
    profile_image: str | None = None
    genres: list[str] = []
    location: str | None = None
    members: int = 1
    price_from: int = 0

class BandUpdateRequest(CamelModel):
    band_name: str | None = None
    name: str | None = None
    description: str | None = None
    bio: str | None = None
    profile_image: str | None = None
    genres: list[str] | None = None
    location: str | None = None
    members: int | None = None
    price_from: int | None = None
    availability: str | None = None

# --- Venues ---
class VenueResponse(CamelModel):
    id: str
    venue_name: str
    name: str | None = None # alias
    address: str | None = None
    location: str | None = None
    city: str
    venue_type: str | None = None
    setting: str | None = None
    capacity: int
    contact_number: str | None = None
    price_per_hour: int = 0
    rating: float = 0.0
    review_count: int = 0
    amenities: list[str] = []
    available: bool = True
    created_by: str
    created_at: datetime
    updated_at: datetime

class VenueCreateRequest(CamelModel):
    venue_name: str
    name: str | None = None
    city: str
    address: str | None = None
    location: str | None = None
    venue_type: str | None = None
    setting: str | None = None
    capacity: int
    contact_number: str | None = None
    price_per_hour: int = 0
    amenities: list[str] = []

class VenueUpdateRequest(CamelModel):
    venue_name: str | None = None
    name: str | None = None
    city: str | None = None
    address: str | None = None
    location: str | None = None
    venue_type: str | None = None
    setting: str | None = None
    capacity: int | None = None
    contact_number: str | None = None
    price_per_hour: int | None = None
    amenities: list[str] | None = None
    available: bool | None = None

# --- Bookings ---
class BookingTimelineEntry(CamelModel):
    status: str
    timestamp: datetime
    note: str

class BookingResponse(CamelModel):
    id: str
    band_id: str
    venue_id: str
    title: str | None = None
    band_name: str | None = None
    venue_name: str | None = None
    booking_date: str | datetime | None = None
    event_date: str | datetime | None = None
    start_time: str | datetime | None = None
    end_time: str | datetime | None = None
    amount: int
    booking_status: str
    status: str | None = None
    event_type: str | None = None
    guest_count: int = 0
    timeline: list[BookingTimelineEntry] = []
    created_by: str
    created_at: datetime
    updated_at: datetime

class BookingCreateRequest(CamelModel):
    band_id: str
    venue_id: str
    title: str | None = None
    booking_date: str | datetime | None = None
    event_date: str | datetime | None = None
    start_time: str | datetime | None = None
    end_time: str | datetime | None = None
    amount: int
    event_type: str | None = None
    guest_count: int = 0

class BookingUpdateRequest(CamelModel):
    booking_status: str | None = None
    status: str | None = None
    amount: int | None = None
    note: str | None = None
