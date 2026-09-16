from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Dict, Any
from src.dependencies.auth import get_current_user
from src.schemas.band import BookingRequest, BookingStatus, PaymentStatus, CustomerEventCreate
from src.services.band_service import BandService

router = APIRouter(prefix="/band", tags=["Band Connect (EventHub)"])

service = BandService()


def _ok(data) -> dict:
    return {"status": "success", "data": data}


@router.get("/artists", response_model=Dict[str, Any])
async def get_artists():
    artists = await service.get_all_artists()
    # Only expose profiles that have a real display_name set (not just the temp user name placeholder)
    public_artists = [
        a for a in artists
        if a.get("display_name") and a.get("display_name") != a.get("created_by")
        and not str(a.get("id", "")).startswith("temp_")
    ]
    return _ok(public_artists)

@router.get("/artists/me/dashboard")
async def get_my_artist_dashboard(current_user: dict = Depends(get_current_user)):
    return _ok(await service.get_artist_dashboard(current_user["id"]))

@router.get("/artists/me/media")
async def get_my_artist_media(current_user: dict = Depends(get_current_user)):
    return _ok(await service.get_artist_media(current_user["id"]))

@router.put("/artists/me/media")
async def update_my_artist_media(
    data: Dict[str, Any],
    current_user: dict = Depends(get_current_user)
):
    return _ok(await service.update_artist_media(current_user["id"], data))

@router.get("/artists/me/pricing")
async def get_my_artist_pricing(current_user: dict = Depends(get_current_user)):
    return _ok(await service.get_artist_pricing(current_user["id"]))

@router.put("/artists/me/pricing")
async def update_my_artist_pricing(
    data: Dict[str, Any],
    current_user: dict = Depends(get_current_user)
):
    return _ok(await service.update_artist_pricing(current_user["id"], data))

@router.get("/artists/me/availability")
async def get_my_artist_availability(current_user: dict = Depends(get_current_user)):
    return _ok(await service.get_artist_availability(current_user["id"]))

@router.put("/artists/me/availability")
async def update_my_artist_availability(
    data: Dict[str, Any],
    current_user: dict = Depends(get_current_user)
):
    return _ok(await service.update_artist_availability(current_user["id"], data))

@router.post("/artists/me/availability/check-conflict")
async def check_my_artist_conflict(
    data: Dict[str, Any],
    current_user: dict = Depends(get_current_user)
):
    return _ok({"has_conflict": False, "reason": None})

@router.get("/artists/me/analytics")
async def get_my_artist_analytics(current_user: dict = Depends(get_current_user)):
    return _ok(await service.get_artist_analytics(current_user["id"]))

@router.get("/artists/me", response_model=Dict[str, Any])
async def get_my_artist_profile(current_user: dict = Depends(get_current_user)):
    profile = await service.get_artist_by_owner(current_user["id"])
    if not profile:
        return _ok({"id": None, "created_by": current_user["id"], "message": "No artist profile yet"})
    return _ok(profile)

@router.put("/artists/me", response_model=Dict[str, Any])
async def update_my_artist_profile(
    data: Dict[str, Any],
    current_user: dict = Depends(get_current_user)
):
    profile = await service.upsert_artist_profile(current_user["id"], data)
    return _ok(profile)

@router.get("/artists/{artist_id}", response_model=Dict[str, Any])
async def get_artist(artist_id: str):
    artist = await service.get_artist_by_id(artist_id)
    if not artist:
        raise HTTPException(status_code=404, detail="Artist not found")
    return _ok(artist)

@router.get("/bands", response_model=Dict[str, Any])
async def get_bands():
    bands = await service.get_all_bands()
    public_bands = [
        b for b in bands
        if b.get("display_name") and not str(b.get("id", "")).startswith("temp_")
    ]
    return _ok(public_bands)

@router.get("/bands/me", response_model=Dict[str, Any])
async def get_my_band_profile(current_user: dict = Depends(get_current_user)):
    profile = await service.get_band_by_owner(current_user["id"])
    if not profile:
        return _ok({"id": None, "created_by": current_user["id"], "message": "No band profile yet"})
    return _ok(profile)

@router.put("/bands/me", response_model=Dict[str, Any])
async def update_my_band_profile(
    data: Dict[str, Any],
    current_user: dict = Depends(get_current_user)
):
    profile = await service.upsert_band_profile(current_user["id"], data)
    return _ok(profile)

