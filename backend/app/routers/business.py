from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_user
from app.schemas.business import BusinessProfileResponse, BusinessProfileUpdate, PinUpdate
from app.services import business_service

router = APIRouter(dependencies=[Depends(get_current_user)])

@router.get("/profile", response_model=BusinessProfileResponse)
async def get_profile(user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    profile = await business_service.get_profile(db, user["id"])
    if not profile:
        raise HTTPException(status_code=404, detail="Perfil no encontrado")
    return BusinessProfileResponse(
        id=profile.id,
        business_name=profile.business_name,
        owner_name=profile.owner_name,
        email=profile.email,
        phone=profile.phone,
        address=profile.address,
        require_pin=profile.require_pin or False,
        has_pin=bool(profile.close_day_pin),
    )

@router.put("/profile")
async def update_profile(data: BusinessProfileUpdate, user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    profile = await business_service.update_profile(db, user["id"], data.model_dump())
    if not profile:
        raise HTTPException(status_code=404, detail="Perfil no encontrado")
    return {"ok": True}

@router.put("/pin")
async def update_pin(data: PinUpdate, user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if data.pin != data.confirm_pin:
        raise HTTPException(status_code=400, detail="Los PIN no coinciden")
    if data.pin and (len(data.pin) != 4 or not data.pin.isdigit()):
        raise HTTPException(status_code=400, detail="El PIN debe tener 4 digitos")
    profile = await business_service.update_pin(db, user["id"], data.pin, data.require_pin)
    if not profile:
        raise HTTPException(status_code=404, detail="Perfil no encontrado")
    return {"ok": True}
