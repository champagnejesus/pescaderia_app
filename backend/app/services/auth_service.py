from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.config import settings
from app.models.business import BusinessConfig
from app.models.collaborator import Collaborator

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthenticatedUser:
    def __init__(self, business_id: int, collaborator_id: int, email: str, name: str, business_name: str, role: str):
        self.id = business_id  # for JWT 'sub' compatibility
        self.collaborator_id = collaborator_id
        self.email = email
        self.owner_name = name  # for front-end name display
        self.business_name = business_name
        self.role = role

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
    existing_business = await db.scalar(select(BusinessConfig).where(BusinessConfig.email == email))
    existing_collab = await db.scalar(select(Collaborator).where(Collaborator.email == email))
    if existing_business or existing_collab:
        raise ValueError("Email already registered")
        
    business = BusinessConfig(business_name=business_name, owner_name=owner_name, email=email, password_hash=hash_password(password), phone=phone)
    db.add(business)
    await db.flush()
    
    # Create the owner as the default Administrador collaborator
    owner_collab = Collaborator(
        business_id=business.id,
        name=owner_name,
        email=email,
        password_hash=hash_password(password),
        role="Administrador",
        is_active=True
    )
    db.add(owner_collab)
    await db.flush()
    
    return business

async def authenticate(db: AsyncSession, email: str, password: str) -> AuthenticatedUser | None:
    # 1. Check in collaborators table
    collab = await db.scalar(select(Collaborator).where(Collaborator.email == email))
    if collab:
        if not verify_password(password, collab.password_hash) or not collab.is_active:
            return None
        business = await db.scalar(select(BusinessConfig).where(BusinessConfig.id == collab.business_id))
        if not business:
            return None
        return AuthenticatedUser(
            business_id=business.id,
            collaborator_id=collab.id,
            email=collab.email,
            name=collab.name,
            business_name=business.business_name,
            role=collab.role
        )
        
    # 2. Check legacy business_config table (self-repairing migration for owner account)
    business = await db.scalar(select(BusinessConfig).where(BusinessConfig.email == email))
    if business:
        if not verify_password(password, business.password_hash):
            return None
        # Auto-create collaborator entry for owner
        collab = Collaborator(
            business_id=business.id,
            name=business.owner_name,
            email=business.email,
            password_hash=business.password_hash,
            role="Administrador",
            is_active=True
        )
        db.add(collab)
        await db.flush()
        return AuthenticatedUser(
            business_id=business.id,
            collaborator_id=collab.id,
            email=business.email,
            name=business.owner_name,
            business_name=business.business_name,
            role="Administrador"
        )
        
    return None
