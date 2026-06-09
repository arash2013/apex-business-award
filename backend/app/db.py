import re

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from .config.settings import settings

_db_url = re.sub(r"[?&]sslmode=[^&]*", "", settings.database_url).rstrip("?")
_connect_args = {"ssl": True} if "sslmode=require" in settings.database_url else {}

engine = create_async_engine(
    _db_url,
    echo=settings.debug,
    pool_pre_ping=True,
    connect_args=_connect_args,
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db() -> AsyncSession:  # type: ignore[return]
    async with AsyncSessionLocal() as session:
        yield session
