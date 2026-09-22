from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any
from src.database.mongo import utc_now
from src.schemas.band import (
    BookingStatus, PaymentStatus,
    BandCreateRequest, ProviderOnboardingRequest,
    BookingUpdateRequest, CounterOfferRequest
)
from src.exceptions.handlers import AppException, NotFoundError
from src.database.base_repository import BaseRepository
from src.repositories import UserRepository
from src.services.notification_service import NotificationService

def _to_utc(dt: datetime | str | None) -> datetime | None:
    """Normalize any datetime or ISO string to a timezone-aware UTC datetime."""
    if not dt:
        return None
    if isinstance(dt, str):
        try:
            dt = datetime.fromisoformat(dt.replace("Z", "+00:00"))
        except Exception:
            return None
    if isinstance(dt, datetime):
        if dt.tzinfo is None:
            return dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc)
    return None

class ArtistRepository(BaseRepository):
    collection_name = "band_artists"

class BandRepository(BaseRepository):
    collection_name = "band_bands"

class VenueRepository(BaseRepository):
    collection_name = "band_venues"

class BookingRepository(BaseRepository):
    collection_name = "band_bookings"

class EventRepository(BaseRepository):
    collection_name = "eventhub_events"

class BandService:
    def __init__(self):
        self.artists = ArtistRepository()
        self.bands = BandRepository()
        self.venues = VenueRepository()
        self.bookings = BookingRepository()
        self.events = EventRepository()
        self.users = UserRepository()
        self.notifications = NotificationService()

    async def get_all_artists(self) -> List[Dict]:
        return await self.artists.find_many({"is_deleted": {"$ne": True}})

    async def get_all_bands(self) -> List[Dict]:
        return await self.bands.find_many({"is_deleted": {"$ne": True}})

    async def get_all_venues(self) -> List[Dict]:
        return await self.venues.find_many({"is_deleted": {"$ne": True}})

    async def get_artist_by_id(self, id: str) -> Optional[Dict]:
        return await self.artists.find_by_id(id)

    async def get_artist(self, artist_id: str) -> Dict:
        artist = await self.artists.find_by_id(artist_id)
        if not artist:
            raise NotFoundError("Artist not found")
        return artist

    async def delete_artist(self, artist_id: str) -> None:
        deleted = await self.artists.delete_by_id(artist_id)
        if not deleted:
            raise NotFoundError("Artist not found")

    async def get_band_by_id(self, id: str) -> Optional[Dict]:
        return await self.bands.find_by_id(id)

    async def get_venue_by_id(self, id: str) -> Optional[Dict]:
        venue = await self.venues.find_by_id(id)
        if venue:
            if not venue.get("name"):
                venue["name"] = venue.get("venue_name") or venue.get("display_name") or "Venue"
            if not venue.get("venue_name"):
                venue["venue_name"] = venue.get("name") or venue.get("display_name") or "Venue"
            if not venue.get("capacity"):
                venue["capacity"] = venue.get("max_capacity") or venue.get("min_capacity") or 0
            if not venue.get("city"):
                venue["city"] = venue.get("district") or venue.get("state") or venue.get("address") or ""
            
            # Attach user profile for public display
            if venue.get("created_by"):
                user = await self.users.find_by_id(venue["created_by"])
                user_name = user.get("full_name", "") if user else ""
                user_email = user.get("email", "") if user else ""
                venue["user"] = {"id": venue["created_by"], "name": user_name, "email": user_email, "role": "venue"}
                
        return venue

    async def get_venue(self, venue_id: str) -> Dict:
        venue = await self.get_venue_by_id(venue_id)
        if not venue:
            raise NotFoundError("Venue not found")
        return venue

    async def delete_venue(self, venue_id: str) -> None:
        deleted = await self.venues.delete_by_id(venue_id)
        if not deleted:
            raise NotFoundError("Venue not found")

    # ── Owner Profile Management ───────────────────────────────────────────────

    async def get_artist_by_owner(self, user_id: str) -> Dict:
        results = await self.artists.find_many({"created_by": user_id})
        user = await self.users.find_by_id(user_id)
        user_name = user.get("full_name", "") if user else ""
        user_email = user.get("email", "") if user else ""
        user_obj = {"id": user_id, "name": user_name, "email": user_email, "role": "artist"}

        if not results:
            return {
                "id": f"temp_{user_id}",
                "user_id": user_id,
                "created_by": user_id,
                "display_name": user_name,
                "name": user_name,
                "user": user_obj,
                "bio": "",
                "base_rate": 0,
                "rating": 5.0,
                "verification_status": "pending",
                "years_of_experience": 0,
                "band_type": "Solo",
                "total_members": 1,
                "currency": "INR",
                "travel_radius": 50,
                "travel_charges": 0,
                "min_booking_hours": 1,
                "max_booking_hours": 8,
                "equipment": {},
                "availability": {
                    "weekly_schedule": {},
                    "break_time": {"start": "13:00", "end": "14:00"},
                    "holidays": [],
                    "blocked_dates": []
                },
                "documents": [],
                "gallery": [],
                "videos": [],
                "youtube_links": [],
                "instagram_reels": [],
                "pricing_details": {},
                "genres": [],
                "languages": [],
                "social_links": {},
                "achievements": [],
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        
        artist = dict(results[0])
        artist["user"] = user_obj
        if "genres" not in artist or artist["genres"] is None:
            artist["genres"] = []
        if "languages" not in artist or artist["languages"] is None:
            artist["languages"] = []
        if "pricing_details" not in artist or artist["pricing_details"] is None:
            artist["pricing_details"] = {}
        if "gallery" not in artist or artist["gallery"] is None:
            artist["gallery"] = []
        if "videos" not in artist or artist["videos"] is None:
            artist["videos"] = []
        if "youtube_links" not in artist or artist["youtube_links"] is None:
            artist["youtube_links"] = []
        if "instagram_reels" not in artist or artist["instagram_reels"] is None:
            artist["instagram_reels"] = []
        return artist

    async def upsert_artist_profile(self, user_id: str, data: Dict) -> Dict:
        now = datetime.now(timezone.utc)
        results = await self.artists.find_many({"created_by": user_id})
        user = await self.users.find_by_id(user_id)
        user_name = user.get("full_name", "") if user else ""
        user_email = user.get("email", "") if user else ""
        user_obj = {"id": user_id, "name": user_name, "email": user_email, "role": "artist"}

        if results:
            existing = results[0]
            updated = await self.artists.update_by_id(existing["id"], data)
            if updated:
                updated["user"] = user_obj
                return updated
            return await self.get_artist_by_owner(user_id)
        else:
            doc = {**data, "created_by": user_id, "rating": 0.0, "reviews_count": 0,
                   "is_deleted": False, "created_at": now, "updated_at": now}
            created = await self.artists.insert(doc)
            if created:
                created["user"] = user_obj
                return created
            return await self.get_artist_by_owner(user_id)
    async def get_artist_dashboard(self, user_id: str) -> Dict:
        artist = await self.get_artist_by_owner(user_id)
        artist_id = artist.get("id")
        bookings = await self.bookings.find_many({"provider_id": artist_id}) if artist_id else []
        
        upcoming_events = []
        recent_requests = []
        total_earnings = 0
        monthly_revenue = 0
        
        now = datetime.now(timezone.utc)
        current_month = now.strftime("%Y-%m")
        
        monthly_data: dict[str, dict[str, Any]] = {}
        from calendar import month_abbr
        for i in range(12):
            y = now.year
            m = now.month - i
            while m < 1:
                m += 12
                y -= 1
            key = f"{y}-{m:02d}"
            monthly_data[key] = {"month": month_abbr[m], "revenue": 0, "bookings": 0}

        for b in bookings:
            status = b.get("status", "")
            amt = b.get("total_amount", 0) or 0
            
            event_date = b.get("event_date")
            b_month = event_date[:7] if event_date and len(event_date) >= 7 else None
            
            if status == BookingStatus.COMPLETED.value:
                total_earnings += amt
                if b_month == current_month:
                    monthly_revenue += amt
                
                if b_month in monthly_data:
                    monthly_data[b_month]["revenue"] += amt
                    monthly_data[b_month]["bookings"] += 1
            
            elif status in (BookingStatus.CONFIRMED.value, BookingStatus.ACCEPTED.value):
                upcoming_events.append({
                    "id": b.get("id", ""),
                    "client_name": "Client",
                    "event_name": b.get("event_name") or "Special Event",
                    "date": event_date,
                    "time": b.get("event_time", "19:00"),
                    "location": "Live Stage",
                    "status": status,
                    "amount": amt
                })
            elif status == BookingStatus.REQUESTED.value:
                recent_requests.append({
                    "id": b.get("id", ""),
                    "client_name": "Client",
                    "event_name": b.get("event_name") or "Performance Gig",
                    "date": event_date,
                    "amount": amt,
                    "status": status
                })

        revenue_chart = list(monthly_data.values())
        revenue_chart.reverse()
        
        return {
            "total_bookings": len(bookings),
            "upcoming_events_count": len(upcoming_events),
            "pending_requests_count": len(recent_requests),
            "monthly_revenue": monthly_revenue,
            "total_earnings": total_earnings,
            "average_rating": artist.get("rating", 0.0),
            "profile_completion": 90 if artist.get("bio") and artist.get("gallery") else 65,
            "profile_views": 0,
            "upcoming_events": upcoming_events,
            "recent_booking_requests": recent_requests,
            "recent_reviews": [],
            "notifications": [],
            "revenue_chart": revenue_chart
        }

    async def get_artist_media(self, user_id: str) -> Dict:
        artist = await self.get_artist_by_owner(user_id)
        return {
            "gallery": artist.get("gallery", []),
            "videos": artist.get("videos", []),
            "youtube_links": artist.get("youtube_links", []),
            "instagram_reels": artist.get("instagram_reels", [])
        }

    async def update_artist_media(self, user_id: str, data: Dict) -> Dict:
        await self.upsert_artist_profile(user_id, {
            "gallery": data.get("gallery", []),
            "videos": data.get("videos", []),
            "youtube_links": data.get("youtube_links", []),
            "instagram_reels": data.get("instagram_reels", [])
        })
        return await self.get_artist_media(user_id)

    async def get_artist_pricing(self, user_id: str) -> Dict:
        artist = await self.get_artist_by_owner(user_id)
        details = artist.get("pricing_details", {}) or {}
        return {
            "base_rate": float(artist.get("base_rate", 0)),
            "currency": artist.get("currency", "INR"),
            "travel_radius": float(artist.get("travel_radius", 50)),
            "travel_charges": float(artist.get("travel_charges", 0)),
            "min_booking_hours": float(artist.get("min_booking_hours", 1)),
            "max_booking_hours": float(artist.get("max_booking_hours", 8)),
            "weekend_surcharge": float(details.get("weekend_surcharge", 0)),
            "holiday_surcharge": float(details.get("holiday_surcharge", 0)),
            "packages": details.get("packages", []),
            "special_offers": details.get("special_offers", [])
        }

    async def update_artist_pricing(self, user_id: str, data: Dict) -> Dict:
        pricing_details = {
            "weekend_surcharge": data.get("weekend_surcharge", 0),
            "holiday_surcharge": data.get("holiday_surcharge", 0),
            "packages": data.get("packages", []),
            "special_offers": data.get("special_offers", [])
        }
        await self.upsert_artist_profile(user_id, {
            "base_rate": data.get("base_rate", 0),
            "currency": data.get("currency", "INR"),
            "travel_radius": data.get("travel_radius", 50),
            "travel_charges": data.get("travel_charges", 0),
            "min_booking_hours": data.get("min_booking_hours", 1),
            "max_booking_hours": data.get("max_booking_hours", 8),
            "pricing_details": pricing_details
        })
        return await self.get_artist_pricing(user_id)

    async def get_artist_availability(self, user_id: str) -> Dict:
        artist = await self.get_artist_by_owner(user_id)
        avail = artist.get("availability")
        if not avail or not avail.get("weekly_schedule"):
            return {
                "weekly_schedule": {
                    "Monday": {"available": True, "start": "09:00", "end": "22:00"},
                    "Tuesday": {"available": True, "start": "09:00", "end": "22:00"},
                    "Wednesday": {"available": True, "start": "09:00", "end": "22:00"},
                    "Thursday": {"available": True, "start": "09:00", "end": "22:00"},
                    "Friday": {"available": True, "start": "09:00", "end": "23:00"},
                    "Saturday": {"available": True, "start": "09:00", "end": "23:00"},
                    "Sunday": {"available": True, "start": "09:00", "end": "22:00"}
                },
                "break_time": {"start": "13:00", "end": "14:00"},
                "holidays": [],
                "blocked_dates": []
            }
        return avail

    async def update_artist_availability(self, user_id: str, data: Dict) -> Dict:
        await self.upsert_artist_profile(user_id, {"availability": data})
        return await self.get_artist_availability(user_id)

    async def get_artist_analytics(self, user_id: str) -> Dict:
        artist = await self.get_artist_by_owner(user_id)
        artist_id = artist.get("id")
        bookings = await self.bookings.find_many({"provider_id": artist_id}) if artist_id else []
        
        now = datetime.now(timezone.utc)
        
        current_m = now.month
        current_y = now.year
        prev_m = current_m - 1
        prev_y = current_y
        if prev_m < 1:
            prev_m += 12
            prev_y -= 1
        
        curr_key = f"{current_y}-{current_m:02d}"
        prev_key = f"{prev_y}-{prev_m:02d}"
        
        curr_revenue = 0
        curr_bookings = 0
        prev_revenue = 0
        prev_bookings = 0
        
        monthly_data: dict[str, dict[str, Any]] = {}
        from calendar import month_abbr
        for i in range(6):
            y = now.year
            m = now.month - i
            while m < 1:
                m += 12
                y -= 1
            key = f"{y}-{m:02d}"
            monthly_data[key] = {"month": month_abbr[m], "revenue": 0, "bookings": 0}
            
        event_types: dict[str, int] = {}
        
        for b in bookings:
            status = b.get("status", "")
            amt = b.get("total_amount", 0) or 0
            event_date = b.get("event_date")
            b_month = event_date[:7] if event_date and len(event_date) >= 7 else None
            
            if status == BookingStatus.COMPLETED.value:
                if b_month == curr_key:
                    curr_revenue += amt
                    curr_bookings += 1
                elif b_month == prev_key:
                    prev_revenue += amt
                    prev_bookings += 1
                    
                if b_month in monthly_data:
                    monthly_data[b_month]["revenue"] += amt
                    monthly_data[b_month]["bookings"] += 1
            
            if status in (BookingStatus.COMPLETED.value, BookingStatus.CONFIRMED.value):
                e_type = b.get("event_name") or "Special Event"
                event_types[e_type] = event_types.get(e_type, 0) + 1

        rev_growth: float = 0.0
        if prev_revenue > 0:
            rev_growth = ((curr_revenue - prev_revenue) / prev_revenue) * 100
        elif curr_revenue > 0:
            rev_growth = 100.0
            
        bk_growth: float = 0.0
        if prev_bookings > 0:
            bk_growth = ((curr_bookings - prev_bookings) / prev_bookings) * 100
        elif curr_bookings > 0:
            bk_growth = 100.0
            
        monthly_perf = list(monthly_data.values())
        monthly_perf.reverse()
        
        popular_events = [{"name": k, "value": v} for k, v in sorted(event_types.items(), key=lambda x: x[1], reverse=True)[:5]]
        
        return {
            "booking_growth": round(bk_growth, 1),
            "revenue_growth": round(rev_growth, 1),
            "profile_views": 0,
            "booking_conversion": 0,
            "popular_event_types": popular_events,
            "top_cities": [{"name": artist.get("city", "Local"), "value": len(bookings)}],
            "monthly_performance": monthly_perf,
            "peak_booking_times": [],
            "rating_trends": []
        }


    async def get_venue_by_owner(self, user_id: str) -> Dict:
        results = await self.venues.find_many({"created_by": user_id})
        user = await self.users.find_by_id(user_id)
        user_name = user.get("full_name", "") if user else ""
        user_email = user.get("email", "") if user else ""
        user_obj = {"id": user_id, "name": user_name, "email": user_email, "role": "venue"}

        if not results:
            return {
                "id": f"temp_{user_id}",
                "user_id": user_id,
                "created_by": user_id,
                "display_name": user_name,
                "name": user_name,
                "venue_name": f"{user_name}'s Venue",
                "user": user_obj,
                "bio": "",
                "description": "",
                "base_price": 0,
                "rating": 5.0,
                "verification_status": "pending",
                "capacity": 100,
                "currency": "INR",
                "address": "",
                "location": {"lat": 0, "lng": 0},
                "availability": {
                    "weekly_schedule": {},
                    "break_time": {"start": "13:00", "end": "14:00"},
                    "holidays": [],
                    "blocked_dates": []
                },
                "documents": [],
                "gallery": [],
                "videos": [],
                "facilities": [],
                "pricing_details": {},
                "metadata_fields": {
                    "cover_image": None,
                    "youtube_links": [],
                    "virtual_tour": None,
                    "facility_details": {}
                },
                "social_links": {},
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        
        venue = dict(results[0])
        venue["user"] = user_obj
        if "pricing_details" not in venue or venue["pricing_details"] is None:
            venue["pricing_details"] = {}
        if "gallery" not in venue or venue["gallery"] is None:
            venue["gallery"] = []
        if "videos" not in venue or venue["videos"] is None:
            venue["videos"] = []
        if "facilities" not in venue or venue["facilities"] is None:
            venue["facilities"] = []
        if "metadata_fields" not in venue or venue["metadata_fields"] is None:
            venue["metadata_fields"] = {
                "cover_image": None,
                "youtube_links": [],
                "virtual_tour": None,
                "facility_details": {}
            }
        return venue

    async def upsert_venue_profile(self, user_id: str, data: Dict) -> Dict:
        now = datetime.now(timezone.utc)
        results = await self.venues.find_many({"created_by": user_id})
        user = await self.users.find_by_id(user_id)
        user_name = user.get("full_name", "") if user else ""
        user_email = user.get("email", "") if user else ""
        user_obj = {"id": user_id, "name": user_name, "email": user_email, "role": "venue"}

        if results:
            existing = results[0]
            updated = await self.venues.update_by_id(existing["id"], data)
            if updated:
                updated["user"] = user_obj
                return updated
            return await self.get_venue_by_owner(user_id)
        else:
            doc = {**data, "created_by": user_id, "rating": 0.0, "reviews_count": 0,
                   "is_deleted": False, "created_at": now, "updated_at": now}
            created = await self.venues.insert(doc)
            if created:
                created["user"] = user_obj
                return created
            return await self.get_venue_by_owner(user_id)

    async def get_venue_dashboard(self, user_id: str) -> Dict:
        venue = await self.get_venue_by_owner(user_id)
        venue_id = venue.get("id")
        bookings = await self.bookings.find_many({"provider_id": venue_id}) if venue_id else []
        
        upcoming_events = []
        recent_requests = []
        total_earnings = 0
        monthly_revenue = 0
        
        now = datetime.now(timezone.utc)
        current_month = now.strftime("%Y-%m")
        
        monthly_data: dict[str, dict[str, Any]] = {}
        from calendar import month_abbr
        for i in range(12):
            y = now.year
            m = now.month - i
            while m < 1:
                m += 12
                y -= 1
            key = f"{y}-{m:02d}"
            monthly_data[key] = {"month": month_abbr[m], "revenue": 0, "bookings": 0}

        for b in bookings:
            status = b.get("status", "")
            amt = b.get("total_amount", 0) or 0
            
            event_date = b.get("event_date")
            b_month = event_date[:7] if event_date and len(event_date) >= 7 else None
            
            if status == BookingStatus.COMPLETED.value:
                total_earnings += amt
                if b_month == current_month:
                    monthly_revenue += amt
                
                if b_month in monthly_data:
                    monthly_data[b_month]["revenue"] += amt
                    monthly_data[b_month]["bookings"] += 1
            
            elif status in (BookingStatus.CONFIRMED.value, BookingStatus.ACCEPTED.value):
                upcoming_events.append({
                    "id": b.get("id", ""),
                    "client_name": "Client",
                    "event_name": b.get("event_name") or "Special Event",
                    "date": event_date,
                    "time": b.get("event_time", "19:00"),
                    "location": venue.get("venue_name") or "Venue",
                    "status": status,
                    "amount": amt
                })
            elif status == BookingStatus.REQUESTED.value:
                recent_requests.append({
                    "id": b.get("id", ""),
                    "client_name": "Client",
                    "event_name": b.get("event_name") or "Performance Gig",
                    "date": event_date,
                    "amount": amt,
                    "status": status
                })

        revenue_chart = list(monthly_data.values())
        revenue_chart.reverse()
        
        return {
            "total_bookings": len(bookings),
            "upcoming_events_count": len(upcoming_events),
            "pending_requests_count": len(recent_requests),
            "monthly_revenue": monthly_revenue,
            "total_earnings": total_earnings,
            "average_rating": venue.get("rating", 0.0),
            "profile_completion": 90 if venue.get("description") and venue.get("gallery") else 65,
            "profile_views": 0,
            "upcoming_events": upcoming_events,
            "recent_booking_requests": recent_requests,
            "recent_reviews": [],
            "notifications": [],
            "revenue_chart": revenue_chart
        }

    async def get_venue_media(self, user_id: str) -> Dict:
        venue = await self.get_venue_by_owner(user_id)
        return {
            "cover_image": venue.get("metadata_fields", {}).get("cover_image", None),
            "gallery": venue.get("gallery", []),
            "videos": venue.get("videos", []),
            "youtube_links": venue.get("metadata_fields", {}).get("youtube_links", []),
            "virtual_tour": venue.get("metadata_fields", {}).get("virtual_tour", None)
        }

    async def update_venue_media(self, user_id: str, data: Dict) -> Dict:
        venue = await self.get_venue_by_owner(user_id)
        metadata_fields = venue.get("metadata_fields", {})
        metadata_fields["cover_image"] = data.get("cover_image", metadata_fields.get("cover_image"))
        metadata_fields["youtube_links"] = data.get("youtube_links", metadata_fields.get("youtube_links"))
        metadata_fields["virtual_tour"] = data.get("virtual_tour", metadata_fields.get("virtual_tour"))
        
        await self.upsert_venue_profile(user_id, {
            "gallery": data.get("gallery", []),
            "videos": data.get("videos", []),
            "metadata_fields": metadata_fields
        })
        return await self.get_venue_media(user_id)

    async def get_venue_pricing(self, user_id: str) -> Dict:
        venue = await self.get_venue_by_owner(user_id)
        details = venue.get("pricing_details", {}) or {}
        return {
            "base_price": float(venue.get("base_price", 0)),
            "currency": details.get("currency", "INR"),
            "hourly_price": float(details.get("hourly_price", 0)),
            "half_day_price": float(details.get("half_day_price", 0)),
            "full_day_price": float(details.get("full_day_price", 0)),
            "weekend_price": float(details.get("weekend_price", 0)),
            "holiday_price": float(details.get("holiday_price", 0)),
            "security_deposit": float(details.get("security_deposit", 0)),
            "cleaning_charges": float(details.get("cleaning_charges", 0)),
            "cancellation_charges": float(details.get("cancellation_charges", 0)),
            "tax_percentage": float(details.get("tax_percentage", 0)),
            "discounts": details.get("discounts", [])
        }

    async def update_venue_pricing(self, user_id: str, data: Dict) -> Dict:
        pricing_details = {
            "hourly_price": data.get("hourly_price", 0),
            "half_day_price": data.get("half_day_price", 0),
            "full_day_price": data.get("full_day_price", 0),
            "weekend_price": data.get("weekend_price", 0),
            "holiday_price": data.get("holiday_price", 0),
            "security_deposit": data.get("security_deposit", 0),
            "cleaning_charges": data.get("cleaning_charges", 0),
            "cancellation_charges": data.get("cancellation_charges", 0),
            "tax_percentage": data.get("tax_percentage", 0),
            "currency": data.get("currency", "INR"),
            "discounts": data.get("discounts", [])
        }
        await self.upsert_venue_profile(user_id, {
            "base_price": data.get("base_price", 0),
            "pricing_details": pricing_details
        })
        return await self.get_venue_pricing(user_id) 

    async def get_venue_availability(self, user_id: str) -> Dict:
        venue = await self.get_venue_by_owner(user_id)
        avail = venue.get("availability")
        if not avail or not avail.get("weekly_schedule"):
            return {
                "weekly_schedule": {
                    "Monday": {"available": True, "start": "09:00", "end": "22:00"},
                    "Tuesday": {"available": True, "start": "09:00", "end": "22:00"},
                    "Wednesday": {"available": True, "start": "09:00", "end": "22:00"},
                    "Thursday": {"available": True, "start": "09:00", "end": "22:00"},
                    "Friday": {"available": True, "start": "09:00", "end": "23:00"},
                    "Saturday": {"available": True, "start": "09:00", "end": "23:00"},
                    "Sunday": {"available": True, "start": "09:00", "end": "22:00"}
                },
                "break_time": {"start": "13:00", "end": "14:00"},
                "holidays": [],
                "blocked_dates": []
            }
        return avail

    async def update_venue_availability(self, user_id: str, data: Dict) -> Dict:
        await self.upsert_venue_profile(user_id, {"availability": data})
        return await self.get_venue_availability(user_id)

    async def get_venue_analytics(self, user_id: str) -> Dict:
        venue = await self.get_venue_by_owner(user_id)
        venue_id = venue.get("id")
        bookings = await self.bookings.find_many({"provider_id": venue_id}) if venue_id else []
        
        now = datetime.now(timezone.utc)
        
        current_m = now.month
        current_y = now.year
        prev_m = current_m - 1
        prev_y = current_y
        if prev_m < 1:
            prev_m += 12
            prev_y -= 1
        
        curr_key = f"{current_y}-{current_m:02d}"
        prev_key = f"{prev_y}-{prev_m:02d}"
        
        curr_revenue = 0
        curr_bookings = 0
        prev_revenue = 0
        prev_bookings = 0
        
        monthly_data: dict[str, dict[str, Any]] = {}
        from calendar import month_abbr
        for i in range(6):
            y = now.year
            m = now.month - i
            while m < 1:
                m += 12
                y -= 1
            key = f"{y}-{m:02d}"
            monthly_data[key] = {"month": month_abbr[m], "revenue": 0, "bookings": 0}
            
        event_types: dict[str, int] = {}
        
        for b in bookings:
            status = b.get("status", "")
            amt = b.get("total_amount", 0) or 0
            event_date = b.get("event_date")
            b_month = event_date[:7] if event_date and len(event_date) >= 7 else None
            
            if status == BookingStatus.COMPLETED.value:
                if b_month == curr_key:
                    curr_revenue += amt
                    curr_bookings += 1
                elif b_month == prev_key:
                    prev_revenue += amt
                    prev_bookings += 1
                    
                if b_month in monthly_data:
                    monthly_data[b_month]["revenue"] += amt
                    monthly_data[b_month]["bookings"] += 1
            
            if status in (BookingStatus.COMPLETED.value, BookingStatus.CONFIRMED.value):
                e_type = b.get("event_name") or "Special Event"
                event_types[e_type] = event_types.get(e_type, 0) + 1

        rev_growth: float = 0.0
        if prev_revenue > 0:
            rev_growth = ((curr_revenue - prev_revenue) / prev_revenue) * 100
        elif curr_revenue > 0:
            rev_growth = 100.0
            
        bk_growth: float = 0.0
        if prev_bookings > 0:
            bk_growth = ((curr_bookings - prev_bookings) / prev_bookings) * 100
        elif curr_bookings > 0:
            bk_growth = 100.0
            
        monthly_perf = list(monthly_data.values())
        monthly_perf.reverse()
        
        popular_events = [{"name": k, "value": v} for k, v in sorted(event_types.items(), key=lambda x: x[1], reverse=True)[:5]]
        
        return {
            "booking_growth": round(bk_growth, 1),
            "revenue_growth": round(rev_growth, 1),
            "profile_views": 0,
            "booking_conversion": 0,
            "popular_event_types": popular_events,
            "top_cities": [{"name": venue.get("city", "Local"), "value": len(bookings)}],
            "monthly_performance": monthly_perf,
            "peak_booking_times": [],
            "rating_trends": []
        }

    async def get_venue_facilities(self, user_id: str) -> Dict:
        venue = await self.get_venue_by_owner(user_id)
        return {
            "facilities": venue.get("facilities", []),
            "details": venue.get("metadata_fields", {}).get("facility_details", {})
        }

    async def update_venue_facilities(self, user_id: str, data: Dict) -> Dict:
        venue = await self.get_venue_by_owner(user_id)
        metadata_fields = venue.get("metadata_fields", {})
        metadata_fields["facility_details"] = data.get("details", {})
        
        await self.upsert_venue_profile(user_id, {
            "facilities": data.get("facilities", []),
            "metadata_fields": metadata_fields
        })
        return await self.get_venue_facilities(user_id)

    async def get_band_by_owner(self, user_id: str) -> Optional[Dict]:
        results = await self.bands.find_many({"created_by": user_id})
        return results[0] if results else None

    async def upsert_band_profile(self, user_id: str, data: Dict) -> Dict:
        now = datetime.now(timezone.utc)
        results = await self.bands.find_many({"created_by": user_id})
        if results:
            existing = results[0]
            return (await self.bands.update_by_id(existing["id"], data)) or {}
        else:
            doc = {**data, "created_by": user_id, "rating": 0.0, "reviews_count": 0,
                   "is_deleted": False, "created_at": now, "updated_at": now}
            return (await self.bands.insert(doc)) or {}

    async def check_provider_availability(
        self,
        provider_id: str,
        event_date: str,
        start_time: str | None = None,
        end_time: str | None = None,
        exclude_booking_id: str | None = None
    ) -> bool:
        """
        Slot-aware double booking check:
        - HARD LOCK: CONFIRMED, EVENT_COMPLETED, COMPLETED (always blocks overlapping slots).
        - SOFT LOCK: ACCEPTED blocks the slot ONLY when elapsed time < 15 minutes.
          If elapsed time >= 15 minutes, the soft lock is expired and does NOT block the slot.
        - NON-BLOCKING: REQUESTED, REJECTED, CANCELLED.
        - Overlap formula: existing.start_time < requested.end_time AND existing.end_time > requested.start_time
        """
        if not provider_id or not event_date:
            return True

        # Check provider blackout dates
        provider_doc = await self.bands.find_by_id(provider_id)
        if not provider_doc:
            provider_doc = await self.artists.find_by_id(provider_id)
        if not provider_doc:
            provider_doc = await self.venues.find_by_id(provider_id)

        if provider_doc:
            blackouts = provider_doc.get("blackout_dates") or []
            if event_date in [str(d) for d in blackouts]:
                return False

        query: dict[str, Any] = {
            "$or": [
                {"provider_id": provider_id},
                {"band_id": provider_id},
                {"venue_id": provider_id}
            ],
            "event_date": event_date,
            "booking_status": {"$in": ["ACCEPTED", "CONFIRMED", "EVENT_COMPLETED", "COMPLETED", "Confirmed", "Accepted", "Completed"]}
        }
        if exclude_booking_id:
            from src.database.base_repository import to_object_id
            try:
                oid = to_object_id(exclude_booking_id)
                query["_id"] = {"$nin": [oid, exclude_booking_id]}
            except Exception:
                query["_id"] = {"$ne": exclude_booking_id}

        existing_bookings = await self.bookings.find_many(query)
        if not existing_bookings:
            return True

        now_utc = utc_now()
        fifteen_mins_ago = now_utc - timedelta(minutes=15)

        # Filter out expired ACCEPTED bookings (elapsed >= 15 minutes)
        active_blocking_bookings = []
        for b in existing_bookings:
            status = b.get("booking_status")
            if status in ["ACCEPTED", "Accepted"]:
                acc_time = _to_utc(b.get("accepted_at") or b.get("updated_at") or b.get("created_at"))
                if acc_time and acc_time > fifteen_mins_ago:
                    active_blocking_bookings.append(b)
            else:
                active_blocking_bookings.append(b)

        if not active_blocking_bookings:
            return True

        if not start_time or not end_time:
            return False

        req_start = start_time.strip()
        req_end = end_time.strip()

        for b in active_blocking_bookings:
            ex_start = str(b.get("start_time") or "").strip()
            ex_end = str(b.get("end_time") or "").strip()

            if not ex_start or not ex_end:
                return False

            if ex_start < req_end and ex_end > req_start:
                return False

        return True

    async def create_booking(self, customer_id: str, request: Any) -> Dict:
        if hasattr(request, "model_dump"):
            doc = request.model_dump(exclude_unset=True)
        elif isinstance(request, dict):
            doc = dict(request)
        else:
            doc = getattr(request, "__dict__", {})

        provider_id = doc.get("provider_id") or doc.get("band_id") or doc.get("venue_id")
        provider_type = doc.get("provider_type") or ("Band" if doc.get("band_id") else "Venue" if doc.get("venue_id") else "Artist")
        ptype_lower = str(provider_type).lower()

        # Slot availability check
        event_date = doc.get("event_date") or doc.get("booking_date")
        start_time = doc.get("start_time")
        end_time = doc.get("end_time")
        if provider_id and event_date:
            is_avail = await self.check_provider_availability(
                provider_id=str(provider_id),
                event_date=str(event_date),
                start_time=str(start_time) if start_time else None,
                end_time=str(end_time) if end_time else None
            )
            if not is_avail:
                raise AppException(400, "The requested provider already has a confirmed booking during this time slot.")

        provider = None
        if provider_id:
            pid_str = str(provider_id)
            if ptype_lower in ("artist", "solo"):
                provider = await self.artists.find_by_id(pid_str)
            elif ptype_lower == "band":
                provider = await self.bands.find_by_id(pid_str)
            elif ptype_lower == "venue":
                provider = await self.venues.find_by_id(pid_str)

        package_id = doc.get("package_id")
        if package_id and package_id != "pkg-custom" and provider:
            package = next((p for p in provider.get("packages", []) if p.get("id") == package_id), None)
            total_amount = float(package["price"]) if package else float(doc.get("amount") or doc.get("proposed_price") or 0.0)
        else:
            total_amount = float(doc.get("amount") or doc.get("proposed_price") or 0.0)

        advance_amount = round(total_amount * 0.25)
        final_amount = total_amount - advance_amount
        now = datetime.now(timezone.utc)

        provider_owner_id = None
        if provider:
            provider_owner_id = provider.get("created_by") or provider.get("user_id") or provider.get("owner_id")

        booking_data = {
            **doc,
            "customer_id": customer_id,
            "provider_id": provider_id,
            "provider_type": provider_type,
            "venue_id": provider_id if ptype_lower == "venue" else doc.get("venue_id"),
            "artist_id": provider_id if ptype_lower in ("artist", "solo") else doc.get("artist_id"),
            "provider_owner_id": str(provider_owner_id) if provider_owner_id else None,
            "status": BookingStatus.REQUESTED.value,
            "booking_status": BookingStatus.REQUESTED.value,
            "payment_status": PaymentStatus.UNPAID.value,
            "total_amount": total_amount,
            "amount": total_amount,
            "advance_amount": advance_amount,
            "final_amount": final_amount,
            "created_at": now,
            "updated_at": now,
            "timeline": [{
                "status": "REQUESTED",
                "timestamp": now,
                "note": "Booking requested by customer"
            }]
        }

        created = await self.bookings.insert(booking_data)
        if not created or "id" not in created:
            raise ValueError("Failed to insert booking")

        # Fetch Customer details for notification
        if provider:
            customer = None
            try:
                customer = await self.users.find_by_id(customer_id)
            except Exception:
                pass
            customer_name = customer.get("full_name", "A customer") if customer else "A customer"
            provider_name = provider.get("band_name") or provider.get("artist_name") or provider.get("venue_name") or "you"

            owner_id = provider.get("created_by")
            if owner_id:
                event_date = doc.get("event_date") or doc.get("booking_date") or ""
                msg = f"New Booking Request: {customer_name} requested to book {provider_name} for {event_date}."
                await self.notifications.create_notification(
                    user_id=owner_id,
                    title="New Booking Request",
                    message=msg,
                    notification_type="BOOKING_REQUEST",
                    module="band"
                )

        return (await self.bookings.find_by_id(created["id"])) or {}
    
    async def get_bookings_for_customer(self, customer_id: str) -> List[Dict]:
        bookings = await self.bookings.find_many({
            "customer_id": customer_id,
            "is_deleted": {"$ne": True}
        })
        for booking in bookings:
            provider_id = booking.get("provider_id") or booking.get("band_id") or booking.get("venue_id")
            provider_type = (booking.get("provider_type") or "").lower()
            provider = None
            if provider_id:
                pid_str = str(provider_id)
                if provider_type == "artist":
                    provider = await self.artists.find_by_id(pid_str)
                elif provider_type == "venue":
                    provider = await self.venues.find_by_id(pid_str)
                elif provider_type == "band":
                    provider = await self.bands.find_by_id(pid_str)
                else:
                    provider = await self.artists.find_by_id(pid_str)
                    if not provider:
                        provider = await self.bands.find_by_id(pid_str)
                    if not provider:
                        provider = await self.venues.find_by_id(pid_str)

            if provider:
                p_name = (
                    provider.get("display_name")
                    or provider.get("name")
                    or provider.get("artist_name")
                    or provider.get("venue_name")
                    or provider.get("band_name")
                    or "Performer"
                )
                booking["provider_name"] = p_name
                booking["artist_name"] = p_name
                booking["venue_name"] = p_name
                booking["provider_image"] = provider.get("profile_image") or provider.get("cover_image") or ""
            else:
                booking["provider_name"] = "Performer"
                booking["artist_name"] = "Performer"

        return bookings

    async def get_all_profile_ids_for_user(self, user_id: str) -> List[str]:
        owned_artists = await self.artists.find_many({
            "$or": [{"created_by": user_id}, {"user_id": user_id}, {"owner_id": user_id}]
        })
        owned_bands = await self.bands.find_many({
            "$or": [{"created_by": user_id}, {"user_id": user_id}, {"owner_id": user_id}]
        })
        owned_venues = await self.venues.find_many({
            "$or": [{"created_by": user_id}, {"user_id": user_id}, {"owner_id": user_id}]
        })
        
        profile_ids = [p["id"] for p in owned_artists + owned_bands + owned_venues if "id" in p]
        profile_ids.append(user_id)
        return list(set(profile_ids))

    async def get_bookings_for_provider(self, user_id: str) -> List[Dict]:
        profile_ids = await self.get_all_profile_ids_for_user(user_id)
        from src.database.base_repository import to_object_id
        search_ids: list[Any] = list(profile_ids)
        for pid in profile_ids:
            try:
                search_ids.append(to_object_id(pid))
            except Exception:
                pass
        
        bookings = await self.bookings.find_many({
            "$or": [
                {"provider_id": {"$in": search_ids}},
                {"provider_owner_id": user_id},
                {"band_id": {"$in": search_ids}},
                {"venue_id": {"$in": search_ids}}
            ],
            "is_deleted": {"$ne": True}
        })
        # Inject customer details for each booking
        for booking in bookings:
            customer = await self.users.find_by_id(booking.get("customer_id") or "")
            if customer:
                booking["customer_name"] = customer.get("full_name", "Unknown Client")
                booking["customer_email"] = customer.get("email", "")
            else:
                booking["customer_name"] = "Unknown Client"
                booking["customer_email"] = ""
                
        return bookings

    async def get_booking_by_id(self, booking_id: str) -> Optional[Dict]:
        return await self.bookings.find_by_id(booking_id)

    async def update_booking_status(self, booking_id: str, status: BookingStatus) -> Optional[Dict]:
        now = datetime.now(timezone.utc)
        booking = await self.bookings.find_by_id(booking_id or "")
        if not booking:
            return None

        success = await self.bookings.update_by_id(booking_id or "", {"status": status.value, "updated_at": now})
        if success:
            customer_id = booking.get("customer_id")
            if customer_id:
                provider_type = booking.get("provider_type")
                provider_id = booking.get("provider_id")
                
                # Fetch provider name
                provider = None
                if provider_type == "artist":
                    provider = await self.artists.find_by_id(provider_id or "")
                elif provider_type == "band":
                    provider = await self.bands.find_by_id(provider_id or "")
                elif provider_type == "venue":
                    provider = await self.venues.find_by_id(provider_id or "")
                
                provider_name = "The provider"
                if provider:
                    provider_name = provider.get("band_name") or provider.get("artist_name") or provider.get("venue_name") or "The provider"
                
                msg = f"Booking Update: Your booking request for {provider_name} has been {status.value.upper()}."
                
                await self.notifications.create_notification(
                    user_id=customer_id,
                    title="Booking Update",
                    message=msg,
                    notification_type="BOOKING_STATUS_UPDATE",
                    module="band"
                )
                
                # Auto-Chat Creation Mock
                # In a fully implemented chat system, this is where we would call:
                # await self.chat_service.create_conversation(customer_id, provider.get("created_by"), booking_id)
                if status.value.upper() == "ACCEPTED":
                    chat_msg = f"A direct chat thread has been opened with {provider_name} to discuss your event details."
                    await self.notifications.create_notification(
                        user_id=customer_id,
                        title="Chat Thread Created",
                        message=chat_msg,
                        notification_type="CHAT_CREATED",
                        module="band"
                    )

            return await self.bookings.find_by_id(booking_id)
        return None

    async def update_payment_status(self, booking_id: str, payment_status: PaymentStatus) -> Optional[Dict]:
        now = datetime.now(timezone.utc)
        updates = {"payment_status": payment_status.value, "updated_at": now}
        
        # Advance payment completes -> CONFIRMED
        if payment_status == PaymentStatus.ADVANCE_PAID:
            updates["status"] = BookingStatus.CONFIRMED.value
        # Final payment completes -> COMPLETED
        elif payment_status == PaymentStatus.FULLY_PAID:
            updates["status"] = BookingStatus.COMPLETED.value
            
        success = await self.bookings.update_by_id(booking_id, updates)
        if success:
            return await self.bookings.find_by_id(booking_id)
        return None

    async def get_booking(self, booking_id: str) -> dict:
        booking = await self.bookings.find_by_id(booking_id)
        if not booking:
            raise NotFoundError("Booking not found")
        return booking

    async def list_bookings(
        self,
        event_id: str | None = None,
        customer_id: str | None = None,
        provider_id: str | None = None,
        booking_status: str | None = None
    ) -> list[dict]:
        query: dict[str, Any] = {}
        if event_id:
            query["event_id"] = event_id
        if customer_id:
            query["customer_id"] = customer_id
        if provider_id:
            query["$or"] = [
                {"provider_id": provider_id},
                {"band_id": provider_id},
                {"venue_id": provider_id}
            ]
        if booking_status:
            query["booking_status"] = booking_status
        return await self.bookings.find_many(query)

    async def update_booking(self, booking_id: str, data: BookingUpdateRequest) -> dict:
        update_data = data.model_dump(exclude_unset=True)
        if not update_data:
            return await self.get_booking(booking_id)
            
        now = utc_now()
        update_data["updated_at"] = now
        
        # If status is updated, push to timeline
        if data.booking_status:
            update_data["status"] = data.booking_status  # keep legacy in sync
            try:
                from src.database.base_repository import to_object_id
                await self.bookings.collection.update_one(
                    {"_id": to_object_id(booking_id)},
                    {"$push": {"timeline": {
                        "status": data.booking_status,
                        "timestamp": now,
                        "note": data.note or f"Status updated to {data.booking_status}"
                    }}}
                )
            except Exception:
                pass
            update_data.pop("note", None)
            
        updated = await self.bookings.update_by_id(booking_id, update_data)
        if not updated:
            raise NotFoundError("Booking not found")
        return await self.get_booking(booking_id)

    async def accept_booking(self, booking_id: str, user_id: str) -> dict:
        booking = await self.get_booking(booking_id)
        
        # Verify slot is still free before accepting
        provider_id = booking.get("provider_id") or booking.get("band_id") or booking.get("venue_id")
        event_date = booking.get("event_date")
        start_time = booking.get("start_time")
        end_time = booking.get("end_time")

        if provider_id and event_date:
            is_avail = await self.check_provider_availability(
                provider_id=str(provider_id),
                event_date=str(event_date),
                start_time=str(start_time) if start_time else None,
                end_time=str(end_time) if end_time else None,
                exclude_booking_id=booking_id
            )
            if not is_avail:
                raise AppException(400, "Cannot accept booking: another booking already occupies this time slot.")

        now = utc_now()
        update_payload = BookingUpdateRequest(
            booking_status="ACCEPTED",
            payment_status="ADVANCE_PAYMENT_PENDING",
            accepted_at=now,
            note="Booking accepted by provider. 25% Advance payment is required within 15 minutes to confirm."
        )
        return await self.update_booking(booking_id, update_payload)

    async def reject_booking(self, booking_id: str, user_id: str, reason: str | None = None) -> dict:
        update_payload = BookingUpdateRequest(
            booking_status="REJECTED",
            payment_status="UNPAID",
            note=reason or "Booking declined by provider"
        )
        return await self.update_booking(booking_id, update_payload)

    async def complete_event(self, booking_id: str, user_id: str) -> dict:
        booking = await self.get_booking(booking_id)
        if booking.get("booking_status") not in ["CONFIRMED", "Confirmed", "ACCEPTED", "Accepted"]:
            raise AppException(400, f"Cannot complete event from status {booking.get('booking_status')}")

        update_payload = BookingUpdateRequest(
            booking_status="EVENT_COMPLETED",
            payment_status="FINAL_PAYMENT_PENDING",
            note="Performance completed by provider. 75% Final payment is available for customer."
        )
        return await self.update_booking(booking_id, update_payload)

    async def counter_offer_booking(self, booking_id: str, user_id: str, data: CounterOfferRequest) -> dict:
        booking = await self.get_booking(booking_id)
        if not booking:
            raise NotFoundError("Booking not found")

        current_status = str(booking.get("booking_status", "")).upper()
        if current_status in ["CONFIRMED", "EVENT_COMPLETED", "COMPLETED", "REJECTED", "CANCELLED"]:
            raise AppException(400, f"Cannot propose counter offer on booking with status '{current_status}'")

        if data.amount <= 0:
            raise AppException(400, "Proposed counter offer amount must be greater than 0")

        advance_amount = int(data.amount * 0.25)
        final_amount = int(data.amount * 0.75)

        counter_doc = {
            "proposed_amount": data.amount,
            "proposed_advance": advance_amount,
            "proposed_final": final_amount,
            "note": data.note,
            "proposed_by": user_id,
            "proposed_at": utc_now().isoformat()
        }

        from src.database.base_repository import to_object_id
        await self.bookings.collection.update_one(
            {"_id": to_object_id(booking_id)},
            {
                "$set": {
                    "amount": data.amount,
                    "advance_amount": advance_amount,
                    "final_amount": final_amount,
                    "counter_offer": counter_doc,
                    "updated_at": utc_now()
                },
                "$push": {
                    "timeline": {
                        "status": "COUNTER_OFFER",
                        "timestamp": utc_now(),
                        "note": data.note or f"Provider proposed revised fee of ₹{data.amount}"
                    }
                }
            }
        )
        return await self.get_booking(booking_id)

    async def update_blackout_dates(self, provider_id: str, user_id: str, dates: list[str]) -> dict:
        import re
        date_pattern = re.compile(r"^\d{4}-\d{2}-\d{2}$")
        clean_dates = []
        for d in dates:
            d_str = d.strip()
            if not date_pattern.match(d_str):
                raise AppException(400, f"Invalid date format '{d_str}'. Expected YYYY-MM-DD.")
            if d_str not in clean_dates:
                clean_dates.append(d_str)

        clean_dates.sort()

        repo: BaseRepository = self.bands
        provider = await repo.find_by_id(provider_id)
        if not provider:
            repo = self.artists
            provider = await repo.find_by_id(provider_id)
        if not provider:
            repo = self.venues
            provider = await repo.find_by_id(provider_id)

        if not provider:
            raise NotFoundError("Provider not found")

        await repo.update_by_id(provider_id, {"blackout_dates": clean_dates, "updated_at": utc_now()})
        res = await repo.find_by_id(provider_id)
        return res or {}

    # --- Events ---
    
    async def create_event(self, customer_id: str, event_data: Dict) -> Optional[Dict]:
        now = datetime.now(timezone.utc)
        doc = {
            **event_data,
            "customer_id": customer_id,
            "created_at": now,
            "updated_at": now
        }
        created = await self.events.insert(doc)
        return await self.events.find_by_id(created["id"])

    async def get_customer_events(self, customer_id: str) -> List[Dict]:
        return await self.events.find_many({"customer_id": customer_id})

    async def get_event_by_id(self, event_id: str) -> Optional[Dict]:
        return await self.events.find_by_id(event_id)

    async def create_band(self, user_id: str, data: BandCreateRequest) -> dict:
        now = datetime.now(timezone.utc)
        doc = data.model_dump(exclude_unset=True)
        if doc.get("name") and not doc.get("band_name"):
            doc["band_name"] = doc["name"]
        elif doc.get("band_name") and not doc.get("name"):
            doc["name"] = doc["band_name"]

        doc.update({
            "created_by": user_id,
            "created_at": now,
            "updated_at": now,
            "availability": "Available",
            "verified": False,
            "completed_gigs": 0,
            "rating": 0.0,
            "review_count": 0,
            "team_members": doc.get("team_members") or [],
            "instrument_lineup": doc.get("instrument_lineup") or {},
            "packages": doc.get("packages") or []
        })
        created = await self.bands.insert(doc)
        return await self.get_band(created["id"])

    async def get_band(self, band_id: str) -> dict:
        band = await self.bands.find_by_id(band_id)
        if not band:
            raise NotFoundError("Band not found")
        return band

    async def delete_band(self, band_id: str) -> None:
        deleted = await self.bands.delete_by_id(band_id)
        if not deleted:
            raise NotFoundError("Band not found")

    async def delete_booking(self, booking_id: str) -> None:
        deleted = await self.bookings.delete_by_id(booking_id)
        if not deleted:
            raise NotFoundError("Booking not found")

    async def onboard_provider(self, user_id: str, data: ProviderOnboardingRequest) -> dict:
        now = datetime.now(timezone.utc)
        payout_dict = {
            "payout_upi": data.payout_upi,
            "bank_account_masked": f"xxxx{data.bank_account[-4:]}" if data.bank_account and len(data.bank_account) >= 4 else data.bank_account,
            "bank_ifsc": data.bank_ifsc,
            "kyc_status": data.kyc_status or "PENDING"
        }

        if data.provider_type == "Band":
            doc = {
                "band_name": data.name,
                "name": data.name,
                "description": data.bio or f"Live band based in {data.city}",
                "bio": data.bio,
                "profile_image": data.profile_image,
                "video_url": data.video_url,
                "images": data.images or [],
                "location": data.city,
                "price_from": data.base_price or 25000,
                "packages": data.packages or [{
                    "id": "pkg_standard",
                    "title": "Standard Live Performance",
                    "price": data.base_price or 25000,
                    "duration_hours": 4,
                    "inclusions": ["Full live band setup", "Sound check", "Stage performance"]
                }],
                "sound_rider_specs": data.sound_rider_specs,
                "payout_details": payout_dict,
                "rating": 5.0,
                "review_count": 1,
                "verified": True,
                "completed_gigs": 0,
                "availability": "Available",
                "blackout_dates": [],
                "created_by": user_id,
                "created_at": now,
                "updated_at": now
            }
            res = await self.bands.insert(doc)
            created_band = await self.bands.find_by_id(res["id"] if isinstance(res, dict) else res)
            return created_band or {}

        elif data.provider_type == "Artist":
            doc = {
                "artist_name": data.name,
                "name": data.name,
                "bio": data.bio or f"Solo artist based in {data.city}",
                "profile_image": data.profile_image,
                "video_url": data.video_url,
                "images": data.images or [],
                "location": data.city,
                "price_from": data.base_price or 5000,
                "min_hours": data.min_hours or 1,
                "travel_charges": data.travel_charges,
                "packages": data.packages or [{
                    "id": "pkg_artist_standard",
                    "title": "Standard Solo Act",
                    "price": data.base_price or 5000,
                    "duration_hours": 2,
                    "inclusions": ["Solo vocal / DJ set"]
                }],
                "payout_details": payout_dict,
                "rating": 5.0,
                "review_count": 1,
                "verified": True,
                "completed_gigs": 0,
                "availability": "Available",
                "blackout_dates": [],
                "created_by": user_id,
                "created_at": now,
                "updated_at": now
            }
            res = await self.artists.insert(doc)
            created_artist = await self.artists.find_by_id(res["id"] if isinstance(res, dict) else res)
            return created_artist or {}

        elif data.provider_type == "Venue":
            doc = {
                "venue_name": data.name,
                "name": data.name,
                "city": data.city,
                "location": data.city,
                "capacity": data.capacity or 200,
                "contact_number": data.contact_phone,
                "price_per_hour": data.base_price or 5000,
                "security_deposit": data.security_deposit or 0,
                "images": data.images or [],
                "packages": data.packages or [],
                "payout_details": payout_dict,
                "rating": 5.0,
                "review_count": 1,
                "verified": True,
                "available": True,
                "availability": "Available",
                "blackout_dates": [],
                "created_by": user_id,
                "created_at": now,
                "updated_at": now
            }
            res = await self.venues.insert(doc)
            created_venue = await self.venues.find_by_id(res["id"] if isinstance(res, dict) else res)
            return created_venue or {}
        else:
            raise AppException(400, f"Unsupported provider_type: {data.provider_type}")
