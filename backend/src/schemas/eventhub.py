from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

class CamelModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )

class EventHubEventCreateRequest(CamelModel):
    title: str
    date: str  # YYYY-MM-DD
    location: str  # City / Area context
    guest_count: int
    budget: int
    event_type: str | None = None  # e.g. "Wedding", "Reception", "Corporate", "Concert", "Birthday"
    start_time: str | None = None  # HH:MM
    end_time: str | None = None    # HH:MM
    description: str | None = None

class EventHubEventUpdateRequest(CamelModel):
    title: str | None = None
    date: str | None = None
    location: str | None = None
    guest_count: int | None = None
    budget: int | None = None
    event_type: str | None = None
    start_time: str | None = None
    end_time: str | None = None
    description: str | None = None
    status: str | None = None  # "ACTIVE" | "ARCHIVED" | "CANCELLED"

class EventHubEventResponse(CamelModel):
    id: str
    customer_id: str
    title: str
    date: str
    location: str
    guest_count: int
    budget: int
    event_type: str | None = None
    start_time: str | None = None
    end_time: str | None = None
    description: str | None = None
    status: str = "ACTIVE"
    booking_count: int = 0
    total_committed: int = 0
    bookings: list[dict] = []
    created_at: datetime
    updated_at: datetime
