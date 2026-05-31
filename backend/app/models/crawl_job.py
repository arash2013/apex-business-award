import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, new_uuid
from .review import Platform


class CrawlStatus(str, enum.Enum):
    queued = "queued"
    running = "running"
    completed = "completed"
    failed = "failed"


class CrawlResultAction(str, enum.Enum):
    created = "created"
    updated = "updated"
    qualified = "qualified"
    disqualified = "disqualified"
    skipped = "skipped"


class CrawlJob(Base):
    __tablename__ = "crawl_jobs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=new_uuid)
    area_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("areas.id", ondelete="SET NULL"), nullable=True
    )
    category_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("categories.id", ondelete="SET NULL"), nullable=True
    )
    platform: Mapped[Platform] = mapped_column(Enum(Platform, create_constraint=False), nullable=False)
    status: Mapped[CrawlStatus] = mapped_column(
        Enum(CrawlStatus), nullable=False, server_default="queued"
    )
    businesses_found: Mapped[int] = mapped_column(Integer, nullable=False, server_default="0")
    businesses_qualified: Mapped[int] = mapped_column(Integer, nullable=False, server_default="0")
    error_message: Mapped[str | None] = mapped_column(Text)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    area: Mapped["Area | None"] = relationship(back_populates="crawl_jobs")
    category: Mapped["Category | None"] = relationship(back_populates="crawl_jobs")
    results: Mapped[list["CrawlJobResult"]] = relationship(back_populates="crawl_job")


class CrawlJobResult(Base):
    __tablename__ = "crawl_job_results"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=new_uuid)
    crawl_job_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("crawl_jobs.id", ondelete="CASCADE"), nullable=False
    )
    business_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False
    )
    action: Mapped[CrawlResultAction] = mapped_column(Enum(CrawlResultAction), nullable=False)
    notes: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    crawl_job: Mapped["CrawlJob"] = relationship(back_populates="results")
    business: Mapped["Business"] = relationship(back_populates="crawl_job_results")
