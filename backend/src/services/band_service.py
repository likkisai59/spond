from datetime import datetime, timezone, timedelta
from src.database.mongo import utc_now
from src.repositories.band import (
    ArtistRepository, BandRepository, VenueRepository, BandVenueBookingRepository
)
from src.exceptions.handlers import NotFoundError, AppException
from src.schemas.band import (
    ArtistCreateRequest, ArtistUpdateRequest,
    BandCreateRequest, BandUpdateRequest,
    VenueCreateRequest, VenueUpdateRequest,
    BookingCreateRequest, BookingUpdateRequest,
    CounterOfferRequest, BlackoutDatesRequest, ProviderOnboardingRequest
)

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

class BandService:
    def __init__(self):
        self.artists = ArtistRepository()
        self.bands = BandRepository()
        self.venues = VenueRepository()
        self.bookings = BandVenueBookingRepository()

    # Artists
    async def create_artist(self, user_id: str, data: ArtistCreateRequest) -> dict:
        existing = await self.artists.find_one({"artist_name": data.artist_name})
        if existing:
            raise AppException(400, "Artist name already exists")
            
        doc = data.model_dump(exclude_unset=True)
        if doc.get("name") and not doc.get("artist_name"):
            doc["artist_name"] = doc["name"]
        elif doc.get("artist_name") and not doc.get("name"):
            doc["name"] = doc["artist_name"]
            
        doc.update({
            "created_by": user_id,
            "created_at": utc_now(),
            "updated_at": utc_now(),
            "availability": "Available",
            "verified": False,
            "completed_gigs": 0,
            "rating": 0.0,
            "review_count": 0,
            "packages": doc.get("packages") or [],
            "sound_rider": doc.get("sound_rider") or []
        })
        created = await self.artists.insert(doc)
        return await self.get_artist(created["id"])

    async def list_artists(self, genre: str | None = None, city: str | None = None) -> list[dict]:
        query = {}
        if genre and genre != "all":
            query["genres"] = genre
        if city and city != "all":
            query["location"] = {"$regex": city, "$options": "i"}
        return await self.artists.find_many(query)

    async def get_artist(self, artist_id: str) -> dict:
        artist = await self.artists.find_by_id(artist_id)
        if not artist:
            raise NotFoundError("Artist not found")
        return artist

    async def update_artist(self, artist_id: str, data: ArtistUpdateRequest) -> dict:
        update_data = data.model_dump(exclude_unset=True)
        if not update_data:
            return await self.get_artist(artist_id)
            
        update_data["updated_at"] = utc_now()
        updated = await self.artists.update_by_id(artist_id, update_data)
        if not updated:
            raise NotFoundError("Artist not found")
        return await self.get_artist(artist_id)

    async def delete_artist(self, artist_id: str) -> None:
        deleted = await self.artists.delete_by_id(artist_id)
        if not deleted:
            raise NotFoundError("Artist not found")

    # Bands
    async def create_band(self, user_id: str, data: BandCreateRequest) -> dict:
        existing = await self.bands.find_one({"band_name": data.band_name})
        if existing:
            raise AppException(400, "Band name already exists")
            
        doc = data.model_dump(exclude_unset=True)
        if doc.get("name") and not doc.get("band_name"):
            doc["band_name"] = doc["name"]
        elif doc.get("band_name") and not doc.get("name"):
            doc["name"] = doc["band_name"]

        doc.update({
            "created_by": user_id,
            "created_at": utc_now(),
            "updated_at": utc_now(),
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

    async def list_bands(self, genre: str | None = None, city: str | None = None) -> list[dict]:
        query = {}
        if genre and genre != "all":
            query["genres"] = genre
        if city and city != "all":
            query["location"] = {"$regex": city, "$options": "i"}
        return await self.bands.find_many(query)

    async def get_band(self, band_id: str) -> dict:
        band = await self.bands.find_by_id(band_id)
        if not band:
            raise NotFoundError("Band not found")
        return band

    async def update_band(self, band_id: str, data: BandUpdateRequest) -> dict:
        update_data = data.model_dump(exclude_unset=True)
        if not update_data:
            return await self.get_band(band_id)
            
        update_data["updated_at"] = utc_now()
        updated = await self.bands.update_by_id(band_id, update_data)
        if not updated:
            raise NotFoundError("Band not found")
        return await self.get_band(band_id)

    async def delete_band(self, band_id: str) -> None:
        deleted = await self.bands.delete_by_id(band_id)
        if not deleted:
            raise NotFoundError("Band not found")

    # Venues
    async def create_venue(self, user_id: str, data: VenueCreateRequest) -> dict:
        existing = await self.venues.find_one({"venue_name": data.venue_name})
        if existing:
            raise AppException(400, "Venue name already exists")
            
        doc = data.model_dump(exclude_unset=True)
        if doc.get("name") and not doc.get("venue_name"):
            doc["venue_name"] = doc["name"]
        elif doc.get("venue_name") and not doc.get("name"):
            doc["name"] = doc["venue_name"]

        doc.update({
            "created_by": user_id,
            "created_at": utc_now(),
            "updated_at": utc_now(),
            "available": True,
            "rating": 0.0,
            "review_count": 0,
            "packages": doc.get("packages") or [],
            "slots": doc.get("slots") or []
        })
        created = await self.venues.insert(doc)
        return await self.get_venue(created["id"])

    async def list_venues(self, city: str | None = None, venue_type: str | None = None) -> list[dict]:
        query = {}
        if city and city != "all":
            query["city"] = {"$regex": city, "$options": "i"}
        if venue_type and venue_type != "all":
            query["venue_type"] = venue_type
        return await self.venues.find_many(query)

    async def get_venue(self, venue_id: str) -> dict:
        venue = await self.venues.find_by_id(venue_id)
        if not venue:
            raise NotFoundError("Venue not found")
        return venue

    async def update_venue(self, venue_id: str, data: VenueUpdateRequest) -> dict:
        update_data = data.model_dump(exclude_unset=True)
        if not update_data:
            return await self.get_venue(venue_id)
            
        update_data["updated_at"] = utc_now()
        updated = await self.venues.update_by_id(venue_id, update_data)
        if not updated:
            raise NotFoundError("Venue not found")
        return await self.get_venue(venue_id)

    async def delete_venue(self, venue_id: str) -> None:
        deleted = await self.venues.delete_by_id(venue_id)
        if not deleted:
            raise NotFoundError("Venue not found")

    # Availability & Overlap Validation
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
            if str(event_date) in [str(d) for d in blackouts]:
                return False

        query = {
            "$or": [
                {"provider_id": provider_id},
                {"band_id": provider_id},
                {"venue_id": provider_id}
            ],
            "event_date": str(event_date),
            "booking_status": {"$in": ["ACCEPTED", "CONFIRMED", "EVENT_COMPLETED", "COMPLETED", "Confirmed", "Accepted", "Completed"]}
        }
        if exclude_booking_id:
            from src.database.base_repository import to_object_id
            try:
                oid = to_object_id(str(exclude_booking_id))
                query["_id"] = {"$nin": [oid, str(exclude_booking_id)]}
            except Exception:
                query["_id"] = {"$ne": str(exclude_booking_id)}

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
                # If elapsed >= 15 minutes (acc_time <= fifteen_mins_ago), soft-lock expired -> does NOT block
            else:
                # CONFIRMED, EVENT_COMPLETED, COMPLETED are hard locks
                active_blocking_bookings.append(b)

        if not active_blocking_bookings:
            return True

        if not start_time or not end_time:
            # No specific time provided, active booking locks the full date
            return False

        req_start = str(start_time).strip()
        req_end = str(end_time).strip()

        for b in active_blocking_bookings:
            ex_start = str(b.get("start_time") or "").strip()
            ex_end = str(b.get("end_time") or "").strip()

            if not ex_start or not ex_end:
                return False

            # Overlap formula
            if ex_start < req_end and ex_end > req_start:
                return False

        return True

    # Bookings
    async def create_booking(self, user_id: str, data: BookingCreateRequest) -> dict:
        doc = data.model_dump(exclude_unset=True)
        
        # Backward compatibility field resolution
        provider_id = doc.get("provider_id") or doc.get("band_id") or doc.get("venue_id")
        provider_type = doc.get("provider_type")
        if not provider_type:
            if doc.get("band_id"):
                provider_type = "Band"
            elif doc.get("venue_id"):
                provider_type = "Venue"
            else:
                provider_type = "Band"

        doc["provider_id"] = provider_id
        doc["provider_type"] = provider_type
        if not doc.get("customer_id"):
            doc["customer_id"] = user_id

        # Calculate exact 25% Advance and 75% Final amounts on backend
        total_amount = doc.get("amount", 0)
        advance_amount = round(total_amount * 0.25)
        final_amount = total_amount - advance_amount
        doc["advance_amount"] = advance_amount
        doc["final_amount"] = final_amount

        # Verify slot availability if event_date & time provided
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

        doc.update({
            "created_by": user_id,
            "created_at": utc_now(),
            "updated_at": utc_now(),
            "booking_status": "REQUESTED",
            "payment_status": "UNPAID",
            "status": "REQUESTED",  # legacy alias
            "timeline": [{
                "status": "REQUESTED",
                "timestamp": utc_now(),
                "note": "Booking requested by customer"
            }]
        })
        created = await self.bookings.insert(doc)
        return await self.get_booking(created["id"])

    async def list_bookings(
        self,
        event_id: str | None = None,
        customer_id: str | None = None,
        provider_id: str | None = None,
        booking_status: str | None = None
    ) -> list[dict]:
        query = {}
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

    async def get_booking(self, booking_id: str) -> dict:
        booking = await self.bookings.find_by_id(booking_id)
        if not booking:
            raise NotFoundError("Booking not found")
        return booking

    async def update_booking(self, booking_id: str, data: BookingUpdateRequest) -> dict:
        update_data = data.model_dump(exclude_unset=True)
        if not update_data:
            return await self.get_booking(booking_id)
            
        update_data["updated_at"] = utc_now()
        
        # If status is updated, push to timeline
        if data.booking_status:
            update_data["status"] = data.booking_status  # keep legacy in sync
            await self.bookings.collection.update_one(
                {"_id": booking_id},
                {"$push": {"timeline": {
                    "status": data.booking_status,
                    "timestamp": utc_now(),
                    "note": data.note or f"Status updated to {data.booking_status}"
                }}}
            )
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
            d_str = str(d).strip()
            if not date_pattern.match(d_str):
                raise AppException(400, f"Invalid date format '{d_str}'. Expected YYYY-MM-DD.")
            if d_str not in clean_dates:
                clean_dates.append(d_str)

        clean_dates.sort()

        provider = await self.bands.find_by_id(provider_id)
        repo = self.bands
        if not provider:
            provider = await self.artists.find_by_id(provider_id)
            repo = self.artists
        if not provider:
            provider = await self.venues.find_by_id(provider_id)
            repo = self.venues

        if not provider:
            raise NotFoundError("Provider not found")

        await repo.update_by_id(provider_id, {"blackout_dates": clean_dates, "updated_at": utc_now()})
        return await repo.find_by_id(provider_id)

    async def onboard_provider(self, user_id: str, data: ProviderOnboardingRequest) -> dict:
        now = utc_now()
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
            return await self.bands.find_by_id(res["id"] if isinstance(res, dict) else res)

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
            return await self.artists.find_by_id(res["id"] if isinstance(res, dict) else res)

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
            return await self.venues.find_by_id(res["id"] if isinstance(res, dict) else res)
        else:
            raise AppException(400, f"Unsupported provider_type: {data.provider_type}")

    async def delete_booking(self, booking_id: str) -> None:
        deleted = await self.bookings.delete_by_id(booking_id)
        if not deleted:
            raise NotFoundError("Booking not found")
