import json

from . import models, schemas


def _safe_json(text, default):
    try:
        return json.loads(text) if text else default
    except (json.JSONDecodeError, TypeError):
        return default


def to_product_card(product: models.Product) -> schemas.ProductCard:
    images = _safe_json(product.images_json, [])
    return schemas.ProductCard(
        id=product.id,
        brand=product.brand,
        name=product.name,
        category=product.category,
        gender=product.gender,
        price=product.price,
        discount_percent=product.discount_percent,
        sale_price=product.sale_price,
        currency=product.currency,
        rating=product.rating,
        ratings_count=product.ratings_count,
        image=images[0] if images else None,
    )


def to_product_detail(product: models.Product) -> schemas.ProductDetail:
    return schemas.ProductDetail(
        id=product.id,
        brand=product.brand,
        name=product.name,
        category=product.category,
        gender=product.gender,
        description=product.description,
        material_and_care=product.material_and_care,
        size_and_fit=product.size_and_fit,
        price=product.price,
        discount_percent=product.discount_percent,
        sale_price=product.sale_price,
        currency=product.currency,
        rating=product.rating,
        ratings_count=product.ratings_count,
        images=_safe_json(product.images_json, []),
        sizes=_safe_json(product.sizes_json, []),
        specifications=_safe_json(product.specifications_json, []),
        star_breakdown=_safe_json(product.star_breakdown_json, {}),
        seller_name=product.seller_name or "Myntra Seller",
    )
