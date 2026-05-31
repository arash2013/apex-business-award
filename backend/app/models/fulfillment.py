import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampMixin, new_uuid


class FulfillmentType(str, enum.Enum):
    digital_badge = "digital_badge"
    certificate = "certificate"
    social_kit = "social_kit"
    plaque = "plaque"


class FulfillmentStatus(str, enum.Enum):
    pending = "pending"
    processing = "processing"
    generated = "generated"
    shipped = "shipped"
    delivered = "delivered"


class AwardFulfillment(Base, TimestampMixin):
    __tablename__ = "award_fulfillments"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=new_uuid)
    order_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False
    )
    award_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("awards.id", ondelete="CASCADE"), nullable=False
    )
    fulfillment_type: Mapped[FulfillmentType] = mapped_column(Enum(FulfillmentType), nullable=False)
    status: Mapped[FulfillmentStatus] = mapped_column(
        Enum(FulfillmentStatus), nullable=False, server_default="pending"
    )
    file_url: Mapped[str | None] = mapped_column(String(1024))
    tracking_number: Mapped[str | None] = mapped_column(String(100))
    shipped_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    delivered_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    order: Mapped["Order"] = relationship(back_populates="fulfillments")
    award: Mapped["Award"] = relationship(back_populates="fulfillments")
