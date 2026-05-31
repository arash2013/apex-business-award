from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import Business, Area, Category
from .qualification import QualificationInput, compute_qualification


async def get_business(db: AsyncSession, business_id: UUID) -> Business | None:
    result = await db.execute(
        select(Business)
        .where(Business.id == business_id)
        .options(selectinload(Business.area), selectinload(Business.category))
    )
    return result.scalar_one_or_none()


async def get_businesses(
    db: AsyncSession,
    *,
    city: str | None = None,
    category: str | None = None,
    qualified_only: bool = False,
    limit: int = 100,
    offset: int = 0,
) -> list[Business]:
    query = select(Business).options(selectinload(Business.area), selectinload(Business.category))

    if city:
        query = query.join(Area, Business.area_id == Area.id).where(Area.city.ilike(f"%{city}%"))
    if category:
        query = query.join(Category, Business.category_id == Category.id).where(
            Category.name.ilike(f"%{category}%")
        )
    if qualified_only:
        query = query.where(Business.qualified.is_(True))

    query = query.limit(limit).offset(offset)
    result = await db.execute(query)
    return list(result.scalars().all())


async def refresh_qualification(db: AsyncSession, business: Business) -> Business:
    inp = QualificationInput(
        google_rating=float(business.google_rating or 0),
        google_review_count=business.google_review_count or 0,
        google_last_review_date=business.google_last_review_date,
        google_owner_response_rate=(
            float(business.google_owner_response_rate)
            if business.google_owner_response_rate is not None
            else None
        ),
        yelp_rating=float(business.yelp_rating) if business.yelp_rating else None,
        yelp_review_count=business.yelp_review_count,
    )
    result = compute_qualification(inp)
    business.qualification_score = result.score  # type: ignore[assignment]
    business.qualified = result.qualified
    if result.qualified:
        business.qualification_date = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(business)
    return business
