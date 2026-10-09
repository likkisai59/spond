from typing import List, Dict, Any, Optional
from bson import ObjectId
from src.database.mongo import utc_now
from src.repositories.reviews import ReviewRepository
from src.database.base_repository import BaseRepository
from src.schemas.review import CreateReviewPayload, UpdateReviewPayload

class BookingRepository(BaseRepository):
    collection_name = "band_bookings"

class VenueBookingRepository(BaseRepository):
    collection_name = "band_venue_bookings"

class ReviewService:
    def __init__(self):
        self.reviews = ReviewRepository()
        self.bookings = BookingRepository()
        self.venue_bookings = VenueBookingRepository()

    async def get_reviews_for_user(self, user_id: str) -> List[Dict[str, Any]]:
        # Fetch reviews where the user is either the reviewer or the reviewee
        query = {"$or": [{"reviewer_id": user_id}, {"client_id": user_id}, {"reviewee_id": user_id}]}
        return await self.reviews.find_many(query, sort=[("created_at", -1)])

    async def create_review(self, user_id: str, user_name: str, payload: CreateReviewPayload) -> Dict[str, Any]:
        now = utc_now()
        doc = payload.model_dump(exclude_unset=True)
        doc["reviewer_id"] = user_id
        doc["reviewer"] = {"id": user_id, "name": user_name}

        # Resolve the reviewee from the booking if possible
        if payload.booking_id:
            booking = await self.bookings.find_by_id(payload.booking_id)
            if not booking:
                booking = await self.venue_bookings.find_by_id(payload.booking_id)
                
            if booking:
                client_id = booking.get("client_id")
                artist_id = booking.get("artist_id")
                venue_id = booking.get("venue_id")
                
                # Determine who the reviewee is based on the reviewer
                if client_id == user_id:
                    # Client is reviewing a provider
                    provider_id = artist_id or venue_id
                    if provider_id:
                        doc["reviewee_id"] = provider_id
                        doc["client_id"] = provider_id # Backward compatibility
                else:
                    # Provider is reviewing the client or another provider
                    # For a simple 1-to-1 booking, the other party is the client
                    if client_id and client_id != user_id:
                        doc["reviewee_id"] = client_id
                        doc["client_id"] = client_id
                    else:
                        # Fallback if there's no client ID or it matches user_id (unlikely)
                        doc["reviewee_id"] = artist_id or venue_id
                        doc["client_id"] = doc["reviewee_id"]

        if "client_id" not in doc:
            doc["client_id"] = payload.reviewee_id or user_id
            doc["reviewee_id"] = payload.reviewee_id or user_id

        doc["moderation_status"] = "approved"
        doc["created_at"] = now
        doc["updated_at"] = now
        
        # Ensure backward compatibility for frontend
        if "review_text" in doc and "comment" not in doc:
            doc["comment"] = doc["review_text"]
        elif "comment" in doc and "review_text" not in doc:
            doc["review_text"] = doc["comment"]

        return await self.reviews.insert(doc)

    async def update_review(self, user_id: str, review_id: str, payload: UpdateReviewPayload) -> Optional[Dict[str, Any]]:
        review = await self.reviews.find_by_id(review_id)
        if not review:
            raise ValueError("Review not found")
            
        if review.get("reviewer_id") != user_id and review.get("client_id") != user_id:
            raise PermissionError("Not authorized to edit this review")
            
        updates = payload.model_dump(exclude_unset=True)
        if "review_text" in updates:
            updates["comment"] = updates["review_text"]
            
        return await self.reviews.update_by_id(review_id, updates)

    async def delete_review(self, user_id: str, review_id: str) -> bool:
        review = await self.reviews.find_by_id(review_id)
        if not review:
            raise ValueError("Review not found")
            
        if review.get("reviewer_id") != user_id and review.get("client_id") != user_id:
            raise PermissionError("Not authorized to delete this review")
            
        return await self.reviews.delete_by_id(review_id)
