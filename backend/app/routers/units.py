from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_user
from app.schemas.unit import UnitCreate, UnitResponse
from app.services import unit_service

router = APIRouter(dependencies=[Depends(get_current_user)])

@router.get("", response_model=list[UnitResponse])
async def list_units(user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await unit_service.list_units(db, user["id"])

@router.post("", response_model=UnitResponse, status_code=201)
async def create_unit(data: UnitCreate, user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    try:
        return await unit_service.create_unit(db, user["id"], data.name, data.abbreviation)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{unit_id}", status_code=204)
async def delete_unit(unit_id: int, user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if not await unit_service.delete_unit(db, unit_id, user["id"]):
        raise HTTPException(status_code=404, detail="Unidad no encontrada")
