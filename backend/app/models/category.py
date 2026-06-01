import uuid

from sqlalchemy import Boolean, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampMixin, new_uuid


class Category(Base, TimestampMixin):
    __tablename__ = "categories"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=new_uuid
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    google_place_type: Mapped[str | None] = mapped_column(String(100))
    yelp_category_alias: Mapped[str | None] = mapped_column(String(100))
    icon: Mapped[str | None] = mapped_column(String(50))
    is_active: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default="true"
    )

    businesses: Mapped[list["Business"]] = relationship(back_populates="category")
    awards: Mapped[list["Award"]] = relationship(back_populates="category")
    crawl_jobs: Mapped[list["CrawlJob"]] = relationship(back_populates="category")