@router.get("/bands/{band_id}", response_model=Dict[str, Any])
async def get_band(band_id: str):
    band = await service.get_band_by_id(band_id)
    if not band:
        raise HTTPException(status_code=404, detail="Band not found")
    return _ok(band)

@router.get("/venues", response_model=Dict[str, Any])
async def get_venues():
    venues = await service.get_all_venues()
    # Only expose venues that have a real venue_name, name, or display_name set
    public_venues = [
        v for v in venues
        if (v.get("venue_name") or v.get("name") or v.get("display_name"))
        and not str(v.get("id", "")).startswith("temp_")
    ]
    # Normalize fields for client consumption
    for v in public_venues:
        if not v.get("name"):
            v["name"] = v.get("venue_name") or v.get("display_name") or "Venue"
        if not v.get("venue_name"):
            v["venue_name"] = v.get("name") or v.get("display_name") or "Venue"
        if not v.get("capacity"):
            v["capacity"] = v.get("max_capacity") or v.get("min_capacity") or 0
        if not v.get("city"):
            v["city"] = v.get("district") or v.get("state") or v.get("address") or ""
        if not v.get("base_price"):
            pricing = v.get("pricing_details") or v.get("pricing") or {}
            if isinstance(pricing, dict):
                v["base_price"] = pricing.get("base_price") or pricing.get("price_per_day") or pricing.get("daily_rate") or 0
            elif isinstance(pricing, (int, float)):
                v["base_price"] = pricing
            else:
                v["base_price"] = 0

    # Sort newest first so recently registered venues appear right at the top
    public_venues.sort(
        key=lambda x: str(x.get("updated_at") or x.get("created_at") or ""),
        reverse=True
    )
    return _ok(public_venues)

@router.get("/venues/me", response_model=Dict[str, Any])
async def get_my_venue_profile(current_user: dict = Depends(get_current_user)):
    profile = await service.get_venue_by_owner(current_user["id"])
    if not profile:
        return _ok({"id": None, "user_id": current_user["id"], "message": "No venue profile yet"})
    return _ok(profile)

@router.put("/venues/me", response_model=Dict[str, Any])
async def update_my_venue_profile(
    data: Dict[str, Any],
    current_user: dict = Depends(get_current_user)
):
    profile = await service.upsert_venue_profile(current_user["id"], data)
    return _ok(profile)

@router.get("/venues/me/dashboard")
async def get_my_venue_dashboard(current_user: dict = Depends(get_current_user)):
    return _ok(await service.get_venue_dashboard(current_user["id"]))

@router.get("/venues/me/media")
async def get_my_venue_media(current_user: dict = Depends(get_current_user)):
    return _ok(await service.get_venue_media(current_user["id"]))

@router.put("/venues/me/media")
async def update_my_venue_media(
    data: Dict[str, Any],
    current_user: dict = Depends(get_current_user)
):
    return _ok(await service.update_venue_media(current_user["id"], data))

@router.get("/venues/me/pricing")
async def get_my_venue_pricing(current_user: dict = Depends(get_current_user)):
    return _ok(await service.get_venue_pricing(current_user["id"]))

@router.put("/venues/me/pricing")
async def update_my_venue_pricing(
    data: Dict[str, Any],
    current_user: dict = Depends(get_current_user)
):
    return _ok(await service.update_venue_pricing(current_user["id"], data))

@router.get("/venues/me/availability")
async def get_my_venue_availability(current_user: dict = Depends(get_current_user)):
    return _ok(await service.get_venue_availability(current_user["id"]))

@router.put("/venues/me/availability")
async def update_my_venue_availability(
    data: Dict[str, Any],
    current_user: dict = Depends(get_current_user)
):
    return _ok(await service.update_venue_availability(current_user["id"], data))

@router.post("/venues/me/availability/check-conflict")
async def check_my_venue_conflict(
    data: Dict[str, Any],
    current_user: dict = Depends(get_current_user)
):
    return _ok({"has_conflict": False, "reason": None})

@router.get("/venues/me/facilities")
async def get_my_venue_facilities(current_user: dict = Depends(get_current_user)):
    return _ok(await service.get_venue_facilities(current_user["id"]))

