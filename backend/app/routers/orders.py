from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas, security, serializers
from ..database import get_db

router = APIRouter(prefix="/api/orders", tags=["orders"])


@router.post("", response_model=schemas.OrderOut, status_code=201)
def place_order(
    payload: schemas.ShippingInfo,
    db: Session = Depends(get_db),
    user: models.User = Depends(security.get_current_user),
):
    cart_items = db.query(models.CartItem).filter(models.CartItem.user_id == user.id).all()
    if not cart_items:
        raise HTTPException(status_code=400, detail="Your cart is empty")

    order = models.Order(
        user_id=user.id,
        status="PLACED",
        total_amount=0,
        full_name=payload.full_name,
        phone=payload.phone,
        address_line=payload.address_line,
        city=payload.city,
        state=payload.state,
        pincode=payload.pincode,
    )
    db.add(order)
    db.flush()

    total = 0.0
    for cart_item in cart_items:
        price = cart_item.product.sale_price
        total += price * cart_item.quantity
        db.add(
            models.OrderItem(
                order_id=order.id,
                product_id=cart_item.product_id,
                quantity=cart_item.quantity,
                size=cart_item.size,
                price_at_purchase=price,
            )
        )

    order.total_amount = round(total, 2)
    db.query(models.CartItem).filter(models.CartItem.user_id == user.id).delete()
    db.commit()
    db.refresh(order)

    return _order_out(order)


def _order_out(order: models.Order) -> schemas.OrderOut:
    return schemas.OrderOut(
        id=order.id,
        status=order.status,
        total_amount=order.total_amount,
        full_name=order.full_name,
        phone=order.phone,
        address_line=order.address_line,
        city=order.city,
        state=order.state,
        pincode=order.pincode,
        created_at=order.created_at,
        items=[
            schemas.OrderItemOut(
                id=item.id,
                quantity=item.quantity,
                size=item.size,
                price_at_purchase=item.price_at_purchase,
                product=serializers.to_product_card(item.product),
            )
            for item in order.items
        ],
    )


@router.get("", response_model=list[schemas.OrderSummaryOut])
def list_orders(db: Session = Depends(get_db), user: models.User = Depends(security.get_current_user)):
    orders = (
        db.query(models.Order)
        .filter(models.Order.user_id == user.id)
        .order_by(models.Order.created_at.desc())
        .all()
    )
    return [
        schemas.OrderSummaryOut(
            id=o.id,
            status=o.status,
            total_amount=o.total_amount,
            created_at=o.created_at,
            item_count=sum(i.quantity for i in o.items),
        )
        for o in orders
    ]


@router.get("/{order_id}", response_model=schemas.OrderOut)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(security.get_current_user),
):
    order = (
        db.query(models.Order)
        .filter(models.Order.id == order_id, models.Order.user_id == user.id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return _order_out(order)
