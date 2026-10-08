import datetime as dt

from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Text,
    ForeignKey,
    DateTime,
)
from sqlalchemy.orm import relationship

from .database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    brand = Column(String, index=True, nullable=False, default="")
    name = Column(String, nullable=False, default="")
    category = Column(String, index=True, nullable=False, default="")
    gender = Column(String, index=True, nullable=True)
    description = Column(Text, default="")
    material_and_care = Column(Text, default="")
    size_and_fit = Column(Text, default="")

    price = Column(Float, nullable=False, default=0)
    discount_percent = Column(Float, nullable=False, default=0)
    sale_price = Column(Float, nullable=False, default=0)
    currency = Column(String, default="INR")

    rating = Column(Float, default=0)
    ratings_count = Column(Integer, default=0)

    images_json = Column(Text, default="[]")
    sizes_json = Column(Text, default="[]")
    specifications_json = Column(Text, default="[]")
    star_breakdown_json = Column(Text, default="{}")

    seller_name = Column(String, default="")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, default="")
    created_at = Column(DateTime, default=dt.datetime.utcnow)

    cart_items = relationship("CartItem", back_populates="user", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="user", cascade="all, delete-orphan")


class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    size = Column(String, default="Onesize")
    created_at = Column(DateTime, default=dt.datetime.utcnow)

    user = relationship("User", back_populates="cart_items")
    product = relationship("Product")


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String, default="PLACED")
    total_amount = Column(Float, nullable=False, default=0)

    full_name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    address_line = Column(String, nullable=False)
    city = Column(String, nullable=False)
    state = Column(String, nullable=False)
    pincode = Column(String, nullable=False)

    created_at = Column(DateTime, default=dt.datetime.utcnow)

    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    size = Column(String, default="Onesize")
    price_at_purchase = Column(Float, nullable=False, default=0)

    order = relationship("Order", back_populates="items")
    product = relationship("Product")
