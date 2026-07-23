from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.units import inch
from io import BytesIO
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.models.order import Order, OrderItem
from app.models.purchase import Purchase, PurchaseItem
from app.models.product import Product
from app.models.business import BusinessConfig


async def get_business_info(db: AsyncSession):
    result = await db.execute(select(BusinessConfig).limit(1))
    return result.scalar_one_or_none()


def create_styles():
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(
        name='BusinessName',
        fontSize=16,
        leading=20,
        spaceAfter=6,
        alignment=1,  # Center
    ))
    styles.add(ParagraphStyle(
        name='SectionTitle',
        fontSize=12,
        leading=14,
        spaceAfter=6,
        spaceBefore=12,
    ))
    return styles


async def generate_order_pdf(db: AsyncSession, order_id: int) -> bytes:
    result = await db.execute(
        select(Order).where(Order.id == order_id).options(selectinload(Order.items))
    )
    order = result.scalar_one_or_none()
    if not order:
        raise ValueError("Order not found")

    items = order.items

    # Get business info
    business = await get_business_info(db)

    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    styles = create_styles()
    story = []

    # Business header
    if business:
        story.append(Paragraph(business.business_name, styles['BusinessName']))
        if business.address:
            story.append(Paragraph(business.address, styles['Normal']))
        if business.phone:
            story.append(Paragraph(f"Tel: {business.phone}", styles['Normal']))
        story.append(Spacer(1, 12))

    # Order details
    story.append(Paragraph(f"<b>Pedido: {order.order_number}</b>", styles['SectionTitle']))
    story.append(Paragraph(f"Fecha: {order.created_at.strftime('%d/%m/%Y %H:%M')}", styles['Normal']))
    if order.client_name:
        story.append(Paragraph(f"Cliente: {order.client_name}", styles['Normal']))
    story.append(Paragraph(f"Estado: {order.status}", styles['Normal']))
    story.append(Paragraph(f"Método de pago: {order.payment_method or 'N/A'}", styles['Normal']))
    story.append(Spacer(1, 12))

    # Items table
    table_data = [['Producto', 'Cantidad', 'Precio', 'Subtotal']]
    for item in items:
        product_name = item.presentation or f"Item #{item.product_id}"
        if item.product_id:
            prod_result = await db.execute(select(Product.name).where(Product.id == item.product_id))
            prod_name = prod_result.scalar()
            if prod_name:
                product_name = prod_name
        table_data.append([
            product_name,
            f"{item.quantity}",
            f"${item.unit_price:.2f}",
            f"${item.subtotal:.2f}",
        ])

    table = Table(table_data, colWidths=[3*inch, 1.5*inch, 1.5*inch, 1.5*inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0891b2')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f0fdfa')),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e2e8f0')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')]),
    ]))
    story.append(table)
    story.append(Spacer(1, 12))

    # Totals
    story.append(Paragraph(f"<b>Total: ${order.total_value:.2f}</b>", styles['SectionTitle']))
    story.append(Paragraph(f"Estado de pago: {order.payment_status}", styles['Normal']))

    doc.build(story)
    return buffer.getvalue()


async def generate_purchase_pdf(db: AsyncSession, purchase_id: int) -> bytes:
    result = await db.execute(
        select(Purchase).where(Purchase.id == purchase_id).options(selectinload(Purchase.items))
    )
    purchase = result.scalar_one_or_none()
    if not purchase:
        raise ValueError("Purchase not found")

    items = purchase.items

    business = await get_business_info(db)

    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    styles = create_styles()
    story = []

    if business:
        story.append(Paragraph(business.business_name, styles['BusinessName']))
        story.append(Spacer(1, 12))

    story.append(Paragraph(f"<b>Compra: {purchase.purchase_number}</b>", styles['SectionTitle']))
    story.append(Paragraph(f"Fecha: {purchase.created_at.strftime('%d/%m/%Y %H:%M')}", styles['Normal']))
    if purchase.supplier_name:
        story.append(Paragraph(f"Proveedor: {purchase.supplier_name}", styles['Normal']))
    story.append(Spacer(1, 12))

    table_data = [['Producto', 'Cantidad', 'Precio', 'Subtotal']]
    for item in items:
        table_data.append([
            item.product_name or f"Item #{item.product_id}",
            f"{item.quantity}",
            f"${item.unit_price:.2f}",
            f"${item.subtotal:.2f}",
        ])

    table = Table(table_data, colWidths=[3*inch, 1.5*inch, 1.5*inch, 1.5*inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0891b2')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e2e8f0')),
    ]))
    story.append(table)
    story.append(Spacer(1, 12))

    story.append(Paragraph(f"<b>Total: ${purchase.total_value:.2f}</b>", styles['SectionTitle']))
    story.append(Paragraph(f"Estado de pago: {purchase.payment_status}", styles['Normal']))

    doc.build(story)
    return buffer.getvalue()


async def generate_report_pdf(db: AsyncSession, report_type: str, start_date: str = None, end_date: str = None) -> bytes:
    from .report_service import get_sales_report, get_products_report, get_clients_report, get_inventory_report

    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    styles = create_styles()
    story = []

    business = await get_business_info(db)
    if business:
        story.append(Paragraph(business.business_name, styles['BusinessName']))
        story.append(Spacer(1, 12))

    story.append(Paragraph(f"<b>Reporte: {report_type.title()}</b>", styles['SectionTitle']))
    story.append(Paragraph(f"Período: {start_date or 'Inicio'} al {end_date or 'Hoy'}", styles['Normal']))
    story.append(Spacer(1, 12))

    if report_type == "sales":
        data = await get_sales_report(db, start_date, end_date)
        story.append(Paragraph(f"Total Ingresos: ${data.total_sales:.2f}", styles['Normal']))
        story.append(Paragraph(f"Total Gastos: ${data.total_expenses:.2f}", styles['Normal']))
        story.append(Paragraph(f"Ganancia Neta: ${data.net_profit:.2f}", styles['Normal']))
    elif report_type == "products":
        data = await get_products_report(db, start_date, end_date)
        table_data = [['Producto', 'Unidades', 'Ingresos']]
        for p in data.top_products:
            table_data.append([p.product_name, str(p.quantity_sold), f"${p.revenue:.2f}"])
        if len(table_data) > 1:
            table = Table(table_data, colWidths=[3*inch, 1.5*inch, 1.5*inch])
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0891b2')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e2e8f0')),
            ]))
            story.append(table)
    elif report_type == "clients":
        data = await get_clients_report(db, start_date, end_date)
        table_data = [['Cliente', 'Compras', 'Pedidos']]
        for c in data.top_clients:
            table_data.append([c.client_name, f"${c.total_purchases:.2f}", str(c.order_count)])
        if len(table_data) > 1:
            table = Table(table_data, colWidths=[3*inch, 1.5*inch, 1.5*inch])
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0891b2')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e2e8f0')),
            ]))
            story.append(table)
    elif report_type == "inventory":
        data = await get_inventory_report(db)
        story.append(Paragraph(f"Valor Total del Inventario: ${data.total_value:.2f}", styles['Normal']))
        story.append(Paragraph(f"Total Productos: {data.total_products}", styles['Normal']))
        story.append(Paragraph(f"Stock Bajo: {data.low_stock_count}", styles['Normal']))
        story.append(Paragraph(f"Sin Stock: {data.out_of_stock_count}", styles['Normal']))

    doc.build(story)
    return buffer.getvalue()