from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import and_, select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from ..db import get_db
from ..models import Business, Award, AwardStatus, Area, Category, AwardTier
from ..config.settings import settings

router = APIRouter(tags=["public"])

ACTIVE_STATUSES = (AwardStatus.purchased, AwardStatus.fulfilled)


def _serialize_winner(b: Business, award: Award) -> dict:
    return {
        "id": str(b.id),
        "slug": b.slug,
        "name": b.name,
        "area_id": str(b.area_id) if b.area_id else None,
        "area_name": b.area.name if b.area else None,
        "city": b.area.city if b.area else None,
        "category_id": str(b.category_id) if b.category_id else None,
        "category_name": b.category.name if b.category else None,
        "category_slug": b.category.slug if b.category else None,
        "google_rating": float(b.google_rating) if b.google_rating else None,
        "google_review_count": b.google_review_count,
        "qualification_score": (
            float(b.qualification_score) if b.qualification_score else None
        ),
        "award_id": str(award.id),
        "tier": award.tier,
        "year": award.year,
        "phone": b.phone,
        "website": b.website,
        "address": b.address,
    }


@router.get("/winners")
async def list_winners(
    area_id: UUID | None = Query(None),
    city: str | None = Query(None),
    category_id: UUID | None = Query(None),
    category_slug: str | None = Query(None),
    year: int = Query(settings.brand_year),
    tier: AwardTier | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, le=100),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Business, Award)
        .join(
            Award,
            and_(
                Award.business_id == Business.id,
                Award.status.in_(ACTIVE_STATUSES),
                Award.year == year,
            ),
        )
        .options(selectinload(Business.area), selectinload(Business.category))
    )

    if area_id:
        stmt = stmt.where(Business.area_id == area_id)
    elif city:
        stmt = stmt.join(Area, Business.area_id == Area.id).where(
            Area.city.ilike(f"%{city}%")
        )

    if category_id:
        stmt = stmt.where(Business.category_id == category_id)
    elif category_slug:
        stmt = stmt.join(Category, Business.category_id == Category.id).where(
            Category.slug == category_slug
        )

    if tier:
        stmt = stmt.where(Award.tier == tier)

    stmt = (
        stmt.order_by(Business.qualification_score.desc().nulls_last())
        .offset((page - 1) * limit)
        .limit(limit)
    )

    result = await db.execute(stmt)
    rows = result.all()

    return {
        "page": page,
        "limit": limit,
        "results": [_serialize_winner(b, aw) for b, aw in rows],
    }


@router.get("/winners/{slug}")
async def get_winner(slug: str, db: AsyncSession = Depends(get_db)):
    stmt = (
        select(Business)
        .where(Business.slug == slug)
        .options(
            selectinload(Business.area),
            selectinload(Business.category),
            selectinload(Business.awards),
            selectinload(Business.reviews),
        )
    )
    result = await db.execute(stmt)
    biz = result.scalar_one_or_none()

    if not biz:
        raise HTTPException(status_code=404, detail="Winner not found")

    active_award = next(
        (
            a
            for a in biz.awards
            if a.status in ACTIVE_STATUSES
            and a.tier in (AwardTier.pro, AwardTier.premium)
        ),
        None,
    )
    if not active_award:
        raise HTTPException(status_code=404, detail="Winner not found")

    top_reviews = sorted(biz.reviews, key=lambda r: r.review_date or "", reverse=True)[
        :5
    ]

    return {
        **_serialize_winner(biz, active_award),
        "yelp_rating": float(biz.yelp_rating) if biz.yelp_rating else None,
        "yelp_review_count": biz.yelp_review_count,
        "years_in_business": biz.years_in_business,
        "reviews": [
            {
                "platform": r.platform,
                "reviewer_name": r.reviewer_name,
                "rating": r.rating,
                "review_text": r.review_text,
                "review_date": r.review_date.isoformat() if r.review_date else None,
            }
            for r in top_reviews
        ],
    }
