from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

class MessageReaction(BaseModel):
    id: str
    message_id: str
    user_id: str
    emoji: str
    created_at: str

class MessageSchema(BaseModel):
    id: str
    conversation_id: str
    sender_id: str
    sender_name: Optional[str] = None
    message_type: str = "TEXT"
    content: str
    reply_to_message_id: Optional[str] = None
    edited_at: Optional[str] = None
    read_at: Optional[str] = None
    is_deleted: bool = False
    attachment_url: Optional[str] = None
    attachment_name: Optional[str] = None
    attachment_size: Optional[int] = None
    attachment_type: Optional[str] = None
    thumbnail_url: Optional[str] = None
    reactions: List[MessageReaction] = []
    created_at: str
    updated_at: str

class ConversationResponse(BaseModel):
    id: str
    booking_id: Optional[str] = None
    client_id: Optional[str] = None
    band_id: Optional[str] = None
    venue_owner_id: Optional[str] = None
    pinned_message_id: Optional[str] = None
    status: str = "ACTIVE"
    type: Optional[str] = "DIRECT"
    group_id: Optional[str] = None
    participant_ids: Optional[List[str]] = []
    name: Optional[str] = None
    last_message: Optional[str] = None
    unread_count: Optional[int] = 0
    last_message_at: Optional[str] = None
    created_at: str
    updated_at: str
    event_name: Optional[str] = None
    pinned_message: Optional[MessageSchema] = None

class CreateConversationPayload(BaseModel):
    booking_id: Optional[str] = None
    target_user_id: Optional[str] = None
    group_id: Optional[str] = None
    group_name: Optional[str] = None
    type: Optional[str] = None

class CreateDirectConversationPayload(BaseModel):
    target_user_id: str

class CreateGroupConversationPayload(BaseModel):
    group_id: str
    group_name: str

class SendMessagePayload(BaseModel):
    content: str
    reply_to_message_id: Optional[str] = None

class MessageUpdatePayload(BaseModel):
    content: str

# Backward compatibility aliases
ChatMessageResponse = MessageSchema
MessageCreateRequest = SendMessagePayload

