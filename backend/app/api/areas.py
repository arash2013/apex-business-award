from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..db import get_db
from ..models import Area, Business, Award, AwardStatus

router = APIRouter(tags=["public"])


@router.get("/areas")
async def list_areas(db: AsyncSession = Depends(get_db)):
    areas_result = await db.execute(
        select(Area).where(Area.is_active.is_(True)).order_by(Area.city, Area.name)
    )
    areas = areas_result.scalars().all()

    biz_counts = {}
    if areas:
        counts_result = await db.execute(
            select(Business.area_id, func.count(Business.id).label("n"))
            .where(Business.area_id.in_([a.id for a in areas]))
            .group_by(Business.area_id)
        )
        biz_counts = {row.area_id: row.n for row in counts_result}

    return [
        {
            "id": str(a.id),
            "name": a.name,
            "city": a.city,
            "state": a.state,
            "business_count": biz_counts.get(a.id, 0),
        }
        for a in areas
    ]
