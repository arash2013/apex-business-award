import logging
import re
from datetime import date, datetime, timezone
from urllib.parse import parse_qs, unquote_plus, urlparse

import httpx
from fastapi import APIRouter, HTTPException, Query
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

# Browser headers so Google share/short URLs follow through properly
_BROWSER_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) "
        "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}


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
    """Extract Google Place ID (ChIJ…) from a Maps URL data parameter."""
    match = re.search(r"!1s(ChIJ[^!&]+)", url)
    return match.group(1) if match else None


def _extract_business_name(url: str) -> str | None:
    """Extract business name from /maps/place/<name>/ path segment."""
    match = re.search(r"/maps/place/([^/@?]+)", url)
    if match:
        return unquote_plus(match.group(1).replace("+", " "))
    return None


def _extract_query_text(url: str) -> str | None:
    """Extract free-text query from ?q= or ?query= parameter (fallback)."""
    qs = parse_qs(urlparse(url).query)
    for key in ("q", "query"):
        vals = qs.get(key)
        if vals and vals[0].strip():
            return vals[0].strip()
    return None


def _extract_cid(url: str) -> str | None:
    """Extract numeric CID from ?cid= parameter."""
    qs = parse_qs(urlparse(url).query)
    vals = qs.get("cid")
    if vals and vals[0].isdigit():
        return vals[0]
    return None


def _is_short_url(url: str) -> bool:
    return any(h in url for h in ("goo.gl", "maps.app", "share.google", "g.co"))


async def _follow_to_maps(client: httpx.AsyncClient, url: str) -> str:
    """Follow redirects with browser headers; return the final URL."""
    try:
        r = await client.get(url, follow_redirects=True, headers=_BROWSER_HEADERS)
        final = str(r.url)
        logger.info("Resolved %s → %s", url, final)
        return final
    except Exception as exc:
        logger.warning("Redirect follow failed for %s: %s", url, exc)
        return url


async def _text_search_place_id(client: httpx.AsyncClient, query: str) -> str | None:
    """Try Places findplacefromtext with a text query; return Place ID or None."""
    try:
        resp = await client.get(
            _PLACES_FIND,
            params={
                "input": query,
                "inputtype": "textquery",
                "fields": "place_id",
                "key": settings.google_places_api_key,
            },
        )
        candidates = resp.json().get("candidates", [])
        if candidates:
            return candidates[0]["place_id"]
    except Exception as exc:
        logger.warning("findplacefromtext failed for %r: %s", query, exc)
    return None


async def _resolve_place_id(client: httpx.AsyncClient, url: str) -> str:
    """Return a Place ID from any Google Maps / share URL."""
    # Step 1: follow redirects for short/share URLs
    resolved = url
    if _is_short_url(url):
        resolved = await _follow_to_maps(client, url)

    # Step 2: try Place ID directly in data parameter
    place_id = _extract_place_id(resolved)
    if place_id:
        return place_id

    # Step 3: business name in /maps/place/<name>/ path
    name = _extract_business_name(resolved)
    if name:
        pid = await _text_search_place_id(client, name)
        if pid:
            return pid

    # Step 4: ?cid= parameter — use CID as text query (sometimes resolves)
    cid = _extract_cid(resolved)
    if cid:
        pid = await _text_search_place_id(client, f"cid:{cid}")
        if pid:
            return pid

    # Step 5: ?q= free-text query
    query = _extract_query_text(resolved)
    if query:
        pid = await _text_search_place_id(client, query)
        if pid:
            return pid

    # Step 6: if the short URL resolution didn't fully expand (e.g. share.google →
    # another short URL), try one more hop
    if _is_short_url(resolved) and resolved != url:
        double_resolved = await _follow_to_maps(client, resolved)
        if double_resolved != resolved:
            place_id = _extract_place_id(double_resolved)
            if place_id:
                return place_id
            name = _extract_business_name(double_resolved)
            if name:
                pid = await _text_search_place_id(client, name)
                if pid:
                    return pid

    raise HTTPException(
        status_code=422,
        detail=(
            "Could not resolve a business from that URL. "
            "Try copying the full URL from your browser's address bar on Google Maps, "
            "or use the Share → Copy link option in the Google Maps app."
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


def _no_api_key() -> None:
    if not settings.google_places_api_key:
        raise HTTPException(
            status_code=503,
            detail="Google Places API is not configured. Please try again later.",
        )


# ── Autocomplete ────────────────────────────────────────────────────────────

class AutocompleteResult(BaseModel):
    place_id: str
    name: str
    address: str


@router.get("/autocomplete", response_model=list[AutocompleteResult])
async def autocomplete(
    q: str = Query(..., min_length=2, max_length=200),
) -> list[AutocompleteResult]:
    """Return up to 5 business suggestions matching the query.

    Uses Find Place from Text, which resolves exact business names for all
    business types including service-area businesses with no physical address.
    Falls back to Autocomplete for partial-match / in-progress typing.
    """
    _no_api_key()
    q = q.strip()
    if len(q) < 2:
        return []

    async with httpx.AsyncClient(timeout=10) as client:
        # Primary: Find Place from Text — best exact-name match, covers all
        # business types including service-area businesses without an address.
        find_resp = await client.get(
            _PLACES_FIND,
            params={
                "input": q,
                "inputtype": "textquery",
                "fields": "place_id,name,formatted_address",
                "key": settings.google_places_api_key,
            },
        )
        candidates = find_resp.json().get("candidates", [])

        # Fallback: Autocomplete for partial queries (Find Place needs ~full name)
        if not candidates:
            auto_resp = await client.get(
                "https://maps.googleapis.com/maps/api/place/autocomplete/json",
                params={
                    "input": q,
                    "key": settings.google_places_api_key,
                },
            )
            for p in auto_resp.json().get("predictions", [])[:5]:
                fmt = p.get("structured_formatting", {})
                candidates.append(
                    {
                        "place_id": p["place_id"],
                        "name": fmt.get("main_text") or p.get("description", ""),
                        "formatted_address": fmt.get("secondary_text") or "",
                    }
                )

    results: list[AutocompleteResult] = []
    for c in candidates[:5]:
        results.append(
            AutocompleteResult(
                place_id=c["place_id"],
                name=c.get("name", ""),
                address=c.get("formatted_address", ""),
            )
        )
    return results


# ── Qualify by Place ID ─────────────────────────────────────────────────────

class QualifyByPlaceIdRequest(BaseModel):
    place_id: str


@router.post("/by-place-id", response_model=QualifyByUrlResponse)
async def qualify_by_place_id(body: QualifyByPlaceIdRequest) -> QualifyByUrlResponse:
    _no_api_key()
    async with httpx.AsyncClient(timeout=15) as client:
        details = await _fetch_place_details(client, body.place_id)

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


# ── Qualify by URL (kept for backward compat) ───────────────────────────────

@router.post("/by-url", response_model=QualifyByUrlResponse)
async def qualify_by_url(body: QualifyByUrlRequest) -> QualifyByUrlResponse:
    _no_api_key()

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
