### Task 3: SQLAlchemy Models — Orders, Transactions

**Files:**
- Create: `backend/app/models/order.py`
- Create: `backend/app/models/transaction.py`
- Update: `backend/app/models/__init__.py`

- [ ] **Step 1: Create `backend/app/models/order.py`**

```python
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database import Base

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(50), unique=True, nullable=False, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    client_name = Column(String(255), nullable=False)
    delivery_date = Column(String(100))
    items_count = Column(Integer, default=0)
    status = Column(String(50), default="PENDIENTE", index=True)
    total_value = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    delivered_at = Column(DateTime(timezone=True))
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = "order_items"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Float, nullable=False)
    unit_price = Column(Float, nullable=False)
    subtotal = Column(Float, nullable=False)
    order = relationship("Order", back_populates="items")
```

- [ ] **Step 2: Create `backend/app/models/transaction.py`**

```python
from sqlalchemy import Column, Integer, String, Float, DateTime, func
from app.database import Base

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    time = Column(String(50), nullable=False)
    type = Column(String(50), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    status = Column(String(50), default="PAGADO")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
```

- [ ] **Step 3: Update `backend/app/models/__init__.py`**

```python
from app.models.business import BusinessConfig
from app.models.product import Product
from app.models.client import Client
from app.models.supplier import Supplier
from app.models.order import Order, OrderItem
from app.models.transaction import Transaction
__all__ = ["BusinessConfig", "Product", "Client", "Supplier", "Order", "OrderItem", "Transaction"]
```

- [ ] **Step 4: Commit**

```bash
git add backend/app/models/
git commit -m "feat(backend): add Order, OrderItem, Transaction models"
```
