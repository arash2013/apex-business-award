from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..db import get_db
from ..models import Category, Business

router = APIRouter(tags=["public"])


@router.get("/categories")
async def list_categories(db: AsyncSession = Depends(get_db)):
    cats_result = await db.execute(
        select(Category).where(Category.is_active.is_(True)).order_by(Category.name)
    )
    categories = cats_result.scalars().all()

    biz_counts = {}
    if categories:
        counts_result = await db.execute(
            select(Business.category_id, func.count(Business.id).label("n"))
            .where(Business.category_id.in_([c.id for c in categories]))
            .group_by(Business.category_id)
        )
        biz_counts = {row.category_id: row.n for row in counts_result}

    return [
        {
            "id": str(c.id),
            "name": c.name,
            "slug": c.slug,
            "icon": c.icon,
            "business_count": biz_counts.get(c.id, 0),
        }
        for c in categories
    ]
