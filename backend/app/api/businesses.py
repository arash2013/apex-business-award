from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from ..db import get_db
from ..services import business_service

router = APIRouter(prefix="/businesses", tags=["businesses"])


class BusinessOut(BaseModel):
    id: UUID
    name: str
    category: str
    neighborhood: str | None
    city: str
    state: str
    google_rating: float | None
    google_review_count: int | None
    yelp_rating: float | None
    yelp_review_count: int | None
    qualification_score: float | None
    qualified: bool

    model_config = {"from_attributes": True}


@router.get("", response_model=list[BusinessOut])
async def list_businesses(
    city: str | None = Query(None),
    category: str | None = Query(None),
    qualified_only: bool = Query(False),
    limit: int = Query(100, le=500),
    offset: int = Query(0),
    db: AsyncSession = Depends(get_db),
) -> list:
    businesses = await business_service.get_businesses(
        db,
        city=city,
        category=category,
        qualified_only=qualified_only,
        limit=limit,
        offset=offset,
    )
    return businesses


@router.get("/{business_id}", response_model=BusinessOut)
async def get_business(
    business_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> object:
    biz = await business_service.get_business(db, business_id)
    if not biz:
        raise HTTPException(status_code=404, detail="Business not found")
    return biz


@router.post("/{business_id}/refresh-qualification", response_model=BusinessOut)
async def refresh_business_qualification(
    business_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> object:
    biz = await business_service.get_business(db, business_id)
    if not biz:
        raise HTTPException(status_code=404, detail="Business not found")
    return await business_service.refresh_qualification(db, biz)
