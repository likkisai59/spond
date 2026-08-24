from fastapi import APIRouter, Depends, Query, status
from typing import List, Dict, Any, Optional

from src.schemas.matches import MatchCreateRequest, MatchUpdateRequest, MatchSummaryCreateRequest
from src.services.match_service import MatchService
from src.middleware.auth import require_auth
from src.dependencies.auth import require_roles


router = APIRouter(prefix="/sports/matches", tags=["Sports Matches"])

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_match(
    data: MatchCreateRequest,
    user: dict = Depends(require_auth),
    # Optional RBAC check here
    service: MatchService = Depends()
) -> Dict[str, Any]:
    return await service.create_match(user["id"], data)

@router.get("")
async def list_matches(
    group_id: Optional[str] = Query(None),
    user: dict = Depends(require_auth),
    service: MatchService = Depends()
) -> List[Dict[str, Any]]:
    return await service.list_matches(group_id=group_id)

@router.get("/{match_id}")
async def get_match(
    match_id: str,
    user: dict = Depends(require_auth),
    service: MatchService = Depends()
) -> Dict[str, Any]:
    return await service.get_match(match_id)

@router.put("/{match_id}")
async def update_match(
    match_id: str,
    data: MatchUpdateRequest,
    user: dict = Depends(require_auth),
    service: MatchService = Depends()
) -> Dict[str, Any]:
    return await service.update_match(user["id"], match_id, data)

@router.delete("/{match_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_match(
    match_id: str,
    user: dict = Depends(require_auth),
    service: MatchService = Depends()
) -> None:
    await service.delete_match(match_id)

@router.post("/{match_id}/summary", status_code=status.HTTP_201_CREATED)
async def create_match_summary(
    match_id: str,
    data: MatchSummaryCreateRequest,
    user: dict = Depends(require_auth),
    service: MatchService = Depends()
) -> Dict[str, Any]:
    if data.match_id != match_id:
        data.match_id = match_id
    return await service.create_match_summary(data)

@router.get("/{match_id}/summary")
async def get_match_summary(
    match_id: str,
    user: dict = Depends(require_auth),
    service: MatchService = Depends()
) -> Dict[str, Any]:
    return await service.get_match_summary(match_id)
