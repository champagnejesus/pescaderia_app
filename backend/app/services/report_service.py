from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload
from datetime import datetime, timedelta
from app.models.transaction import Transaction
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.client import Client
from ..schemas.report import (
    DayData, SalesReportResponse, ProductRanking, ProductsReportResponse,
    ClientRanking, ClientsReportResponse, InventoryReportResponse,
)

def get_date_range(start_date: str = None, end_date: str = None, period: str = "day"):
    """Get default date range if not provided."""
    if not end_date:
        end_date = datetime.now().isoformat().split("T")[0]
    if not start_date:
        today = datetime.now()
        start_date = today.replace(day=1).isoformat().split("T")[0]

    start = datetime.fromisoformat(start_date)
    end = datetime.fromisoformat(end_date + "T23:59:59")
    return start, end

async def get_sales_report(db: AsyncSession, start_date: str = None, end_date: str = None, period: str = "day"):
    start, end = get_date_range(start_date, end_date)

    result = await db.execute(
        select(Transaction).where(
            and_(Transaction.created_at >= start, Transaction.created_at <= end)
        )
    )
    transactions = result.scalars().all()

    total_sales = sum(t.amount for t in transactions if t.amount > 0)
    total_expenses = sum(abs(t.amount) for t in transactions if t.amount < 0)
    net_profit = total_sales - total_expenses

    daily_data = {}
    for t in transactions:
        day = t.created_at.strftime("%Y-%m-%d")
        if day not in daily_data:
            daily_data[day] = {"sales": 0, "expenses": 0}
        if t.amount > 0:
            daily_data[day]["sales"] += t.amount
        else:
            daily_data[day]["expenses"] += abs(t.amount)

    daily_breakdown = [
        DayData(
            date=day,
            sales=data["sales"],
            expenses=data["expenses"],
            net=data["sales"] - data["expenses"],
        )
        for day, data in sorted(daily_data.items())
    ]

    return SalesReportResponse(
        total_sales=total_sales,
        total_expenses=total_expenses,
        net_profit=net_profit,
        daily_breakdown=daily_breakdown,
        period=period,
    )

async def get_products_report(db: AsyncSession, start_date: str = None, end_date: str = None):
    start, end = get_date_range(start_date, end_date)

    result = await db.execute(
        select(
            OrderItem.product_id,
            Product.name.label("product_name"),
            func.sum(OrderItem.quantity).label("quantity_sold"),
            func.sum(OrderItem.subtotal).label("revenue"),
        )
        .join(Order, OrderItem.order_id == Order.id)
        .join(Product, OrderItem.product_id == Product.id)
        .where(
            and_(
                Order.created_at >= start,
                Order.created_at <= end,
                Order.status != "ANULADO",
                OrderItem.product_id.isnot(None),
            )
        )
        .group_by(OrderItem.product_id, Product.name)
        .order_by(func.sum(OrderItem.quantity).desc())
    )
    rows = result.all()

    top_products = [
        ProductRanking(
            product_id=row.product_id,
            product_name=row.product_name,
            quantity_sold=row.quantity_sold,
            revenue=row.revenue,
        )
        for row in rows[:10]
    ]

    slow_movers = [
        ProductRanking(
            product_id=row.product_id,
            product_name=row.product_name,
            quantity_sold=row.quantity_sold,
            revenue=row.revenue,
        )
        for row in rows[-5:] if row.quantity_sold > 0
    ]

    return ProductsReportResponse(
        top_products=top_products,
        slow_movers=slow_movers,
        total_products_sold=len(rows),
    )

async def get_clients_report(db: AsyncSession, start_date: str = None, end_date: str = None):
    start, end = get_date_range(start_date, end_date)

    result = await db.execute(
        select(
            Order.client_id,
            Client.name.label("client_name"),
            func.sum(Order.total_value).label("total_purchases"),
            func.count(Order.id).label("order_count"),
        )
        .join(Client, Order.client_id == Client.id)
        .where(
            and_(
                Order.created_at >= start,
                Order.created_at <= end,
                Order.status != "ANULADO",
                Order.client_id.isnot(None),
            )
        )
        .group_by(Order.client_id, Client.name)
        .order_by(func.sum(Order.total_value).desc())
    )
    rows = result.all()

    top_clients = [
        ClientRanking(
            client_id=row.client_id,
            client_name=row.client_name,
            total_purchases=row.total_purchases,
            order_count=row.order_count,
            outstanding_balance=0,
        )
        for row in rows[:10]
    ]

    receivable_result = await db.execute(
        select(func.sum(Client.outstanding_balance))
    )
    total_receivable = receivable_result.scalar() or 0.0

    active_result = await db.execute(
        select(func.count(func.distinct(Order.client_id)))
        .where(
            and_(
                Order.created_at >= start,
                Order.created_at <= end,
                Order.client_id.isnot(None),
            )
        )
    )
    active_clients = active_result.scalar() or 0

    return ClientsReportResponse(
        top_clients=top_clients,
        total_receivable=total_receivable,
        active_clients=active_clients,
    )

async def get_inventory_report(db: AsyncSession):
    result = await db.execute(select(Product).options(selectinload(Product.category_rel)))
    products = result.scalars().unique().all()

    total_value = sum(p.stock * p.price_venta for p in products)
    low_stock_count = sum(1 for p in products if p.stock <= p.low_stock_threshold and p.stock > 0)
    out_of_stock_count = sum(1 for p in products if p.stock <= 0)

    categories = {}
    for p in products:
        cat = (p.category_rel.name if p.category_rel else p.category) or "Sin categoría"
        if cat not in categories:
            categories[cat] = {"count": 0, "value": 0}
        categories[cat]["count"] += 1
        categories[cat]["value"] += p.stock * p.price_venta

    return InventoryReportResponse(
        total_value=total_value,
        total_products=len(products),
        low_stock_count=low_stock_count,
        out_of_stock_count=out_of_stock_count,
        categories_summary=[{"category": k, **v} for k, v in categories.items()],
    )
