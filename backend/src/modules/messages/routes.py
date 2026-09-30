from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from src.dependencies.auth import get_current_user
from src.schemas.messages import (
    ConversationResponse,
    MessageSchema,
    CreateConversationPayload,
    SendMessagePayload,
    MessageUpdatePayload
)
from src.services.message_service import MessageService

router = APIRouter(prefix="", tags=["Messages"])

def get_service() -> MessageService:
    return MessageService()

@router.get("/conversations", response_model=List[Dict[str, Any]])
async def get_conversations(
    current_user: dict = Depends(get_current_user),
    service: MessageService = Depends(get_service)
):
    conversations = await service.get_user_conversations(current_user["id"])
    return {"data": conversations}

@router.post("/conversations", response_model=Dict[str, Any])
async def create_conversation(
    payload: CreateConversationPayload,
    current_user: dict = Depends(get_current_user),
    service: MessageService = Depends(get_service)
):
    try:
        conversation = await service.create_conversation(payload, current_user["id"])
        return {"data": conversation}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/conversations/{conversation_id}", response_model=Dict[str, Any])
async def get_conversation(
    conversation_id: str,
    current_user: dict = Depends(get_current_user),
    service: MessageService = Depends(get_service)
):
    try:
        conversation = await service.get_conversation(conversation_id, current_user["id"])
        return {"data": conversation}
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/conversations/{conversation_id}/messages", response_model=List[Dict[str, Any]])
async def get_messages(
    conversation_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
    service: MessageService = Depends(get_service)
):
    try:
        messages = await service.get_messages(conversation_id, current_user["id"], page, limit)
        return {"data": messages}
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/conversations/{conversation_id}/messages", response_model=Dict[str, Any])
async def send_message(
    conversation_id: str,
    payload: SendMessagePayload,
    current_user: dict = Depends(get_current_user),
    service: MessageService = Depends(get_service)
):
    try:
        # Check if conversation exists and user is part of it
        await service.get_conversation(conversation_id, current_user["id"])
        
        msg = await service.save_message(
            conversation_id=conversation_id,
            sender_id=current_user["id"],
            payload=payload
        )
        
        # In a real app we would use NotificationService to broadcast the event
        # to the websocket connections for the other participants
        
        return msg
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/conversations/{conversation_id}/messages/attachment", response_model=Dict[str, Any])
async def send_attachment(
    conversation_id: str,
    file: UploadFile = File(...),
    content: str = Form(""),
    reply_to_message_id: Optional[str] = Form(None),
    current_user: dict = Depends(get_current_user),
    service: MessageService = Depends(get_service)
):
    try:
        await service.get_conversation(conversation_id, current_user["id"])
        
        # Stub file handling, just pretend we uploaded it
        attachment_data = {
            "attachment_url": f"/files/attachments/{file.filename}",
            "attachment_name": file.filename,
            "attachment_type": file.content_type,
            "attachment_size": 1024
        }
        
        payload = SendMessagePayload(content=content, reply_to_message_id=reply_to_message_id)
        msg = await service.save_message(
            conversation_id=conversation_id,
            sender_id=current_user["id"],
            payload=payload,
            message_type="FILE",
            attachment_data=attachment_data
        )
        return msg
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/conversations/{conversation_id}/messages/read", response_model=List[Dict[str, Any]])
async def mark_as_read(
    conversation_id: str,
    current_user: dict = Depends(get_current_user),
    service: MessageService = Depends(get_service)
):
    try:
        await service.get_conversation(conversation_id, current_user["id"])
        read_messages = await service.mark_as_read(conversation_id, current_user["id"])
        return {"data": read_messages}
    except (PermissionError, ValueError):
        # Ignore errors for background tasks
        return {"data": []}

@router.patch("/messages/{message_id}", response_model=Dict[str, Any])
async def edit_message(
    message_id: str,
    payload: MessageUpdatePayload,
    current_user: dict = Depends(get_current_user),
    service: MessageService = Depends(get_service)
):
    try:
        edited_msg = await service.edit_message(message_id, current_user["id"], payload)
        return {"data": edited_msg}
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.delete("/messages/{message_id}", response_model=Dict[str, Any])
async def delete_message(
    message_id: str,
    current_user: dict = Depends(get_current_user),
    service: MessageService = Depends(get_service)
):
    try:
        deleted_msg = await service.delete_message(message_id, current_user["id"])
        return {"data": deleted_msg}
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/messages/{message_id}/reactions", response_model=Dict[str, Any])
async def add_reaction(
    message_id: str,
    payload: dict,
    current_user: dict = Depends(get_current_user),
    service: MessageService = Depends(get_service)
):
    emoji = payload.get("emoji")
    if not emoji:
        raise HTTPException(status_code=400, detail="Emoji required")
    try:
        reaction = await service.add_reaction(message_id, current_user["id"], emoji)
        return {"data": reaction}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.delete("/messages/{message_id}/reactions/{emoji}", response_model=Dict[str, Any])
async def remove_reaction(
    message_id: str,
    emoji: str,
    current_user: dict = Depends(get_current_user),
    service: MessageService = Depends(get_service)
):
    removed = await service.remove_reaction(message_id, current_user["id"], emoji)
    return {"data": removed}

@router.post("/conversations/{conversation_id}/typing", response_model=Dict[str, Any])
async def send_typing_status(
    conversation_id: str,
    payload: dict,
    current_user: dict = Depends(get_current_user)
):
    return {"data": True}

@router.get("/conversations/{conversation_id}/search")
async def search_messages(
    conversation_id: str,
    query: str,
    page: int = 1,
    limit: int = 20,
    current_user: dict = Depends(get_current_user)
):
    return {"data": {"total": 0, "page": page, "limit": limit, "messages": []}}

@router.post("/messages/{message_id}/pin", response_model=Dict[str, Any])
async def pin_message(message_id: str, current_user: dict = Depends(get_current_user)):
    return {"data": True}

@router.delete("/conversations/{conversation_id}/pin", response_model=Dict[str, Any])
async def unpin_message(conversation_id: str, current_user: dict = Depends(get_current_user)):
    return {"data": True}

@router.get("/users/{user_id}/presence")
async def get_user_presence(user_id: str, current_user: dict = Depends(get_current_user)):
    from src.database.mongo import utc_now
    return {"data": {
        "user_id": user_id,
        "is_online": True,
        "last_seen": utc_now().isoformat()
    }}
