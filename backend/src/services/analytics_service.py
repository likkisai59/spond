import json
from src.database.redis import RedisClient
from src.repositories.analytics import PlayerStatsRepository
from src.repositories import GroupRepository, GroupMemberRepository, EventRepository, PaymentRepository, MatchRepository
from src.exceptions.handlers import NotFoundError
from bson import ObjectId

class AnalyticsService:
    def __init__(self):
        self.player_stats = PlayerStatsRepository()
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

    async def get_sports_dashboard_overview(self, user_id: str = None) -> dict:
        cache_key = f"analytics:sports:dashboard:overview:{user_id}" if user_id else "analytics:sports:dashboard:overview"
        cached = await self._cache_get(cache_key)
        if cached:
            return cached

        if user_id:
            member_records = await self.members.find_many({"user_id": user_id})
            joined_group_ids = []
            for m in member_records:
                gid = m.get("group_id")
                if gid:
                    if ObjectId.is_valid(str(gid)):
                        joined_group_ids.append(ObjectId(str(gid)))
                    joined_group_ids.append(gid)

            user_groups = await self.groups.find_many({
                "$or": [
                    {"created_by": user_id},
                    {"_id": {"$in": joined_group_ids}}
                ]
            })
            groups_count = len(user_groups)
            user_group_ids = [str(g["id"]) for g in user_groups if "id" in g]

            members_count = await self.members.collection.count_documents({"group_id": {"$in": user_group_ids}}) if user_group_ids else 0
            events_count = await self.events.collection.count_documents({
                "$or": [
                    {"created_by": user_id},
                    {"group_id": {"$in": user_group_ids}}
                ]
            }) if user_group_ids else await self.events.collection.count_documents({"created_by": user_id})
            matches_played = await self.matches.collection.count_documents({
                "status": "COMPLETED",
                "group_id": {"$in": user_group_ids}
            }) if user_group_ids else 0
        else:
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
