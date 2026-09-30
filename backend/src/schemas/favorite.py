from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class FavoriteItemSchema(BaseModel):
    id: str
    user_id: str
    name: str
    type: str  # "artist" | "venue"
    category: str
    location: str
    rating: float
    reviewCount: int
    priceStartingAt: float
    image: str
    savedAt: str
    created_at: Optional[datetime] = None

class CreateFavoritePayload(BaseModel):
    id: str
    name: str
    type: str
    category: str
    location: str
    rating: float
    reviewCount: int
    priceStartingAt: float
    image: str
    savedAt: str
