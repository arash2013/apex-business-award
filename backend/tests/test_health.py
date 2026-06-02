import pytest
from httpx import AsyncClient, ASGITransport

from app.main import app


@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "Apex" in data["service"]


@pytest.mark.asyncio
async def test_health_check_all_fields():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get("/api/v1/health")
    data = response.json()
    assert set(data.keys()) == {"status", "service", "environment", "year"}
    assert isinstance(data["year"], int)
    assert isinstance(data["environment"], str)


@pytest.mark.asyncio
async def test_health_returns_json():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get("/api/v1/health")
    assert response.headers["content-type"].startswith("application/json")
