import json
import datetime
from src.database.redis import RedisClient
from src.repositories.analytics import PlayerStatsRepository
from src.repositories import (
    GroupRepository,
    GroupMemberRepository,
    EventRepository,
    PaymentRepository,
    MatchRepository,
    RsvpRepository,
    AttendanceRepository,
)
from src.exceptions.handlers import NotFoundError
from bson import ObjectId

class AnalyticsService:
    def __init__(self):
        self.player_stats = PlayerStatsRepository()
        self.groups = GroupRepository()
        self.members = GroupMemberRepository()
        self.events = EventRepository()
        self.rsvps = RsvpRepository()
        self.attendance = AttendanceRepository()
        self.payments = PaymentRepository()
        self.matches = MatchRepository()

    async def _cache_get(self, key: str):
        try:
            redis = RedisClient.get_client()
            val = await redis.get(key)
            return json.loads(val) if val else None
        except Exception:
            return None

    async def _cache_set(self, key: str, val: dict, ttl: int = 300):
        try:
            redis = RedisClient.get_client()
            await redis.set(key, json.dumps(val), ex=ttl)
        except Exception:
            pass

    async def get_sports_dashboard_overview(self, user_id: str | None = None) -> dict:
        cache_key = f"analytics:sports:dashboard:overview:{user_id}" if user_id else "analytics:sports:dashboard:overview"
        cached = await self._cache_get(cache_key)
        if cached and "attendanceTrend" in cached and "paymentsDue" in cached:
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
            user_group_obj_ids = [ObjectId(gid) for gid in user_group_ids if ObjectId.is_valid(gid)]
            all_match_ids = list(set(user_group_ids + user_group_obj_ids))

            members_count = await self.members.collection.count_documents({"group_id": {"$in": all_match_ids}}) if all_match_ids else 0
            events_count = await self.events.collection.count_documents({
                "$or": [
                    {"created_by": user_id},
                    {"group_id": {"$in": all_match_ids}}
                ]
            }) if all_match_ids else await self.events.collection.count_documents({"created_by": user_id})
            matches_played = await self.matches.collection.count_documents({
                "status": "COMPLETED",
                "group_id": {"$in": all_match_ids}
            }) if all_match_ids else 0
        else:
            groups_count = await self.groups.collection.count_documents({})
            members_count = await self.members.collection.count_documents({})
            events_count = await self.events.collection.count_documents({})
            matches_played = await self.matches.collection.count_documents({"status": "COMPLETED"})

        # Aggregation for total revenue from payments
        revenue_pipeline = [{"$match": {"payment_status": "COMPLETED"}}, {"$group": {"_id": None, "total": {"$sum": "$amount"}}}]
        revenue_res = await self.payments.collection.aggregate(revenue_pipeline).to_list(1)
        total_revenue = revenue_res[0]["total"] if revenue_res else 0.0

        due_query: dict = {"payment_status": {"$in": ["PENDING", "Pending"]}}
        if user_id and all_match_ids:
            due_query["group_id"] = {"$in": all_match_ids}
        due_pipeline = [{"$match": due_query}, {"$group": {"_id": None, "total": {"$sum": "$amount"}}}]
        due_res = await self.payments.collection.aggregate(due_pipeline).to_list(1)
        payments_due = due_res[0]["total"] if due_res else 0.0

        attendance_pct = await self.get_attendance_percentage()

        target_group_ids = all_match_ids if user_id else None
        attendance_trend = await self._calculate_attendance_trend(target_group_ids)
        payment_trend = await self._calculate_payment_trend(target_group_ids)

        overview = {
            "groups": groups_count,
            "members": members_count,
            "events": events_count,
            "paymentsDue": payments_due,
            "attendancePct": attendance_pct,
            "totalRevenue": total_revenue,
            "matchesPlayed": matches_played,
            "attendanceTrend": attendance_trend,
            "paymentTrend": payment_trend,
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

    async def _calculate_attendance_trend(self, group_ids: list | None = None) -> list[dict]:
        query: dict = {}
        if group_ids:
            query["group_id"] = {"$in": group_ids}

        events = await self.events.find_many(query, sort=[("date", -1), ("created_at", -1)], limit=8)
        events = list(reversed(events))

        trend = []
        for idx in range(8):
            label = f"Wk {idx + 1}"
            if idx < len(events):
                event = events[idx]
                eid = str(event.get("id", ""))
                going = await self.attendance.collection.count_documents({"event_id": eid, "attendance_status": "Going"})
                maybe = await self.rsvps.collection.count_documents({"event_id": eid, "status": "Maybe"})
                att = event.get("attendance", {})
                going = going or att.get("going", 0)
                maybe = maybe or att.get("maybe", 0)
                trend.append({"label": label, "going": int(going), "maybe": int(maybe)})
            else:
                trend.append({"label": label, "going": 0, "maybe": 0})
        return trend

    async def _calculate_payment_trend(self, group_ids: list | None = None) -> list[dict]:
        now = datetime.datetime.now(datetime.timezone.utc)
        months = []
        for i in range(5, -1, -1):
            m = now.month - i
            y = now.year
            while m <= 0:
                m += 12
                y -= 1
            month_date = datetime.date(y, m, 1)
            months.append((month_date.strftime("%b"), y, m))

        trend = []
        for label, year, month in months:
            start_date = datetime.datetime(year, month, 1, tzinfo=datetime.timezone.utc)
            if month == 12:
                end_date = datetime.datetime(year + 1, 1, 1, tzinfo=datetime.timezone.utc)
            else:
                end_date = datetime.datetime(year, month + 1, 1, tzinfo=datetime.timezone.utc)

            match_filter: dict = {
                "$or": [
                    {"created_at": {"$gte": start_date, "$lt": end_date}},
                    {"created_at": {"$gte": start_date.isoformat(), "$lt": end_date.isoformat()}}
                ]
            }
            if group_ids:
                match_filter["group_id"] = {"$in": group_ids}

            collected_pipe = [
                {"$match": {**match_filter, "payment_status": "COMPLETED"}},
                {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
            ]
            pending_pipe = [
                {"$match": {**match_filter, "payment_status": {"$in": ["PENDING", "Pending"]}}},
                {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
            ]

            try:
                col_res = await self.payments.collection.aggregate(collected_pipe).to_list(1)
                pend_res = await self.payments.collection.aggregate(pending_pipe).to_list(1)
                collected = col_res[0]["total"] if col_res else 0.0
                pending = pend_res[0]["total"] if pend_res else 0.0
            except Exception:
                collected = 0.0
                pending = 0.0

            trend.append({"label": label, "collected": float(collected), "pending": float(pending)})

        return trend
