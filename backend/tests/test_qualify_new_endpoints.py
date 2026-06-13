"""Tests for the autocomplete and by-place-id qualification endpoints."""
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import AsyncClient, ASGITransport

from app.main import app

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

_AUTOCOMPLETE_URL = "/api/v1/qualify/autocomplete"
_BY_PLACE_ID_URL = "/api/v1/qualify/by-place-id"

# Find Place from Text response format (used by autocomplete primary path)
_MOCK_AUTOCOMPLETE_RESPONSE = {
    "candidates": [
        {
            "place_id": "ChIJN1t_tDeuEmsRUsoyG83frY4",
            "name": "Acme Barbershop",
            "formatted_address": "123 Main St, Houston, TX",
        },
        {
            "place_id": "ChIJABC123",
            "name": "Acme Auto",
            "formatted_address": "456 Oak Ave, Houston, TX",
        },
    ],
    "status": "OK",
}

# Timestamp ~30 days before 2026-06-13 (well within the 12-month recency cutoff)
_RECENT_REVIEW_TS = 1_778_803_200  # 2026-05-14

_MOCK_PLACE_DETAILS_RESPONSE = {
    "result": {
        "name": "Acme Barbershop",
        "formatted_address": "123 Main St, Houston, TX 77002, USA",
        "rating": 4.7,
        "user_ratings_total": 312,
        "reviews": [{"time": _RECENT_REVIEW_TS}],
    }
}


def _mock_http_response(json_body: dict, status_code: int = 200):
    """Return a mock httpx response."""
    import httpx

    resp = MagicMock(spec=httpx.Response)
    resp.status_code = status_code
    resp.json.return_value = json_body
    resp.raise_for_status = MagicMock()
    return resp


def _make_internal_client_mock(get_return_value):
    """
    Build a mock for httpx.AsyncClient used *inside* the qualify module.

    The qualify endpoints open their own `async with httpx.AsyncClient(...) as client:`
    context. We patch `app.api.qualify.httpx.AsyncClient` so only those internal
    calls are intercepted — the test's own AsyncClient (via ASGITransport) is a
    different import and is not affected.
    """
    mock_client = AsyncMock()
    mock_client.get = AsyncMock(return_value=get_return_value)
    # Support `async with httpx.AsyncClient(...) as client:`
    cm = MagicMock()
    cm.__aenter__ = AsyncMock(return_value=mock_client)
    cm.__aexit__ = AsyncMock(return_value=False)
    mock_cls = MagicMock(return_value=cm)
    return mock_cls, mock_client


# ---------------------------------------------------------------------------
# GET /autocomplete
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_autocomplete_returns_suggestions():
    """Valid query returns a list of business suggestions."""
    mock_cls, _ = _make_internal_client_mock(
        _mock_http_response(_MOCK_AUTOCOMPLETE_RESPONSE)
    )
    with (
        patch("app.api.qualify.settings") as mock_settings,
        patch("app.api.qualify.httpx.AsyncClient", mock_cls),
    ):
        mock_settings.google_places_api_key = "test-key"

        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            resp = await client.get(_AUTOCOMPLETE_URL, params={"q": "Acme"})

    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) == 2
    assert data[0]["place_id"] == "ChIJN1t_tDeuEmsRUsoyG83frY4"
    assert data[0]["name"] == "Acme Barbershop"
    assert data[0]["address"] == "123 Main St, Houston, TX"


@pytest.mark.asyncio
async def test_autocomplete_short_query_rejected():
    """Queries shorter than 2 characters are rejected with 422."""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        resp = await client.get(_AUTOCOMPLETE_URL, params={"q": "A"})

    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_autocomplete_empty_query_rejected():
    """Empty query string is rejected with 422."""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        resp = await client.get(_AUTOCOMPLETE_URL, params={"q": ""})

    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_autocomplete_missing_api_key_returns_503():
    """Missing Google Places API key returns 503."""
    with patch("app.api.qualify.settings") as mock_settings:
        mock_settings.google_places_api_key = ""

        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            resp = await client.get(_AUTOCOMPLETE_URL, params={"q": "Acme"})

    assert resp.status_code == 503


