from pydantic import BaseModel
from datetime import datetime

class ClientCreate(BaseModel):
    name: str
    phone: str = ""
    email: str = ""
    address: str = ""
    outstanding_balance: float = 0.0
    initials: str = ""
    credit_limit: float = 1500.0

class ClientUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    email: str | None = None
    address: str | None = None
    credit_limit: float | None = None

class BalanceAdjust(BaseModel):
    new_balance: float

class ClientResponse(BaseModel):
    id: int
    name: str
    phone: str
    email: str
    address: str
    outstanding_balance: float
    initials: str
    credit_limit: float
    created_at: datetime | None = None
    class Config: from_attributes = True

class ClientOrderResponse(BaseModel):
    id: int
    order_number: str
    delivery_date: str | None
    items_count: int
    status: str
    total_value: float
    created_at: datetime | None

class ClientOrdersResponse(BaseModel):
    orders: list[ClientOrderResponse]
    total: int
