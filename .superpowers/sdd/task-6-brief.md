### Task 6: CRUD Products Endpoints

**Files:**
- Create: `backend/app/services/product_service.py`
- Overwrite: `backend/app/routers/products.py` (currently has stub)
- Create: `backend/app/tests/test_products.py`

- [ ] **Step 1: Create `backend/app/services/product_service.py`**

```python
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.product import Product

async def get_products(db: AsyncSession, search: str = "", category: str = "", page: int = 1, limit: int = 50) -> list[Product]:
    query = select(Product)
    if search:
        query = query.where(Product.name.ilike(f"%{search}%"))
    if category and category != "TODOS":
        query = query.where(Product.category == category)
    query = query.order_by(Product.name.asc()).offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

async def get_product(db: AsyncSession, product_id: int) -> Product | None:
    return await db.get(Product, product_id)

async def create_product(db: AsyncSession, data: dict) -> Product:
    product = Product(**data)
    db.add(product)
    await db.flush()
    return product

async def update_product(db: AsyncSession, product_id: int, data: dict) -> Product | None:
    product = await db.get(Product, product_id)
    if not product: return None
    for key, value in data.items():
        if value is not None: setattr(product, key, value)
    await db.flush()
    return product

async def delete_product(db: AsyncSession, product_id: int) -> bool:
    product = await db.get(Product, product_id)
    if not product: return False
    await db.delete(product)
    await db.flush()
    return True

async def adjust_stock(db: AsyncSession, product_id: int, new_stock: float) -> Product | None:
    product = await db.get(Product, product_id)
    if not product: return None
    product.stock = new_stock
    await db.flush()
    return product

async def get_low_stock(db: AsyncSession) -> list[Product]:
    result = await db.execute(select(Product).where(Product.stock <= Product.low_stock_threshold).order_by(Product.stock.asc()))
    return result.scalars().all()
```

- [ ] **Step 2: Overwrite `backend/app/routers/products.py`**

```python
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_user
from app.schemas.product import ProductCreate, ProductUpdate, StockAdjust, ProductResponse
from app.services import product_service

router = APIRouter(dependencies=[Depends(get_current_user)])

@router.get("", response_model=list[ProductResponse])
async def list_products(search: str = Query(""), category: str = Query(""), page: int = Query(1), limit: int = Query(50), db: AsyncSession = Depends(get_db)):
    return await product_service.get_products(db, search, category, page, limit)

@router.get("/low-stock", response_model=list[ProductResponse])
async def low_stock(db: AsyncSession = Depends(get_db)):
    return await product_service.get_low_stock(db)

@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: int, db: AsyncSession = Depends(get_db)):
    product = await product_service.get_product(db, product_id)
    if not product: raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("", response_model=ProductResponse, status_code=201)
async def create_product(data: ProductCreate, db: AsyncSession = Depends(get_db)):
    return await product_service.create_product(db, data.model_dump())

@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(product_id: int, data: ProductUpdate, db: AsyncSession = Depends(get_db)):
    product = await product_service.update_product(db, product_id, data.model_dump(exclude_unset=True))
    if not product: raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.delete("/{product_id}", status_code=204)
async def delete_product(product_id: int, db: AsyncSession = Depends(get_db)):
    if not await product_service.delete_product(db, product_id):
        raise HTTPException(status_code=404, detail="Product not found")

@router.patch("/{product_id}/stock", response_model=ProductResponse)
async def adjust_product_stock(product_id: int, data: StockAdjust, db: AsyncSession = Depends(get_db)):
    product = await product_service.adjust_stock(db, product_id, data.stock)
    if not product: raise HTTPException(status_code=404, detail="Product not found")
    return product
```

- [ ] **Step 3: Create `backend/app/tests/test_products.py`**

```python
import pytest
from app.services.product_service import create_product, get_products, get_product

@pytest.mark.asyncio
async def test_create_and_list_products(async_session):
    await create_product(async_session, {"name": "Test Fish", "category": "PESCADO BLANCO", "stock": 10.0, "price": 15.0})
    await async_session.commit()
    products = await get_products(async_session)
    assert len(products) == 1
    assert products[0].name == "Test Fish"

@pytest.mark.asyncio
async def test_get_product_by_id(async_session):
    p = await create_product(async_session, {"name": "Test", "category": "X", "stock": 5.0, "price": 10.0})
    await async_session.commit()
    found = await get_product(async_session, p.id)
    assert found is not None and found.name == "Test"
```

- [ ] **Step 4: Run tests and commit**

```bash
cd backend && python -m pytest app/tests/test_products.py -v
git add backend/app/services/product_service.py backend/app/routers/products.py backend/app/tests/test_products.py
git commit -m "feat(backend): add CRUD products endpoints"
```
