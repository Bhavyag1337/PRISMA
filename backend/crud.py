from sqlalchemy.orm import Session
from sqlalchemy import func, desc
import models
import schemas
from datetime import datetime
from typing import List

def ingest_raw_data(db: Session, transactions: List[schemas.RawTransactionItem]):
    processed_count = 0
    new_customers = 0
    new_products = 0
    
    # Using a dictionary-based cache to minimize DB hits during bulk ingest
    customer_cache = {}
    product_cache = {}

    for tx in transactions:
        # 1. Ensure Customer exists
        if tx.customer_id not in customer_cache:
            db_customer = db.query(models.Customer).filter(models.Customer.customer_id == tx.customer_id).first()
            if not db_customer:
                db_customer = models.Customer(customer_id=tx.customer_id, name=None)
                db.add(db_customer)
                new_customers += 1
            customer_cache[tx.customer_id] = db_customer

        # 2. Ensure Product exists
        if tx.product_id not in product_cache:
            db_product = db.query(models.Product).filter(models.Product.product_id == tx.product_id).first()
            if not db_product:
                db_product = models.Product(
                    product_id=tx.product_id, 
                    name=tx.product_name, 
                    unit_price=tx.product_unit_price
                )
                db.add(db_product)
                
                # Initialize inventory for new product
                db_inventory = models.Inventory(product_id=tx.product_id, stock_level=0)
                db.add(db_inventory)
                new_products += 1
            product_cache[tx.product_id] = db_product

        # 3. Create Invoice if it doesn't exist
        db_invoice = db.query(models.Invoice).filter(models.Invoice.invoice_id == tx.invoice_id).first()
        if not db_invoice:
            db_invoice = models.Invoice(
                invoice_id=tx.invoice_id,
                customer_id=tx.customer_id,
                timestamp=tx.timestamp,
                total_amount=0.0
            )
            db.add(db_invoice)

        # 4. Create Invoice Item
        db_item = models.InvoiceItem(
            invoice_id=tx.invoice_id,
            product_id=tx.product_id,
            quantity=tx.product_quantity,
            unit_price=tx.product_unit_price
        )
        db.add(db_item)
        
        # Update invoice total
        db_invoice.total_amount += (tx.product_quantity * tx.product_unit_price)

        # 5. Update Inventory (Ingest can represent sales, so we deduct stock)
        # Note: In a real system, we might have separate stock-in vs stock-out.
        # Here we assume ingest of historical sales, so we track movement.
        db_inventory = db.query(models.Inventory).filter(models.Inventory.product_id == tx.product_id).first()
        if db_inventory:
            db_inventory.stock_level -= tx.product_quantity
        
        processed_count += 1
    
    db.commit()
    return {
        "status": "success",
        "processed_count": processed_count,
        "new_customers": new_customers,
        "new_products": new_products
    }

def get_dashboard_summary(db: Session):
    total_revenue = db.query(func.sum(models.Invoice.total_amount)).scalar() or 0.0
    total_orders = db.query(func.count(models.Invoice.invoice_id)).scalar() or 0
    total_customers = db.query(func.count(models.Customer.customer_id)).scalar() or 0
    
    top_selling = db.query(
        models.Product.name,
        func.sum(models.InvoiceItem.quantity).label("total_sold")
    ).join(models.InvoiceItem).group_by(models.Product.product_id).order_by(desc("total_sold")).limit(5).all()
    
    recent_transactions = db.query(models.Invoice).order_by(desc(models.Invoice.timestamp)).limit(10).all()
    
    return {
        "total_revenue": total_revenue,
        "total_orders": total_orders,
        "total_customers": total_customers,
        "top_selling_products": [{"name": p.name, "quantity": p.total_sold} for p in top_selling],
        "recent_transactions": [
            {"id": i.invoice_id, "amount": i.total_amount, "time": i.timestamp} for i in recent_transactions
        ]
    }

def get_inventory_alerts(db: Session):
    low_stock = db.query(models.Inventory).filter(models.Inventory.stock_level < models.Inventory.reorder_point).all()
    return [
        schemas.InventoryStatus(
            product_id=inv.product_id,
            product_name=inv.product.name,
            stock_level=inv.stock_level,
            reorder_point=inv.reorder_point,
            status="LOW" if inv.stock_level > 0 else "OUT_OF_STOCK"
        ) for inv in low_stock
    ]
