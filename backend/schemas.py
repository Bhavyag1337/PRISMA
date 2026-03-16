from pydantic import BaseModel
from typing import List, Optional
from datetime import date, datetime

class ProductBase(BaseModel):
    name: str
    category: str
    price: float
    stock: int
    expiry_date: Optional[date] = None

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    product_id: int

    class Config:
        from_attributes = True

class CustomerBase(BaseModel):
    name: str
    age: int

class CustomerCreate(CustomerBase):
    pass

class Customer(CustomerBase):
    customer_id: int

    class Config:
        from_attributes = True

class OrderItemBase(BaseModel):
    product_id: int
    quantity: int

class OrderItemCreate(OrderItemBase):
    pass

class OrderItem(OrderItemBase):
    order_id: int

    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    customer_id: int
    date: datetime

class OrderCreate(OrderBase):
    items: List[OrderItemCreate]

class Order(OrderBase):
    order_id: int
    items: List[OrderItem] = []

    class Config:
        from_attributes = True

class PriceUpdate(BaseModel):
    rules_applied: List[str]
    old_price: float
    new_price: float
