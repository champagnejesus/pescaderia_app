from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_user
from app.schemas.tax_config import TaxConfigUpdate, TaxConfigResponse
from app.services import tax_config_service

router = APIRouter(dependencies=[Depends(get_current_user)])

@router.get("", response_model=TaxConfigResponse | None)
async def get_tax_config(user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await tax_config_service.get_tax_config(db, user["id"])

@router.put("", response_model=TaxConfigResponse)
async def update_tax_config(data: TaxConfigUpdate, user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await tax_config_service.upsert_tax_config(db, user["id"], data.model_dump())
