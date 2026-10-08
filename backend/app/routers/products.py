import math
import random
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from .. import models, schemas, serializers
from ..database import get_db

router = APIRouter(prefix="/api", tags=["products"])


@router.get("/categories", response_model=list[schemas.CategorySummary])
def list_categories(db: Session = Depends(get_db)):
    rows = (
        db.query(models.Product.category, func.count(models.Product.id))
        .group_by(models.Product.category)
        .order_by(func.count(models.Product.id).desc())
        .all()
    )
    return [schemas.CategorySummary(category=c, count=n) for c, n in rows]


@router.get("/products", response_model=schemas.ProductListResponse)
def list_products(
    db: Session = Depends(get_db),
    search: Optional[str] = None,
    category: Optional[str] = None,
    gender: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    min_rating: Optional[float] = None,
    sort: Optional[str] = Query(default=None, pattern="^(price_asc|price_desc|rating|newest)$"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=24, ge=1, le=100),
):
    q = db.query(models.Product)

    if search:
        like = f"%{search}%"
        q = q.filter(
            (models.Product.name.ilike(like))
            | (models.Product.brand.ilike(like))
            | (models.Product.category.ilike(like))
        )
    if category:
        q = q.filter(models.Product.category == category)
    if gender:
        q = q.filter(models.Product.gender == gender)
    if min_price is not None:
        q = q.filter(models.Product.sale_price >= min_price)
    if max_price is not None:
        q = q.filter(models.Product.sale_price <= max_price)
    if min_rating is not None:
        q = q.filter(models.Product.rating >= min_rating)

    if sort == "price_asc":
        q = q.order_by(models.Product.sale_price.asc())
    elif sort == "price_desc":
        q = q.order_by(models.Product.sale_price.desc())
    elif sort == "rating":
        q = q.order_by(models.Product.rating.desc())
    else:
        q = q.order_by(models.Product.id.desc())

    total = q.count()
    total_pages = max(1, math.ceil(total / page_size))
    items = q.offset((page - 1) * page_size).limit(page_size).all()

    return schemas.ProductListResponse(
        items=[serializers.to_product_card(p) for p in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/products/featured", response_model=list[schemas.ProductCard])
def featured_products(db: Session = Depends(get_db), limit: int = 12):
    items = (
        db.query(models.Product)
        .filter(models.Product.ratings_count >= 10)
        .order_by(models.Product.rating.desc(), models.Product.ratings_count.desc())
        .limit(limit)
        .all()
    )
    return [serializers.to_product_card(p) for p in items]


@router.get("/products/{product_id}", response_model=schemas.ProductDetail)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return serializers.to_product_detail(product)


@router.get("/products/{product_id}/similar", response_model=list[schemas.ProductCard])
def similar_products(product_id: int, db: Session = Depends(get_db), limit: int = 8):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    candidates = (
        db.query(models.Product)
        .filter(models.Product.category == product.category, models.Product.id != product.id)
        .all()
    )
    random.shuffle(candidates)
    return [serializers.to_product_card(p) for p in candidates[:limit]]
