"""Refactor businesses: replace category/city/neighborhood strings with FK references

Revision ID: 0004
Revises: 0003
Create Date: 2026-01-04 00:00:00.000000
"""

from typing import Sequence, Union

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from alembic import op

revision: str = "0004"
down_revision: Union[str, None] = "0003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("businesses", sa.Column("slug", sa.String(255), nullable=True))
    op.create_unique_constraint("uq_businesses_slug", "businesses", ["slug"])

    op.add_column(
        "businesses", sa.Column("area_id", postgresql.UUID(as_uuid=True), nullable=True)
    )
    op.create_foreign_key(
        "fk_businesses_area_id",
        "businesses",
        "areas",
        ["area_id"],
        ["id"],
        ondelete="SET NULL",
    )

    op.add_column(
        "businesses",
        sa.Column("category_id", postgresql.UUID(as_uuid=True), nullable=True),
    )
    op.create_foreign_key(
        "fk_businesses_category_id",
        "businesses",
        "categories",
        ["category_id"],
        ["id"],
        ondelete="SET NULL",
    )

    op.drop_column("businesses", "category")
    op.drop_column("businesses", "neighborhood")
    op.drop_column("businesses", "city")


def downgrade() -> None:
    op.add_column("businesses", sa.Column("city", sa.String(100), nullable=True))
    op.add_column(
        "businesses", sa.Column("neighborhood", sa.String(100), nullable=True)
    )
    op.add_column("businesses", sa.Column("category", sa.String(100), nullable=True))

    op.drop_constraint("fk_businesses_category_id", "businesses", type_="foreignkey")
    op.drop_constraint("fk_businesses_area_id", "businesses", type_="foreignkey")
    op.drop_constraint("uq_businesses_slug", "businesses", type_="unique")

    op.drop_column("businesses", "category_id")
    op.drop_column("businesses", "area_id")
    op.drop_column("businesses", "slug")
