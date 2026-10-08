import datetime as dt
from typing import List, Optional, Any

from pydantic import BaseModel, EmailStr, ConfigDict


# ---------- Product ----------

class ProductCard(BaseModel):
    id: int
    brand: str
    name: str
    category: str
    gender: Optional[str] = None
    price: float
    discount_percent: float
    sale_price: float
    currency: str
    rating: float
    ratings_count: int
    image: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ProductDetail(BaseModel):
    id: int
    brand: str
    name: str
    category: str
    gender: Optional[str] = None
    description: str
    material_and_care: str
    size_and_fit: str
    price: float
    discount_percent: float
    sale_price: float
    currency: str
    rating: float
    ratings_count: int
    images: List[str]
    sizes: List[str]
    specifications: List[dict]
    star_breakdown: dict
    seller_name: str

    model_config = ConfigDict(from_attributes=True)


class ProductListResponse(BaseModel):
    items: List[ProductCard]
    total: int
    page: int
    page_size: int
    total_pages: int


class CategorySummary(BaseModel):
    category: str
    count: int


# ---------- Auth / User ----------

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str = ""


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: str

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------- Cart ----------

class CartItemCreate(BaseModel):
    product_id: int
    quantity: int = 1
    size: str = "Onesize"


class CartItemUpdate(BaseModel):
    quantity: Optional[int] = None
    size: Optional[str] = None


class CartItemOut(BaseModel):
    id: int
    quantity: int
    size: str
    product: ProductCard

    model_config = ConfigDict(from_attributes=True)


class CartOut(BaseModel):
    items: List[CartItemOut]
    subtotal: float
    total_items: int


# ---------- Orders ----------

class ShippingInfo(BaseModel):
    full_name: str
    phone: str
    address_line: str
    city: str
    state: str
    pincode: str


class OrderItemOut(BaseModel):
    id: int
    quantity: int
    size: str
    price_at_purchase: float
    product: ProductCard

    model_config = ConfigDict(from_attributes=True)


class OrderOut(BaseModel):
    id: int
    status: str
    total_amount: float
    full_name: str
    phone: str
    address_line: str
    city: str
    state: str
    pincode: str
    created_at: dt.datetime
    items: List[OrderItemOut]

    model_config = ConfigDict(from_attributes=True)


class OrderSummaryOut(BaseModel):
    id: int
    status: str
    total_amount: float
    created_at: dt.datetime
    item_count: int

    model_config = ConfigDict(from_attributes=True)
