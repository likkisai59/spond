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
    min_hours: int = 1
    travel_charges: str | None = None
    availability: str = "Available"
    blackout_dates: list[str] = []
    verified: bool = False
    completed_gigs: int = 0
    packages: list[dict] = []
    sound_rider: list[str] = []
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
    min_hours: int = 1
    travel_charges: str | None = None
    packages: list[dict] = []
    sound_rider: list[str] = []

class ArtistUpdateRequest(CamelModel):
    artist_name: str | None = None
    name: str | None = None
    bio: str | None = None
    profile_image: str | None = None
    genres: list[str] | None = None
    location: str | None = None
    price_from: int | None = None
    min_hours: int | None = None
    travel_charges: str | None = None
    availability: str | None = None
    blackout_dates: list[str] | None = None
    packages: list[dict] | None = None
    sound_rider: list[str] | None = None

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
    team_members: list[dict] = []
    instrument_lineup: dict[str, int] = {}
    packages: list[dict] = []
    sound_rider_specs: str | None = None
    rating: float = 0.0
    review_count: int = 0
    price_from: int = 0
    availability: str = "Available"
    blackout_dates: list[str] = []
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
    team_members: list[dict] = []
    instrument_lineup: dict[str, int] = {}
    packages: list[dict] = []
    sound_rider_specs: str | None = None
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
    team_members: list[dict] | None = None
    instrument_lineup: dict[str, int] | None = None
    packages: list[dict] | None = None
    sound_rider_specs: str | None = None
    price_from: int | None = None
    availability: str | None = None
    blackout_dates: list[str] | None = None

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
    security_deposit: int = 0
    rating: float = 0.0
    review_count: int = 0
    amenities: list[str] = []
    packages: list[dict] = []
    slots: list[dict] = []
    availability: str = "Available"
    blackout_dates: list[str] = []
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
    security_deposit: int = 0
    amenities: list[str] = []
    packages: list[dict] = []
    slots: list[dict] = []

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
    security_deposit: int | None = None
    amenities: list[str] | None = None
    packages: list[dict] | None = None
    slots: list[dict] | None = None
    availability: str | None = None
    blackout_dates: list[str] | None = None
    available: bool | None = None

# --- Bookings ---
class BookingTimelineEntry(CamelModel):
    status: str
    timestamp: datetime
    note: str

class BookingResponse(CamelModel):
    id: str
    band_id: str | None = None
    venue_id: str | None = None
    event_id: str | None = None
    customer_id: str | None = None
    provider_id: str | None = None
    provider_type: Literal["Venue", "Artist", "Band"] | None = None
    provider_name: str | None = None
    package_id: str | None = None
    title: str | None = None
    band_name: str | None = None
    venue_name: str | None = None
    booking_date: str | datetime | None = None
    event_date: str | datetime | None = None
    start_time: str | datetime | None = None
    end_time: str | datetime | None = None
    amount: int
    advance_amount: int = 0
    final_amount: int = 0
    booking_status: str = "REQUESTED"
    payment_status: str = "UNPAID"
    status: str | None = None  # legacy alias
    event_type: str | None = None
    guest_count: int = 0
    advance_order_id: str | None = None
    advance_payment_id: str | None = None
    final_order_id: str | None = None
    final_payment_id: str | None = None
    accepted_at: datetime | None = None
    counter_offer: dict | None = None
    timeline: list[BookingTimelineEntry] = []
    created_by: str
    created_at: datetime
    updated_at: datetime

class BookingCreateRequest(CamelModel):
    band_id: str | None = None
    venue_id: str | None = None
    event_id: str | None = None
    customer_id: str | None = None
    provider_id: str | None = None
    provider_type: Literal["Venue", "Artist", "Band"] | None = None
    provider_name: str | None = None
    package_id: str | None = None
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
    payment_status: str | None = None
    status: str | None = None
    amount: int | None = None
    advance_amount: int | None = None
    final_amount: int | None = None
    note: str | None = None
    accepted_at: datetime | None = None
    advance_order_id: str | None = None
    advance_payment_id: str | None = None
    final_order_id: str | None = None
    final_payment_id: str | None = None

# --- Gap Closure Requests ---
class CounterOfferRequest(CamelModel):
    amount: int
    note: str | None = None

class BlackoutDatesRequest(CamelModel):
    dates: list[str]

class ProviderOnboardingRequest(CamelModel):
    provider_type: Literal["Venue", "Artist", "Band"]
    name: str
    city: str
    contact_phone: str | None = None
    bio: str | None = None
    profile_image: str | None = None
    video_url: str | None = None
    images: list[str] = []
    packages: list[dict] = []
    base_price: int = 0
    # Additional specs
    min_hours: int = 1
    travel_charges: str | None = None
    sound_rider_specs: str | None = None
    security_deposit: int = 0
    capacity: int = 200
    # Payout details
    payout_upi: str | None = None
    bank_account: str | None = None
    bank_ifsc: str | None = None
    kyc_status: str = "PENDING"
