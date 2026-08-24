from fastapi import APIRouter, Depends
from src.dependencies.auth import get_current_user
from src.services.notification_service import NotificationService

router = APIRouter(prefix="/notifications", tags=["Notifications"])
service = NotificationService()

@router.get("")
async def list_notifications(user: dict = Depends(get_current_user)) -> dict:
    notifs = await service.list_notifications(user["id"])
    return {"status": "success", "data": {"items": notifs}}

@router.get("/{id}")
async def get_notification(id: str, user: dict = Depends(get_current_user)) -> dict:
    notif = await service.get_notification(id)
    # Check ownership inside service or here
    if notif["user_id"] != user["id"]:
        from src.exceptions.handlers import NotFoundError
        raise NotFoundError("Notification not found")
    return {"status": "success", "data": notif}

@router.put("/{id}/read")
async def mark_read(id: str, user: dict = Depends(get_current_user)) -> dict:
    notif = await service.mark_read(id, user["id"])
    return {"status": "success", "data": notif}

@router.put("/read-all")
async def mark_all_read(user: dict = Depends(get_current_user)) -> dict:
    await service.mark_all_read(user["id"])
    return {"status": "success"}

@router.delete("/{id}")
async def delete_notification(id: str, user: dict = Depends(get_current_user)) -> dict:
    await service.delete_notification(id, user["id"])
    return {"status": "success"}

@router.delete("/clear-all")
async def clear_all_notifications(user: dict = Depends(get_current_user)) -> dict:
    await service.clear_all(user["id"])
    return {"status": "success"}
