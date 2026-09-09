from enum import Enum
from typing import List, Optional, Any, Dict
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
