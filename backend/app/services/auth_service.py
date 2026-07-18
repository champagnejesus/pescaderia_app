from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
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

def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.refresh_token_expire_minutes)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)

def decode_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
    except JWTError:
        return None

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
