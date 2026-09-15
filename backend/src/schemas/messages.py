from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

class CamelModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )

class ChatMessageResponse(CamelModel):
    id: str
    sender_id: str
    sender_name: str
    content: str
    sent_at: datetime | str
    is_mine: bool = False

class ConversationResponse(CamelModel):
    id: str
    type: str  # "Group" or "Direct"
    name: str
    last_message: str | None = None
    last_message_at: datetime | str | None = None
    unread_count: int = 0
    messages: list[ChatMessageResponse] = []

class MessageCreateRequest(CamelModel):
    conversation_id: str
    content: str
