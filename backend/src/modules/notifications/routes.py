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

from fastapi import WebSocket, WebSocketDisconnect
from src.services.websocket_manager import manager
from src.core import security

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: str = None):
    # Accept the connection first
    await websocket.accept()
    if not token:
        print("WebSocket auth failed: No token provided")
        await websocket.send_json({"type": "error", "message": "No token provided"})
        await websocket.close(code=1008)
        return
        
    try:
        # Decode and verify the token
        payload = security.decode_token(token, security.TOKEN_TYPE_ACCESS)
        user_id = payload["sub"]
    except Exception as e:
        print(f"WebSocket auth failed for token {token[:10]}...: {type(e).__name__} - {e}")
        await websocket.send_json({"type": "error", "message": f"Auth failed: {str(e)}"})
        await websocket.close(code=1008)
        return

    # Register user with the manager
    await manager.connect(websocket, user_id)
    
    # Send an initial connection success message
    await websocket.send_json({"type": "connected", "user_id": user_id})
    
    try:
        while True:
            # Wait for any message from the client (e.g., ping/pong heartbeats)
            data = await websocket.receive_text()
            try:
                import json
                message = json.loads(data)
                if message.get("type") == "pong":
                    pass # Keep-alive received
            except json.JSONDecodeError:
                pass
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
