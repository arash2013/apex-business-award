from datetime import date

from fastapi import APIRouter
from pydantic import BaseModel, Field

from ..services.qualification import (
    QualificationInput,
    compute_qualification,
)

router = APIRouter(prefix="/qualify", tags=["qualification"])


class QualifyRequest(BaseModel):
    google_rating: float = Field(..., ge=0.0, le=5.0)
    google_review_count: int = Field(..., ge=0, le=1_000_000)
    google_last_review_date: date | None = None
    google_owner_response_rate: float | None = Field(None, ge=0.0, le=1.0)
    yelp_rating: float | None = Field(None, ge=0.0, le=5.0)
    yelp_review_count: int | None = Field(None, ge=0, le=1_000_000)


class QualifyResponse(BaseModel):
    score: float
    qualified: bool
    breakdown: dict[str, float]
    disqualification_reasons: list[str]


@router.post("", response_model=QualifyResponse)
async def check_qualification(body: QualifyRequest) -> QualifyResponse:
    inp = QualificationInput(
        google_rating=body.google_rating,
        google_review_count=body.google_review_count,
        google_last_review_date=body.google_last_review_date,
        google_owner_response_rate=body.google_owner_response_rate,
        yelp_rating=body.yelp_rating,
        yelp_review_count=body.yelp_review_count,
    )
    result = compute_qualification(inp)
    return QualifyResponse(
        score=result.score,
        qualified=result.qualified,
        breakdown=result.breakdown,
        disqualification_reasons=result.disqualification_reasons,
    )
