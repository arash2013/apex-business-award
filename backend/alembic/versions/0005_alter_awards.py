"""Refactor awards: replace category/city/neighborhood strings with FK references

Revision ID: 0005
Revises: 0004
Create Date: 2026-01-05 00:00:00.000000
"""

from typing import Sequence, Union

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from alembic import op

revision: str = "0005"
down_revision: Union[str, None] = "0004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "awards", sa.Column("area_id", postgresql.UUID(as_uuid=True), nullable=True)
    )
    op.create_foreign_key(
        "fk_awards_area_id", "awards", "areas", ["area_id"], ["id"], ondelete="SET NULL"
    )

    op.add_column(
        "awards", sa.Column("category_id", postgresql.UUID(as_uuid=True), nullable=True)
    )
    op.create_foreign_key(
        "fk_awards_category_id",
        "awards",
        "categories",
        ["category_id"],
        ["id"],
        ondelete="SET NULL",
    )

    op.drop_column("awards", "category")
    op.drop_column("awards", "neighborhood")
    op.drop_column("awards", "city")


def downgrade() -> None:
    op.add_column("awards", sa.Column("city", sa.String(100), nullable=True))
    op.add_column("awards", sa.Column("neighborhood", sa.String(100), nullable=True))
    op.add_column("awards", sa.Column("category", sa.String(100), nullable=True))

    op.drop_constraint("fk_awards_category_id", "awards", type_="foreignkey")
    op.drop_constraint("fk_awards_area_id", "awards", type_="foreignkey")

    op.drop_column("awards", "category_id")
    op.drop_column("awards", "area_id")
