from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# --- Base Schemas ---

class CustomerBase(BaseModel):
    customer_id: str
    name: Optional[str] = None

class CustomerCreate(CustomerBase):
    pass

class Customer(CustomerBase):
    created_at: datetime
    
    class Config:
        from_attributes = True

class ProductBase(BaseModel):
    product_id: str
    name: str
    unit_price: float

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    created_at: datetime
    
    class Config:
        from_attributes = True

# --- Transaction / Ingest ---

class RawTransactionItem(BaseModel):
    invoice_id: str
    product_id: str
    customer_id: str
    timestamp: datetime
    product_name: str
    product_quantity: int
    product_unit_price: float

class IngestResponse(BaseModel):
    status: str
    processed_count: int
    new_customers: int
    new_products: int

# --- Analytics / Dashboard ---

class DashboardSummary(BaseModel):
    total_revenue: float
    total_orders: int
    total_customers: int
    top_selling_products: List[dict]
    recent_transactions: List[dict]

class DemandForecast(BaseModel):
    product_id: str
    forecasted_demand: float
    confidence_score: float

class Recommendation(BaseModel):
    customer_id: str
    recommended_products: List[Product]

# --- Other ---

class InventoryStatus(BaseModel):
    product_id: str
    product_name: str
    stock_level: int
    reorder_point: int
    status: str # "OK", "LOW", "OUT_OF_STOCK"

class PriceUpdate(BaseModel):
    product_id: str
    old_price: float
    new_price: float
    reason: str
