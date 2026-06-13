"""Crawl worker — Google Places API integration."""

import logging
from datetime import datetime, timezone
from uuid import UUID

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import AsyncSessionLocal
from app.models import (
    Area,
    Business,
    Category,
    CrawlJob,
    CrawlJobResult,
    CrawlResultAction,
    CrawlStatus,
)
from app.config.settings import settings
from workers.qualification import QualificationInput, compute_qualification

logger = logging.getLogger(__name__)

_PLACES_TEXTSEARCH = "https://maps.googleapis.com/maps/api/place/textsearch/json"
_PLACES_DETAILS = "https://maps.googleapis.com/maps/api/place/details/json"


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
            category = (
                await db.get(Category, job.category_id) if job.category_id else None
            )

            raw_results = await _fetch_google_places(area, category)

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

            logger.info(
                "CrawlJob %s completed: %d found, %d qualified",
                job_id,
                found,
                qualified_count,
            )

        except Exception:
            job.status = CrawlStatus.failed
            job.completed_at = datetime.now(timezone.utc)
            await db.commit()
            logger.exception("CrawlJob %s failed", job_id)
            raise


async def _fetch_google_places(
    area: Area | None, category: Category | None
) -> list[dict]:
    """Search Google Places Text Search for businesses in the given area/category."""
    if not settings.google_places_api_key:
        logger.warning("GOOGLE_PLACES_API_KEY not set — skipping crawl")
        return []

    city = area.name if area else settings.brand_city
    state = area.state if area else settings.brand_state
    cat_name = category.name if category else "business"
    query = f"{cat_name} in {city}, {state}"

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(
            _PLACES_TEXTSEARCH,
            params={"query": query, "key": settings.google_places_api_key},
        )
        resp.raise_for_status()

        results = []
        for place in resp.json().get("results", []):
            place_id = place.get("place_id")
            if not place_id:
                continue

            last_review_date = await _fetch_last_review_date(client, place_id)

            results.append(
                {
                    "place_id": place_id,
                    "name": place.get("name", ""),
                    "address": place.get("formatted_address", ""),
                    "rating": place.get("rating"),
                    "review_count": place.get("user_ratings_total"),
                    "last_review_date": last_review_date,
                    "owner_response_rate": None,
                }
            )

        return results


async def _fetch_last_review_date(
    client: httpx.AsyncClient, place_id: str
) -> datetime | None:
    """Return the timestamp of the most recent Google review for a place."""
    try:
        resp = await client.get(
            _PLACES_DETAILS,
            params={
                "place_id": place_id,
                "fields": "reviews",
                "key": settings.google_places_api_key,
            },
        )
        resp.raise_for_status()
        reviews = resp.json().get("result", {}).get("reviews", [])
        if reviews:
            ts = max(r.get("time", 0) for r in reviews)
            return datetime.fromtimestamp(ts, tz=timezone.utc) if ts else None
    except Exception:
        logger.warning("Place Details fetch failed for %s", place_id)
    return None


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
        biz.google_last_review_date = raw.get(
            "last_review_date", biz.google_last_review_date
        )
        action = CrawlResultAction.updated

    inp = QualificationInput(
        google_rating=float(biz.google_rating or 0),
        google_review_count=biz.google_review_count or 0,
        google_last_review_date=biz.google_last_review_date,
        google_owner_response_rate=(
            float(biz.google_owner_response_rate)
            if biz.google_owner_response_rate
            else None
        ),
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
