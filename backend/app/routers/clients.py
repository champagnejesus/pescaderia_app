from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_user
from app.schemas.client import ClientCreate, ClientUpdate, BalanceAdjust, ClientResponse, ClientOrdersResponse
from app.services import client_service

router = APIRouter(dependencies=[Depends(get_current_user)])

@router.get("", response_model=list[ClientResponse])
async def list_clients(search: str = Query(""), page: int = Query(1), limit: int = Query(50), user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await client_service.get_clients(db, user["id"], search, page, limit)

@router.get("/{client_id}", response_model=ClientResponse)
async def get_client(client_id: int, user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    client = await client_service.get_client(db, client_id, user["id"])
    if not client: raise HTTPException(status_code=404, detail="Client not found")
    return client

@router.post("", response_model=ClientResponse, status_code=201)
async def create_client(data: ClientCreate, user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await client_service.create_client(db, data.model_dump(), user["id"])

@router.put("/{client_id}", response_model=ClientResponse)
async def update_client(client_id: int, data: ClientUpdate, user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    client = await client_service.update_client(db, client_id, data.model_dump(exclude_unset=True), user["id"])
    if not client: raise HTTPException(status_code=404, detail="Client not found")
    return client

@router.delete("/{client_id}", status_code=204)
async def delete_client(client_id: int, user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if not await client_service.delete_client(db, client_id, user["id"]):
        raise HTTPException(status_code=404, detail="Client not found")

@router.patch("/{client_id}/balance", response_model=ClientResponse)
async def adjust_client_balance(client_id: int, data: BalanceAdjust, user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    client = await client_service.adjust_balance(db, client_id, data.new_balance, user["id"])
    if not client: raise HTTPException(status_code=404, detail="Client not found")
    return client

@router.get("/{client_id}/orders", response_model=ClientOrdersResponse)
async def get_client_orders_endpoint(client_id: int, limit: int = Query(5), user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    client = await client_service.get_client(db, client_id, user["id"])
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    orders = await client_service.get_client_orders(db, client_id, user["id"], limit)
    return ClientOrdersResponse(orders=orders, count=len(orders))
