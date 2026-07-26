from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.dependencies import get_current_user
from app.schemas.business import BusinessProfileResponse, BusinessProfileUpdate, PinUpdate, CollaboratorResponse, CollaboratorCreate
from app.services import business_service
from app.models.collaborator import Collaborator
from app.models.business import BusinessConfig
from app.services.auth_service import hash_password

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

@router.get("/collaborators", response_model=list[CollaboratorResponse])
async def list_collaborators(user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    bid = user["id"]
    result = await db.execute(select(Collaborator).where(Collaborator.business_id == bid).order_by(Collaborator.id.asc()))
    return result.scalars().all()

@router.post("/collaborators", response_model=CollaboratorResponse)
async def create_collaborator(data: CollaboratorCreate, user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    bid = user["id"]
    # Check if email is already in use
    existing_business = await db.scalar(select(BusinessConfig).where(BusinessConfig.email == data.email))
    existing_collab = await db.scalar(select(Collaborator).where(Collaborator.email == data.email))
    if existing_business or existing_collab:
        raise HTTPException(status_code=400, detail="El correo electrónico ya está registrado")
        
    collab = Collaborator(
        business_id=bid,
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password),
        role=data.role,
        is_active=True
    )
    db.add(collab)
    await db.flush()
    return collab

@router.delete("/collaborators/{collab_id}", status_code=200)
async def delete_collaborator(collab_id: int, user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    bid = user["id"]
    collab = await db.scalar(select(Collaborator).where(Collaborator.id == collab_id, Collaborator.business_id == bid))
    if not collab:
        raise HTTPException(status_code=404, detail="Colaborador no encontrado")
        
    # Prevent self-deletion
    if collab.email == user["email"]:
        raise HTTPException(status_code=400, detail="No puedes eliminar tu propio usuario")
        
    await db.delete(collab)
    await db.flush()
    return {"ok": True}

@router.patch("/collaborators/{collab_id}/toggle", response_model=CollaboratorResponse)
async def toggle_collaborator(collab_id: int, user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    bid = user["id"]
    collab = await db.scalar(select(Collaborator).where(Collaborator.id == collab_id, Collaborator.business_id == bid))
    if not collab:
        raise HTTPException(status_code=404, detail="Colaborador no encontrado")
        
    # Prevent self-deactivation
    if collab.email == user["email"]:
        raise HTTPException(status_code=400, detail="No puedes desactivar tu propio usuario")
        
    collab.is_active = not collab.is_active
    await db.flush()
    return collab
