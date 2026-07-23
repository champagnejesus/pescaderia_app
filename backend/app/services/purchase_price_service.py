from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from ..models.purchase_price import PurchasePrice
from ..models.product import Product
from ..models.supplier import Supplier

async def record_price(
    db: AsyncSession,
    product_id: int,
    purchase_id: int,
    supplier_id: int,
    unit_price: float,
    quantity: float,
):
    """Record a purchase price and update product's avg_purchase_price."""
    price_record = PurchasePrice(
        product_id=product_id,
        purchase_id=purchase_id,
        supplier_id=supplier_id,
        unit_price=unit_price,
        quantity=quantity,
    )
    db.add(price_record)

    # Update product's average purchase price
    result = await db.execute(
        select(func.avg(PurchasePrice.unit_price)).where(PurchasePrice.product_id == product_id)
    )
    avg_price = result.scalar() or 0.0

    product_result = await db.execute(select(Product).where(Product.id == product_id))
    product = product_result.scalar_one_or_none()
    if product:
        product.avg_purchase_price = round(avg_price, 2)

    await db.flush()
    return price_record

async def get_price_history(db: AsyncSession, product_id: int):
    """Get price history for a product with statistics."""
    query = (
        select(PurchasePrice, Supplier.name.label("supplier_name"))
        .outerjoin(Supplier, PurchasePrice.supplier_id == Supplier.id)
        .where(PurchasePrice.product_id == product_id)
        .order_by(PurchasePrice.recorded_at.desc())
    )
    result = await db.execute(query)
    rows = result.all()

    prices = []
    for row in rows:
        price = row[0]
        supplier_name = row[1]
        prices.append({
            "id": price.id,
            "product_id": price.product_id,
            "purchase_id": price.purchase_id,
            "supplier_id": price.supplier_id,
            "supplier_name": supplier_name,
            "unit_price": price.unit_price,
            "quantity": price.quantity,
            "recorded_at": price.recorded_at,
        })

    if prices:
        avg_price = sum(p["unit_price"] for p in prices) / len(prices)
        min_price = min(p["unit_price"] for p in prices)
        max_price = max(p["unit_price"] for p in prices)
    else:
        avg_price = min_price = max_price = 0.0

    return {
        "prices": prices,
        "avg_price": round(avg_price, 2),
        "min_price": min_price,
        "max_price": max_price,
    }

async def check_price_alert(db: AsyncSession, product_id: int, threshold: float = 20.0):
    """Check if latest price varies more than threshold% from average."""
    latest_result = await db.execute(
        select(PurchasePrice)
        .where(PurchasePrice.product_id == product_id)
        .order_by(PurchasePrice.recorded_at.desc())
        .limit(1)
    )
    latest = latest_result.scalar_one_or_none()
    if not latest:
        return {"has_alert": False, "current_price": 0.0, "avg_price": 0.0, "percentage_change": 0.0, "message": "No hay precios registrados"}

    avg_result = await db.execute(
        select(func.avg(PurchasePrice.unit_price)).where(PurchasePrice.product_id == product_id)
    )
    avg_price = avg_result.scalar() or 0.0
    if avg_price == 0:
        return {"has_alert": False, "current_price": latest.unit_price, "avg_price": 0.0, "percentage_change": 0.0, "message": "No hay suficientes datos"}

    percentage_change = ((latest.unit_price - avg_price) / avg_price) * 100
    has_alert = abs(percentage_change) > threshold

    message = f"El precio actual ({latest.unit_price}) está {'por encima' if percentage_change > 0 else 'por debajo'} del promedio ({round(avg_price, 2)}) en {abs(round(percentage_change, 1))}%"

    return {
        "has_alert": has_alert,
        "current_price": latest.unit_price,
        "avg_price": round(avg_price, 2),
        "percentage_change": round(percentage_change, 1),
        "message": message,
    }
