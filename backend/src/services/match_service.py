from src.database.mongo import utc_now
from src.repositories.matches import MatchRepository, MatchSummaryRepository
from src.repositories import AuditRepository
from src.exceptions.handlers import NotFoundError
from src.schemas.matches import MatchCreateRequest, MatchUpdateRequest, MatchSummaryCreateRequest

class MatchService:
    def __init__(self):
        self.matches = MatchRepository()
        self.summaries = MatchSummaryRepository()
        self.audit = AuditRepository()

    async def create_match(self, user_id: str, data: MatchCreateRequest) -> dict:
        doc = {
            "group_id": data.group_id,
            "event_id": data.event_id,
            "venue_id": data.venue_id,
            "title": data.title,
            "match_type": data.match_type,
            "match_date": data.match_date,
            "status": "SCHEDULED",
            "team_a": data.team_a,
            "team_b": data.team_b,
            "created_by": user_id,
            "created_at": utc_now()
        }
        mid = await self.matches.insert(doc)
        
        await self.audit.insert({
            "user_id": user_id,
            "action": "Match Created",
            "details": f"Match created with id {mid['id']}"
        })
        
        return await self.get_match(mid['id'])

    async def get_match(self, match_id: str) -> dict:
        match = await self.matches.find_by_id(match_id)
        if not match:
            raise NotFoundError("Match not found")
        return match

    async def list_matches(self, group_id: str = None) -> list[dict]:
        query = {}
        if group_id:
            query["group_id"] = group_id
        return await self.matches.find_many(query, sort=[("match_date", -1)])

    async def update_match(self, user_id: str, match_id: str, data: MatchUpdateRequest) -> dict:
        await self.get_match(match_id)
        update_doc = {k: v for k, v in data.model_dump().items() if v is not None}
        if update_doc:
            await self.matches.update_by_id(match_id, update_doc)
            
            await self.audit.insert({
                "user_id": user_id,
                "action": "Match Updated",
                "details": f"Match updated with id {match_id}"
            })
            
        return await self.get_match(match_id)

    async def delete_match(self, match_id: str) -> None:
        await self.get_match(match_id)
        await self.matches.delete_by_id(match_id)
        await self.summaries.collection.delete_many({"match_id": match_id})

    async def create_match_summary(self, data: MatchSummaryCreateRequest) -> dict:
        await self.get_match(data.match_id)
        doc = data.model_dump()
        sid = await self.summaries.insert(doc)
        return await self.summaries.find_by_id(sid)

    async def get_match_summary(self, match_id: str) -> dict:
        summary = await self.summaries.find_one({"match_id": match_id})
        if not summary:
            raise NotFoundError("Match summary not found")
        return summary
