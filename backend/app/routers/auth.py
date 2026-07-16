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
    token = create_access_token({"sub": business.id, "email": business.email})
    return TokenResponse(access_token=token, business_name=business.business_name, owner_name=business.owner_name)

@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    business = await authenticate(db, req.email, req.password)
    if not business:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token({"sub": business.id, "email": business.email})
    return TokenResponse(access_token=token, business_name=business.business_name, owner_name=business.owner_name)
