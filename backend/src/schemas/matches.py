from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class MatchCreateRequest(BaseModel):
    group_id: str
    event_id: Optional[str] = None
    venue_id: Optional[str] = None
    title: str
    match_type: str
    match_date: str
    team_a: str
    team_b: str

class MatchUpdateRequest(BaseModel):
    status: Optional[str] = None
    team_a: Optional[str] = None
    team_b: Optional[str] = None

class MatchSummaryCreateRequest(BaseModel):
    match_id: str
    winner: str
    score_summary: str
    top_performer: str
    player_of_match: str
    match_duration: int
