import asyncio
import uuid
import sys
import os
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key-for-unit-tests-only")

import pytest
from src.database.mongo import mongo
from src.services.band_service import BandService
from src.repositories import UserRepository
from src.schemas.band import BookingRequest

def test_performance():
    async def _run():
        await mongo.connect()
        try:
            band_service = BandService()
            user_repo = UserRepository()
            
            # Setup users
            customer_ids = [uuid.uuid4().hex[:24] for _ in range(50)]
            venue_id = uuid.uuid4().hex[:24]
            package_id = f"pkg_{uuid.uuid4().hex[:8]}"
            
            print("\n[SETUP] Seeding database for performance test...")
            await user_repo.insert({
                "id": venue_id,
                "full_name": "Perf Venue",
                "email": f"{venue_id}@test.com",
                "role": "venue"
            })
            
            venue = await band_service.upsert_venue_profile(venue_id, {
                "venue_name": "Perf Arena",
                "packages": [
                    {"id": package_id, "name": "Basic", "price": 1000, "duration": 60, "description": "-"}
                ]
            })
            provider_real_id = venue["id"]
            
            # Seed 10 artists and venues for the marketplace read test
            for i in range(10):
                v_user = uuid.uuid4().hex[:24]
                a_user = uuid.uuid4().hex[:24]
                await band_service.upsert_venue_profile(v_user, {"venue_name": f"Venue {i}"})
                await band_service.upsert_artist_profile(a_user, {"artist_name": f"Artist {i}"})
            
            print("[TEST 1] Testing Marketplace Read Throughput (100 concurrent requests)")
            start_time = time.perf_counter()
            
            async def read_marketplace():
                await band_service.get_all_venues()
                await band_service.get_all_artists()
                
            await asyncio.gather(*(read_marketplace() for _ in range(100)))
            read_duration = time.perf_counter() - start_time
            print(f"  -> 100 read operations took {read_duration:.2f}s ({(100 / read_duration):.2f} ops/sec)")
            
            print("[TEST 2] Testing Booking Creation Throughput (50 concurrent requests)")
            start_time = time.perf_counter()
            
            async def create_booking_task(cid):
                req = BookingRequest(
                    provider_id=provider_real_id,
                    provider_type="venue",
                    package_id=package_id,
                    event_date="2026-12-01",
                    event_time="10:00"
                )
                await band_service.create_booking(cid, req)
                
            await asyncio.gather(*(create_booking_task(cid) for cid in customer_ids))
            write_duration = time.perf_counter() - start_time
            print(f"  -> 50 write operations took {write_duration:.2f}s ({(50 / write_duration):.2f} ops/sec)")
            
            assert read_duration < 10.0, "Reads are too slow!"
            assert write_duration < 10.0, "Writes are too slow!"
            
            print("\n[OK] Performance testing passed successfully.")
            
        finally:
            await mongo.close()

    asyncio.run(_run())