@router.put("/venues/me/facilities")
async def update_my_venue_facilities(
    data: Dict[str, Any],
    current_user: dict = Depends(get_current_user)
):
    return _ok(await service.update_venue_facilities(current_user["id"], data))

@router.get("/venues/me/analytics")
async def get_my_venue_analytics(current_user: dict = Depends(get_current_user)):
    return _ok(await service.get_venue_analytics(current_user["id"]))

@router.put("/venues/me/verification/resubmit")
async def resubmit_venue_verification(
    data: Dict[str, Any],
    current_user: dict = Depends(get_current_user)
):
    return _ok(await service.upsert_venue_profile(current_user["id"], {"verification_status": "pending", "verification_documents": data}))

@router.put("/venues/me/settings")
async def update_venue_settings(
    data: Dict[str, Any],
    current_user: dict = Depends(get_current_user)
):
    return _ok(await service.upsert_venue_profile(current_user["id"], {"settings": data}))


@router.get("/venues/{venue_id}", response_model=Dict[str, Any])
async def get_venue(venue_id: str):
    venue = await service.get_venue_by_id(venue_id)
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found")
    return _ok(venue)

@router.post("/bookings")
async def create_booking(
    request: BookingRequest,
    current_user: dict = Depends(get_current_user)
):
    try:
        booking = await service.create_booking(current_user["id"], request)
        return _ok(booking)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/bookings/artist/venue")
async def create_artist_venue_booking(
    request: BookingRequest,
    current_user: dict = Depends(get_current_user)
):
    try:
        # Currently identical to create_booking, but allows distinct logic later if needed
        booking = await service.create_booking(current_user["id"], request)
        return _ok(booking)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/bookings/venue/talent")
async def create_venue_talent_booking(
    request: BookingRequest,
    current_user: dict = Depends(get_current_user)
):
    try:
        booking = await service.create_booking(current_user["id"], request)
        return _ok(booking)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/bookings")
async def get_my_bookings(
    role_view: str = Query("customer", description="View as customer or provider"),
    current_user: dict = Depends(get_current_user)
):
    if role_view == "provider":
        bookings = await service.get_bookings_for_provider(current_user["id"])
    else:
        bookings = await service.get_bookings_for_customer(current_user["id"])
    return _ok(bookings)

@router.get("/bookings/{booking_id}")
async def get_booking(
    booking_id: str,
    current_user: dict = Depends(get_current_user)
):
    booking = await service.get_booking_by_id(booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    user_id = current_user["id"]
    profile_ids = await service.get_all_profile_ids_for_user(user_id)
    if booking.get("customer_id") != user_id and booking.get("provider_id") not in profile_ids:
        raise HTTPException(status_code=403, detail="Not authorized to view this booking")

    return _ok(booking)

@router.put("/bookings/{booking_id}/status")
async def update_booking_status(
    booking_id: str,
    status: BookingStatus,
    current_user: dict = Depends(get_current_user)
):
    booking = await service.get_booking_by_id(booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    profile_ids = await service.get_all_profile_ids_for_user(current_user["id"])
    if booking.get("provider_id") not in profile_ids:
        raise HTTPException(status_code=403, detail="Only provider can update booking status")

    updated = await service.update_booking_status(booking_id, status)
    return _ok(updated)

@router.put("/bookings/{booking_id}/payment")
async def simulate_payment(
    booking_id: str,
    payment_status: PaymentStatus,
    current_user: dict = Depends(get_current_user)
):
    booking = await service.get_booking_by_id(booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.get("customer_id") != current_user["id"]:
        raise HTTPException(status_code=403, detail="Only customer can make payments")

    updated = await service.update_payment_status(booking_id, payment_status)
    return _ok(updated)

# --- Customer Events ---

@router.post("/customer/events")
async def create_event(
    event_data: CustomerEventCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new umbrella event for the customer"""
    created = await service.create_event(current_user["id"], event_data.model_dump())
    return _ok(created)

@router.get("/customer/events")
async def get_customer_events(
    current_user: dict = Depends(get_current_user)
):
    """Get all events created by the customer"""
    events = await service.get_customer_events(current_user["id"])
    return _ok(events)

@router.get("/customer/events/{event_id}")
async def get_event_by_id(
    event_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a specific event by ID"""
    event = await service.get_event_by_id(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    if event.get("customer_id") != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to view this event")
        
    return _ok(event)
