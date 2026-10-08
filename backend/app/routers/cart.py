from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas, security, serializers
from ..database import get_db

router = APIRouter(prefix="/api/cart", tags=["cart"])


def _cart_out(db: Session, user: models.User) -> schemas.CartOut:
    items = (
        db.query(models.CartItem)
        .filter(models.CartItem.user_id == user.id)
        .order_by(models.CartItem.id.desc())
        .all()
    )
    out_items = []
    subtotal = 0.0
    total_items = 0
    for item in items:
        card = serializers.to_product_card(item.product)
        out_items.append(schemas.CartItemOut(id=item.id, quantity=item.quantity, size=item.size, product=card))
        subtotal += card.sale_price * item.quantity
        total_items += item.quantity

    return schemas.CartOut(items=out_items, subtotal=round(subtotal, 2), total_items=total_items)


@router.get("", response_model=schemas.CartOut)
def get_cart(db: Session = Depends(get_db), user: models.User = Depends(security.get_current_user)):
    return _cart_out(db, user)


@router.post("", response_model=schemas.CartOut)
def add_to_cart(
    payload: schemas.CartItemCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(security.get_current_user),
):
    product = db.query(models.Product).filter(models.Product.id == payload.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if payload.quantity < 1:
        raise HTTPException(status_code=400, detail="Quantity must be at least 1")

    existing = (
        db.query(models.CartItem)
        .filter(
            models.CartItem.user_id == user.id,
            models.CartItem.product_id == payload.product_id,
            models.CartItem.size == payload.size,
        )
        .first()
    )
    if existing:
        existing.quantity += payload.quantity
    else:
        db.add(
            models.CartItem(
                user_id=user.id,
                product_id=payload.product_id,
                quantity=payload.quantity,
                size=payload.size,
            )
        )
    db.commit()
    return _cart_out(db, user)


@router.put("/{item_id}", response_model=schemas.CartOut)
def update_cart_item(
    item_id: int,
    payload: schemas.CartItemUpdate,
    db: Session = Depends(get_db),
    user: models.User = Depends(security.get_current_user),
):
    item = (
        db.query(models.CartItem)
        .filter(models.CartItem.id == item_id, models.CartItem.user_id == user.id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    if payload.quantity is not None:
        if payload.quantity < 1:
            raise HTTPException(status_code=400, detail="Quantity must be at least 1")
        item.quantity = payload.quantity
    if payload.size is not None:
        item.size = payload.size

    db.commit()
    return _cart_out(db, user)


@router.delete("/{item_id}", response_model=schemas.CartOut)
def remove_cart_item(
    item_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(security.get_current_user),
):
    item = (
        db.query(models.CartItem)
        .filter(models.CartItem.id == item_id, models.CartItem.user_id == user.id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    db.delete(item)
    db.commit()
    return _cart_out(db, user)


@router.delete("", response_model=schemas.CartOut)
def clear_cart(db: Session = Depends(get_db), user: models.User = Depends(security.get_current_user)):
    db.query(models.CartItem).filter(models.CartItem.user_id == user.id).delete()
    db.commit()
    return _cart_out(db, user)
