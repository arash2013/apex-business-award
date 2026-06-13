import logging
import re
from datetime import date, datetime, timezone
from urllib.parse import parse_qs, unquote_plus, urlparse

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from ..config.settings import settings
from ..services.qualification import (
    QualificationInput,
    compute_qualification,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/qualify", tags=["qualification"])

_PLACES_DETAILS = "https://maps.googleapis.com/maps/api/place/details/json"
_PLACES_FIND = "https://maps.googleapis.com/maps/api/place/findplacefromtext/json"


class QualifyRequest(BaseModel):
    google_rating: float = Field(..., ge=0.0, le=5.0)
    google_review_count: int = Field(..., ge=0, le=1_000_000)
    google_last_review_date: date | None = None
    google_owner_response_rate: float | None = Field(None, ge=0.0, le=100.0)


class QualifyResponse(BaseModel):
    score: float
    qualified: bool
    breakdown: dict[str, float]
    disqualification_reasons: list[str]


@router.post("", response_model=QualifyResponse)
async def check_qualification(body: QualifyRequest) -> QualifyResponse:
    inp = QualificationInput(
        google_rating=body.google_rating,
        google_review_count=body.google_review_count,
        google_last_review_date=body.google_last_review_date,
        google_owner_response_rate=body.google_owner_response_rate,
    )
    result = compute_qualification(inp)
    return QualifyResponse(
        score=result.score,
        qualified=result.qualified,
        breakdown=result.breakdown,
        disqualification_reasons=result.disqualification_reasons,
    )


class QualifyByUrlRequest(BaseModel):
    google_maps_url: str


class QualifyByUrlResponse(BaseModel):
    business_name: str
    business_address: str
    score: float
    qualified: bool
    breakdown: dict[str, float]
    disqualification_reasons: list[str]
    google_rating: float | None
    google_review_count: int | None


def _extract_place_id(url: str) -> str | None:
    """Extract Google Place ID (ChIJ...) from a Maps URL if present."""
    match = re.search(r"!1s(ChIJ[^!&]+)", url)
    return match.group(1) if match else None


def _extract_business_name(url: str) -> str | None:
    """Extract business name from /maps/place/<name>/ URL path segment."""
    match = re.search(r"/maps/place/([^/@?]+)", url)
    if match:
        return unquote_plus(match.group(1).replace("+", " "))
    return None


async def _resolve_place_id(client: httpx.AsyncClient, url: str) -> str:
    """Return a Place ID from any Google Maps URL, following redirects if needed."""
    resolved = url
    if "goo.gl" in url or "maps.app" in url:
        try:
            r = await client.get(url, follow_redirects=True)
            resolved = str(r.url)
        except Exception:
            pass

    place_id = _extract_place_id(resolved)
    if place_id:
        return place_id

    name = _extract_business_name(resolved)
    if name:
        resp = await client.get(
            _PLACES_FIND,
            params={
                "input": name,
                "inputtype": "textquery",
                "fields": "place_id",
                "key": settings.google_places_api_key,
            },
        )
        candidates = resp.json().get("candidates", [])
        if candidates:
            return candidates[0]["place_id"]

    raise HTTPException(
        status_code=422,
        detail=(
            "Could not extract a Place ID from that URL. "
            "Please use the full URL from your browser's address bar on Google Maps."
        ),
    )


async def _fetch_place_details(
    client: httpx.AsyncClient, place_id: str
) -> dict:
    resp = await client.get(
        _PLACES_DETAILS,
        params={
            "place_id": place_id,
            "fields": "name,formatted_address,rating,user_ratings_total,reviews",
            "key": settings.google_places_api_key,
        },
    )
    resp.raise_for_status()
    result = resp.json().get("result", {})
    if not result:
        raise HTTPException(status_code=404, detail="Business not found on Google Maps.")

    reviews = result.get("reviews", [])
    last_review_date: date | None = None
    if reviews:
        ts = max(r.get("time", 0) for r in reviews)
        if ts:
            last_review_date = datetime.fromtimestamp(ts, tz=timezone.utc).date()

    return {
        "name": result.get("name", ""),
        "address": result.get("formatted_address", ""),
        "rating": result.get("rating"),
        "review_count": result.get("user_ratings_total"),
        "last_review_date": last_review_date,
    }


@router.post("/by-url", response_model=QualifyByUrlResponse)
async def qualify_by_url(body: QualifyByUrlRequest) -> QualifyByUrlResponse:
    if not settings.google_places_api_key:
        raise HTTPException(
            status_code=503,
            detail="Google Places API is not configured. Please try again later.",
        )

    async with httpx.AsyncClient(timeout=15) as client:
        place_id = await _resolve_place_id(client, body.google_maps_url)
        details = await _fetch_place_details(client, place_id)

    inp = QualificationInput(
        google_rating=float(details["rating"] or 0),
        google_review_count=int(details["review_count"] or 0),
        google_last_review_date=details["last_review_date"],
        google_owner_response_rate=None,
    )
    result = compute_qualification(inp)

    return QualifyByUrlResponse(
        business_name=details["name"],
        business_address=details["address"],
        score=result.score,
        qualified=result.qualified,
        breakdown=result.breakdown,
        disqualification_reasons=result.disqualification_reasons,
        google_rating=details["rating"],
        google_review_count=details["review_count"],
    )
