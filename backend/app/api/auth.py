"""Admin authentication guard.

Two modes:
  Azure AD (production)  — validates RS256 JWT from the Microsoft identity
                           platform and checks the configured app role.
  API-key (development)  — constant-time comparison of a bearer token against
                           ADMIN_API_KEY.  Used when AZURE_TENANT_ID or
                           AZURE_CLIENT_ID are not set.
"""

import asyncio
import secrets
import time
from typing import Any

import httpx
from fastapi import HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from ..config.settings import settings

_bearer = HTTPBearer(auto_error=True)

# ── JWKS cache ───────────────────────────────────────────────────────────────
_jwks_cache: dict[str, Any] | None = None
_jwks_fetched_at: float = 0.0
_jwks_lock = asyncio.Lock()
_JWKS_TTL = 3600.0  # refresh every hour


async def _get_jwks(force: bool = False) -> dict[str, Any]:
    global _jwks_cache, _jwks_fetched_at
    now = time.monotonic()
    if not force and _jwks_cache is not None and (now - _jwks_fetched_at) < _JWKS_TTL:
        return _jwks_cache
    async with _jwks_lock:
        now = time.monotonic()
        if (
            not force
            and _jwks_cache is not None
            and (now - _jwks_fetched_at) < _JWKS_TTL
        ):
            return _jwks_cache
        url = (
            "https://login.microsoftonline.com"
            f"/{settings.azure_tenant_id}/discovery/v2.0/keys"
        )
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.get(url)
                resp.raise_for_status()
                _jwks_cache = resp.json()
                _jwks_fetched_at = time.monotonic()
        except httpx.HTTPError as exc:
            raise HTTPException(503, "Unable to reach identity provider") from exc
    return _jwks_cache  # type: ignore[return-value]


# ── Public dependency ────────────────────────────────────────────────────────


async def require_admin(
    creds: HTTPAuthorizationCredentials = Security(_bearer),
) -> dict[str, Any]:
    """FastAPI dependency that enforces admin-only access on a route."""
    use_azure = bool(settings.azure_tenant_id and settings.azure_client_id)

    if not use_azure:
        # Dev / API-key fallback
        if not settings.admin_api_key:
            raise HTTPException(
                503,
                detail=(
                    "Admin auth not configured — set AZURE_TENANT_ID + AZURE_CLIENT_ID"
                    " or ADMIN_API_KEY"
                ),
            )
        if not secrets.compare_digest(creds.credentials, settings.admin_api_key):
            raise HTTPException(401, "Invalid API key")
        return {"sub": "api-key", "roles": [settings.azure_admin_role]}

    # ── Azure AD JWT validation ──────────────────────────────────────────────
    token = creds.credentials
    try:
        header = jwt.get_unverified_header(token)
        jwks = await _get_jwks()
        key = next((k for k in jwks["keys"] if k.get("kid") == header.get("kid")), None)
        if key is None:
            # Unknown signing key — JWKS may have rotated; retry once
            jwks = await _get_jwks(force=True)
            key = next(
                (k for k in jwks["keys"] if k.get("kid") == header.get("kid")), None
            )
        if key is None:
            raise HTTPException(401, "Unknown signing key")

        issuer = f"https://login.microsoftonline.com/{settings.azure_tenant_id}/v2.0"
        claims: dict[str, Any] = jwt.decode(
            token,
            key,
            algorithms=["RS256"],
            audience=settings.azure_client_id,
            issuer=issuer,
        )
    except JWTError as exc:
        raise HTTPException(401, "Invalid or expired token") from exc

    roles: list[str] = claims.get("roles", [])
    if settings.azure_admin_role not in roles:
        raise HTTPException(403, "Admin role required")

    return claims
