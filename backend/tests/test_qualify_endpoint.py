import pytest
from httpx import AsyncClient, ASGITransport

from app.main import app


@pytest.mark.asyncio
async def test_qualify_endpoint_qualified():
    payload = {
        "google_rating": 4.8,
        "google_review_count": 200,
        "google_last_review_date": "2026-04-01",
        "google_owner_response_rate": 75.0,
        "yelp_rating": 4.7,
        "yelp_review_count": 100,
    }
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.post("/api/v1/qualify", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["qualified"] is True
    assert data["score"] > 0


@pytest.mark.asyncio
async def test_qualify_endpoint_not_qualified():
    payload = {
        "google_rating": 3.5,
        "google_review_count": 10,
    }
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.post("/api/v1/qualify", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["qualified"] is False
    assert len(data["disqualification_reasons"]) > 0
