from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from src.schemas.band import (
    ArtistSchema, BandSchema, VenueSchema, BookingSchema,
    BookingStatus, PaymentStatus, BookingRequest
)
from src.database.base_repository import BaseRepository
from src.repositories import UserRepository
from src.services.notification_service import NotificationService

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

    async def get_band_by_id(self, id: str) -> Optional[Dict]:
        return await self.bands.find_by_id(id)

    async def get_venue_by_id(self, id: str) -> Optional[Dict]:
        return await self.venues.find_by_id(id)

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
        
        monthly_data = {}
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
        
        monthly_data = {}
        from calendar import month_abbr
        for i in range(6):
            y = now.year
            m = now.month - i
            while m < 1:
                m += 12
                y -= 1
            key = f"{y}-{m:02d}"
            monthly_data[key] = {"month": month_abbr[m], "revenue": 0, "bookings": 0}
            
        event_types = {}
        
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

        rev_growth = 0
        if prev_revenue > 0:
            rev_growth = ((curr_revenue - prev_revenue) / prev_revenue) * 100
        elif curr_revenue > 0:
            rev_growth = 100
            
        bk_growth = 0
        if prev_bookings > 0:
            bk_growth = ((curr_bookings - prev_bookings) / prev_bookings) * 100
        elif curr_bookings > 0:
            bk_growth = 100
            
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
        
        monthly_data = {}
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
        
        monthly_data = {}
        from calendar import month_abbr
        for i in range(6):
            y = now.year
            m = now.month - i
            while m < 1:
                m += 12
                y -= 1
            key = f"{y}-{m:02d}"
            monthly_data[key] = {"month": month_abbr[m], "revenue": 0, "bookings": 0}
            
        event_types = {}
        
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

        rev_growth = 0
        if prev_revenue > 0:
            rev_growth = ((curr_revenue - prev_revenue) / prev_revenue) * 100
        elif curr_revenue > 0:
            rev_growth = 100
            
        bk_growth = 0
        if prev_bookings > 0:
            bk_growth = ((curr_bookings - prev_bookings) / prev_bookings) * 100
        elif curr_bookings > 0:
            bk_growth = 100
            
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


    async def create_booking(self, customer_id: str, request: BookingRequest) -> Dict:
        # Resolve Provider to calculate total and advance
        provider = None
        if request.provider_type == "artist":
            provider = await self.artists.find_by_id(request.provider_id)
        elif request.provider_type == "band":
            provider = await self.bands.find_by_id(request.provider_id)
        elif request.provider_type == "venue":
            provider = await self.venues.find_by_id(request.provider_id)
        
        if not provider:
            raise ValueError(f"Provider not found: {request.provider_id}")

        if request.package_id == "pkg-custom":
            total_amount = request.proposed_price or 0.0
        else:
            package = next((p for p in provider.get("packages", []) if p["id"] == request.package_id), None)
            if not package:
                raise ValueError(f"Package not found: {request.package_id}")
            total_amount = package["price"]

        advance_amount = total_amount * 0.25

        now = datetime.now(timezone.utc)
        
        booking_data = {
            "customer_id": customer_id,
            "provider_id": request.provider_id,
            "provider_type": request.provider_type,
            "package_id": request.package_id,
            "event_date": request.event_date,
            "event_time": request.event_time,
            "message": request.message,
            "status": BookingStatus.REQUESTED.value,
            "payment_status": PaymentStatus.UNPAID.value,
            "total_amount": total_amount,
            "advance_amount": advance_amount,
            "created_at": now,
            "updated_at": now
        }
        
        created = await self.bookings.insert(booking_data)
        if not created or "id" not in created:
             raise ValueError("Failed to insert booking")

        # Fetch Customer details for notification
        customer = await self.users.find_by_id(customer_id)
        customer_name = customer.get("full_name", "A customer") if customer else "A customer"
        
        provider_name = provider.get("band_name") or provider.get("artist_name") or provider.get("venue_name") or "you"

        # Notify provider owner
        owner_id = provider.get("created_by")
        if owner_id:
            msg = f"New Booking Request: {customer_name} requested to book {provider_name} for {request.event_date}."
            await self.notifications.create_notification(
                user_id=owner_id,
                title="New Booking Request",
                message=msg,
                notification_type="BOOKING_REQUEST",
                module="band"
            )

        return (await self.bookings.find_by_id(created["id"])) or {}
    
    async def get_bookings_for_customer(self, customer_id: str) -> List[Dict]:
        return await self.bookings.find_many({"customer_id": customer_id})

    async def get_all_profile_ids_for_user(self, user_id: str) -> List[str]:
        owned_artists = await self.artists.find_many({"created_by": user_id})
        owned_bands = await self.bands.find_many({"created_by": user_id})
        owned_venues = await self.venues.find_many({"created_by": user_id})
        
        profile_ids = [p["id"] for p in owned_artists + owned_bands + owned_venues if "id" in p]
        profile_ids.append(user_id)
        return profile_ids

    async def get_bookings_for_provider(self, user_id: str) -> List[Dict]:
        profile_ids = await self.get_all_profile_ids_for_user(user_id)
        
        bookings = await self.bookings.find_many({
            "provider_id": {"$in": profile_ids}, 
            "is_deleted": False
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
