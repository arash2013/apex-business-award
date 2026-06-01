import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampMixin, new_uuid


class OutreachStatus(str, enum.Enum):
    pending = "pending"
    sent = "sent"
    opened = "opened"
    clicked = "clicked"
    responded = "responded"
    bounced = "bounced"
    unsubscribed = "unsubscribed"


class Outreach(Base, TimestampMixin):
    __tablename__ = "outreach"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=new_uuid
    )
    business_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("businesses.id", ondelete="CASCADE"),
        nullable=False,
    )
    award_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("awards.id", ondelete="CASCADE"), nullable=False
    )
    email_address: Mapped[str] = mapped_column(String(255), nullable=False)
    sequence_step: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[OutreachStatus] = mapped_column(
        Enum(OutreachStatus), nullable=False, default=OutreachStatus.pending
    )
    sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    opened_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    clicked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    sendgrid_message_id: Mapped[str | None] = mapped_column(String(255))

    business: Mapped["Business"] = relationship(back_populates="outreach_records")
    award: Mapped["Award"] = relationship(back_populates="outreach_records")
