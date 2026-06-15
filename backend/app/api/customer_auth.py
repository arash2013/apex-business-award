"""Customer authentication via magic link (email-based, no password).

Flow:
  1. POST /customer/auth/request  — validate email, generate signed magic-link JWT,
                                    send email (or return URL in dev mode).
  2. GET  /customer/auth/verify   — exchange magic-link token for an access token.
"""

import logging
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException, Request
from jose import JWTError, jwt
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..config.settings import settings
from ..db import get_db
from ..models.customer import Customer
from fastapi import Depends

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/customer/auth", tags=["customer-auth"])

_MAGIC_TYPE = "customer_magic"
_ACCESS_TYPE = "customer_access"
_MAGIC_TTL_MINUTES = 15
_ACCESS_TTL_HOURS = 8


# ── Token helpers ─────────────────────────────────────────────────────────────


def _create_magic_token(email: str) -> str:
    exp = datetime.now(timezone.utc) + timedelta(minutes=_MAGIC_TTL_MINUTES)
    return jwt.encode(
        {"sub": email, "type": _MAGIC_TYPE, "exp": exp},
        settings.secret_key,
        algorithm=settings.algorithm,
    )


def _create_access_token(customer_id: str, email: str) -> str:
    exp = datetime.now(timezone.utc) + timedelta(hours=_ACCESS_TTL_HOURS)
    return jwt.encode(
        {"sub": customer_id, "email": email, "type": _ACCESS_TYPE, "exp": exp},
        settings.secret_key,
        algorithm=settings.algorithm,
    )


def decode_customer_token(token: str) -> dict:
    """Decode and validate a customer access token. Raises HTTPException on failure."""
    try:
        claims = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
    except JWTError as exc:
        raise HTTPException(401, "Invalid or expired token") from exc
    if claims.get("type") != _ACCESS_TYPE:
        raise HTTPException(401, "Invalid token type")
    return claims


# ── Schemas ───────────────────────────────────────────────────────────────────


class MagicLinkRequest(BaseModel):
    email: EmailStr


class MagicLinkResponse(BaseModel):
    message: str
    # Only populated in non-production to aid testing/development
    magic_url: str | None = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    customer_id: str
    email: str
    first_name: str
    last_name: str


# ── Endpoints ─────────────────────────────────────────────────────────────────


@router.post("/request", response_model=MagicLinkResponse)
async def request_magic_link(
    body: MagicLinkRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Send a magic link to the customer's email address.

    Always returns 200 so that we don't leak whether an email is registered.
    """
    result = await db.execute(
        select(Customer).where(Customer.email == body.email.lower())
    )
    customer = result.scalar_one_or_none()

    if customer is None:
        # Return the same response to avoid enumeration
        logger.info("Magic link requested for unknown email: %s", body.email)
        return MagicLinkResponse(
            message="If an account exists for that email, a login link has been sent."
        )

    token = _create_magic_token(customer.email)
    base_url = settings.frontend_url.rstrip("/")
    magic_url = f"{base_url}/portal/verify?token={token}"

    if settings.environment != "production":
        # In dev/staging expose the URL directly so it can be used without email
        logger.info("DEV magic link for %s: %s", customer.email, magic_url)
        return MagicLinkResponse(
            message="Magic link generated (dev mode — returned in response).",
            magic_url=magic_url,
        )

    # Production — send via email (SendGrid)
    if settings.sendgrid_api_key:
        try:
            await _send_magic_link_email(customer, magic_url)
        except Exception as exc:
            logger.error("Failed to send magic link email: %s", exc)
            raise HTTPException(503, "Failed to send login email; please try again.")

    return MagicLinkResponse(
        message="If an account exists for that email, a login link has been sent."
    )


@router.get("/verify", response_model=TokenResponse)
async def verify_magic_link(
    token: str,
    db: AsyncSession = Depends(get_db),
):
    """Exchange a magic-link token for a long-lived customer access token."""
    try:
        claims = jwt.decode(
            token, settings.secret_key, algorithms=[settings.algorithm]
        )
    except JWTError as exc:
        raise HTTPException(401, "Invalid or expired magic link") from exc

    if claims.get("type") != _MAGIC_TYPE:
        raise HTTPException(401, "Invalid token type")

    email: str = claims["sub"]
    result = await db.execute(select(Customer).where(Customer.email == email))
    customer = result.scalar_one_or_none()
    if customer is None:
        raise HTTPException(404, "Customer not found")

    access_token = _create_access_token(str(customer.id), customer.email)
    return TokenResponse(
        access_token=access_token,
        customer_id=str(customer.id),
        email=customer.email,
        first_name=customer.first_name,
        last_name=customer.last_name,
    )


# ── Email helper ──────────────────────────────────────────────────────────────


async def _send_magic_link_email(customer: Customer, magic_url: str) -> None:
    import httpx

    payload = {
        "personalizations": [
            {
                "to": [{"email": customer.email, "name": f"{customer.first_name} {customer.last_name}"}],
                "dynamic_template_data": {
                    "first_name": customer.first_name,
                    "magic_url": magic_url,
                    "brand_name": settings.brand_name,
                    "expiry_minutes": _MAGIC_TTL_MINUTES,
                },
            }
        ],
        "from": {
            "email": settings.sendgrid_from_email,
            "name": settings.sendgrid_from_name,
        },
        "subject": f"Sign in to {settings.brand_name}",
        "content": [
            {
                "type": "text/html",
                "value": (
                    f"<p>Hello {customer.first_name},</p>"
                    f"<p>Click the link below to sign in and view your order status:</p>"
                    f"<p><a href='{magic_url}'>Sign in to {settings.brand_name}</a></p>"
                    f"<p>This link expires in {_MAGIC_TTL_MINUTES} minutes.</p>"
                    f"<p>If you didn't request this, you can safely ignore this email.</p>"
                ),
            }
        ],
    }
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.post(
            "https://api.sendgrid.com/v3/mail/send",
            json=payload,
            headers={"Authorization": f"Bearer {settings.sendgrid_api_key}"},
        )
        resp.raise_for_status()
