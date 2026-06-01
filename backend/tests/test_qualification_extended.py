"""Extended edge-case tests for the qualification scoring engine."""

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


# ── Hard cutoff boundary values ────────────────────────────────────────────

def test_rating_exactly_4_0_passes():
    result = compute_qualification(_input(google_rating=4.0))
    assert result.qualified is True
    assert result.breakdown["google_rating"] == 0.0


def test_rating_just_below_4_0_fails():
    result = compute_qualification(_input(google_rating=3.99))
    assert result.qualified is False


def test_review_count_exactly_50_passes():
    result = compute_qualification(_input(google_review_count=50))
    assert result.qualified is True


def test_review_count_49_fails():
    result = compute_qualification(_input(google_review_count=49))
    assert result.qualified is False


def test_review_exactly_365_days_ago_passes():
    result = compute_qualification(
        _input(google_last_review_date=date.today() - timedelta(days=365))
    )
    assert result.qualified is True
    assert result.breakdown["recency"] == 10.0


def test_review_366_days_ago_fails():
    result = compute_qualification(
        _input(google_last_review_date=date.today() - timedelta(days=366))
    )
    assert result.qualified is False


# ── Multiple disqualification reasons ──────────────────────────────────────

def test_all_three_cutoffs_fail_simultaneously():
    result = compute_qualification(
        _input(
            google_rating=2.0,
            google_review_count=5,
            google_last_review_date=date.today() - timedelta(days=500),
        )
    )
    assert result.qualified is False
    assert len(result.disqualification_reasons) == 3


def test_low_rating_and_low_count_both_reported():
    result = compute_qualification(_input(google_rating=3.5, google_review_count=10))
    assert result.qualified is False
    assert len(result.disqualification_reasons) == 2


# ── Scoring math ───────────────────────────────────────────────────────────

def test_perfect_rating_gives_35_pts():
    result = compute_qualification(_input(google_rating=5.0))
    assert result.breakdown["google_rating"] == 35.0


def test_midpoint_rating_4_5_gives_17_5_pts():
    result = compute_qualification(_input(google_rating=4.5))
    assert result.breakdown["google_rating"] == pytest.approx(17.5, abs=0.1)


def test_owner_response_rate_zero_gives_zero_pts():
    result = compute_qualification(_input(google_owner_response_rate=0.0))
    assert result.breakdown["owner_response"] == 0.0


def test_owner_response_rate_100_gives_10_pts():
    result = compute_qualification(_input(google_owner_response_rate=100.0))
    assert result.breakdown["owner_response"] == 10.0


def test_owner_response_rate_none_gives_zero_pts():
    result = compute_qualification(_input(google_owner_response_rate=None))
    assert result.breakdown["owner_response"] == 0.0


def test_yelp_rating_below_4_gives_zero_bonus():
    result = compute_qualification(_input(yelp_rating=3.9, yelp_review_count=50))
    assert result.breakdown["yelp_bonus"] == 0.0


def test_yelp_rating_4_low_count_gives_5_pts():
    result = compute_qualification(_input(yelp_rating=4.0, yelp_review_count=10))
    assert result.breakdown["yelp_bonus"] == 5.0


def test_yelp_rating_4_sufficient_count_gives_10_pts():
    result = compute_qualification(_input(yelp_rating=4.0, yelp_review_count=20))
    assert result.breakdown["yelp_bonus"] == 10.0


def test_recency_90_days_exactly_gives_20_pts():
    result = compute_qualification(
        _input(google_last_review_date=date.today() - timedelta(days=90))
    )
    assert result.breakdown["recency"] == 20.0


def test_recency_91_days_gives_15_pts():
    result = compute_qualification(
        _input(google_last_review_date=date.today() - timedelta(days=91))
    )
    assert result.breakdown["recency"] == 15.0


def test_recency_180_days_exactly_gives_15_pts():
    result = compute_qualification(
        _input(google_last_review_date=date.today() - timedelta(days=180))
    )
    assert result.breakdown["recency"] == 15.0


def test_recency_181_days_gives_10_pts():
    result = compute_qualification(
        _input(google_last_review_date=date.today() - timedelta(days=181))
    )
    assert result.breakdown["recency"] == 10.0


def test_score_is_sum_of_breakdown():
    result = compute_qualification(_input())
    assert result.score == pytest.approx(sum(result.breakdown.values()), abs=0.01)


def test_disqualified_has_empty_breakdown():
    result = compute_qualification(_input(google_rating=3.0))
    assert result.breakdown == {}


def test_disqualified_score_is_zero():
    result = compute_qualification(_input(google_rating=3.0))
    assert result.score == 0.0
