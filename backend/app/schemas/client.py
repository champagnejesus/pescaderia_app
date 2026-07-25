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
    allows_credit: bool = False
    payment_terms: int = 0

class ClientUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    email: str | None = None
    address: str | None = None
    outstanding_balance: float | None = None
    initials: str | None = None
    credit_limit: float | None = None
    allows_credit: bool | None = None
    payment_terms: int | None = None

class BalanceAdjust(BaseModel):
    new_balance: float

class ClientResponse(BaseModel):
    id: int
    name: str
    phone: str | None = None
    email: str | None = None
    address: str | None = None
    outstanding_balance: float | None = None
    initials: str | None = None
    credit_limit: float | None = None
    allows_credit: bool
    payment_terms: int
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
    class Config: from_attributes = True

class ClientOrdersResponse(BaseModel):
    orders: list[ClientOrderResponse]
    count: int
