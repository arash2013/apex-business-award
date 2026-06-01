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
