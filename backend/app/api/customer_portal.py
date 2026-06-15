"""Customer-facing portal endpoints (protected by customer JWT).

All routes require a valid customer access token obtained from /customer/auth/verify.
"""

import uuid
from datetime import datetime
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..db import get_db
from ..models.customer import Customer
from ..models.fulfillment import AwardFulfillment
from ..models.order import Order
from .customer_auth import decode_customer_token

router = APIRouter(prefix="/customer", tags=["customer-portal"])

_bearer = HTTPBearer(auto_error=True)


# ── Auth dependency ───────────────────────────────────────────────────────────


async def require_customer(
    creds: HTTPAuthorizationCredentials = Depends(_bearer),
    db: AsyncSession = Depends(get_db),
) -> Customer:
    claims = decode_customer_token(creds.credentials)
    customer_id = claims["sub"]
    result = await db.execute(
        select(Customer).where(Customer.id == uuid.UUID(customer_id))
    )
    customer = result.scalar_one_or_none()
    if customer is None:
        raise HTTPException(404, "Customer not found")
    return customer


# ── Schemas ───────────────────────────────────────────────────────────────────


class FulfillmentOut(BaseModel):
    id: str
    fulfillment_type: str
    status: str
    file_url: str | None
    tracking_number: str | None
    shipped_at: datetime | None
    delivered_at: datetime | None


class OrderOut(BaseModel):
    id: str
    tier: str
    status: str
    amount: Decimal
    currency: str
    paid_at: datetime | None
    created_at: datetime
    award_name: str
    award_year: int
    business_name: str
    fulfillments: list[FulfillmentOut]


class CustomerProfileOut(BaseModel):
    id: str
    first_name: str
    last_name: str
    email: str
    phone: str | None
    business_name: str


# ── Endpoints ─────────────────────────────────────────────────────────────────


@router.get("/me", response_model=CustomerProfileOut)
async def get_profile(
    customer: Customer = Depends(require_customer),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Customer)
        .where(Customer.id == customer.id)
        .options(selectinload(Customer.business))
    )
    c = result.scalar_one()
    return CustomerProfileOut(
        id=str(c.id),
        first_name=c.first_name,
        last_name=c.last_name,
        email=c.email,
        phone=c.phone,
        business_name=c.business.name if c.business else "",
    )


@router.get("/orders", response_model=list[OrderOut])
async def list_orders(
    customer: Customer = Depends(require_customer),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Order)
        .where(Order.customer_id == customer.id)
        .options(
            selectinload(Order.award).selectinload("business"),
            selectinload(Order.fulfillments),
        )
        .order_by(Order.created_at.desc())
    )
    orders = result.scalars().all()
    return [_order_to_out(o) for o in orders]


@router.get("/orders/{order_id}", response_model=OrderOut)
async def get_order(
    order_id: str,
    customer: Customer = Depends(require_customer),
    db: AsyncSession = Depends(get_db),
):
    try:
        oid = uuid.UUID(order_id)
    except ValueError:
        raise HTTPException(422, "Invalid order ID")

    result = await db.execute(
        select(Order)
        .where(Order.id == oid, Order.customer_id == customer.id)
        .options(
            selectinload(Order.award).selectinload("business"),
            selectinload(Order.fulfillments),
        )
    )
    order = result.scalar_one_or_none()
    if order is None:
        raise HTTPException(404, "Order not found")
    return _order_to_out(order)


# ── Helpers ───────────────────────────────────────────────────────────────────


def _order_to_out(order: Order) -> OrderOut:
    award = order.award
    business = award.business if award else None
    return OrderOut(
        id=str(order.id),
        tier=order.tier,
        status=order.status.value,
        amount=order.amount,
        currency=order.currency,
        paid_at=order.paid_at,
        created_at=order.created_at,
        award_name=award.award_name if award else "",
        award_year=award.year if award else 0,
        business_name=business.name if business else "",
        fulfillments=[_fulfillment_to_out(f) for f in order.fulfillments],
    )


def _fulfillment_to_out(f: AwardFulfillment) -> FulfillmentOut:
    return FulfillmentOut(
        id=str(f.id),
        fulfillment_type=f.fulfillment_type.value,
        status=f.status.value,
        file_url=f.file_url,
        tracking_number=f.tracking_number,
        shipped_at=f.shipped_at,
        delivered_at=f.delivered_at,
    )
