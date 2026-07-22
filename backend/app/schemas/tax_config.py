from pydantic import BaseModel
from datetime import datetime

class TaxConfigUpdate(BaseModel):
    is_enabled: bool
    name: str = "IVA"
    rate: float = 0.0
    included_in_price: bool = True

class TaxConfigResponse(BaseModel):
    id: int
    is_enabled: bool
    name: str
    rate: float
    included_in_price: bool
    created_at: datetime | None = None
    class Config: from_attributes = True
