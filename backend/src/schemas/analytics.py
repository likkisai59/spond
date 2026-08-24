from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class PlayerStatResponse(BaseModel):
    id: str
    player_id: str
    matches_played: int
    wins: int
    losses: int
    attendance_rate: float
    total_points: int
    total_runs: int
    total_goals: int
    performance_score: float

class DashboardOverviewResponse(BaseModel):
    groups: int
    members: int
    events: int
    paymentsDue: int
    unreadMessages: int

class BandArtistAnalyticsResponse(BaseModel):
    artist_id: str
    total_bookings: int
    total_events: int
    total_revenue: float
    performance_score: float
