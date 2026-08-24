from pydantic import BaseModel, Field
from typing import Optional

class NotificationResponse(BaseModel):
    id: str
    user_id: str
    title: str
    message: str
    notification_type: str
    module: str
    is_read: bool
    created_at: str
