from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_user
from app.schemas.expense_category import (
    ExpenseCategoryCreate, ExpenseCategoryUpdate,
    ExpenseCategoryResponse, ExpenseCategoryListResponse
)
from app.services import expense_category_service

router = APIRouter(dependencies=[Depends(get_current_user)])


@router.get("", response_model=ExpenseCategoryListResponse)
async def list_categories(
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    categories = await expense_category_service.get_categories(db, user["id"])
    return ExpenseCategoryListResponse(categories=categories, total=len(categories))


@router.post("", response_model=ExpenseCategoryResponse, status_code=201)
async def create_category(
    data: ExpenseCategoryCreate,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await expense_category_service.create_category(db, data, user["id"])


@router.put("/{category_id}", response_model=ExpenseCategoryResponse)
async def update_category(
    category_id: int,
    data: ExpenseCategoryUpdate,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    category = await expense_category_service.update_category(db, category_id, data)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


@router.delete("/{category_id}", status_code=204)
async def delete_category(
    category_id: int,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    success = await expense_category_service.delete_category(db, category_id)
    if not success:
        raise HTTPException(status_code=400, detail="Cannot delete category with expenses")
