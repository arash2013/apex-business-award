"""Add customers, orders, award_fulfillments, email_templates tables

Revision ID: 0006
Revises: 0005
Create Date: 2026-01-06 00:00:00.000000
"""
from typing import Sequence, Union

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from alembic import op

revision: str = "0006"
down_revision: Union[str, None] = "0005"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "customers",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("business_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("first_name", sa.String(100), nullable=False),
        sa.Column("last_name", sa.String(100), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("phone", sa.String(50), nullable=True),
        sa.Column("stripe_customer_id", sa.String(255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("business_id", name="uq_customers_business_id"),
        sa.UniqueConstraint("email", name="uq_customers_email"),
        sa.UniqueConstraint("stripe_customer_id", name="uq_customers_stripe_customer_id"),
        sa.ForeignKeyConstraint(["business_id"], ["businesses.id"], ondelete="CASCADE"),
    )

    op.create_table(
        "orders",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("customer_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("award_id", postgresql.UUID(as_uuid=True), nullable=False),
        # reuses existing awardtier enum type
        sa.Column("tier", sa.Enum("basic", "pro", "premium", name="awardtier", create_type=False), nullable=False),
        sa.Column(
            "status",
            sa.Enum("pending", "paid", "failed", "refunded", "cancelled", name="orderstatus"),
            nullable=False,
            server_default="pending",
        ),
        sa.Column("amount", sa.Numeric(10, 2), nullable=False),
        sa.Column("currency", sa.String(10), nullable=False, server_default="usd"),
        sa.Column("stripe_payment_intent_id", sa.String(255), nullable=True),
        sa.Column("stripe_invoice_id", sa.String(255), nullable=True),
        sa.Column("paid_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("stripe_payment_intent_id", name="uq_orders_stripe_payment_intent_id"),
        sa.ForeignKeyConstraint(["customer_id"], ["customers.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["award_id"], ["awards.id"], ondelete="RESTRICT"),
    )

    op.create_table(
        "award_fulfillments",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("order_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("award_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "fulfillment_type",
            sa.Enum("digital_badge", "certificate", "social_kit", "plaque", name="fulfillmenttype"),
            nullable=False,
        ),
        sa.Column(
            "status",
            sa.Enum("pending", "processing", "generated", "shipped", "delivered", name="fulfillmentstatus"),
            nullable=False,
            server_default="pending",
        ),
        sa.Column("file_url", sa.String(1024), nullable=True),
        sa.Column("tracking_number", sa.String(100), nullable=True),
        sa.Column("shipped_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("delivered_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["order_id"], ["orders.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["award_id"], ["awards.id"], ondelete="CASCADE"),
    )

    op.create_table(
        "email_templates",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("subject", sa.String(255), nullable=False),
        sa.Column("body_html", sa.Text, nullable=False),
        sa.Column("body_text", sa.Text, nullable=False),
        sa.Column("variables", postgresql.JSONB, nullable=False, server_default="'[]'::jsonb"),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name", name="uq_email_templates_name"),
    )


def downgrade() -> None:
    op.drop_table("email_templates")
    op.drop_table("award_fulfillments")
    op.drop_table("orders")
    op.drop_table("customers")
    op.execute("DROP TYPE IF EXISTS fulfillmentstatus")
    op.execute("DROP TYPE IF EXISTS fulfillmenttype")
    op.execute("DROP TYPE IF EXISTS orderstatus")
