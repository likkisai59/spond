from fastapi import APIRouter, Depends, Query

from src.dependencies.auth import get_current_user
from src.services.eventhub_service import EventHubService
from src.schemas.eventhub import (
    EventHubEventCreateRequest,
    EventHubEventUpdateRequest,
    EventHubEventResponse
)

router = APIRouter(prefix="/eventhub", tags=["EventHub Events"])
service = EventHubService()

@router.post("/events")
async def create_event(
    data: EventHubEventCreateRequest,
    user: dict = Depends(get_current_user)
) -> dict:
    event = await service.create_event(user["id"], data)
    return {"status": "success", "data": event}

@router.get("/events")
async def list_events(
    status: str | None = Query(None),
    user: dict = Depends(get_current_user)
) -> dict:
    events = await service.list_events(user["id"], status=status)
    return {"status": "success", "data": {"items": events}}

@router.get("/events/{id}")
async def get_event(
    id: str,
    user: dict = Depends(get_current_user)
) -> dict:
    event = await service.get_event(id, user["id"])
    return {"status": "success", "data": event}

@router.put("/events/{id}")
async def update_event(
    id: str,
    data: EventHubEventUpdateRequest,
    user: dict = Depends(get_current_user)
) -> dict:
    event = await service.update_event(id, user["id"], data)
    return {"status": "success", "data": event}

@router.delete("/events/{id}")
async def delete_event(
    id: str,
    user: dict = Depends(get_current_user)
) -> dict:
    res = await service.delete_event(id, user["id"])
    return {"status": "success", "data": res}
