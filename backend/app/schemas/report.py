from pydantic import BaseModel

class DashboardResponse(BaseModel):
    gross_profit: float
    sales_total: float
    purchases_total: float
    cash_total: float
    transfer_total: float
    pending_orders: int
    low_stock_count: int
    total_clients: int
    total_suppliers: int
