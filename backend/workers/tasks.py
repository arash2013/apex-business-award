import asyncio
import logging
from datetime import datetime, timezone

from sqlalchemy import select

from .celery_app import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(name="workers.tasks.run_crawl_job", bind=True)
def run_crawl_job(self, job_id: str) -> dict:
    """Execute a single CrawlJob by ID."""
    from workers.crawl_worker import _run_crawl
    from uuid import UUID
    asyncio.run(_run_crawl(UUID(job_id)))
    return {"job_id": job_id, "status": "completed"}


@celery_app.task(name="workers.tasks.schedule_nightly_crawls")
def schedule_nightly_crawls(platform: str = "google") -> dict:
    """Queue one crawl_job per active area×category combination."""
    from app.db import AsyncSessionLocal
    from app.models import Area, Category, CrawlJob, CrawlStatus
    from app.models.review import Platform

    async def _enqueue():
        async with AsyncSessionLocal() as db:
            areas = (await db.execute(select(Area).where(Area.is_active.is_(True)))).scalars().all()
            cats = (await db.execute(select(Category).where(Category.is_active.is_(True)))).scalars().all()
            now = datetime.now(timezone.utc)
            job_ids = []
            for area in areas:
                for cat in cats:
                    job = CrawlJob(
                        area_id=area.id,
                        category_id=cat.id,
                        platform=Platform(platform),
                        status=CrawlStatus.queued,
                    )
                    db.add(job)
                    await db.flush()
                    job_ids.append(str(job.id))
            await db.commit()
            return job_ids

    job_ids = asyncio.run(_enqueue())
    for jid in job_ids:
        run_crawl_job.delay(jid)
    return {"queued": len(job_ids), "platform": platform}


@celery_app.task(name="workers.tasks.send_outreach_email")
def send_outreach_email(outreach_id: str) -> dict:
    """Send a single outreach email via SendGrid."""
    from workers.email_worker import _send_outreach
    from uuid import UUID
    asyncio.run(_send_outreach(UUID(outreach_id)))
    return {"status": "sent", "outreach_id": outreach_id}


@celery_app.task(name="workers.tasks.send_outreach_follow_up")
def send_outreach_follow_up(business_id: str, award_id: str, email: str, step: int) -> dict:
    """Create and send a follow-up outreach email for a specific step."""
    from app.db import AsyncSessionLocal
    from app.models import Outreach, OutreachStatus
    from uuid import UUID

    async def _create_and_send():
        async with AsyncSessionLocal() as db:
            outreach = Outreach(
                business_id=UUID(business_id),
                award_id=UUID(award_id),
                email_address=email,
                sequence_step=step,
                status=OutreachStatus.pending,
            )
            db.add(outreach)
            await db.commit()
            await db.refresh(outreach)
            return outreach.id

    outreach_id = asyncio.run(_create_and_send())
    send_outreach_email.delay(str(outreach_id))
    return {"status": "scheduled", "step": step}


@celery_app.task(name="workers.tasks.refresh_all_qualifications")
def refresh_all_qualifications() -> dict:
    """Recompute qualification scores for all businesses."""
    from app.db import AsyncSessionLocal
    from app.models import Business
    from app.services.business_service import refresh_qualification

    async def _refresh():
        async with AsyncSessionLocal() as db:
            businesses = (await db.execute(select(Business))).scalars().all()
            for biz in businesses:
                await refresh_qualification(db, biz)
            return len(businesses)

    count = asyncio.run(_refresh())
    return {"status": "completed", "updated": count}
