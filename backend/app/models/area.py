import uuid
from decimal import Decimal

from sqlalchemy import Boolean, Integer, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampMixin, new_uuid


class Area(Base, TimestampMixin):
    __tablename__ = "areas"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=new_uuid
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    state: Mapped[str] = mapped_column(String(10), nullable=False)
    country: Mapped[str] = mapped_column(
        String(10), nullable=False, server_default="US"
    )
    lat: Mapped[Decimal | None] = mapped_column(Numeric(9, 6))
    lng: Mapped[Decimal | None] = mapped_column(Numeric(9, 6))
    radius_miles: Mapped[int] = mapped_column(
        Integer, nullable=False, server_default="10"
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default="true"
    )

    businesses: Mapped[list["Business"]] = relationship(back_populates="area")
    awards: Mapped[list["Award"]] = relationship(back_populates="area")
    crawl_jobs: Mapped[list["CrawlJob"]] = relationship(back_populates="area")
