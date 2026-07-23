from pydantic import BaseModel
from typing import List, Optional

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

class DayData(BaseModel):
    date: str
    sales: float
    expenses: float
    net: float

class SalesReportResponse(BaseModel):
    total_sales: float
    total_expenses: float
    net_profit: float
    daily_breakdown: List[DayData]
    period: str

class ProductRanking(BaseModel):
    product_id: int
    product_name: str
    quantity_sold: float
    revenue: float

class ProductsReportResponse(BaseModel):
    top_products: List[ProductRanking]
    slow_movers: List[ProductRanking]
    total_products_sold: int

class ClientRanking(BaseModel):
    client_id: int
    client_name: str
    total_purchases: float
    order_count: int
    outstanding_balance: float

class ClientsReportResponse(BaseModel):
    top_clients: List[ClientRanking]
    total_receivable: float
    active_clients: int

class InventoryReportResponse(BaseModel):
    total_value: float
    total_products: int
    low_stock_count: int
    out_of_stock_count: int
    categories_summary: List[dict]
