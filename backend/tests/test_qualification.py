from datetime import date, timedelta

import pytest

from app.services.qualification import QualificationInput, compute_qualification


def _input(**overrides) -> QualificationInput:
    defaults = dict(
        google_rating=4.8,
        google_review_count=200,
        google_last_review_date=date.today() - timedelta(days=30),
        google_owner_response_rate=75.0,
        yelp_rating=4.7,
        yelp_review_count=100,
    )
    defaults.update(overrides)
    return QualificationInput(**defaults)


def test_fully_qualified_business_scores_high():
    result = compute_qualification(_input())
    assert result.qualified is True
    assert result.score > 80


def test_low_rating_disqualifies():
    result = compute_qualification(_input(google_rating=3.9))
    assert result.qualified is False
    assert "4.0" in result.disqualification_reasons[0]


def test_low_review_count_disqualifies():
    result = compute_qualification(_input(google_review_count=49))
    assert result.qualified is False
    assert "50" in result.disqualification_reasons[0]


def test_no_recent_review_disqualifies():
    old_date = date.today() - timedelta(days=400)
    result = compute_qualification(_input(google_last_review_date=old_date))
    assert result.qualified is False


def test_no_review_date_disqualifies():
    result = compute_qualification(_input(google_last_review_date=None))
    assert result.qualified is False


def test_score_capped_at_100():
    result = compute_qualification(
        _input(
            google_rating=5.0,
            google_review_count=500,
            google_last_review_date=date.today(),
            google_owner_response_rate=100.0,
            yelp_rating=5.0,
            yelp_review_count=200,
        )
    )
    assert result.score <= 100.0


def test_breakdown_keys_present():
    result = compute_qualification(_input())
    assert "google_rating" in result.breakdown
    assert "review_count" in result.breakdown
    assert "recency" in result.breakdown
    assert "owner_response" in result.breakdown
    assert "yelp_bonus" in result.breakdown


def test_recency_scoring():
    r_3mo = compute_qualification(
        _input(google_last_review_date=date.today() - timedelta(days=60))
    )
    r_6mo = compute_qualification(
        _input(google_last_review_date=date.today() - timedelta(days=150))
    )
    r_12mo = compute_qualification(
        _input(google_last_review_date=date.today() - timedelta(days=300))
    )
    assert r_3mo.breakdown["recency"] == 20.0
    assert r_6mo.breakdown["recency"] == 15.0
    assert r_12mo.breakdown["recency"] == 10.0


def test_no_yelp_data_gives_zero_yelp_bonus():
    result = compute_qualification(_input(yelp_rating=None, yelp_review_count=None))
    assert result.breakdown["yelp_bonus"] == 0.0


# ── Boundary conditions ───────────────────────────────────────────────────────


def test_rating_exactly_at_cutoff_qualifies():
    result = compute_qualification(_input(google_rating=4.0))
    assert result.qualified is True
    assert result.breakdown["google_rating"] == 0.0


def test_review_count_exactly_at_cutoff_qualifies():
    result = compute_qualification(_input(google_review_count=50))
    assert result.qualified is True


def test_multiple_disqualification_reasons():
    result = compute_qualification(
        _input(google_rating=3.5, google_review_count=10)
    )
    assert result.qualified is False
    assert len(result.disqualification_reasons) == 2
    assert result.score == 0.0
    assert result.breakdown == {}


# ── Owner response rate scoring ───────────────────────────────────────────────


def test_owner_response_rate_zero_gives_no_pts():
    result = compute_qualification(_input(google_owner_response_rate=0.0))
    assert result.breakdown["owner_response"] == 0.0


def test_owner_response_rate_full_gives_max_pts():
    result = compute_qualification(_input(google_owner_response_rate=100.0))
    assert result.breakdown["owner_response"] == 10.0


def test_owner_response_rate_none_gives_zero():
    result = compute_qualification(_input(google_owner_response_rate=None))
    assert result.breakdown["owner_response"] == 0.0


def test_owner_response_rate_50_pct():
    result = compute_qualification(_input(google_owner_response_rate=50.0))
    assert result.breakdown["owner_response"] == 5.0


# ── Yelp bonus edge cases ─────────────────────────────────────────────────────


def test_yelp_high_rating_low_count_gives_partial_credit():
    # rating ≥ 4.0 but count < 20 → 5 pts
    result = compute_qualification(_input(yelp_rating=4.5, yelp_review_count=10))
    assert result.breakdown["yelp_bonus"] == 5.0


def test_yelp_low_rating_gives_no_bonus():
    result = compute_qualification(_input(yelp_rating=3.9, yelp_review_count=50))
    assert result.breakdown["yelp_bonus"] == 0.0


def test_yelp_full_bonus_requires_rating_and_count():
    result = compute_qualification(_input(yelp_rating=4.2, yelp_review_count=20))
    assert result.breakdown["yelp_bonus"] == 10.0


# ── Review count scoring ──────────────────────────────────────────────────────


def test_review_count_caps_at_500():
    r_500 = compute_qualification(_input(google_review_count=500))
    r_999 = compute_qualification(_input(google_review_count=999))
    assert r_500.breakdown["review_count"] == r_999.breakdown["review_count"]
    assert r_500.breakdown["review_count"] == 25.0


# ── Recency boundary: exactly 90 / 180 / 365 days ────────────────────────────


def test_recency_exactly_90_days():
    result = compute_qualification(
        _input(google_last_review_date=date.today() - timedelta(days=90))
    )
    assert result.breakdown["recency"] == 20.0


def test_recency_exactly_180_days():
    result = compute_qualification(
        _input(google_last_review_date=date.today() - timedelta(days=180))
    )
    assert result.breakdown["recency"] == 15.0


def test_recency_exactly_365_days():
    result = compute_qualification(
        _input(google_last_review_date=date.today() - timedelta(days=365))
    )
    assert result.breakdown["recency"] == 10.0


def test_recency_366_days_disqualifies():
    result = compute_qualification(
        _input(google_last_review_date=date.today() - timedelta(days=366))
    )
    assert result.qualified is False
