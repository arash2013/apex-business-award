"""Admin username/password login endpoint.

Issues short-lived HS256 JWTs consumed by the frontend admin portal.
The require_admin dependency in auth.py also accepts these tokens.
"""

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from jose import jwt

from ..config.settings import settings
from ..db import get_db
from ..models.user import User, UserRole

router = APIRouter(prefix="/admin/auth", tags=["admin-auth"])

_pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    email: str
    role: str


def _make_token(user: User) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.access_token_expire_minutes
    )
    return jwt.encode(
        {
            "sub": str(user.id),
            "email": user.email,
            "role": user.role.value,
            "exp": expire,
            "iss": "apex-admin",
        },
        settings.secret_key,
        algorithm=settings.algorithm,
    )


@router.post("/login", response_model=LoginResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)) -> LoginResponse:
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()

    if user is None or not _pwd.verify(body.password, user.password_hash):
        raise HTTPException(401, "Invalid email or password")

    if user.role not in (UserRole.admin, UserRole.staff):
        raise HTTPException(403, "Insufficient role")

    return LoginResponse(
        access_token=_make_token(user),
        email=user.email,
        role=user.role.value,
    )
