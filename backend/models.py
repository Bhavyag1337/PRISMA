from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Index, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class Customer(Base):
    __tablename__ = "customers"

    customer_id = Column(String, primary_key=True, index=True) # Using string ID as per external ingest
    name = Column(String, index=True, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    invoices = relationship("Invoice", back_populates="customer")

class Product(Base):
    __tablename__ = "products"

    product_id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    unit_price = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    inventory = relationship("Inventory", back_populates="product", uselist=False)
    invoice_items = relationship("InvoiceItem", back_populates="product")
    price_history = relationship("PriceHistory", back_populates="product")

class Invoice(Base):
    __tablename__ = "invoices"

    invoice_id = Column(String, primary_key=True, index=True)
    customer_id = Column(String, ForeignKey("customers.customer_id"), index=True)
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    total_amount = Column(Float, default=0.0)

    customer = relationship("Customer", back_populates="invoices")
    items = relationship("InvoiceItem", back_populates="invoice")

class InvoiceItem(Base):
    __tablename__ = "invoice_items"

    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(String, ForeignKey("invoices.invoice_id"), index=True)
    product_id = Column(String, ForeignKey("products.product_id"), index=True)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False) # Store historical price at time of sale

    invoice = relationship("Invoice", back_populates="items")
    product = relationship("Product", back_populates="invoice_items")

class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(String, ForeignKey("products.product_id"), unique=True)
    stock_level = Column(Integer, default=0)
    reorder_point = Column(Integer, default=10)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    product = relationship("Product", back_populates="inventory")

class PriceHistory(Base):
    __tablename__ = "price_history"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(String, ForeignKey("products.product_id"), index=True)
    price = Column(Float, nullable=False)
    change_reason = Column(String, nullable=True)
    effective_date = Column(DateTime(timezone=True), server_default=func.now())

    product = relationship("Product", back_populates="price_history")

class RecommendationsCache(Base):
    __tablename__ = "recommendations_cache"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(String, ForeignKey("customers.customer_id"), index=True)
    recommended_product_ids = Column(JSON) # List of product IDs
    generated_at = Column(DateTime(timezone=True), server_default=func.now())
