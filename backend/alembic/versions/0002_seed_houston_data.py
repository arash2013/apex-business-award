"""Seed Houston demo data

Revision ID: 0002
Revises: 0001
Create Date: 2026-01-02 00:00:00.000000

"""

from typing import Sequence, Union

import uuid
from datetime import date, datetime, timezone

import sqlalchemy as sa
from alembic import op

revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

BUSINESSES = [
    {
        "id": "a1b2c3d4-0001-0000-0000-000000000001",
        "name": "Cool Air HVAC Solutions",
        "category": "HVAC",
        "neighborhood": "Houston Heights",
        "address": "1420 Yale St, Houston, TX 77008",
        "city": "Houston",
        "state": "TX",
        "zip": "77008",
        "phone": "(713) 555-0101",
        "website": "https://coolair-hvac.example.com",
        "google_rating": 4.9,
        "google_review_count": 312,
        "google_last_review_date": date(2026, 5, 1),
        "google_owner_response_rate": 82.5,
        "yelp_rating": 4.8,
        "yelp_review_count": 187,
        "qualification_score": 97.20,
        "qualified": True,
        "years_in_business": 12,
    },
    {
        "id": "a1b2c3d4-0002-0000-0000-000000000002",
        "name": "Montrose Dental Care",
        "category": "Dentist",
        "neighborhood": "Montrose",
        "address": "3801 Westheimer Rd, Houston, TX 77027",
        "city": "Houston",
        "state": "TX",
        "zip": "77027",
        "phone": "(713) 555-0202",
        "website": "https://montrose-dental.example.com",
        "google_rating": 4.8,
        "google_review_count": 428,
        "google_last_review_date": date(2026, 4, 15),
        "google_owner_response_rate": 91.0,
        "yelp_rating": 4.7,
        "yelp_review_count": 203,
        "qualification_score": 95.80,
        "qualified": True,
        "years_in_business": 8,
    },
    {
        "id": "a1b2c3d4-0003-0000-0000-000000000003",
        "name": "Midtown Bites",
        "category": "Restaurant",
        "neighborhood": "Midtown",
        "address": "2503 Fannin St, Houston, TX 77002",
        "city": "Houston",
        "state": "TX",
        "zip": "77002",
        "phone": "(713) 555-0303",
        "website": "https://midtownbites.example.com",
        "google_rating": 4.7,
        "google_review_count": 891,
        "google_last_review_date": date(2026, 5, 20),
        "google_owner_response_rate": 45.0,
        "yelp_rating": 4.6,
        "yelp_review_count": 634,
        "qualification_score": 94.10,
        "qualified": True,
        "years_in_business": 5,
    },
    {
        "id": "a1b2c3d4-0004-0000-0000-000000000004",
        "name": "Galleria Auto Repair",
        "category": "Auto Repair",
        "neighborhood": "Galleria",
        "address": "5555 Richmond Ave, Houston, TX 77056",
        "city": "Houston",
        "state": "TX",
        "zip": "77056",
        "phone": "(713) 555-0404",
        "website": "https://galleria-auto.example.com",
        "google_rating": 4.8,
        "google_review_count": 156,
        "google_last_review_date": date(2026, 3, 10),
        "google_owner_response_rate": 78.0,
        "yelp_rating": 4.7,
        "yelp_review_count": 98,
        "qualification_score": 91.50,
        "qualified": True,
        "years_in_business": 15,
    },
    {
        "id": "a1b2c3d4-0005-0000-0000-000000000005",
        "name": "River Oaks Legal Group",
        "category": "Law Firm",
        "neighborhood": "River Oaks",
        "address": "2727 Allen Pkwy, Houston, TX 77019",
        "city": "Houston",
        "state": "TX",
        "zip": "77019",
        "phone": "(713) 555-0505",
        "website": "https://ro-legal.example.com",
        "google_rating": 4.9,
        "google_review_count": 74,
        "google_last_review_date": date(2026, 4, 1),
        "google_owner_response_rate": 95.0,
        "yelp_rating": 4.8,
        "yelp_review_count": 41,
        "qualification_score": 89.30,
        "qualified": True,
        "years_in_business": 22,
    },
    {
        "id": "a1b2c3d4-0006-0000-0000-000000000006",
        "name": "EaDo Fitness Studio",
        "category": "Gym",
        "neighborhood": "East Downtown",
        "address": "2602 Canal St, Houston, TX 77003",
        "city": "Houston",
        "state": "TX",
        "zip": "77003",
        "phone": "(713) 555-0606",
        "website": "https://eado-fitness.example.com",
        "google_rating": 4.6,
        "google_review_count": 203,
        "google_last_review_date": date(2026, 5, 10),
        "google_owner_response_rate": 60.0,
        "yelp_rating": 4.5,
        "yelp_review_count": 119,
        "qualification_score": 87.40,
        "qualified": True,
        "years_in_business": 4,
    },
    {
        "id": "a1b2c3d4-0007-0000-0000-000000000007",
        "name": "The Woodlands Plumbing Co.",
        "category": "Plumbing",
        "neighborhood": "The Woodlands",
        "address": "2219 Sawdust Rd, The Woodlands, TX 77380",
        "city": "The Woodlands",
        "state": "TX",
        "zip": "77380",
        "phone": "(281) 555-0707",
        "website": "https://twp-plumbing.example.com",
        "google_rating": 4.5,
        "google_review_count": 88,
        "google_last_review_date": date(2026, 2, 20),
        "google_owner_response_rate": 55.0,
        "yelp_rating": 4.4,
        "yelp_review_count": 52,
        "qualification_score": 82.10,
        "qualified": True,
        "years_in_business": 9,
    },
    {
        "id": "a1b2c3d4-0008-0000-0000-000000000008",
        "name": "Sugar Land Veterinary Clinic",
        "category": "Veterinarian",
        "neighborhood": "Sugar Land",
        "address": "77 Sugar Creek Center Blvd, Sugar Land, TX 77478",
        "city": "Sugar Land",
        "state": "TX",
        "zip": "77478",
        "phone": "(281) 555-0808",
        "website": "https://slvet.example.com",
        "google_rating": 4.7,
        "google_review_count": 340,
        "google_last_review_date": date(2026, 5, 18),
        "google_owner_response_rate": 70.0,
        "yelp_rating": 4.6,
        "yelp_review_count": 198,
        "qualification_score": 93.00,
        "qualified": True,
        "years_in_business": 11,
    },
    # Not yet qualified
    {
        "id": "a1b2c3d4-0009-0000-0000-000000000009",
        "name": "Pearland Tax Prep",
        "category": "Accounting",
        "neighborhood": "Pearland",
        "address": "2800 Business Center Dr, Pearland, TX 77584",
        "city": "Pearland",
        "state": "TX",
        "zip": "77584",
        "phone": "(281) 555-0909",
        "website": "https://pearland-tax.example.com",
        "google_rating": 3.9,
        "google_review_count": 32,
        "google_last_review_date": date(2025, 11, 5),
        "google_owner_response_rate": 10.0,
        "yelp_rating": 3.8,
        "yelp_review_count": 14,
        "qualification_score": 0.0,
        "qualified": False,
        "years_in_business": 2,
    },
    {
        "id": "a1b2c3d4-0010-0000-0000-000000000010",
        "name": "Katy Roofing Solutions",
        "category": "Roofing",
        "neighborhood": "Katy",
        "address": "1550 Katy Fort Bend Rd, Katy, TX 77494",
        "city": "Katy",
        "state": "TX",
        "zip": "77494",
        "phone": "(281) 555-1010",
        "website": "https://katy-roofing.example.com",
        "google_rating": 4.1,
        "google_review_count": 45,
        "google_last_review_date": date(2026, 1, 15),
        "google_owner_response_rate": 30.0,
        "yelp_rating": 4.0,
        "yelp_review_count": 27,
        "qualification_score": 0.0,
        "qualified": False,
        "years_in_business": 3,
    },
]


