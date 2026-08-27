import json
from typing import Dict, List
from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from src.dependencies.auth import get_current_user
from src.schemas.messages import ConversationResponse, MessageCreateRequest, ChatMessageResponse
from src.services.message_service import MessageService

router = APIRouter(prefix="/messages", tags=["Messages"])

class ConnectionManager:
    def __init__(self):
        # Maps conversation_id -> list of active websockets
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, conversation_id: str):
        await websocket.accept()
        if conversation_id not in self.active_connections:
            self.active_connections[conversation_id] = []
        self.active_connections[conversation_id].append(websocket)

    def disconnect(self, websocket: WebSocket, conversation_id: str):
        if conversation_id in self.active_connections:
            self.active_connections[conversation_id].remove(websocket)

    async def broadcast(self, message: dict, conversation_id: str):
        if conversation_id in self.active_connections:
            for connection in self.active_connections[conversation_id]:
                await connection.send_text(json.dumps(message))

manager = ConnectionManager()

@router.get("/conversations", response_model=list[ConversationResponse])
async def get_conversations(current_user: dict = Depends(get_current_user)):
    service = MessageService()
    return await service.get_user_conversations(current_user["id"])

@router.get("/{conversation_id}/history", response_model=list[ChatMessageResponse])
async def get_history(conversation_id: str, current_user: dict = Depends(get_current_user)):
    service = MessageService()
    return await service.get_conversation_history(conversation_id, current_user["id"])

@router.websocket("/ws/{conversation_id}")
async def websocket_endpoint(websocket: WebSocket, conversation_id: str):
    # Note: For production, we'd add auth token verification via query param or headers in websocket connection
    await manager.connect(websocket, conversation_id)
    service = MessageService()
    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            
            # Typically you'd resolve sender_id and sender_name from the authenticated connection context
            # For this MVP based on the frontend structure, we assume they send their id and name in the payload
            # Or we can just use dummy if not provided
            sender_id = payload.get("senderId", "me")
            sender_name = payload.get("senderName", "Unknown")
            content = payload.get("content", "")

            # Save to db
            msg_response = await service.save_message(conversation_id, sender_id, sender_name, content)
            
            # Broadcast to everyone in conversation
            # Format msg_response for frontend ChatMessage mapping (using camelCase keys where appropriate)
            broadcast_msg = {
                "id": msg_response["id"],
                "senderId": msg_response["sender_id"],
                "senderName": msg_response["sender_name"],
                "content": msg_response["content"],
                "sentAt": msg_response["sent_at"].isoformat() if hasattr(msg_response["sent_at"], "isoformat") else msg_response["sent_at"],
                "isMine": False # The receiver's client determines this based on senderId
            }
            
            await manager.broadcast(broadcast_msg, conversation_id)
    except WebSocketDisconnect:
        manager.disconnect(websocket, conversation_id)