@pytest.mark.asyncio
async def test_autocomplete_caps_at_five_results():
    """At most 5 predictions are returned regardless of API response size."""
    many_predictions = {
        "candidates": [
            {
                "place_id": f"ChIJ{i}",
                "name": f"Business {i}",
                "formatted_address": f"{i} St",
            }
            for i in range(10)
        ]
    }
    mock_cls, _ = _make_internal_client_mock(_mock_http_response(many_predictions))
    with (
        patch("app.api.qualify.settings") as mock_settings,
        patch("app.api.qualify.httpx.AsyncClient", mock_cls),
    ):
        mock_settings.google_places_api_key = "test-key"

        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            resp = await client.get(_AUTOCOMPLETE_URL, params={"q": "Business"})

    assert resp.status_code == 200
    assert len(resp.json()) <= 5


# ---------------------------------------------------------------------------
# POST /by-place-id
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_by_place_id_qualified_business():
    """Valid place_id with qualifying metrics returns a full result."""
    mock_cls, _ = _make_internal_client_mock(
        _mock_http_response(_MOCK_PLACE_DETAILS_RESPONSE)
    )
    with (
        patch("app.api.qualify.settings") as mock_settings,
        patch("app.api.qualify.httpx.AsyncClient", mock_cls),
    ):
        mock_settings.google_places_api_key = "test-key"

        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            resp = await client.post(
                _BY_PLACE_ID_URL,
                json={"place_id": "ChIJN1t_tDeuEmsRUsoyG83frY4"},
            )

    assert resp.status_code == 200
    data = resp.json()
    assert data["business_name"] == "Acme Barbershop"
    assert data["qualified"] is True
    assert data["score"] > 0
    assert "google_rating" in data
    assert "google_review_count" in data
    assert isinstance(data["breakdown"], dict)
    assert isinstance(data["disqualification_reasons"], list)


@pytest.mark.asyncio
async def test_by_place_id_not_found_returns_404():
    """place_id that returns empty result from Places API yields 404."""
    mock_cls, _ = _make_internal_client_mock(_mock_http_response({"result": {}}))
    with (
        patch("app.api.qualify.settings") as mock_settings,
        patch("app.api.qualify.httpx.AsyncClient", mock_cls),
    ):
        mock_settings.google_places_api_key = "test-key"

        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            resp = await client.post(
                _BY_PLACE_ID_URL, json={"place_id": "ChIJinvalid"}
            )

    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_by_place_id_missing_api_key_returns_503():
    """Missing Google Places API key returns 503."""
    with patch("app.api.qualify.settings") as mock_settings:
        mock_settings.google_places_api_key = ""

        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            resp = await client.post(
                _BY_PLACE_ID_URL,
                json={"place_id": "ChIJN1t_tDeuEmsRUsoyG83frY4"},
            )

    assert resp.status_code == 503


@pytest.mark.asyncio
async def test_by_place_id_missing_body_returns_422():
    """Missing place_id field yields 422 validation error."""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        resp = await client.post(_BY_PLACE_ID_URL, json={})

    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_by_place_id_low_rating_not_qualified():
    """Business with rating below 4.0 is not qualified."""
    low_rating_response = {
        "result": {
            "name": "Mediocre Shop",
            "formatted_address": "999 Low St",
            "rating": 3.2,
            "user_ratings_total": 80,
            "reviews": [{"time": 1_740_000_000}],
        }
    }
    mock_cls, _ = _make_internal_client_mock(_mock_http_response(low_rating_response))
    with (
        patch("app.api.qualify.settings") as mock_settings,
        patch("app.api.qualify.httpx.AsyncClient", mock_cls),
    ):
        mock_settings.google_places_api_key = "test-key"

        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            resp = await client.post(
                _BY_PLACE_ID_URL, json={"place_id": "ChIJlow"}
            )

    assert resp.status_code == 200
    data = resp.json()
    assert data["qualified"] is False
    assert len(data["disqualification_reasons"]) > 0