def upgrade() -> None:
    conn = op.get_bind()
    now = datetime.now(timezone.utc)

    for b in BUSINESSES:
        conn.execute(
            sa.text("""
                INSERT INTO businesses (
                    id, name, category, neighborhood, address, city, state, zip, phone, website,
                    google_rating, google_review_count, google_last_review_date,
                    google_owner_response_rate, yelp_rating, yelp_review_count,
                    years_in_business, qualification_score, qualified, qualification_date,
                    created_at, updated_at
                ) VALUES (
                    :id, :name, :category, :neighborhood, :address, :city, :state, :zip,
                    :phone, :website, :google_rating, :google_review_count,
                    :google_last_review_date, :google_owner_response_rate,
                    :yelp_rating, :yelp_review_count, :years_in_business,
                    :qualification_score, :qualified, :qualification_date,
                    :created_at, :updated_at
                )
                ON CONFLICT DO NOTHING
                """),
            {
                "id": b["id"],
                "name": b["name"],
                "category": b["category"],
                "neighborhood": b["neighborhood"],
                "address": b["address"],
                "city": b["city"],
                "state": b["state"],
                "zip": b["zip"],
                "phone": b["phone"],
                "website": b["website"],
                "google_rating": b["google_rating"],
                "google_review_count": b["google_review_count"],
                "google_last_review_date": b["google_last_review_date"],
                "google_owner_response_rate": b["google_owner_response_rate"],
                "yelp_rating": b["yelp_rating"],
                "yelp_review_count": b["yelp_review_count"],
                "years_in_business": b["years_in_business"],
                "qualification_score": b["qualification_score"],
                "qualified": b["qualified"],
                "qualification_date": now if b["qualified"] else None,
                "created_at": now,
                "updated_at": now,
            },
        )


def downgrade() -> None:
    conn = op.get_bind()
    for b in BUSINESSES:
        conn.execute(
            sa.text("DELETE FROM businesses WHERE id = :id"),
            {"id": b["id"]},
        )
