from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_user
from app.schemas.product import ProductCreate, ProductUpdate, StockAdjust, ProductResponse
from app.services import product_service

router = APIRouter(dependencies=[Depends(get_current_user)])

@router.get("", response_model=list[ProductResponse])
async def list_products(search: str = Query(""), category: str = Query(""), page: int = Query(1), limit: int = Query(50), db: AsyncSession = Depends(get_db)):
    return await product_service.get_products(db, search, category, page, limit)

@router.get("/low-stock", response_model=list[ProductResponse])
async def low_stock(db: AsyncSession = Depends(get_db)):
    return await product_service.get_low_stock(db)

@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: int, db: AsyncSession = Depends(get_db)):
    product = await product_service.get_product(db, product_id)
    if not product: raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("", response_model=ProductResponse, status_code=201)
async def create_product(data: ProductCreate, db: AsyncSession = Depends(get_db)):
    return await product_service.create_product(db, data.model_dump())

@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(product_id: int, data: ProductUpdate, db: AsyncSession = Depends(get_db)):
    product = await product_service.update_product(db, product_id, data.model_dump(exclude_unset=True))
    if not product: raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.delete("/{product_id}", status_code=204)
async def delete_product(product_id: int, db: AsyncSession = Depends(get_db)):
    if not await product_service.delete_product(db, product_id):
        raise HTTPException(status_code=404, detail="Product not found")

@router.patch("/{product_id}/stock", response_model=ProductResponse)
async def adjust_product_stock(product_id: int, data: StockAdjust, db: AsyncSession = Depends(get_db)):
    product = await product_service.adjust_stock(db, product_id, data.stock)
    if not product: raise HTTPException(status_code=404, detail="Product not found")
    return product
