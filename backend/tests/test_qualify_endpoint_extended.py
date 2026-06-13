"""Extended integration tests for POST /api/v1/qualify."""

import pytest
from httpx import AsyncClient, ASGITransport

from app.main import app


@pytest.mark.asyncio
async def test_qualify_returns_breakdown():
    payload = {
        "google_rating": 4.8,
        "google_review_count": 200,
        "google_last_review_date": "2026-04-01",
        "google_owner_response_rate": 75.0,
        "yelp_rating": 4.7,
        "yelp_review_count": 100,
    }
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/api/v1/qualify", json=payload)
    data = response.json()
    assert "breakdown" in data
    assert "google_rating" in data["breakdown"]
    assert "review_count" in data["breakdown"]
    assert "recency" in data["breakdown"]
    assert "owner_response_rate" in data["breakdown"]
    assert "yelp_bonus" in data["breakdown"]


@pytest.mark.asyncio
async def test_qualify_boundary_rating_4_0():
    payload = {
        "google_rating": 4.0,
        "google_review_count": 50,
        "google_last_review_date": "2026-04-01",
    }
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/api/v1/qualify", json=payload)
    assert response.status_code == 200
    assert response.json()["qualified"] is True


@pytest.mark.asyncio
async def test_qualify_rating_below_4_0():
    payload = {
        "google_rating": 3.99,
        "google_review_count": 200,
        "google_last_review_date": "2026-04-01",
    }
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/api/v1/qualify", json=payload)
    data = response.json()
    assert data["qualified"] is False
    assert data["score"] == 0.0
    assert len(data["disqualification_reasons"]) >= 1


@pytest.mark.asyncio
async def test_qualify_missing_optional_fields():
    """Only required fields sent; optional yelp + owner_response omitted."""
    payload = {
        "google_rating": 4.5,
        "google_review_count": 100,
        "google_last_review_date": "2026-05-01",
    }
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/api/v1/qualify", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["qualified"] is True
    assert data["breakdown"]["yelp_bonus"] == 0.0
    assert data["breakdown"]["owner_response_rate"] == 0.0


@pytest.mark.asyncio
async def test_qualify_missing_required_field_returns_422():
    """google_rating is required; omitting it should return 422."""
    payload = {"google_review_count": 100}
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/api/v1/qualify", json=payload)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_qualify_invalid_rating_type_returns_422():
    payload = {
        "google_rating": "not-a-number",
        "google_review_count": 100,
    }
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/api/v1/qualify", json=payload)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_qualify_no_review_date_disqualifies():
    payload = {
        "google_rating": 4.8,
        "google_review_count": 200,
        "google_last_review_date": None,
    }
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/api/v1/qualify", json=payload)
    data = response.json()
    assert data["qualified"] is False


@pytest.mark.asyncio
async def test_qualify_score_is_non_negative():
    payload = {
        "google_rating": 4.1,
        "google_review_count": 55,
        "google_last_review_date": "2026-03-01",
    }
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/api/v1/qualify", json=payload)
    assert response.json()["score"] >= 0
