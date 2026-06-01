from typing import Annotated, Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from ..db import get_db
from ..services import business_service
from .auth import require_admin

router = APIRouter(prefix="/businesses", tags=["businesses"])

AdminUser = Annotated[dict[str, Any], Depends(require_admin)]


class BusinessOut(BaseModel):
    id: UUID
    name: str
    slug: str | None
    state: str
    area_id: UUID | None
    category_id: UUID | None
    google_rating: float | None
    google_review_count: int | None
    yelp_rating: float | None
    yelp_review_count: int | None
    qualification_score: float | None
    qualified: bool

    model_config = {"from_attributes": True}


@router.get("", response_model=list[BusinessOut])
async def list_businesses(
    city: str | None = Query(None, max_length=100),
    category: str | None = Query(None, max_length=100),
    qualified_only: bool = Query(False),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0, le=100_000),
    db: AsyncSession = Depends(get_db),
) -> list:
    return await business_service.get_businesses(
        db,
        city=city,
        category=category,
        qualified_only=qualified_only,
        limit=limit,
        offset=offset,
    )


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
    _: AdminUser,
    db: AsyncSession = Depends(get_db),
) -> object:
    biz = await business_service.get_business(db, business_id)
    if not biz:
        raise HTTPException(status_code=404, detail="Business not found")
    return await business_service.refresh_qualification(db, biz)
