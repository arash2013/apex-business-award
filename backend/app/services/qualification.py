from dataclasses import dataclass
from datetime import date, timedelta
from decimal import Decimal


@dataclass
class QualificationInput:
    google_rating: float
    google_review_count: int
    google_last_review_date: date | None
    google_owner_response_rate: float | None  # 0-100 percent
    yelp_rating: float | None
    yelp_review_count: int | None


@dataclass
class QualificationResult:
    score: float  # 0-100
    qualified: bool
    breakdown: dict[str, float]
    disqualification_reasons: list[str]


def compute_qualification(data: QualificationInput) -> QualificationResult:
    """Compute the composite qualification score for a business.

    Hard cutoffs must all pass before any score is awarded.
    Returns score=0 and qualified=False if any cutoff fails.
    """
    reasons: list[str] = []

    # ── Hard cutoffs ──────────────────────────────────────────────────────────
    if data.google_rating < 4.0:
        reasons.append(f"Google rating {data.google_rating} is below 4.0")

    if data.google_review_count < 50:
        reasons.append(f"Google review count {data.google_review_count} is below 50")

    today = date.today()
    if data.google_last_review_date is None:
        reasons.append("No Google reviews found")
    elif (today - data.google_last_review_date) > timedelta(days=365):
        reasons.append("No Google reviews within the last 12 months")

    if reasons:
        return QualificationResult(
            score=0.0,
            qualified=False,
            breakdown={},
            disqualification_reasons=reasons,
        )

    # ── Scoring ───────────────────────────────────────────────────────────────
    breakdown: dict[str, float] = {}

    # 1. Google rating (0–35 pts): linear scale from 4.0 to 5.0
    rating_pts = min(35.0, ((data.google_rating - 4.0) / 1.0) * 35.0)
    breakdown["google_rating"] = round(rating_pts, 2)

    # 2. Review count (0–25 pts): log scale, caps at 500 reviews
    import math

    count = min(data.google_review_count, 500)
    # 50 reviews → ~0 pts, 500 reviews → 25 pts
    count_pts = max(0.0, (math.log10(count / 50) / math.log10(10)) * 25.0)
    count_pts = min(25.0, count_pts)
    breakdown["review_count"] = round(count_pts, 2)

    # 3. Recency (0–20 pts)
    days_since = (today - data.google_last_review_date).days  # type: ignore[operator]
    if days_since <= 90:
        recency_pts = 20.0
    elif days_since <= 180:
        recency_pts = 15.0
    elif days_since <= 365:
        recency_pts = 10.0
    else:
        recency_pts = 0.0
    breakdown["recency"] = recency_pts

    # 4. Owner response rate (0–10 pts)
    if data.google_owner_response_rate is not None:
        response_pts = min(10.0, (data.google_owner_response_rate / 100.0) * 10.0)
    else:
        response_pts = 0.0
    breakdown["owner_response"] = round(response_pts, 2)

    # 5. Yelp cross-reference bonus (0–10 pts)
    yelp_pts = 0.0
    if data.yelp_rating is not None and data.yelp_review_count:
        if data.yelp_rating >= 4.0 and data.yelp_review_count >= 20:
            yelp_pts = 10.0
        elif data.yelp_rating >= 4.0:
            yelp_pts = 5.0
    breakdown["yelp_bonus"] = yelp_pts

    score = sum(breakdown.values())
    score = round(min(100.0, score), 2)

    return QualificationResult(
        score=score,
        qualified=True,
        breakdown=breakdown,
        disqualification_reasons=[],
    )
