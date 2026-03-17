from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import crud
import schemas
import models
from database import get_db

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/dashboard/summary", response_model=schemas.DashboardSummary)
def get_dashboard_summary(db: Session = Depends(get_db)):
    return crud.get_dashboard_summary(db)

@router.get("/customers/{customer_id}")
def get_customer_analytics(customer_id: str, db: Session = Depends(get_db)):
    # Basic customer metrics
    customer = db.query(models.Customer).filter(models.Customer.customer_id == customer_id).first()
    if not customer:
        return {"error": "Customer not found"}
    
    total_spent = sum(inv.total_amount for inv in customer.invoices)
    order_count = len(customer.invoices)
    
    return {
        "customer_id": customer_id,
        "name": customer.name,
        "total_spent": total_spent,
        "order_count": order_count,
        "average_order_value": total_spent / order_count if order_count > 0 else 0
    }
