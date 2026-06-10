"""Seed Houston areas and categories; wire existing businesses to FK references

Revision ID: 0008
Revises: 0007
Create Date: 2026-01-08 00:00:00.000000
"""

from typing import Sequence, Union
from datetime import datetime, timezone

import sqlalchemy as sa
from alembic import op

revision: str = "0008"
down_revision: Union[str, None] = "0007"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

AREAS = [
    {
        "id": "aa000001-0000-0000-0000-000000000001",
        "name": "Houston Heights",
        "city": "Houston",
        "state": "TX",
    },
    {
        "id": "aa000001-0000-0000-0000-000000000002",
        "name": "Midtown",
        "city": "Houston",
        "state": "TX",
    },
    {
        "id": "aa000001-0000-0000-0000-000000000003",
        "name": "River Oaks",
        "city": "Houston",
        "state": "TX",
    },
    {
        "id": "aa000001-0000-0000-0000-000000000004",
        "name": "The Woodlands",
        "city": "The Woodlands",
        "state": "TX",
    },
]

CATEGORIES = [
    {
        "id": "cc000001-0000-0000-0000-000000000001",
        "name": "HVAC",
        "slug": "hvac",
        "google_place_type": "hvac_contractor",
        "yelp_category_alias": "hvacrepair",
        "icon": "❄️",
    },
    {
        "id": "cc000001-0000-0000-0000-000000000002",
        "name": "Dentist",
        "slug": "dentist",
        "google_place_type": "dentist",
        "yelp_category_alias": "dentists",
        "icon": "🦷",
    },
    {
        "id": "cc000001-0000-0000-0000-000000000003",
        "name": "Restaurant",
        "slug": "restaurant",
        "google_place_type": "restaurant",
        "yelp_category_alias": "restaurants",
        "icon": "🍽️",
    },
    {
        "id": "cc000001-0000-0000-0000-000000000004",
        "name": "Plumber",
        "slug": "plumber",
        "google_place_type": "plumber",
        "yelp_category_alias": "plumbing",
        "icon": "🔧",
    },
    {
        "id": "cc000001-0000-0000-0000-000000000005",
        "name": "Auto Repair",
        "slug": "auto-repair",
        "google_place_type": "car_repair",
        "yelp_category_alias": "autorepair",
        "icon": "🚗",
    },
]

# (business_id, area_id, category_id, slug)
BUSINESS_MAP = [
    (
        "a1b2c3d4-0001-0000-0000-000000000001",
        "aa000001-0000-0000-0000-000000000001",
        "cc000001-0000-0000-0000-000000000001",
        "cool-air-hvac-heights",
    ),
    (
        "a1b2c3d4-0002-0000-0000-000000000002",
        "aa000001-0000-0000-0000-000000000001",
        "cc000001-0000-0000-0000-000000000002",
        "montrose-dental-care",
    ),
    (
        "a1b2c3d4-0003-0000-0000-000000000003",
        "aa000001-0000-0000-0000-000000000002",
        "cc000001-0000-0000-0000-000000000003",
        "midtown-bites-restaurant",
    ),
    (
        "a1b2c3d4-0004-0000-0000-000000000004",
        "aa000001-0000-0000-0000-000000000002",
        "cc000001-0000-0000-0000-000000000005",
        "galleria-auto-repair",
    ),
    (
        "a1b2c3d4-0005-0000-0000-000000000005",
        "aa000001-0000-0000-0000-000000000003",
        None,
        "river-oaks-legal-group",
    ),
    (
        "a1b2c3d4-0006-0000-0000-000000000006",
        "aa000001-0000-0000-0000-000000000002",
        None,
        "eado-fitness-studio",
    ),
    (
        "a1b2c3d4-0007-0000-0000-000000000007",
        "aa000001-0000-0000-0000-000000000004",
        "cc000001-0000-0000-0000-000000000004",
        "the-woodlands-plumbing",
    ),
    (
        "a1b2c3d4-0008-0000-0000-000000000008",
        "aa000001-0000-0000-0000-000000000004",
        None,
        "sugarland-vet-clinic",
    ),
    ("a1b2c3d4-0009-0000-0000-000000000009", None, None, "pearland-tax-prep"),
    ("a1b2c3d4-0010-0000-0000-000000000010", None, None, "katy-roofing-solutions"),
]

