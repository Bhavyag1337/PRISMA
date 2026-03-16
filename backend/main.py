from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from datetime import date, timedelta
from contextlib import asynccontextmanager
import random
import uvicorn

from database import engine, get_db, Base
import models
import schemas
from ml_engine import predict_demand, get_recommendations

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="PRISMA (Predictive Retail Intelligence & Sales Management Analytics)",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For dev only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to PRISMA API"}

# --- PRODUCTS ---

@app.get("/products", response_model=List[schemas.Product])
def get_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    products = db.query(models.Product).offset(skip).limit(limit).all()
    return products

@app.post("/products", response_model=schemas.Product)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    db_product = models.Product(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

# --- ORDERS ---

@app.get("/orders", response_model=List[schemas.Order])
def get_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    orders = db.query(models.Order).offset(skip).limit(limit).all()
    return orders

@app.post("/orders", response_model=schemas.Order)
def create_order(order: schemas.OrderCreate, db: Session = Depends(get_db)):
    # Check if things exist...
    db_order = models.Order(customer_id=order.customer_id, date=order.date)
    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    for item in order.items:
        db_item = models.OrderItem(
            order_id=db_order.order_id, 
            product_id=item.product_id, 
            quantity=item.quantity
        )
        # Update stock
        product = db.query(models.Product).filter(models.Product.product_id == item.product_id).first()
        if product:
            product.stock -= item.quantity
        db.add(db_item)
    
    db.commit()
    return db_order

# --- SALES ANALYTICS ---

@app.get("/sales/analytics")
@app.get("/dashboard/summary")
def get_sales_analytics(db: Session = Depends(get_db)):
    orders = db.query(models.Order).all()
    
    # Calculate revenue
    total_revenue = 0
    monthly_revenue = {}
    top_selling = {}
    
    for order in orders:
        month_key = order.date.strftime("%Y-%m")
        if month_key not in monthly_revenue:
            monthly_revenue[month_key] = 0

        for item in order.items:
            product = item.product
            revenue = item.quantity * product.price
            total_revenue += revenue
            monthly_revenue[month_key] += revenue
            
            p_name = product.name
            top_selling[p_name] = top_selling.get(p_name, 0) + item.quantity

    sorted_top_selling = sorted(top_selling.items(), key=lambda x: x[1], reverse=True)[:5]
    
    # Format monthly revenue for charts
    trends = [{"month": k, "revenue": v} for k, v in sorted(monthly_revenue.items())]

    return {
        "total_revenue": total_revenue,
        "monthly_revenue": trends,
        "top_selling_products": [{"name": k, "quantity": v} for k, v in sorted_top_selling]
    }

# --- DEMAND PREDICTION ---

@app.get("/predict-demand/{product_id}")
def predict_product_demand(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.product_id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Get history of sales for this product
    items = db.query(models.OrderItem).filter(models.OrderItem.product_id == product_id).all()
    
    orders_data = []
    for item in items:
        orders_data.append({
            "date": item.order.date,
            "quantity": item.quantity
        })

    prediction = predict_demand(product_id, orders_data)
    return {"product": product.name, "prediction": prediction}

# --- RECOMMENDATIONS ---

@app.get("/recommend/{product_id}")
def recommend_products(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.product_id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Build co-occurrence map
    orders = db.query(models.Order).all()
    order_items_map = {}
    for o in orders:
        order_items_map[o.order_id] = [item.product_id for item in o.items]
        
    recs = get_recommendations(product_id, order_items_map)
    recommended_product_ids = recs["recommended_product_ids"]
    
    recommended_products = db.query(models.Product).filter(models.Product.product_id.in_(recommended_product_ids)).all()
    
    return {"product": product.name, "recommendations": recommended_products}

# --- INVENTORY ALERTS ---

@app.get("/inventory-alerts")
@app.get("/stock/alerts")
def get_inventory_alerts(db: Session = Depends(get_db)):
    threshold = 10
    low_stock = db.query(models.Product).filter(models.Product.stock < threshold).all()
    
    alerts = []
    for p in low_stock:
        alerts.append({
            "product_id": p.product_id,
            "name": p.name,
            "stock": p.stock,
            "message": f"Low inventory alert: {p.name} has only {p.stock} units left."
        })
        
    return {"alerts": alerts}

# --- DYNAMIC PRICING ---

@app.post("/update-price/{product_id}", response_model=schemas.PriceUpdate)
def update_product_price(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.product_id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    old_price = product.price
    rules_applied = []
    
    # Rule 1: High demand based on last 30 days
    last_30_days = date.today() - timedelta(days=30)
    
    # We need a proper datetime query for order date... fallback to simpler logic for sqlite
    # Mocking demand check since we don't have enough full data
    mock_high_demand = random.choice([True, False])
    if mock_high_demand:
        product.price = product.price * 1.10
        rules_applied.append("Increased price 10% (High Demand)")
        
    # Rule 2: Expiry date near (within 7 days)
    if product.expiry_date:
        if (product.expiry_date - date.today()).days <= 7:
            product.price = product.price * 0.80
            rules_applied.append("Decreased price 20% (Expiry Near)")
            
    if not rules_applied:
        rules_applied.append("No price change applied based on current rules.")
    
    db.commit()
    return {"rules_applied": rules_applied, "old_price": old_price, "new_price": product.price}

# --- CHATBOT ---

class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
def chatbot(request: ChatRequest, db: Session = Depends(get_db)):
    # Mock Open-AI style response
    query = request.message.lower()
    
    if "recommend" in query:
        return {"reply": "I recommend our fresh artisan bread, it pairs well with our organic butter!"}
    if "time" in query or "open" in query or "store" in query:
        return {"reply": "Our store is open from 8 AM to 10 PM every day."}
    if "stock" in query or "available" in query:
        return {"reply": "You can check product availability directly from the dashboard."}
        
    return {"reply": "I'm the PRISMA virtual assistant. I can help with product availability, information, and recommendations!"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
