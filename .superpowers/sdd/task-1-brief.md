### Task 1: Agregar schemas de respuesta para pedidos del cliente

**Files:**
- Modify: `backend/app/schemas/client.py`

**Interfaces:**
- Produces: `ClientOrderResponse`, `ClientOrdersResponse`

- [ ] **Step 1: Agregar schemas al archivo existente**

```python
# Agregar al final de backend/app/schemas/client.py

class ClientOrderResponse(BaseModel):
    id: int
    order_number: str
    delivery_date: str | None
    items_count: int
    status: str
    total_value: float
    created_at: datetime | None

class ClientOrdersResponse(BaseModel):
    orders: list[ClientOrderResponse]
    total: int
```

- [ ] **Step 2: Verificar que el código es válido**

Run: `cd backend && python -c "from app.schemas.client import ClientOrderResponse, ClientOrdersResponse; print('OK')"`
Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add backend/app/schemas/client.py
git commit -m "feat: add ClientOrderResponse and ClientOrdersResponse schemas"
```
