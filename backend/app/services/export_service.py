import csv, io, zipfile
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.product import Product
from app.models.client import Client
from app.models.order import Order

async def export_products_csv(db: AsyncSession) -> str:
    result = await db.execute(select(Product).order_by(Product.name))
    products = result.scalars().all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Nombre", "Categoría", "Stock", "Unidad", "Precio Compra", "Precio Venta"])
    for p in products:
        writer.writerow([p.id, p.name, p.category, p.stock, p.unit, p.price_compra, p.price_venta])
    return output.getvalue()

async def export_clients_csv(db: AsyncSession) -> str:
    result = await db.execute(select(Client).order_by(Client.name))
    clients = result.scalars().all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Nombre", "Teléfono", "Email", "Dirección", "Saldo Pendiente"])
    for c in clients:
        writer.writerow([c.id, c.name, c.phone, c.email, c.address, c.outstanding_balance])
    return output.getvalue()

async def export_orders_csv(db: AsyncSession) -> str:
    result = await db.execute(select(Order).order_by(Order.created_at.desc()))
    orders = result.scalars().all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Número", "Cliente", "Total", "Estado", "Método Pago", "Fecha"])
    for o in orders:
        writer.writerow([o.id, o.order_number, o.client_name, o.total_value, o.status, o.payment_method, o.created_at])
    return output.getvalue()

async def export_all_zip(db: AsyncSession) -> tuple[bytes, str]:
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("productos.csv", await export_products_csv(db))
        zf.writestr("clientes.csv", await export_clients_csv(db))
        zf.writestr("pedidos.csv", await export_orders_csv(db))
    buffer.seek(0)
    return buffer.getvalue(), "abyssal-export.zip"
