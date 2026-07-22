from pydantic import BaseModel
from datetime import datetime

class InvoicePrefUpdate(BaseModel):
    footer_text: str = ""
    show_tax_breakdown: bool = True
    default_payment_method_id: int | None = None

class InvoicePrefResponse(BaseModel):
    id: int
    footer_text: str
    show_tax_breakdown: bool
    default_payment_method_id: int | None = None
    created_at: datetime | None = None
    class Config: from_attributes = True
