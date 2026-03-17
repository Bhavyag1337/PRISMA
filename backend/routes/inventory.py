from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import crud
import schemas
import models
from database import get_db

router = APIRouter(prefix="/inventory", tags=["Inventory"])

@router.get("/alerts", response_model=List[schemas.InventoryStatus])
def get_inventory_alerts(db: Session = Depends(get_db)):
    return crud.get_inventory_alerts(db)

@router.get("/products/{product_id}/demand", response_model=schemas.DemandForecast)
def predict_product_demand(product_id: str, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.product_id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Placeholder ML logic
    return {
        "product_id": product_id,
        "forecasted_demand": 42.5,
        "confidence_score": 0.85
    }

@router.post("/products/{product_id}/update-price", response_model=schemas.PriceUpdate)
def update_product_price(product_id: str, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.product_id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    old_price = product.unit_price
    # Mock logic: increase price if stock is low
    if product.inventory and product.inventory.stock_level < 5:
        product.unit_price = product.unit_price * 1.15
        reason = "Low stock surge pricing"
    else:
        product.unit_price = product.unit_price * 0.95
        reason = "Standard inventory optimization"
    
    # Log to history
    history = models.PriceHistory(product_id=product_id, price=product.unit_price, change_reason=reason)
    db.add(history)
    db.commit()
    
    return {
        "product_id": product_id,
        "old_price": old_price,
        "new_price": product.unit_price,
        "reason": reason
    }
