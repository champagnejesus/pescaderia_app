from pydantic import BaseModel
from datetime import datetime

class SupplierCreate(BaseModel):
    name: str
    category: str
    pending_payment: float = 0.0
    status: str = "PENDIENTE"
    image_url: str = ""

class SupplierUpdate(BaseModel):
    name: str | None = None
    category: str | None = None
    pending_payment: float | None = None
    status: str | None = None
    image_url: str | None = None

class SupplierResponse(BaseModel):
    id: int
    name: str
    category: str
    pending_payment: float
    status: str
    image_url: str | None = None
    created_at: datetime | None = None
    class Config: from_attributes = True
