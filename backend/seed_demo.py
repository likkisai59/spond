import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import bcrypt
import os
from dotenv import load_dotenv

load_dotenv()

async def seed_db():
    uri = os.getenv("MONGODB_URI")
    db_name = os.getenv("MONGODB_DB_NAME")
    client = AsyncIOMotorClient(uri)
    db = client[db_name]

    print("Clearing old demo data...")
    await db.users.delete_many({"email": {"$regex": "@demo.com"}})
    await db.artists.delete_many({"name": {"$in": ["Neon Wave Band", "DJ Shadow"]}})
    await db.venues.delete_many({"name": {"$in": ["The Grand Hall", "Riverside Club"]}})

    hashed_pw = bcrypt.hashpw("password123".encode(), bcrypt.gensalt()).decode()

    # Create Users
    users = [
        {"name": "Neon Wave", "email": "neon@demo.com", "password": hashed_pw, "role": "artist", "id": "u_neon"},
        {"name": "DJ Shadow", "email": "shadow@demo.com", "password": hashed_pw, "role": "artist", "id": "u_shadow"},
        {"name": "Grand Hall Owner", "email": "grand@demo.com", "password": hashed_pw, "role": "venue", "id": "u_grand"},
        {"name": "Riverside Owner", "email": "river@demo.com", "password": hashed_pw, "role": "venue", "id": "u_river"},
        {"name": "Alice Client", "email": "alice@demo.com", "password": hashed_pw, "role": "customer", "id": "u_alice"},
        {"name": "Bob Client", "email": "bob@demo.com", "password": hashed_pw, "role": "customer", "id": "u_bob"},
    ]
    await db.users.insert_many(users)

    # Create Artist Profiles
    artists = [
        {
            "id": "p_neon",
            "created_by": "u_neon",
            "name": "Neon Wave Band",
            "display_name": "neonwave",
            "band_type": "Live Band",
            "genres": ["Rock", "Pop"],
            "bio": "High energy rock band for your events!",
            "years_of_experience": 5,
            "profile_image": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7",
            "pricing": {"base_rate": 500, "packages": [{"name": "Standard", "price": 500, "duration": "2 hours", "description": "Standard performance"}]},
            "is_public": True,
            "status": "APPROVED",
            "verification_status": "VERIFIED"
        },
        {
            "id": "p_shadow",
            "created_by": "u_shadow",
            "name": "DJ Shadow",
            "display_name": "djshadow",
            "band_type": "Solo Artist",
            "genres": ["Electronic", "Dance"],
            "bio": "Get the party started with the best mixes.",
            "years_of_experience": 8,
            "profile_image": "https://images.unsplash.com/photo-1571266028243-3716f02d2d2e",
            "pricing": {"base_rate": 300, "packages": [{"name": "Party", "price": 300, "duration": "3 hours", "description": "Full party mix"}]},
            "is_public": True,
            "status": "APPROVED",
            "verification_status": "VERIFIED"
        }
    ]
    await db.artists.insert_many(artists)

    # Create Venue Profiles
    venues = [
        {
            "id": "p_grand",
            "created_by": "u_grand",
            "name": "The Grand Hall",
            "description": "Luxurious hall for big events and weddings.",
            "type": "Banquet Hall",
            "country": "India",
            "state": "Maharashtra",
            "city": {"id": "c1", "name": "Mumbai"},
            "address": "123 Grand Ave",
            "capacity": 500,
            "pricing": {"hourly_rate": 1000, "daily_rate": 10000},
            "profile_image": "https://images.unsplash.com/photo-1519167758481-83f550bb49b3",
            "status": "APPROVED",
            "verification_status": "VERIFIED"
        },
        {
            "id": "p_river",
            "created_by": "u_river",
            "name": "Riverside Club",
            "description": "Open air club by the river for casual parties.",
            "type": "Club",
            "country": "India",
            "state": "Maharashtra",
            "city": {"id": "c1", "name": "Mumbai"},
            "address": "45 River Rd",
            "capacity": 200,
            "pricing": {"hourly_rate": 500, "daily_rate": 5000},
            "profile_image": "https://images.unsplash.com/photo-1566737236500-c8ac43014a67",
            "status": "APPROVED",
            "verification_status": "VERIFIED"
        }
    ]
    await db.venues.insert_many(venues)

    print("Demo data seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed_db())
