"""Load dataset/Combined_dataset.csv into the products table.

Run with: python -m app.seed
"""
import csv
import json
import os

from .database import Base, SessionLocal, engine
from . import models

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROJECT_ROOT = os.path.dirname(BASE_DIR)
CSV_PATH = os.path.join(PROJECT_ROOT, "dataset", "Combined_dataset.csv")

KNOWN_GENDERS = {"men", "women", "boys", "girls", "unisex", "kids"}


def _parse_json(text, default):
    try:
        return json.loads(text) if text else default
    except (json.JSONDecodeError, TypeError):
        return default


def _parse_float(text, default=0.0):
    try:
        return float(text)
    except (TypeError, ValueError):
        return default


def _parse_int(text, default=0):
    try:
        return int(float(text))
    except (TypeError, ValueError):
        return default


def _extract_gender(breadcrumbs_raw):
    crumbs = _parse_json(breadcrumbs_raw, [])
    for crumb in crumbs:
        name = str(crumb.get("name", "")).strip().lower()
        if name in KNOWN_GENDERS:
            return name.capitalize()
    return None


def _extract_sizes(sizes_raw):
    entries = _parse_json(sizes_raw, [])
    sizes = []
    for entry in entries:
        size = entry.get("size")
        if size and size not in sizes:
            sizes.append(size)
    return sizes or ["Onesize"]


def _extract_images(images_raw):
    if not images_raw:
        return []
    return [url.strip() for url in images_raw.split(",") if url.strip()]


def _clean_text(value):
    return (value or "").strip()


def row_to_product(row: dict) -> models.Product:
    product_details = _parse_json(row.get("product_details"), {})
    price = _parse_float(row.get("initial_price"))
    discount = _parse_float(row.get("discount"))
    sale_price = round(price * (1 - discount / 100), 2) if discount else price

    seller_name = _clean_text(row.get("seller_name"))
    if not seller_name or "█" in seller_name:
        seller_name = "Myntra Seller"

    return models.Product(
        id=_parse_int(row.get("product_id")),
        brand=_clean_text(row.get("title")) or "Unbranded",
        name=_clean_text(row.get("product_description")) or "Product",
        category=_clean_text(row.get("category")) or "misc",
        gender=_extract_gender(row.get("breadcrumbs")),
        description=_clean_text(product_details.get("description")),
        material_and_care=_clean_text(product_details.get("material_and_care")),
        size_and_fit=_clean_text(product_details.get("size_and_fit")),
        price=price,
        discount_percent=discount,
        sale_price=sale_price,
        currency=_clean_text(row.get("currency")) or "INR",
        rating=_parse_float(row.get("rating")),
        ratings_count=_parse_int(row.get("ratings_count")),
        images_json=json.dumps(_extract_images(row.get("images"))),
        sizes_json=json.dumps(_extract_sizes(row.get("sizes"))),
        specifications_json=json.dumps(_parse_json(row.get("product_specifications"), [])),
        star_breakdown_json=json.dumps(_parse_json(row.get("amount_of_stars"), {})),
        seller_name=seller_name,
    )


def seed(reset: bool = False):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        existing_count = db.query(models.Product).count()
        if existing_count and not reset:
            print(f"Products table already has {existing_count} rows. Skipping seed (use reset=True to reload).")
            return

        if reset:
            db.query(models.Product).delete()
            db.commit()

        with open(CSV_PATH, encoding="utf-8") as f:
            reader = csv.DictReader(f)
            count = 0
            for row in reader:
                if not row.get("product_id"):
                    continue
                product = row_to_product(row)
                db.merge(product)
                count += 1
        db.commit()
        print(f"Seeded {count} products from {CSV_PATH}")
    finally:
        db.close()


if __name__ == "__main__":
    seed(reset=True)
