from fastapi import APIRouter

from ..config.settings import settings

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check() -> dict:
    return {
        "status": "ok",
        "service": settings.brand_name,
        "environment": settings.environment,
        "year": settings.brand_year,
    }
