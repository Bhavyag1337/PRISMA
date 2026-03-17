from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
import schemas
import models
from database import get_db

router = APIRouter(prefix="/recommendations", tags=["ML"])

@router.get("/{customer_id}", response_model=schemas.Recommendation)
def get_recommendations(customer_id: str, db: Session = Depends(get_db)):
    # Placeholder recommendation logic
    # We would typically pull from RecommendationsCache or run a live inference
    
    # Mock some recommendations
    products = db.query(models.Product).limit(3).all()
    
    return {
        "customer_id": customer_id,
        "recommended_products": products
    }
