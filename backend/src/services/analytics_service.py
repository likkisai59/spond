import json
from src.database.redis import RedisClient
from src.repositories.analytics import PlayerStatsRepository, BandArtistAnalyticsRepository, BandVenueAnalyticsRepository
from src.repositories import GroupRepository, GroupMemberRepository, EventRepository, PaymentRepository, MatchRepository
from src.exceptions.handlers import NotFoundError

class AnalyticsService:
    def __init__(self):
        self.player_stats = PlayerStatsRepository()
        self.artist_analytics = BandArtistAnalyticsRepository()
        self.venue_analytics = BandVenueAnalyticsRepository()
        self.groups = GroupRepository()
        self.members = GroupMemberRepository()
        self.events = EventRepository()
        self.payments = PaymentRepository()
        self.matches = MatchRepository()

    async def _cache_get(self, key: str):
        redis = RedisClient.get_client()
        val = await redis.get(key)
        return json.loads(val) if val else None

    async def _cache_set(self, key: str, val: dict, ttl: int = 300):
        redis = RedisClient.get_client()
        await redis.set(key, json.dumps(val), ex=ttl)

    async def get_sports_dashboard_overview(self) -> dict:
        cache_key = "analytics:sports:dashboard:overview"
        cached = await self._cache_get(cache_key)
        if cached:
            return cached

        groups_count = await self.groups.collection.count_documents({})
        members_count = await self.members.collection.count_documents({})
        events_count = await self.events.collection.count_documents({})
        matches_played = await self.matches.collection.count_documents({"status": "COMPLETED"})

        # Aggregation for total revenue from payments
        revenue_pipeline = [{"$match": {"payment_status": "COMPLETED"}}, {"$group": {"_id": None, "total": {"$sum": "$amount"}}}]
        revenue_res = await self.payments.collection.aggregate(revenue_pipeline).to_list(1)
        total_revenue = revenue_res[0]["total"] if revenue_res else 0.0

        attendance_pct = await self.get_attendance_percentage()

        overview = {
            "groups": groups_count,
            "members": members_count,
            "events": events_count,
            "attendancePct": attendance_pct,
            "totalRevenue": total_revenue,
            "matchesPlayed": matches_played
        }
        await self._cache_set(cache_key, overview, ttl=300)
        return overview

    async def get_band_dashboard_overview(self) -> dict:
        cache_key = "analytics:band:dashboard:overview"
        cached = await self._cache_get(cache_key)
        if cached:
            return cached

        # Aggregate total revenue from artist analytics
        revenue_pipeline = [{"$group": {"_id": None, "total": {"$sum": "$total_revenue"}}}]
        revenue_res = await self.artist_analytics.collection.aggregate(revenue_pipeline).to_list(1)
        total_revenue = revenue_res[0]["total"] if revenue_res else 0.0

        # Most active artists
        artists = await self.artist_analytics.find_many({}, sort=[("total_events", -1)], limit=3)
        
        # Top venues
        venues = await self.venue_analytics.find_many({}, sort=[("total_bookings", -1)], limit=3)

        overview = {
            "total_artists": await self.artist_analytics.collection.count_documents({}),
            "total_venues": await self.venue_analytics.collection.count_documents({}),
            "total_bookings": sum([v.get("total_bookings", 0) for v in venues]) if venues else 0,
            "total_revenue": total_revenue,
            "top_artists": artists,
            "top_venues": venues
        }
        await self._cache_set(cache_key, overview, ttl=300)
        return overview

    async def get_top_players(self, limit: int = 10) -> list[dict]:
        return await self.player_stats.find_many({}, sort=[("performance_score", -1)], limit=limit)

    async def get_player_stats(self, player_id: str) -> dict:
        stats = await self.player_stats.find_one({"player_id": player_id})
        if not stats:
            # Return empty skeleton
            return {
                "player_id": player_id,
                "matches_played": 0, "wins": 0, "losses": 0,
                "attendance_rate": 0.0, "total_points": 0,
                "total_runs": 0, "total_goals": 0, "performance_score": 0.0
            }
        return stats

    # Example MongoDB Aggregation
    async def get_attendance_percentage(self) -> float:
        # Complex pipeline omitted for brevity, simple count vs rsvp
        pipeline = [
            {"$group": {"_id": None, "avg_attendance": {"$avg": "$attendance_rate"}}}
        ]
        result = await self.player_stats.collection.aggregate(pipeline).to_list(1)
        if result and result[0].get("avg_attendance"):
            return round(result[0]["avg_attendance"], 2)
        return 0.0
