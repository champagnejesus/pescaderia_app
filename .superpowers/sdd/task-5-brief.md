### Task 5: Auth Service + Endpoints (Register, Login, JWT)

**Files:**
- Create: `backend/app/services/auth_service.py`
- Overwrite: `backend/app/routers/auth.py` (currently has stub `router = APIRouter()`)
- Create: `backend/app/tests/test_auth.py`

- [ ] **Step 1: Create `backend/app/services/auth_service.py`**

```python
from datetime import datetime, timedelta, timezone
from jose import jwt
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.config import settings
from app.models.business import BusinessConfig

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)

async def register_business(db: AsyncSession, business_name: str, owner_name: str, email: str, password: str, phone: str = None) -> BusinessConfig:
    existing = await db.scalar(select(BusinessConfig).where(BusinessConfig.email == email))
    if existing:
        raise ValueError("Email already registered")
    business = BusinessConfig(business_name=business_name, owner_name=owner_name, email=email, password_hash=hash_password(password), phone=phone)
    db.add(business)
    await db.flush()
    return business

async def authenticate(db: AsyncSession, email: str, password: str) -> BusinessConfig | None:
    user = await db.scalar(select(BusinessConfig).where(BusinessConfig.email == email))
    if not user or not verify_password(password, user.password_hash):
        return None
    return user
```

- [ ] **Step 2: Overwrite `backend/app/routers/auth.py`**

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.services.auth_service import register_business, authenticate, create_access_token

router = APIRouter()

@router.post("/register", response_model=TokenResponse)
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    try:
        business = await register_business(db, req.business_name, req.owner_name, req.email, req.password, req.phone)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    token = create_access_token({"sub": str(business.id), "email": business.email})
    return TokenResponse(access_token=token, business_name=business.business_name, owner_name=business.owner_name)

@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    business = await authenticate(db, req.email, req.password)
    if not business:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token({"sub": str(business.id), "email": business.email})
    return TokenResponse(access_token=token, business_name=business.business_name, owner_name=business.owner_name)
```

- [ ] **Step 3: Create `backend/app/tests/test_auth.py`**

```python
from app.services.auth_service import hash_password, verify_password, create_access_token
from jose import jwt
from app.config import settings

def test_password_hashing():
    hashed = hash_password("test123")
    assert verify_password("test123", hashed)
    assert not verify_password("wrong", hashed)

def test_token_creation():
    token = create_access_token({"sub": "1", "email": "test@test.com"})
    payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
    assert payload["sub"] == "1"
    assert payload["email"] == "test@test.com"
```

- [ ] **Step 4: Run tests**

```bash
cd backend && python -m pytest app/tests/test_auth.py -v
```

- [ ] **Step 5: Commit**

```bash
git add backend/app/services/auth_service.py backend/app/routers/auth.py backend/app/tests/test_auth.py
git commit -m "feat(backend): add auth with register, login, JWT"
```
