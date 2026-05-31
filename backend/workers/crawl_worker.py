"""Crawl worker — SerpAPI + qualification scoring per crawl job."""
import logging
from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import AsyncSessionLocal
from app.models import Area, Category, Business, CrawlJob, CrawlJobResult, CrawlStatus, CrawlResultAction
from app.config.settings import settings
from workers.qualification import QualificationInput, compute_qualification

logger = logging.getLogger(__name__)


async def _run_crawl(job_id: UUID) -> None:
    async with AsyncSessionLocal() as db:
        job: CrawlJob | None = await db.get(CrawlJob, job_id)
        if not job:
            logger.error("CrawlJob %s not found", job_id)
            return

        job.status = CrawlStatus.running
        job.started_at = datetime.now(timezone.utc)
        await db.commit()

        try:
            area = await db.get(Area, job.area_id) if job.area_id else None
            category = await db.get(Category, job.category_id) if job.category_id else None

            # TODO: replace stub with real SerpAPI call
            # raw_results = await _fetch_serpapi(area, category, job.platform)
            raw_results = _stub_serpapi_results(area, category)

            found = 0
            qualified_count = 0

            for raw in raw_results:
                action = await _upsert_business(db, raw, job, area, category)
                found += 1
                if action == CrawlResultAction.qualified:
                    qualified_count += 1

            job.businesses_found = found
            job.businesses_qualified = qualified_count
            job.status = CrawlStatus.completed
            job.completed_at = datetime.now(timezone.utc)
            await db.commit()

            logger.info("CrawlJob %s completed: %d found, %d qualified", job_id, found, qualified_count)

        except Exception as exc:
            job.status = CrawlStatus.failed
            job.error_message = str(exc)
            job.completed_at = datetime.now(timezone.utc)
            await db.commit()
            logger.exception("CrawlJob %s failed", job_id)
            raise


async def _upsert_business(
    db: AsyncSession,
    raw: dict,
    job: CrawlJob,
    area: Area | None,
    category: Category | None,
) -> CrawlResultAction:
    existing = await db.execute(
        select(Business).where(Business.google_place_id == raw.get("place_id"))
    )
    biz = existing.scalar_one_or_none()

    if biz is None:
        biz = Business(
            google_place_id=raw.get("place_id"),
            name=raw["name"],
            address=raw.get("address"),
            state=area.state if area else "TX",
            area_id=area.id if area else None,
            category_id=category.id if category else None,
            google_rating=raw.get("rating"),
            google_review_count=raw.get("review_count"),
            google_last_review_date=raw.get("last_review_date"),
            google_owner_response_rate=raw.get("owner_response_rate"),
        )
        db.add(biz)
        action = CrawlResultAction.created
    else:
        biz.google_rating = raw.get("rating", biz.google_rating)
        biz.google_review_count = raw.get("review_count", biz.google_review_count)
        biz.google_last_review_date = raw.get("last_review_date", biz.google_last_review_date)
        action = CrawlResultAction.updated

    # score and qualify
    inp = QualificationInput(
        google_rating=float(biz.google_rating or 0),
        google_review_count=biz.google_review_count or 0,
        google_last_review_date=biz.google_last_review_date,
        google_owner_response_rate=float(biz.google_owner_response_rate) if biz.google_owner_response_rate else None,
        yelp_rating=float(biz.yelp_rating) if biz.yelp_rating else None,
        yelp_review_count=biz.yelp_review_count,
    )
    result = compute_qualification(inp)
    biz.qualification_score = result.score  # type: ignore[assignment]
    was_qualified = biz.qualified
    biz.qualified = result.qualified
    if result.qualified and not was_qualified:
        biz.qualification_date = datetime.now(timezone.utc)
        action = CrawlResultAction.qualified
    elif not result.qualified and was_qualified:
        action = CrawlResultAction.disqualified

    await db.flush()

    crawl_result = CrawlJobResult(
        crawl_job_id=job.id,
        business_id=biz.id,
        action=action,
    )
    db.add(crawl_result)

    return action


def _stub_serpapi_results(area: Area | None, category: Category | None) -> list[dict]:
    """Stub — returns empty list until SerpAPI is wired."""
    return []
