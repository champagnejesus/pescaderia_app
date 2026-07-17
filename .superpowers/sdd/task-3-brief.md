### Task 3: Agregar test para get_client_orders

**Files:**
- Modify: `backend/app/tests/test_clients.py`

**Interfaces:**
- Consumes: `get_client_orders`, `create_client`, `Order` model (via order_service)
- Produces: Test `test_get_client_orders`

- [ ] **Step 1: Agregar imports al inicio del archivo**

```python
# Agregar en backend/app/tests/test_clients.py, línea 2
from app.services.client_service import get_client_orders
from app.services.order_service import create_order
```

- [ ] **Step 2: Agregar test al final del archivo**

```python
# Agregar al final de backend/app/tests/test_clients.py

@pytest.mark.asyncio
async def test_get_client_orders(async_session):
    # Crear cliente
    client = await create_client(async_session, {"name": "Order Client", "phone": "789"})
    await async_session.commit()
    
    # Crear pedidos para el cliente
    await create_order(async_session, {
        "order_number": "ORD-001",
        "client_id": client.id,
        "client_name": client.name,
        "items_count": 3,
        "status": "ENTREGADO",
        "total_value": 100.0
    })
    await create_order(async_session, {
        "order_number": "ORD-002",
        "client_id": client.id,
        "client_name": client.name,
        "items_count": 2,
        "status": "PENDIENTE",
        "total_value": 200.0
    })
    await async_session.commit()
    
    # Obtener pedidos del cliente
    orders = await get_client_orders(async_session, client.id)
    assert len(orders) == 2
    assert orders[0].order_number == "ORD-002"  # Más reciente primero
    assert orders[1].order_number == "ORD-001"

@pytest.mark.asyncio
async def test_get_client_orders_empty(async_session):
    client = await create_client(async_session, {"name": "No Orders", "phone": "000"})
    await async_session.commit()
    
    orders = await get_client_orders(async_session, client.id)
    assert len(orders) == 0
```

- [ ] **Step 3: Ejecutar tests para verificar que fallan**

Run: `cd backend && python -m pytest app/tests/test_clients.py::test_get_client_orders -v`
Expected: FAIL (función aún no está registrada en el módulo)

- [ ] **Step 4: Ejecutar todos los tests de clientes para verificar que pasan**

Run: `cd backend && python -m pytest app/tests/test_clients.py -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/app/tests/test_clients.py
git commit -m "test: add tests for get_client_orders"
```
