import enum
import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampMixin, new_uuid
from .review import Platform


class AwardTier(str, enum.Enum):
    basic = "basic"
    pro = "pro"
    premium = "premium"


class AwardStatus(str, enum.Enum):
    offered = "offered"
    purchased = "purchased"
    fulfilled = "fulfilled"
    expired = "expired"


class AssetType(str, enum.Enum):
    badge = "badge"
    certificate = "certificate"
    social_kit = "social_kit"
    plaque_order = "plaque_order"


class AssetStatus(str, enum.Enum):
    pending = "pending"
    generated = "generated"
    delivered = "delivered"


class Award(Base, TimestampMixin):
    __tablename__ = "awards"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=new_uuid)
    business_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False
    )
    area_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("areas.id", ondelete="SET NULL"), nullable=True
    )
    category_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("categories.id", ondelete="SET NULL"), nullable=True
    )
    platform: Mapped[Platform] = mapped_column(Enum(Platform, create_constraint=False), nullable=False)
    award_name: Mapped[str] = mapped_column(String(255), nullable=False)
    year: Mapped[int] = mapped_column(Integer, nullable=False)

    tier: Mapped[AwardTier] = mapped_column(Enum(AwardTier), nullable=False)
    status: Mapped[AwardStatus] = mapped_column(
        Enum(AwardStatus), nullable=False, default=AwardStatus.offered
    )

    offered_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    purchased_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    fulfilled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    stripe_payment_intent_id: Mapped[str | None] = mapped_column(String(255))
    amount_paid: Mapped[Decimal | None] = mapped_column(Numeric(10, 2))

    business: Mapped["Business"] = relationship(back_populates="awards")
    area: Mapped["Area | None"] = relationship(back_populates="awards")
    category: Mapped["Category | None"] = relationship(back_populates="awards")
    assets: Mapped[list["AwardAsset"]] = relationship(back_populates="award")
    outreach_records: Mapped[list["Outreach"]] = relationship(back_populates="award")
    fulfillments: Mapped[list["AwardFulfillment"]] = relationship(back_populates="award")
    orders: Mapped[list["Order"]] = relationship(back_populates="award")


class AwardAsset(Base, TimestampMixin):
    __tablename__ = "award_assets"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=new_uuid)
    award_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("awards.id", ondelete="CASCADE"), nullable=False
    )
    asset_type: Mapped[AssetType] = mapped_column(Enum(AssetType), nullable=False)
    file_url: Mapped[str | None] = mapped_column(String(1024))
    status: Mapped[AssetStatus] = mapped_column(
        Enum(AssetStatus), nullable=False, default=AssetStatus.pending
    )

    award: Mapped["Award"] = relationship(back_populates="assets")
