from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, RefreshRequest
from app.services.auth_service import register_business, authenticate, create_access_token, create_refresh_token, decode_token

router = APIRouter()

@router.post("/register", response_model=TokenResponse)
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    try:
        business = await register_business(db, req.business_name, req.owner_name, req.email, req.password, req.phone)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    user_id = str(business.id)
    access_token = create_access_token({"sub": user_id, "email": business.email})
    refresh_token = create_refresh_token({"sub": user_id, "email": business.email})
    return TokenResponse(access_token=access_token, refresh_token=refresh_token, business_name=business.business_name, owner_name=business.owner_name)

@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    business = await authenticate(db, req.email, req.password)
    if not business:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    user_id = str(business.id)
    access_token = create_access_token({"sub": user_id, "email": business.email})
    refresh_token = create_refresh_token({"sub": user_id, "email": business.email})
    return TokenResponse(access_token=access_token, refresh_token=refresh_token, business_name=business.business_name, owner_name=business.owner_name)

@router.post("/refresh", response_model=TokenResponse)
async def refresh(req: RefreshRequest, db: AsyncSession = Depends(get_db)):
    payload = decode_token(req.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token")
    user_id = payload.get("sub")
    email = payload.get("email")
    if not user_id or not email:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
    access_token = create_access_token({"sub": user_id, "email": email})
    refresh_token = create_refresh_token({"sub": user_id, "email": email})
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)
