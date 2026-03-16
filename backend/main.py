from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from datetime import date, timedelta
from contextlib import asynccontextmanager
from dotenv import load_dotenv
import os
import json
import re
from urllib import request as urlrequest
from urllib import error as urlerror
import random
import uvicorn

from database import engine, get_db, Base
import models
import schemas
from ml_engine import predict_demand, get_recommendations

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")

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


def _build_business_context(db: Session) -> str:
    products = db.query(models.Product).limit(25).all()
    low_stock = db.query(models.Product).filter(models.Product.stock < 10).limit(10).all()

    if not products:
        return "No products are currently available in the system."

    product_lines = [
        f"- {p.name} | category: {p.category} | price: ${p.price:.2f} | stock: {p.stock}"
        for p in products
    ]
    low_stock_lines = [f"- {p.name} ({p.stock} left)" for p in low_stock] or ["- None"]

    return "\n".join(
        [
            "Product catalog snapshot:",
            *product_lines,
            "",
            "Low stock items (<10):",
            *low_stock_lines,
        ]
    )


def _call_gemini(user_message: str, context: str) -> str:
    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="Missing GEMINI_API_KEY. Add it to backend/.env and restart backend.",
        )

    system_prompt = (
        "You are PRISMA AI, a concise retail operations assistant. "
        "Use only the provided business context when answering product or stock questions. "
        "If data is missing, say you do not have enough data. Keep responses under 120 words."
    )

    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": (
                            f"{system_prompt}\n\n"
                            f"Business context:\n{context}\n\n"
                            f"User question: {user_message}"
                        )
                    }
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.5,
            "maxOutputTokens": 300,
        },
    }

    fallback_models = [
        GEMINI_MODEL,
        "gemini-2.0-flash",
        "gemini-2.0-flash-lite",
        "gemini-1.5-pro",
    ]
    tried_models = []
    last_error_detail = ""

    for model in fallback_models:
        clean_model = model.replace("models/", "").strip()
        if not clean_model or clean_model in tried_models:
            continue
        tried_models.append(clean_model)

        endpoint = (
            f"https://generativelanguage.googleapis.com/v1beta/models/{clean_model}:generateContent"
            f"?key={GEMINI_API_KEY}"
        )

        req = urlrequest.Request(
            endpoint,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )

        try:
            with urlrequest.urlopen(req, timeout=25) as response:
                raw = response.read().decode("utf-8")
                data = json.loads(raw)
            break
        except urlerror.HTTPError as e:
            details = e.read().decode("utf-8", errors="ignore")
            last_error_detail = details
            if e.code == 404:
                continue
            if e.code == 429:
                retry_match = re.search(r'"retryDelay"\s*:\s*"([^"]+)"', details)
                retry_hint = retry_match.group(1) if retry_match else "a short while"
                raise HTTPException(
                    status_code=429,
                    detail=f"Gemini quota exceeded. Please retry in {retry_hint} or check billing/quota.",
                ) from e
            raise HTTPException(status_code=502, detail=f"Gemini API error: {details}") from e
        except urlerror.URLError as e:
            raise HTTPException(status_code=502, detail="Unable to reach Gemini API") from e
    else:
        raise HTTPException(
            status_code=502,
            detail=(
                "No supported Gemini model was available. "
                f"Tried: {', '.join(tried_models)}. "
                f"Last API response: {last_error_detail}"
            ),
        )

    candidates = data.get("candidates", [])
    if not candidates:
        return "I could not generate a response right now. Please try again."

    parts = candidates[0].get("content", {}).get("parts", [])
    text_parts = [p.get("text", "") for p in parts if p.get("text")]
    if not text_parts:
        return "I could not generate a response right now. Please try again."

    return "\n".join(text_parts).strip()


def _fallback_chat_reply(user_message: str, db: Session) -> str:
    query = user_message.lower()

    if "stock" in query or "available" in query:
        low_stock = db.query(models.Product).filter(models.Product.stock < 10).limit(5).all()
        if not low_stock:
            return "All tracked products are currently above low-stock threshold in the dashboard."
        names = ", ".join([f"{p.name} ({p.stock} left)" for p in low_stock])
        return f"Low-stock items right now: {names}."

    if "recommend" in query:
        top_products = db.query(models.Product).order_by(models.Product.stock.desc()).limit(3).all()
        if top_products:
            names = ", ".join([p.name for p in top_products])
            return f"You can start with these popular in-stock options: {names}."
        return "I can recommend products once your catalog has items."

    if "time" in query or "open" in query or "store" in query:
        return "Store timing is not configured in PRISMA yet. Add it to your business profile if needed."

    return (
        "Gemini quota is temporarily exceeded, so I am in basic mode. "
        "You can still ask about stock alerts, products, and recommendations from dashboard data."
    )


@app.post("/chat")
def chatbot(request: ChatRequest, db: Session = Depends(get_db)):
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    business_context = _build_business_context(db)
    try:
        reply = _call_gemini(request.message.strip(), business_context)
    except HTTPException as exc:
        if exc.status_code == 429:
            fallback = _fallback_chat_reply(request.message.strip(), db)
            return {"reply": f"{fallback} (Gemini quota exceeded)"}
        raise

    return {"reply": reply}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
