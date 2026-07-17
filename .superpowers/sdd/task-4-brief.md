### Task 4: Agregar endpoint GET /{client_id}/orders

**Files:**
- Modify: `backend/app/routers/clients.py`

**Interfaces:**
- Consumes: `get_client_orders`, `ClientOrdersResponse`
- Produces: Endpoint `GET /{client_id}/orders`

- [ ] **Step 1: Agregar import de schema**

```python
# Modificar línea 5 en backend/app/routers/clients.py
from app.schemas.client import ClientCreate, ClientUpdate, BalanceAdjust, ClientResponse, ClientOrdersResponse
```

- [ ] **Step 2: Agregar endpoint al final del archivo**

```python
# Agregar al final de backend/app/routers/clients.py

@router.get("/{client_id}/orders", response_model=ClientOrdersResponse)
async def get_client_orders_endpoint(client_id: int, limit: int = Query(5), db: AsyncSession = Depends(get_db)):
    orders = await client_service.get_client_orders(db, client_id, limit)
    return ClientOrdersResponse(orders=orders, total=len(orders))
```

- [ ] **Step 3: Verificar que el servidor inicia**

Run: `cd backend && python -c "from app.routers.clients import router; print('OK')"`
Expected: `OK`

- [ ] **Step 4: Commit**

```bash
git add backend/app/routers/clients.py
git commit -m "feat: add GET /clients/{id}/orders endpoint"
```
