from pydantic import BaseModel
from datetime import datetime

class PurchaseItemCreate(BaseModel):
    product_id: int
    presentation: str = "Unidad"
    quantity: float
    unit_price: float
    subtotal: float

class PurchaseCreate(BaseModel):
    supplier_id: int
    supplier_name: str
    items: list[PurchaseItemCreate]
    payment_status: str = "PENDIENTE"

class PurchaseItemResponse(BaseModel):
    id: int
    product_id: int | None = None
    presentation: str = "Unidad"
    quantity: float
    unit_price: float
    subtotal: float
    class Config: from_attributes = True

class PurchaseResponse(BaseModel):
    id: int
    purchase_number: str
    supplier_id: int | None = None
    supplier_name: str
    items_count: int
    total_value: float
    payment_status: str = "PENDIENTE"
    created_at: datetime | None = None
    items: list[PurchaseItemResponse] = []
    class Config: from_attributes = True

class InventoryItemResponse(BaseModel):
    product_id: int
    product_name: str
    category: str
    stock: float
    unit: str
    price_compra: float = 0.0
    price_venta: float = 0.0
    status: str
    low_stock_threshold: float

class InventoryMovementResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    type: str
    quantity: float
    unit: str
    unit_price: float
    total: float
    reference: str
    created_at: datetime | None = None
    class Config: from_attributes = True

class AccountEntryResponse(BaseModel):
    id: int
    reference_id: int
    reference_number: str
    reference_type: str
    amount: float
    pending_amount: float
    status: str
    date: datetime | None = None

class AccountDebtorResponse(BaseModel):
    id: int
    name: str
    total_pending: float
    entries: list[AccountEntryResponse] = []
