from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_user
from app.schemas.category import CategoryCreate, CategoryResponse
from app.services import category_service

router = APIRouter(dependencies=[Depends(get_current_user)])

@router.get("", response_model=list[CategoryResponse])
async def list_categories(user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await category_service.list_categories(db, user["id"])

@router.post("", response_model=CategoryResponse, status_code=201)
async def create_category(data: CategoryCreate, user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    try:
        return await category_service.create_category(db, user["id"], data.name)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{category_id}", status_code=204)
async def delete_category(category_id: int, user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if not await category_service.delete_category(db, category_id, user["id"]):
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
