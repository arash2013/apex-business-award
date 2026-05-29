from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import health, businesses, qualify
from .config.settings import settings

app = FastAPI(
    title=settings.brand_name,
    description=settings.brand_tagline,
    version="0.1.0",
    docs_url="/api/docs" if settings.environment != "production" else None,
    redoc_url="/api/redoc" if settings.environment != "production" else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://apexbusinessaward.com",
        "https://www.apexbusinessaward.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api/v1")
app.include_router(businesses.router, prefix="/api/v1")
app.include_router(qualify.router, prefix="/api/v1")
