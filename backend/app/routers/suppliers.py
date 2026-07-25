from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_user
from app.schemas.supplier import SupplierCreate, SupplierUpdate, SupplierResponse
from app.services import supplier_service

router = APIRouter(dependencies=[Depends(get_current_user)])

@router.get("", response_model=list[SupplierResponse])
async def list_suppliers(search: str = Query(""), page: int = Query(1), limit: int = Query(50), user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await supplier_service.get_suppliers(db, user["id"], search, page, limit)

@router.get("/{supplier_id}", response_model=SupplierResponse)
async def get_supplier(supplier_id: int, user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    supplier = await supplier_service.get_supplier(db, supplier_id, user["id"])
    if not supplier: raise HTTPException(status_code=404, detail="Supplier not found")
    return supplier

@router.post("", response_model=SupplierResponse, status_code=201)
async def create_supplier(data: SupplierCreate, user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await supplier_service.create_supplier(db, data.model_dump(), user["id"])

@router.put("/{supplier_id}", response_model=SupplierResponse)
async def update_supplier(supplier_id: int, data: SupplierUpdate, user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    supplier = await supplier_service.update_supplier(db, supplier_id, data.model_dump(exclude_unset=True), user["id"])
    if not supplier: raise HTTPException(status_code=404, detail="Supplier not found")
    return supplier

@router.delete("/{supplier_id}", status_code=204)
async def delete_supplier(supplier_id: int, user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if not await supplier_service.delete_supplier(db, supplier_id, user["id"]):
        raise HTTPException(status_code=404, detail="Supplier not found")
