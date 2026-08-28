from fastapi import APIRouter, Depends, Query

from src.dependencies.auth import get_current_user
from src.services.band_service import BandService
from src.schemas.band import (
    ArtistCreateRequest, ArtistUpdateRequest,
    BandCreateRequest, BandUpdateRequest,
    VenueCreateRequest, VenueUpdateRequest,
    BookingCreateRequest, BookingUpdateRequest,
    CounterOfferRequest, BlackoutDatesRequest, ProviderOnboardingRequest
)

router = APIRouter(prefix="/band", tags=["Band & EventHub"])
service = BandService()

# --- Providers Unified Onboarding ---
@router.post("/providers/onboarding")
async def onboard_provider(data: ProviderOnboardingRequest, user: dict = Depends(get_current_user)) -> dict:
    provider = await service.onboard_provider(user["id"], data)
    return {"status": "success", "data": provider}

# --- Provider Blackout Dates ---
@router.put("/providers/{id}/blackout")
async def update_blackout_dates(id: str, data: BlackoutDatesRequest, user: dict = Depends(get_current_user)) -> dict:
    provider = await service.update_blackout_dates(id, user["id"], data.dates)
    return {"status": "success", "data": provider}

# --- Artists ---
@router.post("/artists")
async def create_artist(data: ArtistCreateRequest, user: dict = Depends(get_current_user)) -> dict:
    artist = await service.create_artist(user["id"], data)
    return {"status": "success", "data": artist}

@router.get("/artists")
async def list_artists(
    genre: str | None = Query(None),
    city: str | None = Query(None),
    _: dict = Depends(get_current_user)
) -> dict:
    artists = await service.list_artists(genre=genre, city=city)
    return {"status": "success", "data": {"items": artists}}

@router.get("/artists/{id}")
async def get_artist(id: str, _: dict = Depends(get_current_user)) -> dict:
    artist = await service.get_artist(id)
    return {"status": "success", "data": artist}

@router.put("/artists/{id}")
async def update_artist(id: str, data: ArtistUpdateRequest, _: dict = Depends(get_current_user)) -> dict:
    artist = await service.update_artist(id, data)
    return {"status": "success", "data": artist}

@router.delete("/artists/{id}")
async def delete_artist(id: str, _: dict = Depends(get_current_user)) -> dict:
    await service.delete_artist(id)
    return {"status": "success"}

# --- Bands ---
@router.post("/bands")
async def create_band(data: BandCreateRequest, user: dict = Depends(get_current_user)) -> dict:
    band = await service.create_band(user["id"], data)
    return {"status": "success", "data": band}

@router.get("/bands")
async def list_bands(
    genre: str | None = Query(None),
    city: str | None = Query(None),
    _: dict = Depends(get_current_user)
) -> dict:
    bands = await service.list_bands(genre=genre, city=city)
    return {"status": "success", "data": {"items": bands}}

@router.get("/bands/{id}")
async def get_band(id: str, _: dict = Depends(get_current_user)) -> dict:
    band = await service.get_band(id)
    return {"status": "success", "data": band}

@router.put("/bands/{id}")
async def update_band(id: str, data: BandUpdateRequest, _: dict = Depends(get_current_user)) -> dict:
    band = await service.update_band(id, data)
    return {"status": "success", "data": band}

@router.delete("/bands/{id}")
async def delete_band(id: str, _: dict = Depends(get_current_user)) -> dict:
    await service.delete_band(id)
    return {"status": "success"}

# --- Venues ---
@router.post("/venues")
async def create_venue(data: VenueCreateRequest, user: dict = Depends(get_current_user)) -> dict:
    venue = await service.create_venue(user["id"], data)
    return {"status": "success", "data": venue}

@router.get("/venues")
async def list_venues(
    city: str | None = Query(None),
    venue_type: str | None = Query(None),
    _: dict = Depends(get_current_user)
) -> dict:
    venues = await service.list_venues(city=city, venue_type=venue_type)
    return {"status": "success", "data": {"items": venues}}

@router.get("/venues/{id}")
async def get_venue(id: str, _: dict = Depends(get_current_user)) -> dict:
    venue = await service.get_venue(id)
    return {"status": "success", "data": venue}

@router.put("/venues/{id}")
async def update_venue(id: str, data: VenueUpdateRequest, _: dict = Depends(get_current_user)) -> dict:
    venue = await service.update_venue(id, data)
    return {"status": "success", "data": venue}

@router.delete("/venues/{id}")
async def delete_venue(id: str, _: dict = Depends(get_current_user)) -> dict:
    await service.delete_venue(id)
    return {"status": "success"}

# --- Availability ---
@router.get("/providers/{id}/availability")
async def check_availability(
    id: str,
    event_date: str = Query(...),
    start_time: str | None = Query(None),
    end_time: str | None = Query(None),
    _: dict = Depends(get_current_user)
) -> dict:
    is_available = await service.check_provider_availability(
        provider_id=id,
        event_date=event_date,
        start_time=start_time,
        end_time=end_time
    )
    return {"status": "success", "data": {"available": is_available, "provider_id": id, "event_date": event_date}}

# --- Bookings ---
@router.post("/bookings")
async def create_booking(data: BookingCreateRequest, user: dict = Depends(get_current_user)) -> dict:
    booking = await service.create_booking(user["id"], data)
    return {"status": "success", "data": booking}

@router.get("/bookings")
async def list_bookings(
    event_id: str | None = Query(None),
    provider_id: str | None = Query(None),
    booking_status: str | None = Query(None),
    user: dict = Depends(get_current_user)
) -> dict:
    bookings = await service.list_bookings(
        event_id=event_id,
        provider_id=provider_id,
        booking_status=booking_status
    )
    return {"status": "success", "data": {"items": bookings}}

@router.get("/bookings/history")
async def get_booking_history(user: dict = Depends(get_current_user)) -> dict:
    bookings = await service.list_bookings(customer_id=user["id"])
    return {"status": "success", "data": {"items": bookings}}

@router.get("/bookings/{id}")
async def get_booking(id: str, _: dict = Depends(get_current_user)) -> dict:
    booking = await service.get_booking(id)
    return {"status": "success", "data": booking}

@router.put("/bookings/{id}")
async def update_booking(id: str, data: BookingUpdateRequest, _: dict = Depends(get_current_user)) -> dict:
    booking = await service.update_booking(id, data)
    return {"status": "success", "data": booking}

@router.put("/bookings/{id}/accept")
async def accept_booking(id: str, user: dict = Depends(get_current_user)) -> dict:
    booking = await service.accept_booking(id, user["id"])
    return {"status": "success", "data": booking}

@router.put("/bookings/{id}/reject")
async def reject_booking(id: str, reason: str | None = Query(None), user: dict = Depends(get_current_user)) -> dict:
    booking = await service.reject_booking(id, user["id"], reason=reason)
    return {"status": "success", "data": booking}

@router.put("/bookings/{id}/counter-offer")
async def counter_offer_booking(id: str, data: CounterOfferRequest, user: dict = Depends(get_current_user)) -> dict:
    booking = await service.counter_offer_booking(id, user["id"], data)
    return {"status": "success", "data": booking}

@router.put("/bookings/{id}/complete-event")
async def complete_event(id: str, user: dict = Depends(get_current_user)) -> dict:
    booking = await service.complete_event(id, user["id"])
    return {"status": "success", "data": booking}

@router.delete("/bookings/{id}")
async def delete_booking(id: str, _: dict = Depends(get_current_user)) -> dict:
    await service.delete_booking(id)
    return {"status": "success"}
