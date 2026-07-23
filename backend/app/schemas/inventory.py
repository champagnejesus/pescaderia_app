from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class AdjustStockRequest(BaseModel):
    product_id: int
    quantity_change: float
    reason: str
    notes: Optional[str] = None

class PhysicalCountRequest(BaseModel):
    product_id: int
    actual_quantity: float
    notes: Optional[str] = None

class AdjustmentResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    type: str
    quantity_before: float
    quantity_adjusted: float
    quantity_after: float
    reason: str
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class AdjustmentListResponse(BaseModel):
    adjustments: List[AdjustmentResponse]
    total: int
