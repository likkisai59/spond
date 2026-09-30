from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime

class UserBrief(BaseModel):
    id: str
    name: str
    email: Optional[str] = None

class ClientReviewer(BaseModel):
    id: str
    name: str

class ReviewSchema(BaseModel):
    id: Optional[str] = None
    booking_id: Optional[str] = None
    reviewer_id: Optional[str] = None
    reviewer_role: Optional[str] = None
    reviewee_id: Optional[str] = None
    reviewee_role: Optional[str] = None
    artist_profile_id: Optional[str] = None
    venue_id: Optional[str] = None
    client_id: Optional[str] = None
    rating: int
    review_title: Optional[str] = None
    review_text: Optional[str] = None
    comment: Optional[str] = None
    is_public: bool = True
    moderation_status: str = "approved"
    reply_comment: Optional[str] = None
    reply_at: Optional[str] = None
    images: List[str] = []
    videos: List[str] = []
    
    reviewer: Optional[UserBrief] = None
    reviewee: Optional[UserBrief] = None
    client: Optional[ClientReviewer] = None
    
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class CreateReviewPayload(BaseModel):
    booking_id: Optional[str] = None
    reviewee_id: Optional[str] = None
    reviewee_role: Optional[str] = None
    artist_profile_id: Optional[str] = None
    venue_id: Optional[str] = None
    rating: int = Field(..., ge=1, le=5)
    review_title: Optional[str] = None
    review_text: Optional[str] = None
    comment: Optional[str] = None
    is_public: bool = True
    images: List[str] = []
    videos: List[str] = []

class UpdateReviewPayload(BaseModel):
    rating: Optional[int] = Field(None, ge=1, le=5)
    review_title: Optional[str] = None
    review_text: Optional[str] = None
    comment: Optional[str] = None
    is_public: Optional[bool] = None
    images: Optional[List[str]] = None
    videos: Optional[List[str]] = None
