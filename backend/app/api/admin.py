from typing import Annotated, Any
from uuid import UUID
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from ..db import get_db
from ..models import Area, Category, CrawlJob, CrawlStatus, Business, Award, Outreach
from ..models.review import Platform
from .auth import require_admin

router = APIRouter(prefix="/admin", tags=["admin"])

AdminUser = Annotated[dict[str, Any], Depends(require_admin)]


class CrawlTriggerRequest(BaseModel):
    area_id: UUID
    category_id: UUID
    platform: Platform = Platform.google


@router.post("/crawl/trigger")
async def trigger_crawl(
    body: CrawlTriggerRequest,
    _: AdminUser,
    db: AsyncSession = Depends(get_db),
):
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
    _: AdminUser,
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


class AdminBusinessOut(BaseModel):
    id: str
    name: str
    address: str | None
    phone: str | None
    website: str | None
    category_name: str | None
    area_name: str | None
    google_rating: float | None
    google_review_count: int | None
    qualification_score: float | None
    qualified: bool
    award_tier: str | None
    award_status: str | None
    outreach_status: str | None
    model_config = {"from_attributes": True}

class AdminOutreachOut(BaseModel):
    id: str
    business_id: str
    business_name: str
    email_address: str
    sequence_step: int
    status: str
    sent_at: datetime | None
    opened_at: datetime | None
    clicked_at: datetime | None
    created_at: datetime
    model_config = {"from_attributes": True}

class AdminAwardOut(BaseModel):
    id: str
    business_id: str
    business_name: str
    category_name: str | None
    area_name: str | None
    tier: str
    status: str
    year: int
    qualification_score: float | None
    offered_at: datetime | None
    purchased_at: datetime | None
    fulfilled_at: datetime | None
    model_config = {"from_attributes": True}

class AdminAnalyticsOut(BaseModel):
    businesses_discovered: int
    businesses_qualified: int
    outreach_sent: int
    outreach_opened: int
    outreach_clicked: int
    outreach_responded: int
    awards_offered: int
    awards_purchased: int
    awards_fulfilled: int
    revenue_cents: int


@router.get("/businesses", response_model=list[AdminBusinessOut])
async def admin_businesses(
    limit: int = 200,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin),
):
    result = await db.execute(
        select(Business)
        .options(
            selectinload(Business.category),
            selectinload(Business.area),
            selectinload(Business.awards),
            selectinload(Business.outreach_records),
        )
        .limit(limit)
    )
    businesses = result.scalars().all()
    out = []
    for b in businesses:
        active_award = next((a for a in b.awards if a.status != "expired"), None)
        sorted_outreach = sorted(b.outreach_records, key=lambda o: o.created_at, reverse=True)
        out.append(AdminBusinessOut(
            id=b.id,
            name=b.name,
            address=b.address,
            phone=b.phone,
            website=b.website,
            category_name=b.category.name if b.category else None,
            area_name=b.area.name if b.area else None,
            google_rating=b.google_rating,
            google_review_count=b.google_review_count,
            qualification_score=b.qualification_score,
            qualified=b.qualified,
            award_tier=active_award.tier if active_award else None,
            award_status=active_award.status if active_award else None,
            outreach_status=sorted_outreach[0].status if sorted_outreach else None,
        ))
    return out


@router.get("/outreach", response_model=list[AdminOutreachOut])
async def admin_outreach(
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin),
):
    result = await db.execute(
        select(Outreach)
        .options(selectinload(Outreach.business))
        .order_by(Outreach.created_at.desc())
        .limit(500)
    )
    records = result.scalars().all()
    return [
        AdminOutreachOut(
            id=r.id,
            business_id=r.business_id,
            business_name=r.business.name,
            email_address=r.email_address,
            sequence_step=r.sequence_step,
            status=r.status,
            sent_at=r.sent_at,
            opened_at=r.opened_at,
            clicked_at=r.clicked_at,
            created_at=r.created_at,
        )
        for r in records
    ]


@router.get("/awards", response_model=list[AdminAwardOut])
async def admin_awards(
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin),
):
    result = await db.execute(
        select(Award)
        .options(
            selectinload(Award.business),
            selectinload(Award.category),
            selectinload(Award.area),
        )
        .order_by(Award.created_at.desc())
    )
    awards = result.scalars().all()
    return [
        AdminAwardOut(
            id=a.id,
            business_id=a.business_id,
            business_name=a.business.name,
            category_name=a.category.name if a.category else None,
            area_name=a.area.name if a.area else None,
            tier=a.tier,
            status=a.status,
            year=a.year,
            qualification_score=a.qualification_score,
            offered_at=a.offered_at,
            purchased_at=a.purchased_at,
            fulfilled_at=a.fulfilled_at,
        )
        for a in awards
    ]


@router.get("/analytics", response_model=AdminAnalyticsOut)
async def admin_analytics(
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin),
):
    async def count(model, *filters):
        q = select(func.count()).select_from(model)
        for f in filters:
            q = q.where(f)
        r = await db.execute(q)
        return r.scalar() or 0

    businesses_discovered = await count(Business)
    businesses_qualified = await count(Business, Business.qualified == True)
    outreach_sent = await count(Outreach, Outreach.status.in_(["sent", "opened", "clicked", "responded", "bounced"]))
    outreach_opened = await count(Outreach, Outreach.status.in_(["opened", "clicked", "responded"]))
    outreach_clicked = await count(Outreach, Outreach.status.in_(["clicked", "responded"]))
    outreach_responded = await count(Outreach, Outreach.status == "responded")
    awards_offered = await count(Award, Award.status == "offered")
    awards_purchased = await count(Award, Award.status == "purchased")
    awards_fulfilled = await count(Award, Award.status == "fulfilled")

    rev_result = await db.execute(
        select(func.sum(Award.amount_paid)).where(Award.amount_paid.isnot(None))
    )
    rev = rev_result.scalar() or 0
    revenue_cents = int(float(rev) * 100)

    return AdminAnalyticsOut(
        businesses_discovered=businesses_discovered,
        businesses_qualified=businesses_qualified,
        outreach_sent=outreach_sent,
        outreach_opened=outreach_opened,
        outreach_clicked=outreach_clicked,
        outreach_responded=outreach_responded,
        awards_offered=awards_offered,
        awards_purchased=awards_purchased,
        awards_fulfilled=awards_fulfilled,
        revenue_cents=revenue_cents,
    )
