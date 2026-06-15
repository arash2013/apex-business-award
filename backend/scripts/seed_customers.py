"""
Seed the two founding customers: Malikah Studio (premium) and Euphoric Wraps (pro).

Run on Railway (or locally with DATABASE_URL + GOOGLE_PLACES_API_KEY set):

    cd backend
    python -m scripts.seed_customers

The script is idempotent — safe to run multiple times.
"""

import asyncio
import re
import sys
from datetime import datetime, timezone
from urllib.parse import parse_qs, unquote_plus, urlparse

import httpx
from sqlalchemy import select

sys.path.insert(0, ".")

from app.config.settings import settings
from app.db import AsyncSessionLocal
from app.models import Area, Award, Business, Category, Customer
from app.models.award import AwardStatus, AwardTier
from app.models.review import Platform
from app.services.qualification import QualificationInput, compute_qualification

# ── Business definitions ─────────────────────────────────────────────────────

BUSINESSES = [
    {
        "share_url": "https://share.google/hVKd2uxIQ8hyB4E5B",
        "name_hint": "Malikah Studio",
        "category_name": "Cosmetology",
        "category_slug": "cosmetology",
        "tier": AwardTier.premium,
        "customer": {
            "first_name": "Malikah",
            "last_name": "Studio",
            "email": "info@malikahstudio.com",
        },
    },
    {
        "share_url": "https://share.google/UvbmMjR8MjWxOQFkn",
        "name_hint": "Euphoric Wraps",
        "category_name": "Vehicle Wrapping",
        "category_slug": "vehicle-wrapping",
        "tier": AwardTier.pro,
        "customer": {
            "first_name": "Euphoric",
            "last_name": "Wraps",
            "email": "info@euphoricwraps.com",
        },
    },
]

_BROWSER_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) "
        "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
    ),
    "Accept": "text/html,application/xhtml+xml,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}

_PLACES_FIND = "https://maps.googleapis.com/maps/api/place/findplacefromtext/json"
_PLACES_DETAILS = "https://maps.googleapis.com/maps/api/place/details/json"


async def _resolve_place_id(client: httpx.AsyncClient, share_url: str, name_hint: str) -> str:
    """Follow redirects to get Place ID, falling back to name search."""
    try:
        r = await client.get(share_url, follow_redirects=True, headers=_BROWSER_HEADERS, timeout=15)
        resolved = str(r.url)
        print(f"  Resolved URL: {resolved[:100]}")
        match = re.search(r"!1s(ChIJ[^!&]+)", resolved)
        if match:
            return match.group(1)
        name_match = re.search(r"/maps/place/([^/@?]+)", resolved)
        if name_match:
            name_hint = unquote_plus(name_match.group(1).replace("+", " "))
    except Exception as e:
        print(f"  Redirect failed ({e}), falling back to name search")

    # Fall back to Find Place from Text
    resp = await client.get(
        _PLACES_FIND,
        params={
            "input": name_hint,
            "inputtype": "textquery",
            "fields": "place_id",
            "locationbias": "circle:80000@29.7604,-95.3698",
            "key": settings.google_places_api_key,
        },
        timeout=10,
    )
    candidates = resp.json().get("candidates", [])
    if not candidates:
        raise RuntimeError(f"Could not find Place ID for '{name_hint}'")
    return candidates[0]["place_id"]


async def _fetch_details(client: httpx.AsyncClient, place_id: str) -> dict:
    resp = await client.get(
        _PLACES_DETAILS,
        params={
            "place_id": place_id,
            "fields": "name,formatted_address,rating,user_ratings_total,reviews,formatted_phone_number,website",
            "key": settings.google_places_api_key,
        },
        timeout=10,
    )
    resp.raise_for_status()
    result = resp.json().get("result", {})
    if not result:
        raise RuntimeError(f"Empty details for place_id={place_id}")
    return result


async def _get_or_create_category(db, name: str, slug: str) -> Category:
    row = await db.execute(select(Category).where(Category.slug == slug))
    cat = row.scalar_one_or_none()
    if cat:
        return cat
    cat = Category(name=name, slug=slug, is_active=True)
    db.add(cat)
    await db.flush()
    return cat


async def _get_or_create_area(db, city: str, state: str) -> Area:
    row = await db.execute(select(Area).where(Area.city == city, Area.state == state))
    area = row.scalar_one_or_none()
    if area:
        return area
    area = Area(name=city, city=city, state=state, is_active=True)
    db.add(area)
    await db.flush()
    return area


