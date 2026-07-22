from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_user
from app.services import data_service

router = APIRouter(dependencies=[Depends(get_current_user)])

@router.delete("/clear-all")
async def clear_all_data(db: AsyncSession = Depends(get_db)):
    await data_service.clear_all_data(db)
    return {"ok": True, "message": "Todos los datos han sido eliminados"}
