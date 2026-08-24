from fastapi import APIRouter, Depends

from src.dependencies.auth import get_current_user
from src.services.band_service import BandService
from src.schemas.band import (
    ArtistCreateRequest, ArtistUpdateRequest,
    BandCreateRequest, BandUpdateRequest,
    VenueCreateRequest, VenueUpdateRequest,
    BookingCreateRequest, BookingUpdateRequest
)

router = APIRouter(prefix="/band", tags=["Band"])
service = BandService()

# --- Artists ---
@router.post("/artists")
async def create_artist(data: ArtistCreateRequest, user: dict = Depends(get_current_user)) -> dict:
    artist = await service.create_artist(user["id"], data)
    return {"status": "success", "data": artist}

@router.get("/artists")
async def list_artists(_: dict = Depends(get_current_user)) -> dict:
    artists = await service.list_artists()
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
async def list_bands(_: dict = Depends(get_current_user)) -> dict:
    bands = await service.list_bands()
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
async def list_venues(_: dict = Depends(get_current_user)) -> dict:
    venues = await service.list_venues()
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

# --- Bookings ---
@router.post("/bookings")
async def create_booking(data: BookingCreateRequest, user: dict = Depends(get_current_user)) -> dict:
    booking = await service.create_booking(user["id"], data)
    return {"status": "success", "data": booking}

@router.get("/bookings")
async def list_bookings(_: dict = Depends(get_current_user)) -> dict:
    bookings = await service.list_bookings()
    return {"status": "success", "data": {"items": bookings}}

@router.get("/bookings/history")
async def get_booking_history(user: dict = Depends(get_current_user)) -> dict:
    bookings = await service.list_bookings({"created_by": user["id"]})
    return {"status": "success", "data": {"items": bookings}}

@router.get("/bookings/{id}")
async def get_booking(id: str, _: dict = Depends(get_current_user)) -> dict:
    booking = await service.get_booking(id)
    return {"status": "success", "data": booking}

@router.put("/bookings/{id}")
async def update_booking(id: str, data: BookingUpdateRequest, _: dict = Depends(get_current_user)) -> dict:
    booking = await service.update_booking(id, data)
    return {"status": "success", "data": booking}

@router.delete("/bookings/{id}")
async def delete_booking(id: str, _: dict = Depends(get_current_user)) -> dict:
    await service.delete_booking(id)
    return {"status": "success"}
