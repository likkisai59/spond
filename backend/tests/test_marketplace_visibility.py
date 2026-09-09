import asyncio
import uuid
import sys
import os
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key-for-unit-tests-only")

import pytest
from src.database.mongo import mongo
from src.services.band_service import BandService
from src.repositories import UserRepository

def test_marketplace_visibility():
    async def _run():
        await mongo.connect()
        try:
            band_service = BandService()
            user_repo = UserRepository()
            
            # 1. Create a dummy Artist user and profile
            artist_user_id = uuid.uuid4().hex[:24]
            await user_repo.insert({
                "id": artist_user_id,
                "full_name": "Test Artist",
                "email": f"{artist_user_id}@test.com",
                "role": "artist"
            })
            
            artist_profile_data = {
                "artist_name": "The Great Test Artist",
                "bio": "A fantastic test artist",
                "base_rate": 5000,
                "rating": 4.9,
                "verification_status": "verified"
            }
            created_artist = await band_service.upsert_artist_profile(artist_user_id, artist_profile_data)
            assert created_artist is not None
            
            # 2. Create a dummy Venue user and profile
            venue_user_id = uuid.uuid4().hex[:24]
            await user_repo.insert({
                "id": venue_user_id,
                "full_name": "Test Venue Owner",
                "email": f"{venue_user_id}@test.com",
                "role": "venue"
            })
            
            venue_profile_data = {
                "venue_name": "The Grand Test Arena",
                "description": "A spacious test venue",
                "base_price": 20000,
                "capacity": 5000,
                "rating": 5.0,
                "verification_status": "verified"
            }
            created_venue = await band_service.upsert_venue_profile(venue_user_id, venue_profile_data)
            assert created_venue is not None
            
            # 3. Verify Artist is visible in marketplace (get_all_artists)
            all_artists = await band_service.get_all_artists()
            artist_found = any(a.get("created_by") == artist_user_id for a in all_artists)
            assert artist_found, "Artist profile was not found in the marketplace listing!"
            
            # 4. Verify Venue is visible in marketplace (get_all_venues)
            all_venues = await band_service.get_all_venues()
            venue_found = any(v.get("created_by") == venue_user_id for v in all_venues)
            assert venue_found, "Venue profile was not found in the marketplace listing!"
            
            print("\n[OK] Success: Artist and Venue profiles were successfully created and are visible in the marketplace endpoints.")
            
        finally:
            await mongo.close()

    asyncio.run(_run())
