from pydantic import BaseModel
from datetime import datetime

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: float
    unit_price: float
    subtotal: float

class OrderCreate(BaseModel):
    client_id: int
    client_name: str
    delivery_date: str = ""
    items: list[OrderItemCreate]
    payment_method: str = "Efectivo"

class OrderStatusUpdate(BaseModel):
    status: str

class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: float
    unit_price: float
    subtotal: float
    class Config: from_attributes = True

class OrderResponse(BaseModel):
    id: int
    order_number: str
    client_id: int | None = None
    client_name: str
    delivery_date: str
    items_count: int
    status: str
    payment_method: str = "Efectivo"
    total_value: float
    created_at: datetime | None = None
    items: list[OrderItemResponse] = []
    class Config: from_attributes = True
