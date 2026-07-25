import sys
import os
import asyncio
from datetime import datetime, date, timezone

# Add the backend directory to sys.path to enable imports
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import engine, async_session, Base
from app.models.business import BusinessConfig
from app.models.category import Category
from app.models.unit import Unit
from app.models.payment_method import PaymentMethod
from app.models.product import Product
from app.models.client import Client
from app.models.supplier import Supplier
from app.models.order import Order, OrderItem
from app.models.transaction import Transaction
from app.services.auth_service import hash_password

async def seed():
    print("Starting database seeding...")
    
    # Initialize connection and create tables if they don't exist
    async with engine.begin() as conn:
        # We don't drop tables, we just clear data to keep structure
        print("Database connection initialized.")

    async with async_session() as session:
        # 1. Clear existing data
        print("Clearing old data...")
        tables_to_clear = [
            Transaction, OrderItem, Order, Product, Category, 
            Client, Supplier, Unit, PaymentMethod, BusinessConfig
        ]
        for model in tables_to_clear:
            try:
                # Get the table object from the model class
                table = model.__table__
                await session.execute(table.delete())
            except Exception as e:
                print(f"Skipped clearing {model.__name__}: {e}")
        await session.commit()

        # 2. Create Business Config
        print("Creating business profile...")
        pwd = hash_password("admin123")
        business = BusinessConfig(
            id=1,
            business_name="Pescadería El Ancla",
            owner_name="Juan Pérez",
            email="admin@pescaderia.com",
            password_hash=pwd,
            phone="+56912345678",
            address="Terminal Pesquero local 42, Santiago",
            require_pin=False
        )
        session.add(business)
        await session.commit()
        await session.refresh(business)

        # 3. Create Categories
        print("Creating categories...")
        cat_mariscos = Category(id=1, business_id=1, name="Mariscos")
        cat_pescados = Category(id=2, business_id=1, name="Pescado Fresco")
        cat_congelados = Category(id=3, business_id=1, name="Congelados")
        session.add_all([cat_mariscos, cat_pescados, cat_congelados])
        await session.commit()

        # 4. Create Units
        print("Creating units...")
        unit_kg = Unit(id=1, business_id=1, name="kg", abbreviation="kg")
        unit_ud = Unit(id=2, business_id=1, name="unidad", abbreviation="ud")
        unit_bandeja = Unit(id=3, business_id=1, name="bandeja", abbreviation="bdj")
        session.add_all([unit_kg, unit_ud, unit_bandeja])
        await session.commit()

        # 5. Create Payment Methods
        print("Creating payment methods...")
        pm_efectivo = PaymentMethod(id=1, business_id=1, name="Efectivo")
        pm_transferencia = PaymentMethod(id=2, business_id=1, name="Transferencia")
        pm_tarjeta = PaymentMethod(id=3, business_id=1, name="Tarjeta")
        session.add_all([pm_efectivo, pm_transferencia, pm_tarjeta])
        await session.commit()

        # 6. Create Products
        print("Creating products...")
        prod_camaron = Product(
            id=1, business_id=1, name="Camarón Premium", category="Mariscos", category_id=1,
            stock=150.5, unit="kg", price_compra=8500.0, price_venta=15000.0, avg_purchase_price=8500.0,
            price=15000.0, description="Camarón ecuatoriano pelado y desvenado", low_stock_threshold=10.0
        )
        prod_merluza = Product(
            id=2, business_id=1, name="Filete de Merluza", category="Pescado Fresco", category_id=2,
            stock=85.0, unit="kg", price_compra=4200.0, price_venta=7800.0, avg_purchase_price=4200.0,
            price=7800.0, description="Filete de merluza fresca del día", low_stock_threshold=15.0
        )
        prod_pulpo = Product(
            id=3, business_id=1, name="Pulpo Congelado", category="Congelados", category_id=3,
            stock=45.0, unit="kg", price_compra=12000.0, price_venta=22000.0, avg_purchase_price=12000.0,
            price=22000.0, description="Pulpo entero congelado I.Q.F.", low_stock_threshold=5.0
        )
        prod_salmon = Product(
            id=4, business_id=1, name="Salmón Fresco", category="Pescado Fresco", category_id=2,
            stock=3.5, unit="kg", price_compra=15000.0, price_venta=28000.0, avg_purchase_price=15000.0,
            price=28000.0, description="Salmón fresco entero o porciones", low_stock_threshold=8.0
        )
        prod_mero = Product(
            id=5, business_id=1, name="Mero Fresco", category="Pescado Fresco", category_id=2,
            stock=0.0, unit="kg", price_compra=9000.0, price_venta=18500.0, avg_purchase_price=9000.0,
            price=18500.0, description="Filete de mero fresco", low_stock_threshold=10.0
        )
        session.add_all([prod_camaron, prod_merluza, prod_pulpo, prod_salmon, prod_mero])
        await session.commit()

        # 7. Create Clients
        print("Creating clients...")
        cli_puerto = Client(
            id=1, business_id=1, name="Restaurante El Puerto", phone="+56987654321",
            email="contacto@elpuerto.com", address="Av. Costanera 123, Valparaíso",
            outstanding_balance=173000.0, credit_limit=2000000.0, allows_credit=True
        )
        cli_sur = Client(
            id=2, business_id=1, name="Mariscos del Sur S.A.", phone="+56911223344",
            email="ventas@mariscosdelsur.com", address="Camino Industrial 450, Puerto Montt",
            outstanding_balance=0.0, credit_limit=5000000.0, allows_credit=True
        )
        cli_costera = Client(
            id=3, business_id=1, name="Distribuidora Costera", phone="+56955667788",
            email="costera@gmail.com", address="Gran Vía 890, Viña del Mar",
            outstanding_balance=0.0, credit_limit=1500000.0, allows_credit=False
        )
        session.add_all([cli_puerto, cli_sur, cli_costera])
        await session.commit()

        # 8. Create Suppliers
        print("Creating suppliers...")
        sup_pacifico = Supplier(
            id=1, business_id=1, name="Pesquera Pacífico", category="Mariscos",
            pending_payment=350000.0, status="ACTIVO"
        )
        sup_mar = Supplier(
            id=2, business_id=1, name="Distribuidora del Mar", category="Pescados",
            pending_payment=0.0, status="ACTIVO"
        )
        session.add_all([sup_pacifico, sup_mar])
        await session.commit()

        # 9. Create Orders and Items
        print("Creating orders...")
        
        # Order 1: Completada/Entregada
        order1 = Order(
            id=1, business_id=1, order_number="PED-001284", client_id=2, client_name="Mariscos del Sur S.A.",
            delivery_date="2026-07-24", items_count=2, status="ENTREGADO", payment_method="Transferencia",
            payment_status="PAGADO", total_value=410000.0, created_at=datetime.now(timezone.utc),
            delivered_at=datetime.now(timezone.utc), due_date=date.today()
        )
        session.add(order1)
        await session.commit()
        
        item1_1 = OrderItem(order_id=1, product_id=1, presentation="kg", quantity=20.0, unit_price=15000.0, subtotal=300000.0)
        item1_2 = OrderItem(order_id=1, product_id=3, presentation="kg", quantity=5.0, unit_price=22000.0, subtotal=110000.0)
        session.add_all([item1_1, item1_2])
        await session.commit()

        # Order 2: Pendiente
        order2 = Order(
            id=2, business_id=1, order_number="PED-001285", client_id=1, client_name="Restaurante El Puerto",
            delivery_date="2026-07-26", items_count=2, status="PENDIENTE", payment_method="Efectivo",
            payment_status="PENDIENTE", total_value=173000.0, created_at=datetime.now(timezone.utc),
            due_date=date.today()
        )
        session.add(order2)
        await session.commit()
        
        item2_1 = OrderItem(order_id=2, product_id=2, presentation="kg", quantity=15.0, unit_price=7800.0, subtotal=117000.0)
        item2_2 = OrderItem(order_id=2, product_id=4, presentation="kg", quantity=2.0, unit_price=28000.0, subtotal=56000.0)
        session.add_all([item2_1, item2_2])
        await session.commit()

        # Order 3: Procesando
        order3 = Order(
            id=3, business_id=1, order_number="PED-001286", client_id=3, client_name="Distribuidora Costera",
            delivery_date="2026-07-25", items_count=1, status="PROCESANDO", payment_method="Tarjeta",
            payment_status="PAGADO", total_value=220000.0, created_at=datetime.now(timezone.utc),
            due_date=date.today()
        )
        session.add(order3)
        await session.commit()
        
        item3_1 = OrderItem(order_id=3, product_id=3, presentation="kg", quantity=10.0, unit_price=22000.0, subtotal=220000.0)
        session.add(item3_1)
        await session.commit()

        # 10. Create Transactions
        print("Creating transactions...")
        tx_ingreso1 = Transaction(
            business_id=1, title="Pago recibido - Mariscos del Sur S.A.", time="10:30",
            type="INGRESO", amount=410000.0, status="PAGADO", created_at=datetime.now(timezone.utc)
        )
        tx_ingreso2 = Transaction(
            business_id=1, title="Pago recibido - Distribuidora Costera", time="12:15",
            type="INGRESO", amount=220000.0, status="PAGADO", created_at=datetime.now(timezone.utc)
        )
        tx_egreso1 = Transaction(
            business_id=1, title="Compra - Pesquera Pacífico (Lote Camarón)", time="09:00",
            type="EGRESO", amount=350000.0, status="PAGADO", created_at=datetime.now(timezone.utc)
        )
        session.add_all([tx_ingreso1, tx_ingreso2, tx_egreso1])
        await session.commit()

        # Update order item counts
        order1.items_count = 2
        order2.items_count = 2
        order3.items_count = 1
        await session.commit()

    print("Database seeding completed successfully!")

if __name__ == "__main__":
    asyncio.run(seed())
