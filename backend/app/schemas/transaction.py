from pydantic import BaseModel
from datetime import datetime

class TransactionCreate(BaseModel):
    title: str
    time: str
    type: str
    amount: float
    status: str = "PAGADO"

class TransactionResponse(BaseModel):
    id: int
    title: str
    time: str
    type: str
    amount: float
    status: str
    created_at: datetime | None = None
    class Config: from_attributes = True

class DailySummaryResponse(BaseModel):
    total_sales: float
    total_expenses: float
    net_total: float
    cash_total: float
    card_total: float
    transaction_count: int
