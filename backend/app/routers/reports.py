from typing import Optional
from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.dependencies import get_current_user
from app.schemas.report import (
    DashboardResponse, SalesReportResponse, ProductsReportResponse,
    ClientsReportResponse, InventoryReportResponse,
)
from app.models.product import Product
from app.models.order import Order
from app.models.client import Client
from app.models.supplier import Supplier
from app.models.transaction import Transaction
from app.services import report_service
from app.services import pdf_service

router = APIRouter(dependencies=[Depends(get_current_user)])

@router.get("/dashboard", response_model=DashboardResponse)
async def dashboard(user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    bid = user["id"]
    products_all = (await db.execute(select(Product).where(Product.business_id == bid))).scalars().all()
    pending = (await db.execute(select(func.count(Order.id)).where(Order.status == "PENDIENTE", Order.business_id == bid))).scalar() or 0
    clients_count = (await db.execute(select(func.count(Client.id)).where(Client.business_id == bid))).scalar() or 0
    suppliers_count = (await db.execute(select(func.count(Supplier.id)).where(Supplier.business_id == bid))).scalar() or 0
    txs = (await db.execute(select(Transaction).where(Transaction.business_id == bid))).scalars().all()
    total_sales = sum(t.amount for t in txs if t.amount > 0)
    total_expenses = sum(abs(t.amount) for t in txs if t.amount < 0)
    cash = sum(t.amount for t in txs if t.type == "Efectivo" and t.amount > 0)
    transfer = sum(t.amount for t in txs if t.type in ("Transferencia", "Transfer") and t.amount > 0)
    return DashboardResponse(
        gross_profit=total_sales - total_expenses, sales_total=total_sales, purchases_total=total_expenses,
        cash_total=cash, transfer_total=transfer, pending_orders=pending,
        low_stock_count=sum(1 for p in products_all if p.stock <= p.low_stock_threshold),
        total_clients=clients_count, total_suppliers=suppliers_count,
    )

@router.get("/sales", response_model=SalesReportResponse)
async def get_sales_report(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    period: Optional[str] = Query("day"),
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await report_service.get_sales_report(db, user["id"], start_date, end_date, period)

@router.get("/products", response_model=ProductsReportResponse)
async def get_products_report(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await report_service.get_products_report(db, user["id"], start_date, end_date)

@router.get("/clients", response_model=ClientsReportResponse)
async def get_clients_report(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await report_service.get_clients_report(db, user["id"], start_date, end_date)

@router.get("/inventory", response_model=InventoryReportResponse)
async def get_inventory_report(
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await report_service.get_inventory_report(db, user["id"])


@router.get("/pdf/sales")
async def download_sales_pdf(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    pdf_bytes = await pdf_service.generate_report_pdf(db, "sales", user["id"], start_date, end_date)
    return StreamingResponse(
        iter([pdf_bytes]),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=reporte_ventas.pdf"},
    )


@router.get("/pdf/products")
async def download_products_pdf(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    pdf_bytes = await pdf_service.generate_report_pdf(db, "products", user["id"], start_date, end_date)
    return StreamingResponse(
        iter([pdf_bytes]),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=reporte_productos.pdf"},
    )


@router.get("/pdf/inventory")
async def download_inventory_pdf(
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    pdf_bytes = await pdf_service.generate_report_pdf(db, "inventory", user["id"])
    return StreamingResponse(
        iter([pdf_bytes]),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=reporte_inventario.pdf"},
    )


@router.get("/pdf/financial")
async def download_financial_pdf(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    pdf_bytes = await pdf_service.generate_report_pdf(db, "financial", user["id"], start_date, end_date)
    return StreamingResponse(
        iter([pdf_bytes]),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=reporte_financiero.pdf"},
    )


@router.get("/pdf/clients")
async def download_clients_pdf(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    pdf_bytes = await pdf_service.generate_report_pdf(db, "clients", user["id"], start_date, end_date)
    return StreamingResponse(
        iter([pdf_bytes]),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=reporte_clientes.pdf"},
    )
