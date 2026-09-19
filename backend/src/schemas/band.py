from enum import Enum
from typing import List, Optional, Any, Dict, Literal
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime

class BookingStatus(str, Enum):
    REQUESTED = "REQUESTED"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"
    CONFIRMED = "CONFIRMED"
    EVENT_COMPLETED = "EVENT_COMPLETED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class PaymentStatus(str, Enum):
    UNPAID = "UNPAID"
    ADVANCE_PENDING = "ADVANCE_PENDING"
    ADVANCE_PAID = "ADVANCE_PAID"
    FINAL_PENDING = "FINAL_PENDING"
    FULLY_PAID = "FULLY_PAID"
    REFUNDED = "REFUNDED"

class PackageSchema(BaseModel):
    id: str
    name: str
    price: float
    duration: int # minutes
    description: str

class ArtistSchema(BaseModel):
    id: Optional[str] = None
    user_id: str
    name: str
    genre: List[str]
    bio: str
    city: str
    packages: List[PackageSchema]
    rating: float = 0.0
    reviews_count: int = 0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class BandSchema(BaseModel):
    id: Optional[str] = None
    user_id: str
    name: str
    genre: List[str]
    members_count: int
    bio: str
    city: str
    packages: List[PackageSchema]
    rating: float = 0.0
    reviews_count: int = 0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class VenueSchema(BaseModel):
    id: Optional[str] = None
    user_id: str
    name: str
    type: str
    capacity: int
    city: str
    amenities: List[str]
    packages: List[PackageSchema]
    rating: float = 0.0
    reviews_count: int = 0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class BookingRequest(BaseModel):
    provider_id: str
    provider_type: str # 'artist', 'band', 'venue'
    package_id: str
    event_date: str
    event_time: str
    message: Optional[str] = None
    proposed_price: Optional[float] = 0.0

class BookingSchema(BaseModel):
    id: Optional[str] = None
    customer_id: str
    provider_id: str
    provider_type: str
    package_id: str
    event_date: str
    event_time: str
    message: Optional[str] = None
    status: BookingStatus = BookingStatus.REQUESTED
    payment_status: PaymentStatus = PaymentStatus.UNPAID
    total_amount: float
    advance_amount: float
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class CustomerEventCreate(BaseModel):
    title: str
    event_type: str
    date: str
    start_time: str
    end_time: str
    location: str
    guest_count: int
    budget: float

class CustomerEventSchema(CustomerEventCreate):
    id: Optional[str] = None
    customer_id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

# ── Legacy & Test Compatibility Request Schemas ──────────────────────────────
class BandCreateRequest(BaseModel):
    band_name: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    bio: Optional[str] = None
    profile_image: Optional[str] = None
    genres: List[str] = []
    location: Optional[str] = None
    members: int = 1
    team_members: List[dict] = []
    instrument_lineup: Dict[str, int] = {}
    packages: List[dict] = []
    sound_rider_specs: Optional[str] = None
    price_from: int = 0

class BookingCreateRequest(BaseModel):
    band_id: Optional[str] = None
    venue_id: Optional[str] = None
    event_id: Optional[str] = None
    customer_id: Optional[str] = None
    provider_id: Optional[str] = None
    provider_type: Optional[Literal["Venue", "Artist", "Band"]] = None
    provider_name: Optional[str] = None
    package_id: Optional[str] = None
    title: Optional[str] = None
    booking_date: Optional[Any] = None
    event_date: Optional[Any] = None
    start_time: Optional[Any] = None
    end_time: Optional[Any] = None
    amount: float = 0.0
    event_type: Optional[str] = None
    guest_count: int = 0

class BookingUpdateRequest(BaseModel):
    booking_status: Optional[str] = None
    payment_status: Optional[str] = None
    status: Optional[str] = None
    amount: Optional[float] = None
    advance_amount: Optional[float] = None
    final_amount: Optional[float] = None
    note: Optional[str] = None
    accepted_at: Optional[datetime] = None
    advance_order_id: Optional[str] = None
    advance_payment_id: Optional[str] = None
    final_order_id: Optional[str] = None
    final_payment_id: Optional[str] = None

class ProviderOnboardingRequest(BaseModel):
    provider_type: str = "Band"
    name: str
    city: str = "Bangalore"
    contact_phone: Optional[str] = None
    bio: Optional[str] = None
    profile_image: Optional[str] = None
    video_url: Optional[str] = None
    images: List[str] = []
    packages: List[dict] = []
    base_price: float = 0.0
    min_hours: int = 1
    travel_charges: Optional[str] = None
    sound_rider_specs: Optional[str] = None
    security_deposit: float = 0.0
    capacity: int = 200
    payout_upi: Optional[str] = None
    bank_account: Optional[str] = None
    bank_ifsc: Optional[str] = None
    kyc_status: str = "PENDING"

class CounterOfferRequest(BaseModel):
    amount: float
    note: Optional[str] = None

class BlackoutDatesRequest(BaseModel):
    dates: List[str]

class ArtistCreateRequest(BaseModel):
    artist_name: Optional[str] = None
    name: Optional[str] = None
    bio: Optional[str] = None
    profile_image: Optional[str] = None
    genres: List[str] = []
    location: Optional[str] = None
    price_from: float = 0.0
    min_hours: int = 1
    travel_charges: Optional[str] = None
    packages: List[dict] = []
    sound_rider: List[str] = []

class ArtistUpdateRequest(BaseModel):
    artist_name: Optional[str] = None
    name: Optional[str] = None
    bio: Optional[str] = None
    profile_image: Optional[str] = None
    genres: Optional[List[str]] = None
    location: Optional[str] = None
    price_from: Optional[float] = None
    min_hours: Optional[int] = None
    travel_charges: Optional[str] = None
    availability: Optional[str] = None
    blackout_dates: Optional[List[str]] = None
    packages: Optional[List[dict]] = None
    sound_rider: Optional[List[str]] = None

class BandUpdateRequest(BaseModel):
    band_name: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    bio: Optional[str] = None
    profile_image: Optional[str] = None
    genres: Optional[List[str]] = None
    location: Optional[str] = None
    members: Optional[int] = None
    team_members: Optional[List[dict]] = None
    instrument_lineup: Optional[Dict[str, int]] = None
    packages: Optional[List[dict]] = None
    sound_rider_specs: Optional[str] = None
    price_from: Optional[float] = None
    availability: Optional[str] = None
    blackout_dates: Optional[List[str]] = None

class VenueCreateRequest(BaseModel):
    venue_name: Optional[str] = None
    name: Optional[str] = None
    city: str = "Bangalore"
    address: Optional[str] = None
    location: Optional[str] = None
    venue_type: Optional[str] = None
    setting: Optional[str] = None
    capacity: int = 200
    contact_number: Optional[str] = None
    price_per_hour: float = 0.0
    security_deposit: float = 0.0
    amenities: List[str] = []
    packages: List[dict] = []
    slots: List[dict] = []

class VenueUpdateRequest(BaseModel):
    venue_name: Optional[str] = None
    name: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    location: Optional[str] = None
    venue_type: Optional[str] = None
    setting: Optional[str] = None
    capacity: Optional[int] = None
    contact_number: Optional[str] = None
    price_per_hour: Optional[float] = None
    security_deposit: Optional[float] = None
    amenities: Optional[List[str]] = None
    packages: Optional[List[dict]] = None
    slots: Optional[List[dict]] = None
    availability: Optional[str] = None
    blackout_dates: Optional[List[str]] = None
    available: Optional[bool] = None

