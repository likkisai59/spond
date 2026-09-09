import asyncio
import uuid
import sys
import os
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key-for-unit-tests-only")

from src.database.mongo import mongo
from src.services.band_service import BandService
from src.repositories import UserRepository
from src.schemas.band import BookingRequest

SLA_MAX_DURATION_SECONDS = 3.0

def test_sla_transactions():
    """
    Performance test to verify that individual API transactions 
    complete within the 3.0 second SLA.
    """
    async def _run():
        await mongo.connect()
        try:
            band_service = BandService()
            user_repo = UserRepository()
            
            # Setup users
            customer_id = uuid.uuid4().hex[:24]
            venue_id = uuid.uuid4().hex[:24]
            package_id = f"pkg_{uuid.uuid4().hex[:8]}"
            
            print("\n[SETUP] Seeding database for SLA test...")
            await user_repo.insert({
                "id": venue_id,
                "full_name": "SLA Venue",
                "email": f"{venue_id}@test.com",
                "role": "venue"
            })
            
            venue = await band_service.upsert_venue_profile(venue_id, {
                "venue_name": "SLA Arena",
                "packages": [
                    {"id": package_id, "name": "Basic", "price": 1000, "duration": 60, "description": "-"}
                ]
            })
            provider_real_id = venue["id"]
            
            print(f"[TEST 1] Testing Read Transaction SLA (< {SLA_MAX_DURATION_SECONDS}s)")
            start_time = time.perf_counter()
            await band_service.get_all_venues()
            read_duration = time.perf_counter() - start_time
            print(f"  -> Read operation took {read_duration:.4f}s")
            
            assert read_duration < SLA_MAX_DURATION_SECONDS, f"Read SLA violation: took {read_duration:.2f}s (must be < {SLA_MAX_DURATION_SECONDS}s)"

            print(f"[TEST 2] Testing Write Transaction SLA (< {SLA_MAX_DURATION_SECONDS}s)")
            req = BookingRequest(
                provider_id=provider_real_id,
                provider_type="venue",
                package_id=package_id,
                event_date="2026-12-01",
                event_time="10:00"
            )
            
            start_time = time.perf_counter()
            await band_service.create_booking(customer_id, req)
            write_duration = time.perf_counter() - start_time
            print(f"  -> Write operation took {write_duration:.4f}s")
            
            assert write_duration < SLA_MAX_DURATION_SECONDS, f"Write SLA violation: took {write_duration:.2f}s (must be < {SLA_MAX_DURATION_SECONDS}s)"

            print("\n[OK] All SLA transaction tests passed successfully.")
            
        finally:
            await mongo.close()

    asyncio.run(_run())
