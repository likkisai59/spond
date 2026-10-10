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

    async def get_reviews_for_user(self, user_id: str, reviewee_only: bool = False) -> List[Dict[str, Any]]:
        if reviewee_only:
            # Public profile: only show reviews received (where this user is the reviewee)
            query = {"reviewee_id": user_id}
        else:
            # My reviews page: show all reviews involving this user
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
                customer_id = booking.get("customer_id")
                provider_owner_id = booking.get("provider_owner_id")
                provider_id = booking.get("provider_id")

                # If provider_owner_id is missing, resolve it via the artist/venue record
                if not provider_owner_id and provider_id:
                    from src.database.base_repository import BaseRepository
                    class _ArtistRepo(BaseRepository):
                        collection_name = "band_artists"
                    class _VenueRepo(BaseRepository):
                        collection_name = "band_venues"
                    # Try artist first, then venue
                    prov_rec = await _ArtistRepo().find_by_id(provider_id)
                    if not prov_rec:
                        prov_rec = await _VenueRepo().find_by_id(provider_id)
                    if prov_rec:
                        provider_owner_id = prov_rec.get("created_by") or prov_rec.get("user_id")

                # Determine who the reviewee is based on the reviewer
                if customer_id == user_id:
                    # Customer is reviewing a provider → reviewee = provider
                    doc["reviewee_id"] = provider_owner_id or provider_id
                    doc["client_id"] = customer_id  # client_id = the actual client (reviewer)
                else:
                    # Provider is reviewing the customer → reviewee = customer
                    doc["reviewee_id"] = customer_id
                    doc["client_id"] = customer_id  # client_id = the actual client (reviewee)

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
