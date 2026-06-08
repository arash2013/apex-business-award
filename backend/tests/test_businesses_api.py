"""Integration tests for GET /api/v1/businesses endpoints.

DB dependency is overridden with a mock so no real database is needed.
"""

from unittest.mock import AsyncMock, MagicMock, patch
from uuid import UUID, uuid4

import pytest
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.db import get_db


# ── Fixtures ───────────────────────────────────────────────────────────────

def _make_business(**overrides) -> MagicMock:
    biz = MagicMock()
    biz.id = overrides.get("id", uuid4())
    biz.name = overrides.get("name", "Test Bistro")
    biz.slug = overrides.get("slug", "test-bistro")
    biz.state = overrides.get("state", "TX")
    biz.area_id = overrides.get("area_id", None)
    biz.category_id = overrides.get("category_id", None)
    biz.google_rating = overrides.get("google_rating", 4.5)
    biz.google_review_count = overrides.get("google_review_count", 150)
    biz.yelp_rating = overrides.get("yelp_rating", 4.3)
    biz.yelp_review_count = overrides.get("yelp_review_count", 80)
    biz.qualification_score = overrides.get("qualification_score", 78.5)
    biz.qualified = overrides.get("qualified", True)
    return biz


async def _mock_db():
    yield MagicMock()


# ── List endpoint tests ────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_list_businesses_returns_200():
    sample = [_make_business(), _make_business(name="Second Cafe", slug="second-cafe")]

    with patch("app.services.business_service.get_businesses", new=AsyncMock(return_value=sample)):
        app.dependency_overrides[get_db] = _mock_db
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.get("/api/v1/businesses")
        app.dependency_overrides.clear()

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 2


@pytest.mark.asyncio
async def test_list_businesses_returns_correct_fields():
    biz_id = uuid4()
    sample = [_make_business(id=biz_id, name="Houston Eats", slug="houston-eats")]

    with patch("app.services.business_service.get_businesses", new=AsyncMock(return_value=sample)):
        app.dependency_overrides[get_db] = _mock_db
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.get("/api/v1/businesses")
        app.dependency_overrides.clear()

    item = response.json()[0]
    assert item["name"] == "Houston Eats"
    assert item["slug"] == "houston-eats"
    assert item["qualified"] is True
    assert "google_rating" in item
    assert "qualification_score" in item


@pytest.mark.asyncio
async def test_list_businesses_empty():
    with patch("app.services.business_service.get_businesses", new=AsyncMock(return_value=[])):
        app.dependency_overrides[get_db] = _mock_db
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.get("/api/v1/businesses")
        app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.asyncio
async def test_list_businesses_passes_qualified_only_param():
    captured_kwargs: dict = {}

    async def mock_get_businesses(db, **kwargs):
        captured_kwargs.update(kwargs)
        return []

    with patch("app.services.business_service.get_businesses", new=mock_get_businesses):
        app.dependency_overrides[get_db] = _mock_db
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            await client.get("/api/v1/businesses?qualified_only=true")
        app.dependency_overrides.clear()

    assert captured_kwargs.get("qualified_only") is True


@pytest.mark.asyncio
async def test_list_businesses_limit_capped_at_500():
    with patch("app.services.business_service.get_businesses", new=AsyncMock(return_value=[])):
        app.dependency_overrides[get_db] = _mock_db
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.get("/api/v1/businesses?limit=9999")
        app.dependency_overrides.clear()

    # FastAPI should reject limit > 500 with 422
    assert response.status_code == 422


# ── Get-by-ID tests ────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_get_business_by_id_found():
    biz_id = uuid4()
    sample = _make_business(id=biz_id, name="Found Biz")

    with patch("app.services.business_service.get_business", new=AsyncMock(return_value=sample)):
        app.dependency_overrides[get_db] = _mock_db
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.get(f"/api/v1/businesses/{biz_id}")
        app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json()["name"] == "Found Biz"


@pytest.mark.asyncio
async def test_get_business_by_id_not_found():
    with patch("app.services.business_service.get_business", new=AsyncMock(return_value=None)):
        app.dependency_overrides[get_db] = _mock_db
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.get(f"/api/v1/businesses/{uuid4()}")
        app.dependency_overrides.clear()

    assert response.status_code == 404
    assert response.json()["detail"] == "Business not found"


@pytest.mark.asyncio
async def test_get_business_invalid_uuid_returns_422():
    app.dependency_overrides[get_db] = _mock_db
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/v1/businesses/not-a-uuid")
    app.dependency_overrides.clear()

    assert response.status_code == 422


# ── Refresh qualification tests ────────────────────────────────────────────

@pytest.mark.asyncio
async def test_refresh_qualification_found():
    biz_id = uuid4()
    original = _make_business(id=biz_id, qualification_score=60.0)
    refreshed = _make_business(id=biz_id, qualification_score=75.0)

    with patch("app.services.business_service.get_business", new=AsyncMock(return_value=original)), \
         patch("app.services.business_service.refresh_qualification", new=AsyncMock(return_value=refreshed)):
        app.dependency_overrides[get_db] = _mock_db
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post(f"/api/v1/businesses/{biz_id}/refresh-qualification")
        app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json()["qualification_score"] == 75.0


@pytest.mark.asyncio
async def test_refresh_qualification_not_found():
    with patch("app.services.business_service.get_business", new=AsyncMock(return_value=None)):
        app.dependency_overrides[get_db] = _mock_db
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post(f"/api/v1/businesses/{uuid4()}/refresh-qualification")
        app.dependency_overrides.clear()

    assert response.status_code == 404
