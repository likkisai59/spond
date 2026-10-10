from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException
from src.dependencies.auth import get_current_user, get_optional_current_user
from src.schemas.review import ReviewSchema, CreateReviewPayload, UpdateReviewPayload
from src.services.review_service import ReviewService

router = APIRouter(prefix="/reviews", tags=["Reviews"])

def get_service() -> ReviewService:
    return ReviewService()

@router.get("", response_model=Dict[str, Any])
async def get_reviews(
    user_id: Optional[str] = None,
    reviewee_only: bool = False,
    current_user: Optional[dict] = Depends(get_optional_current_user),
    service: ReviewService = Depends(get_service)
):
    target_id = user_id or (current_user["id"] if current_user else None)
    if not target_id:
        raise HTTPException(status_code=401, detail="Authentication required or target user_id missing")
        
    reviews = await service.get_reviews_for_user(target_id, reviewee_only=reviewee_only)
    return {"status": "success", "data": reviews}

@router.post("", response_model=Dict[str, Any])
async def create_review(
    payload: CreateReviewPayload,
    current_user: dict = Depends(get_current_user),
    service: ReviewService = Depends(get_service)
):
    try:
        review = await service.create_review(
            current_user["id"], 
            current_user.get("full_name", "Unknown"), 
            payload
        )
        return {"status": "success", "data": review}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{review_id}", response_model=Dict[str, Any])
async def update_review(
    review_id: str,
    payload: UpdateReviewPayload,
    current_user: dict = Depends(get_current_user),
    service: ReviewService = Depends(get_service)
):
    try:
        review = await service.update_review(current_user["id"], review_id, payload)
        return {"status": "success", "data": review}
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{review_id}")
async def delete_review(
    review_id: str,
    current_user: dict = Depends(get_current_user),
    service: ReviewService = Depends(get_service)
):
    try:
        await service.delete_review(current_user["id"], review_id)
        return {"status": "success", "message": "Review deleted successfully"}
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
