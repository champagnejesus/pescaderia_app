### Task 2: Agregar función get_client_orders al service

**Files:**
- Modify: `backend/app/services/client_service.py`

**Interfaces:**
- Consumes: `Client` model, `Order` model
- Produces: `get_client_orders(db, client_id, limit) -> list[Order]`

- [ ] **Step 1: Agregar import de Order al inicio del archivo**

```python
# Agregar en backend/app/services/client_service.py, línea 3
from app.models.order import Order
```

- [ ] **Step 2: Agregar función get_client_orders al final del archivo**

```python
# Agregar al final de backend/app/services/client_service.py

async def get_client_orders(db: AsyncSession, client_id: int, limit: int = 5) -> list[Order]:
    query = select(Order).where(Order.client_id == client_id).order_by(Order.created_at.desc()).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()
```

- [ ] **Step 3: Verificar que el código es válido**

Run: `cd backend && python -c "from app.services.client_service import get_client_orders; print('OK')"`
Expected: `OK`

- [ ] **Step 4: Commit**

```bash
git add backend/app/services/client_service.py
git commit -m "feat: add get_client_orders service function"
```
