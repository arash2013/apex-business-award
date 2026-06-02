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


@pytest.mark.asyncio
async def test_qualify_endpoint_missing_required_fields():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.post("/api/v1/qualify", json={})
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_qualify_endpoint_rating_above_5_rejected():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.post(
            "/api/v1/qualify",
            json={"google_rating": 5.1, "google_review_count": 100},
        )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_qualify_endpoint_negative_review_count_rejected():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.post(
            "/api/v1/qualify",
            json={"google_rating": 4.5, "google_review_count": -1},
        )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_qualify_endpoint_owner_response_rate_bounds():
    # 0.0 and 100.0 are both valid
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        for rate in (0.0, 50.0, 100.0):
            response = await client.post(
                "/api/v1/qualify",
                json={
                    "google_rating": 4.5,
                    "google_review_count": 100,
                    "google_owner_response_rate": rate,
                },
            )
            assert response.status_code == 200, f"Expected 200 for rate={rate}"


@pytest.mark.asyncio
async def test_qualify_endpoint_owner_response_rate_over_100_rejected():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.post(
            "/api/v1/qualify",
            json={
                "google_rating": 4.5,
                "google_review_count": 100,
                "google_owner_response_rate": 101.0,
            },
        )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_qualify_endpoint_minimal_payload():
    # Only required fields — all optional fields absent
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.post(
            "/api/v1/qualify",
            json={"google_rating": 4.5, "google_review_count": 100},
        )
    assert response.status_code == 200
    data = response.json()
    assert "score" in data
    assert "qualified" in data
    assert "breakdown" in data
    assert "disqualification_reasons" in data


@pytest.mark.asyncio
async def test_qualify_endpoint_response_shape():
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
    for key in ("google_rating", "review_count", "recency", "owner_response", "yelp_bonus"):
        assert key in data["breakdown"], f"Missing breakdown key: {key}"
