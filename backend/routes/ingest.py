from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import crud
import schemas
from database import get_db

router = APIRouter(prefix="/ingest-data", tags=["Ingest"])

@router.post("", response_model=schemas.IngestResponse)
def ingest_data(transactions: List[schemas.RawTransactionItem], db: Session = Depends(get_db)):
    return crud.ingest_raw_data(db, transactions)
