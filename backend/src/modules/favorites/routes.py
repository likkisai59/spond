from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from src.dependencies.auth import get_current_user
from src.schemas.favorite import CreateFavoritePayload
from src.services.favorite_service import FavoriteService

router = APIRouter(prefix="/favorites", tags=["Favorites"])

def get_service() -> FavoriteService:
    return FavoriteService()

@router.get("", response_model=Dict[str, Any])
async def get_favorites(
    current_user: dict = Depends(get_current_user),
    service: FavoriteService = Depends(get_service)
):
    items = await service.get_favorites(current_user["id"])
    return {"status": "success", "data": items}

@router.post("", response_model=Dict[str, Any])
async def add_favorite(
    payload: CreateFavoritePayload,
    current_user: dict = Depends(get_current_user),
    service: FavoriteService = Depends(get_service)
):
    try:
        item = await service.add_favorite(current_user["id"], payload)
        return {"status": "success", "data": item}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{item_id}")
async def remove_favorite(
    item_id: str,
    current_user: dict = Depends(get_current_user),
    service: FavoriteService = Depends(get_service)
):
    try:
        await service.remove_favorite(current_user["id"], item_id)
        return {"status": "success", "message": "Removed from favorites"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
