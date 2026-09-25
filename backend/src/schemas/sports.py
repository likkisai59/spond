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

# --- Groups ---
class GroupMemberResponse(CamelModel):
    id: str
    group_id: str
    user_id: str
    name: str | None = None
    email: str | None = None
    role: str
    status: str = "Active"
    joined_at: datetime

class GroupResponse(CamelModel):
    id: str
    name: str
    description: str
    category: str | None = None
    sport_type: str | None = None
    age_group: str | None = None
    location: str | None = None
    logo: str | None = None
    visibility: str | None = None
    created_by: str
    created_at: datetime
    updated_at: datetime
    member_count: int = 0
    members: list[GroupMemberResponse] = []

class GroupCreateRequest(CamelModel):
    name: str = Field(min_length=2, max_length=100)
    description: str = Field(max_length=500)
    sport_type: str | None = None
    age_group: str | None = None
    category: str | None = None
    location: str | None = None
    visibility: str | None = None
    logo: str | None = None

class GroupUpdateRequest(CamelModel):
    name: str | None = Field(default=None, min_length=2, max_length=100)
    description: str | None = Field(default=None, max_length=500)
    sport_type: str | None = None
    age_group: str | None = None
    category: str | None = None
    location: str | None = None
    visibility: str | None = None
    logo: str | None = None

# --- Members ---
class AddMemberRequest(CamelModel):
    user_id: str | None = None
    name: str | None = None
    email: str | None = None
    role: str = "Member"

class UpdateMemberRoleRequest(CamelModel):
    role: str

# --- Events ---
class EventAttendanceSummary(CamelModel):
    going: int = 0
    maybe: int = 0
    not_responded: int = 0

class EventResponse(CamelModel):
    id: str
    group_id: str
    title: str | None = None
    name: str | None = None  # alias for title
    description: str | None = None
    date: str | None = None
    start_time: str | None = None
    end_time: str | None = None
    location: str | None = None
    venue_name: str | None = None
    type: str | None = "Training"
    event_type: str | None = None
    status: str = "Upcoming"
    max_participants: int | None = None
    notify_members: bool = True
    created_by: str | None = None
    attendance: EventAttendanceSummary = Field(default_factory=EventAttendanceSummary)

class EventCreateRequest(CamelModel):
    group_id: str
    title: str | None = None
    name: str | None = None
    description: str = ""
    date: str | None = None
    start_time: str | None = None
    end_time: str | None = None
    venue_name: str | None = None
    location: str | None = None
    event_type: str | None = None
    type: str | None = "Training"
    max_participants: int | None = None
    notify_members: bool = True

class EventUpdateRequest(CamelModel):
    title: str | None = None
    name: str | None = None
    description: str | None = None
    date: str | None = None
    start_time: str | None = None
    end_time: str | None = None
    venue_name: str | None = None
    location: str | None = None
    event_type: str | None = None
    type: str | None = None
    max_participants: int | None = None
    status: str | None = None
    notify_members: bool | None = None

# --- RSVP ---
class RsvpRequest(CamelModel):
    status: Literal["Going", "Maybe", "Not Responded"]

class RsvpResponse(CamelModel):
    id: str
    event_id: str
    user_id: str
    status: str

# --- Attendance ---
class MarkAttendanceRequest(CamelModel):
    event_id: str
    user_id: str
    attendance_status: str

class AttendanceResponse(CamelModel):
    id: str
    event_id: str
    user_id: str
    attendance_status: str
    marked_by: str
    marked_at: datetime

# --- Venues ---
class VenueResponse(CamelModel):
    id: str
    name: str
    description: str
    sport_type: str | None = None
    address: str
    city: str
    state: str | None = None
    country: str | None = None
    amenities: list[str] = []
    images: list[str] = []
    contact_name: str | None = None
    contact_phone: str | None = None
    opening_time: str | None = None
    closing_time: str | None = None
    status: str = "Draft"
    created_by: str
    created_at: datetime

class VenueCreateRequest(CamelModel):
    name: str
    description: str
    sport_type: str | None = None
    address: str
    city: str
    state: str | None = None
    country: str | None = None
    amenities: list[str] = []
    images: list[str] = []
    contact_name: str | None = None
    contact_phone: str | None = None
    opening_time: str | None = None
    closing_time: str | None = None
    status: str = "Draft"

class VenueUpdateRequest(CamelModel):
    name: str | None = None
    description: str | None = None
    sport_type: str | None = None
    address: str | None = None
    city: str | None = None
    state: str | None = None
    country: str | None = None
    amenities: list[str] | None = None
    images: list[str] | None = None
    contact_name: str | None = None
    contact_phone: str | None = None
    opening_time: str | None = None
    closing_time: str | None = None
    status: str | None = None

# --- Slots ---
class SlotResponse(CamelModel):
    id: str
    venue_id: str
    date: str
    start_time: str
    end_time: str
    price: float
    is_available: bool

class SlotCreateRequest(CamelModel):
    date: str
    start_time: str
    end_time: str
    price: float
    is_available: bool = True

class SlotUpdateRequest(CamelModel):
    date: str | None = None
    start_time: str | None = None
    end_time: str | None = None
    price: float | None = None
    is_available: bool | None = None

class GenerateSlotsRequest(CamelModel):
    start_date: str
    end_date: str
    start_time: str
    end_time: str
    slot_duration_minutes: int = 60
    price: float

# --- Bookings ---
class BookingResponse(CamelModel):
    id: str
    venue_id: str
    slot_id: str
    group_id: str | None = None
    booked_by: str
    booking_status: str
    amount: float
    booking_date: datetime | str
    created_at: datetime

class BookingCreateRequest(CamelModel):
    venue_id: str
    slot_id: str
    group_id: str | None = None
    amount: float
    booking_date: datetime | str | None = None

class UpdateBookingStatusRequest(CamelModel):
    status: str

# --- Payment Requests ---
class PaymentRequestCreateRequest(CamelModel):
    group_id: str
    title: str = Field(min_length=2, max_length=150)
    amount: float = Field(gt=0)
    due_date: str
    description: str | None = None

class PaymentRequestResponse(CamelModel):
    id: str
    group_id: str
    title: str
    amount: float
    due_date: str
    description: str | None = None
    status: str = "Pending"
    paid_count: int = 0
    total_members: int = 0
    created_by: str | None = None
    created_at: datetime
    updated_at: datetime

# --- Polls ---
class PollCreateRequest(CamelModel):
    group_id: str
    question: str
    option_labels: list[str] | None = None
    options: list[str] | list[dict] | None = None
    multiple_choice: bool = False
    expires_at: str

class PollVoteRequest(CamelModel):
    option_id: str



