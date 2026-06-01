"""Initial schema

Revision ID: 0001
Revises:
Create Date: 2026-01-01 00:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from alembic import op

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "businesses",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("google_place_id", sa.String(255), nullable=True),
        sa.Column("yelp_id", sa.String(255), nullable=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("category", sa.String(100), nullable=False),
        sa.Column("address", sa.Text, nullable=True),
        sa.Column("neighborhood", sa.String(100), nullable=True),
        sa.Column("city", sa.String(100), nullable=False),
        sa.Column("state", sa.String(10), nullable=False),
        sa.Column("zip", sa.String(20), nullable=True),
        sa.Column("phone", sa.String(50), nullable=True),
        sa.Column("website", sa.String(512), nullable=True),
        sa.Column("google_rating", sa.Numeric(2, 1), nullable=True),
        sa.Column("google_review_count", sa.Integer, nullable=True),
        sa.Column("google_last_review_date", sa.Date, nullable=True),
        sa.Column("google_owner_response_rate", sa.Numeric(5, 2), nullable=True),
        sa.Column("yelp_rating", sa.Numeric(2, 1), nullable=True),
        sa.Column("yelp_review_count", sa.Integer, nullable=True),
        sa.Column("years_in_business", sa.Integer, nullable=True),
        sa.Column("qualification_score", sa.Numeric(5, 2), nullable=True),
        sa.Column("qualified", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("qualification_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("google_place_id"),
        sa.UniqueConstraint("yelp_id"),
    )

    op.create_table(
        "reviews",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("business_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "platform", sa.Enum("google", "yelp", name="platform"), nullable=False
        ),
        sa.Column("reviewer_name", sa.String(255), nullable=True),
        sa.Column("rating", sa.Integer, nullable=False),
        sa.Column("review_text", sa.Text, nullable=True),
        sa.Column("review_date", sa.Date, nullable=True),
        sa.Column("owner_reply", sa.Text, nullable=True),
        sa.Column("owner_reply_date", sa.Date, nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["business_id"], ["businesses.id"], ondelete="CASCADE"),
    )

    op.create_table(
        "awards",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("business_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "platform", sa.Enum("google", "yelp", name="platform"), nullable=False
        ),
        sa.Column("award_name", sa.String(255), nullable=False),
        sa.Column("category", sa.String(100), nullable=False),
        sa.Column("neighborhood", sa.String(100), nullable=False),
        sa.Column("city", sa.String(100), nullable=False),
        sa.Column("year", sa.Integer, nullable=False),
        sa.Column(
            "tier", sa.Enum("basic", "pro", "premium", name="awardtier"), nullable=False
        ),
        sa.Column(
            "status",
            sa.Enum("offered", "purchased", "fulfilled", "expired", name="awardstatus"),
            nullable=False,
            server_default="offered",
        ),
        sa.Column("offered_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("purchased_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("fulfilled_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("stripe_payment_intent_id", sa.String(255), nullable=True),
        sa.Column("amount_paid", sa.Numeric(10, 2), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["business_id"], ["businesses.id"], ondelete="CASCADE"),
    )

    op.create_table(
        "award_assets",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("award_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "asset_type",
            sa.Enum(
                "badge", "certificate", "social_kit", "plaque_order", name="assettype"
            ),
            nullable=False,
        ),
        sa.Column("file_url", sa.String(1024), nullable=True),
        sa.Column(
            "status",
            sa.Enum("pending", "generated", "delivered", name="assetstatus"),
            nullable=False,
            server_default="pending",
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["award_id"], ["awards.id"], ondelete="CASCADE"),
    )

    op.create_table(
        "outreach",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("business_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("award_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("email_address", sa.String(255), nullable=False),
        sa.Column("sequence_step", sa.Integer, nullable=False),
        sa.Column(
            "status",
            sa.Enum(
                "pending",
                "sent",
                "opened",
                "clicked",
                "responded",
                "bounced",
                "unsubscribed",
                name="outreachstatus",
            ),
            nullable=False,
            server_default="pending",
        ),
        sa.Column("sent_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("opened_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("clicked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("sendgrid_message_id", sa.String(255), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["business_id"], ["businesses.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["award_id"], ["awards.id"], ondelete="CASCADE"),
    )

    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column(
            "role",
            sa.Enum("admin", "staff", name="userrole"),
            nullable=False,
            server_default="staff",
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
    )


def downgrade() -> None:
    op.drop_table("users")
    op.drop_table("outreach")
    op.drop_table("award_assets")
    op.drop_table("awards")
    op.drop_table("reviews")
    op.drop_table("businesses")
