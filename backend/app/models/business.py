import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampMixin, new_uuid


class Business(Base, TimestampMixin):
    __tablename__ = "businesses"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=new_uuid)
    google_place_id: Mapped[str | None] = mapped_column(String(255), unique=True)
    yelp_id: Mapped[str | None] = mapped_column(String(255), unique=True)

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str | None] = mapped_column(String(255), unique=True)
    address: Mapped[str | None] = mapped_column(Text)
    state: Mapped[str] = mapped_column(String(10), nullable=False)
    zip: Mapped[str | None] = mapped_column(String(20))
    phone: Mapped[str | None] = mapped_column(String(50))
    website: Mapped[str | None] = mapped_column(String(512))

    area_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("areas.id", ondelete="SET NULL"), nullable=True
    )
    category_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("categories.id", ondelete="SET NULL"), nullable=True
    )

    google_rating: Mapped[Decimal | None] = mapped_column(Numeric(2, 1))
    google_review_count: Mapped[int | None] = mapped_column(Integer)
    google_last_review_date: Mapped[date | None] = mapped_column(Date)
    google_owner_response_rate: Mapped[Decimal | None] = mapped_column(Numeric(5, 2))

    yelp_rating: Mapped[Decimal | None] = mapped_column(Numeric(2, 1))
    yelp_review_count: Mapped[int | None] = mapped_column(Integer)

    years_in_business: Mapped[int | None] = mapped_column(Integer)

    qualification_score: Mapped[Decimal | None] = mapped_column(Numeric(5, 2))
    qualified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    qualification_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    area: Mapped["Area | None"] = relationship(back_populates="businesses")
    category: Mapped["Category | None"] = relationship(back_populates="businesses")
    reviews: Mapped[list["Review"]] = relationship(back_populates="business")
    awards: Mapped[list["Award"]] = relationship(back_populates="business")
    outreach_records: Mapped[list["Outreach"]] = relationship(back_populates="business")
    customer: Mapped["Customer | None"] = relationship(back_populates="business", uselist=False)
    crawl_job_results: Mapped[list["CrawlJobResult"]] = relationship(back_populates="business")