# Seed award records for the 8 qualified businesses
AWARDS = [
    (
        "aw000001-0000-0000-0000-000000000001",
        "a1b2c3d4-0001-0000-0000-000000000001",
        "aa000001-0000-0000-0000-000000000001",
        "cc000001-0000-0000-0000-000000000001",
        "premium",
        "fulfilled",
    ),
    (
        "aw000001-0000-0000-0000-000000000002",
        "a1b2c3d4-0002-0000-0000-000000000002",
        "aa000001-0000-0000-0000-000000000001",
        "cc000001-0000-0000-0000-000000000002",
        "pro",
        "purchased",
    ),
    (
        "aw000001-0000-0000-0000-000000000003",
        "a1b2c3d4-0003-0000-0000-000000000003",
        "aa000001-0000-0000-0000-000000000002",
        "cc000001-0000-0000-0000-000000000003",
        "premium",
        "fulfilled",
    ),
    (
        "aw000001-0000-0000-0000-000000000004",
        "a1b2c3d4-0004-0000-0000-000000000004",
        "aa000001-0000-0000-0000-000000000002",
        "cc000001-0000-0000-0000-000000000005",
        "pro",
        "purchased",
    ),
    (
        "aw000001-0000-0000-0000-000000000005",
        "a1b2c3d4-0005-0000-0000-000000000005",
        "aa000001-0000-0000-0000-000000000003",
        None,
        "basic",
        "purchased",
    ),
    (
        "aw000001-0000-0000-0000-000000000006",
        "a1b2c3d4-0006-0000-0000-000000000006",
        "aa000001-0000-0000-0000-000000000002",
        None,
        "pro",
        "purchased",
    ),
    (
        "aw000001-0000-0000-0000-000000000007",
        "a1b2c3d4-0007-0000-0000-000000000007",
        "aa000001-0000-0000-0000-000000000004",
        "cc000001-0000-0000-0000-000000000004",
        "basic",
        "purchased",
    ),
    (
        "aw000001-0000-0000-0000-000000000008",
        "a1b2c3d4-0008-0000-0000-000000000008",
        "aa000001-0000-0000-0000-000000000004",
        None,
        "premium",
        "fulfilled",
    ),
]


def upgrade() -> None:
    conn = op.get_bind()
    now = datetime.now(timezone.utc)

    for area in AREAS:
        conn.execute(
            sa.text("""
                INSERT INTO areas (id, name, city, state, country, radius_miles, is_active, created_at, updated_at)
                VALUES (:id, :name, :city, :state, 'US', 10, true, :now, :now)
                ON CONFLICT DO NOTHING
            """),
            {**area, "now": now},
        )

    for cat in CATEGORIES:
        conn.execute(
            sa.text("""
                INSERT INTO categories (id, name, slug, google_place_type, yelp_category_alias, icon, is_active, created_at, updated_at)
                VALUES (:id, :name, :slug, :google_place_type, :yelp_category_alias, :icon, true, :now, :now)
                ON CONFLICT DO NOTHING
            """),
            {**cat, "now": now},
        )

    for biz_id, area_id, cat_id, slug in BUSINESS_MAP:
        conn.execute(
            sa.text(
                "UPDATE businesses SET area_id=:area_id, category_id=:cat_id, slug=:slug, updated_at=:now WHERE id=:id"
            ),
            {
                "area_id": area_id,
                "cat_id": cat_id,
                "slug": slug,
                "now": now,
                "id": biz_id,
            },
        )

    for aw_id, biz_id, area_id, cat_id, tier, status in AWARDS:
        conn.execute(
            sa.text("""
                INSERT INTO awards (id, business_id, area_id, category_id, platform, award_name, year, tier, status,
                    offered_at, purchased_at, fulfilled_at, created_at, updated_at)
                VALUES (:id, :biz_id, :area_id, :cat_id, 'google',
                    'Apex Business Award 2026', 2026, :tier, CAST(:status AS awardstatus),
                    :now,
                    CASE WHEN CAST(:status AS TEXT) IN ('purchased','fulfilled') THEN :now ELSE NULL END,
                    CASE WHEN CAST(:status AS TEXT) = 'fulfilled' THEN :now ELSE NULL END,
                    :now, :now)
                ON CONFLICT DO NOTHING
            """),
            {
                "id": aw_id,
                "biz_id": biz_id,
                "area_id": area_id,
                "cat_id": cat_id,
                "tier": tier,
                "status": status,
                "now": now,
            },
        )


def downgrade() -> None:
    conn = op.get_bind()
    for aw_id, *_ in AWARDS:
        conn.execute(sa.text("DELETE FROM awards WHERE id = :id"), {"id": aw_id})
    for biz_id, *_ in BUSINESS_MAP:
        conn.execute(
            sa.text(
                "UPDATE businesses SET area_id=NULL, category_id=NULL, slug=NULL WHERE id=:id"
            ),
            {"id": biz_id},
        )
    for cat in CATEGORIES:
        conn.execute(sa.text("DELETE FROM categories WHERE id=:id"), {"id": cat["id"]})
    for area in AREAS:
        conn.execute(sa.text("DELETE FROM areas WHERE id=:id"), {"id": area["id"]})
