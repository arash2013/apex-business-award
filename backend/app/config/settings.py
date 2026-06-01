from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Brand (single source of truth for backend)
    brand_name: str = "Apex Business Award"
    brand_short: str = "Apex"
    brand_tagline: str = "Recognizing Excellence in Local Business"
    brand_city: str = "Houston"
    brand_state: str = "TX"
    brand_year: int = 2026

    # Environment
    environment: str = "development"
    debug: bool = False

    # Database
    database_url: str = "postgresql+asyncpg://apex:apex@localhost:5432/apex_dev"

    # Redis / Celery
    redis_url: str = "redis://localhost:6379/0"

    # External APIs
    google_places_api_key: str = ""
    serpapi_key: str = ""
    yelp_api_key: str = ""
    brightdata_proxy_url: str = ""

    # Email
    sendgrid_api_key: str = ""
    sendgrid_from_email: str = "awards@apexbusinessaward.com"
    sendgrid_from_name: str = "Apex Business Award"

    # Stripe
    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""
    stripe_basic_price_id: str = ""
    stripe_pro_price_id: str = ""
    stripe_premium_price_id: str = ""

    # Auth
    secret_key: str = "change-me-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 8

    # Award tier pricing (USD dollars)
    tier_price_basic: int = 199
    tier_price_pro: int = 249
    tier_price_premium: int = 349

    def award_name(self, category: str, year: int, area_name: str) -> str:
        return f"{self.brand_name} · {category} · {year} · {area_name}"


settings = Settings()