async def seed_business(db, definition: dict, client: httpx.AsyncClient) -> None:
    name_hint = definition["name_hint"]
    print(f"\n── {name_hint} ──")

    # Resolve place details from Google
    place_id = await _resolve_place_id(client, definition["share_url"], name_hint)
    print(f"  Place ID: {place_id}")
    details = await _fetch_details(client, place_id)
    print(f"  Name: {details.get('name')}")
    print(f"  Address: {details.get('formatted_address')}")
    print(f"  Rating: {details.get('rating')} ({details.get('user_ratings_total')} reviews)")

    # Idempotency — skip if already in DB
    existing = await db.execute(select(Business).where(Business.google_place_id == place_id))
    biz = existing.scalar_one_or_none()
    if biz:
        print(f"  Already exists (id={biz.id}) — skipping")
        return

    # Parse last review date
    from datetime import date
    reviews = details.get("reviews", [])
    last_review_date: date | None = None
    if reviews:
        ts = max(r.get("time", 0) for r in reviews)
        if ts:
            last_review_date = datetime.fromtimestamp(ts, tz=timezone.utc).date()

    # Compute qualification
    rating = float(details.get("rating") or 0)
    review_count = int(details.get("user_ratings_total") or 0)
    inp = QualificationInput(
        google_rating=rating,
        google_review_count=review_count,
        google_last_review_date=last_review_date,
        google_owner_response_rate=None,
    )
    result = compute_qualification(inp)
    print(f"  Score: {result.score:.1f}  Qualified: {result.qualified}")

    # Derive city/state from address
    address = details.get("formatted_address", "")
    city, state = "Houston", "TX"
    parts = [p.strip() for p in address.split(",")]
    if len(parts) >= 2:
        city = parts[-3] if len(parts) >= 3 else parts[-2]
        state_zip = parts[-2].strip().split()
        if state_zip:
            state = state_zip[0]

    # Category, area
    category = await _get_or_create_category(db, definition["category_name"], definition["category_slug"])
    area = await _get_or_create_area(db, city, state)

    # Build slug
    import unicodedata
    slug_base = re.sub(r"[^a-z0-9]+", "-", unicodedata.normalize("NFD", details["name"].lower())).strip("-")

    # Business
    biz = Business(
        google_place_id=place_id,
        name=details["name"],
        slug=slug_base,
        address=address,
        state=state,
        phone=details.get("formatted_phone_number"),
        website=details.get("website"),
        area_id=area.id,
        category_id=category.id,
        google_rating=rating,
        google_review_count=review_count,
        google_last_review_date=last_review_date,
        qualification_score=result.score,
        qualified=result.qualified,
        qualification_date=datetime.now(timezone.utc) if result.qualified else None,
    )
    db.add(biz)
    await db.flush()

    # Award
    from app.config.settings import settings as s
    award = Award(
        business_id=biz.id,
        area_id=area.id,
        category_id=category.id,
        platform=Platform.google,
        award_name=f"{s.brand_name} · {definition['category_name']} · {s.brand_year} · {city}",
        year=s.brand_year,
        tier=definition["tier"],
        status=AwardStatus.purchased,
        offered_at=datetime.now(timezone.utc),
        purchased_at=datetime.now(timezone.utc),
        amount_paid={
            AwardTier.premium: s.tier_price_premium,
            AwardTier.pro: s.tier_price_pro,
            AwardTier.basic: s.tier_price_basic,
        }[definition["tier"]],
    )
    db.add(award)
    await db.flush()

    # Customer
    cdef = definition["customer"]
    customer = Customer(
        business_id=biz.id,
        first_name=cdef["first_name"],
        last_name=cdef["last_name"],
        email=cdef["email"],
        phone=details.get("formatted_phone_number"),
    )
    db.add(customer)

    print(f"  ✓ Created business={biz.id} award={award.id} tier={definition['tier'].value}")


async def main() -> None:
    if not settings.google_places_api_key:
        print("ERROR: GOOGLE_PLACES_API_KEY is not set", file=sys.stderr)
        sys.exit(1)

    print("Seeding founding customers...")
    async with httpx.AsyncClient() as client:
        async with AsyncSessionLocal() as db:
            for defn in BUSINESSES:
                await seed_business(db, defn, client)
            await db.commit()

    print("\nDone.")


if __name__ == "__main__":
    asyncio.run(main())
