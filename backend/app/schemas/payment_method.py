from pydantic import BaseModel
from datetime import datetime

class PaymentMethodResponse(BaseModel):
    id: int
    name: str
    is_active: bool
    sort_order: int
    created_at: datetime | None = None
    class Config: from_attributes = True

class PaymentMethodReorder(BaseModel):
    ids: list[int]

class PaymentMethodToggle(BaseModel):
    is_active: bool
