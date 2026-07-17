### Task 2: SQLAlchemy Models — Products, Clients, Suppliers

**Files:**
- Create: `backend/app/models/business.py`
- Create: `backend/app/models/product.py`
- Create: `backend/app/models/client.py`
- Create: `backend/app/models/supplier.py`
- Update: `backend/app/models/__init__.py`

- [ ] **Step 1: Create `backend/app/models/business.py`**

```python
from sqlalchemy import Column, Integer, String, DateTime, func
from app.database import Base

class BusinessConfig(Base):
    __tablename__ = "business_config"
    id = Column(Integer, primary_key=True, index=True)
    business_name = Column(String(255), nullable=False)
    owner_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    phone = Column(String(50))
    address = Column(String(500))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
```

- [ ] **Step 2: Create `backend/app/models/product.py`**

```python
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, func
from app.database import Base

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False, index=True)
    stock = Column(Float, nullable=False, default=0.0)
    unit = Column(String(20), nullable=False, default="kg")
    price = Column(Float, nullable=False)
    image_url = Column(String(1000))
    description = Column(String(2000))
    is_extra_quality = Column(Boolean, default=False)
    low_stock_threshold = Column(Float, default=10.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
```

- [ ] **Step 3: Create `backend/app/models/client.py`**

```python
from sqlalchemy import Column, Integer, String, Float, DateTime, func
from app.database import Base

class Client(Base):
    __tablename__ = "clients"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    phone = Column(String(50))
    email = Column(String(255))
    address = Column(String(500))
    outstanding_balance = Column(Float, default=0.0)
    initials = Column(String(10))
    credit_limit = Column(Float, default=1500.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
```

- [ ] **Step 4: Create `backend/app/models/supplier.py`**

```python
from sqlalchemy import Column, Integer, String, Float, DateTime, func
from app.database import Base

class Supplier(Base):
    __tablename__ = "suppliers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    pending_payment = Column(Float, default=0.0)
    status = Column(String(50), default="PENDIENTE")
    image_url = Column(String(1000))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
```

- [ ] **Step 5: Update `backend/app/models/__init__.py`**

```python
from app.models.business import BusinessConfig
from app.models.product import Product
from app.models.client import Client
from app.models.supplier import Supplier
__all__ = ["BusinessConfig", "Product", "Client", "Supplier"]
```

- [ ] **Step 6: Commit**

```bash
git add backend/app/models/
git commit -m "feat(backend): add SQLAlchemy models for Product, Client, Supplier"
```
