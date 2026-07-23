from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PurchasePriceResponse(BaseModel):
    id: int
    product_id: int
    purchase_id: Optional[int]
    supplier_id: Optional[int]
    supplier_name: Optional[str]
    unit_price: float
    quantity: float
    recorded_at: datetime

    class Config:
        from_attributes = True

class PurchasePriceHistoryResponse(BaseModel):
    prices: list[PurchasePriceResponse]
    avg_price: float
    min_price: float
    max_price: float

class PriceAlertResponse(BaseModel):
    has_alert: bool
    current_price: float
    avg_price: float
    percentage_change: float
    message: str
