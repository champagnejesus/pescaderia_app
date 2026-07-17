### Task 4: Pydantic Schemas

**Files:**
- Create: `backend/app/schemas/auth.py`
- Create: `backend/app/schemas/product.py`
- Create: `backend/app/schemas/client.py`
- Create: `backend/app/schemas/supplier.py`
- Create: `backend/app/schemas/order.py`
- Create: `backend/app/schemas/transaction.py`
- Create: `backend/app/schemas/report.py`
- Create: `backend/app/schemas/sync.py`

- [ ] **Step 1: Create `backend/app/schemas/auth.py`**

```python
from pydantic import BaseModel

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    business_name: str
    owner_name: str
    email: str
    password: str
    phone: str | None = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    business_name: str
    owner_name: str
```

- [ ] **Step 2: Create `backend/app/schemas/product.py`**

```python
from pydantic import BaseModel
from datetime import datetime

class ProductCreate(BaseModel):
    name: str
    category: str
    stock: float = 0.0
    unit: str = "kg"
    price: float
    image_url: str = ""
    description: str = ""
    is_extra_quality: bool = False
    low_stock_threshold: float = 10.0

class ProductUpdate(BaseModel):
    name: str | None = None
    category: str | None = None
    stock: float | None = None
    unit: str | None = None
    price: float | None = None
    image_url: str | None = None
    description: str | None = None
    is_extra_quality: bool | None = None
    low_stock_threshold: float | None = None

class StockAdjust(BaseModel):
    stock: float

class ProductResponse(BaseModel):
    id: int
    name: str
    category: str
    stock: float
    unit: str
    price: float
    image_url: str
    description: str
    is_extra_quality: bool
    low_stock_threshold: float
    created_at: datetime | None = None
    updated_at: datetime | None = None
    class Config: from_attributes = True
```

- [ ] **Step 3: Create `backend/app/schemas/client.py`**

```python
from pydantic import BaseModel
from datetime import datetime

class ClientCreate(BaseModel):
    name: str
    phone: str = ""
    email: str = ""
    address: str = ""
    outstanding_balance: float = 0.0
    initials: str = ""
    credit_limit: float = 1500.0

class ClientUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    email: str | None = None
    address: str | None = None
    credit_limit: float | None = None

class BalanceAdjust(BaseModel):
    new_balance: float

class ClientResponse(BaseModel):
    id: int
    name: str
    phone: str
    email: str
    address: str
    outstanding_balance: float
    initials: str
    credit_limit: float
    created_at: datetime | None = None
    class Config: from_attributes = True
```

- [ ] **Step 4: Create `backend/app/schemas/supplier.py`**

```python
from pydantic import BaseModel
from datetime import datetime

class SupplierCreate(BaseModel):
    name: str
    category: str
    pending_payment: float = 0.0
    status: str = "PENDIENTE"
    image_url: str = ""

class SupplierUpdate(BaseModel):
    name: str | None = None
    category: str | None = None
    pending_payment: float | None = None
    status: str | None = None
    image_url: str | None = None

class SupplierResponse(BaseModel):
    id: int
    name: str
    category: str
    pending_payment: float
    status: str
    image_url: str
    created_at: datetime | None = None
    class Config: from_attributes = True
```

- [ ] **Step 5: Create `backend/app/schemas/order.py`**

```python
from pydantic import BaseModel
from datetime import datetime

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: float
    unit_price: float
    subtotal: float

class OrderCreate(BaseModel):
    client_id: int
    client_name: str
    delivery_date: str = ""
    items: list[OrderItemCreate]
    payment_method: str = "Efectivo"

class OrderStatusUpdate(BaseModel):
    status: str

class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: float
    unit_price: float
    subtotal: float
    class Config: from_attributes = True

class OrderResponse(BaseModel):
    id: int
    order_number: str
    client_id: int
    client_name: str
    delivery_date: str
    items_count: int
    status: str
    total_value: float
    created_at: datetime | None = None
    items: list[OrderItemResponse] = []
    class Config: from_attributes = True
```

- [ ] **Step 6: Create `backend/app/schemas/transaction.py`**

```python
from pydantic import BaseModel
from datetime import datetime

class TransactionCreate(BaseModel):
    title: str
    time: str
    type: str
    amount: float
    status: str = "PAGADO"

class TransactionResponse(BaseModel):
    id: int
    title: str
    time: str
    type: str
    amount: float
    status: str
    created_at: datetime | None = None
    class Config: from_attributes = True

class DailySummaryResponse(BaseModel):
    total_sales: float
    total_expenses: float
    net_total: float
    cash_total: float
    card_total: float
    transaction_count: int
```

- [ ] **Step 7: Create `backend/app/schemas/report.py`**

```python
from pydantic import BaseModel

class DashboardResponse(BaseModel):
    gross_profit: float
    sales_total: float
    purchases_total: float
    cash_total: float
    transfer_total: float
    pending_orders: int
    low_stock_count: int
    total_clients: int
    total_suppliers: int
```

- [ ] **Step 8: Create `backend/app/schemas/sync.py`**

```python
from pydantic import BaseModel
from datetime import datetime

class SyncPullRequest(BaseModel):
    since: datetime | None = None

class SyncPullResponse(BaseModel):
    products: list = []
    clients: list = []
    suppliers: list = []
    orders: list = []
    transactions: list = []
    server_time: datetime

class SyncPushItem(BaseModel):
    action: str
    entity: str
    data: dict
    client_timestamp: datetime | None = None

class SyncPushRequest(BaseModel):
    changes: list[SyncPushItem]

class SyncPushResponse(BaseModel):
    accepted: int = 0
    rejected: list[str] = []
    server_time: datetime
```

- [ ] **Step 9: Commit**

```bash
git add backend/app/schemas/
git commit -m "feat(backend): add Pydantic schemas for all entities"
```
