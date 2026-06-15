"""Remove demo seed businesses inserted by migration 0002

Revision ID: 0009
Revises: 0008
Create Date: 2026-06-15 00:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0009"
down_revision: Union[str, None] = "0008"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

_DEMO_IDS = [
    "a1b2c3d4-0001-0000-0000-000000000001",
    "a1b2c3d4-0002-0000-0000-000000000002",
    "a1b2c3d4-0003-0000-0000-000000000003",
    "a1b2c3d4-0004-0000-0000-000000000004",
    "a1b2c3d4-0005-0000-0000-000000000005",
    "a1b2c3d4-0006-0000-0000-000000000006",
    "a1b2c3d4-0007-0000-0000-000000000007",
    "a1b2c3d4-0008-0000-0000-000000000008",
    "a1b2c3d4-0009-0000-0000-000000000009",
    "a1b2c3d4-0010-0000-0000-000000000010",
]


def upgrade() -> None:
    conn = op.get_bind()
    for bid in _DEMO_IDS:
        conn.execute(sa.text("DELETE FROM awards WHERE business_id = :id"), {"id": bid})
        conn.execute(sa.text("DELETE FROM customers WHERE business_id = :id"), {"id": bid})
        conn.execute(sa.text("DELETE FROM businesses WHERE id = :id"), {"id": bid})


def downgrade() -> None:
    pass
