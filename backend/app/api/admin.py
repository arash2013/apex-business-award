from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..db import get_db
from ..models import Area, Category, CrawlJob, CrawlStatus
from ..models.review import Platform

router = APIRouter(prefix="/admin", tags=["admin"])


class CrawlTriggerRequest(BaseModel):
    area_id: UUID
    category_id: UUID
    platform: Platform = Platform.google


@router.post("/crawl/trigger")
async def trigger_crawl(body: CrawlTriggerRequest, db: AsyncSession = Depends(get_db)):
    area = await db.get(Area, body.area_id)
    if not area:
        raise HTTPException(status_code=404, detail="Area not found")
    category = await db.get(Category, body.category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    job = CrawlJob(
        area_id=body.area_id,
        category_id=body.category_id,
        platform=body.platform,
        status=CrawlStatus.queued,
    )
    db.add(job)
    await db.commit()
    await db.refresh(job)

    # push to Celery queue
    from workers.tasks import run_crawl_job

    run_crawl_job.delay(str(job.id))

    return {"job_id": str(job.id), "status": job.status}


@router.get("/crawl/jobs")
async def list_crawl_jobs(
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(CrawlJob).order_by(CrawlJob.created_at.desc()).limit(limit)
    )
    jobs = result.scalars().all()
    return [
        {
            "id": str(j.id),
            "area_id": str(j.area_id) if j.area_id else None,
            "category_id": str(j.category_id) if j.category_id else None,
            "platform": j.platform,
            "status": j.status,
            "businesses_found": j.businesses_found,
            "businesses_qualified": j.businesses_qualified,
            "error_message": j.error_message,
            "started_at": j.started_at.isoformat() if j.started_at else None,
            "completed_at": j.completed_at.isoformat() if j.completed_at else None,
            "created_at": j.created_at.isoformat(),
        }
        for j in jobs
    ]
