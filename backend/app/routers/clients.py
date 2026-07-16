from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_user
from app.schemas.client import ClientCreate, ClientUpdate, BalanceAdjust, ClientResponse
from app.services import client_service

router = APIRouter(dependencies=[Depends(get_current_user)])

@router.get("", response_model=list[ClientResponse])
async def list_clients(search: str = Query(""), page: int = Query(1), limit: int = Query(50), db: AsyncSession = Depends(get_db)):
    return await client_service.get_clients(db, search, page, limit)

@router.get("/{client_id}", response_model=ClientResponse)
async def get_client(client_id: int, db: AsyncSession = Depends(get_db)):
    client = await client_service.get_client(db, client_id)
    if not client: raise HTTPException(status_code=404, detail="Client not found")
    return client

@router.post("", response_model=ClientResponse, status_code=201)
async def create_client(data: ClientCreate, db: AsyncSession = Depends(get_db)):
    return await client_service.create_client(db, data.model_dump())

@router.put("/{client_id}", response_model=ClientResponse)
async def update_client(client_id: int, data: ClientUpdate, db: AsyncSession = Depends(get_db)):
    client = await client_service.update_client(db, client_id, data.model_dump(exclude_unset=True))
    if not client: raise HTTPException(status_code=404, detail="Client not found")
    return client

@router.delete("/{client_id}", status_code=204)
async def delete_client(client_id: int, db: AsyncSession = Depends(get_db)):
    if not await client_service.delete_client(db, client_id):
        raise HTTPException(status_code=404, detail="Client not found")

@router.patch("/{client_id}/balance", response_model=ClientResponse)
async def adjust_client_balance(client_id: int, data: BalanceAdjust, db: AsyncSession = Depends(get_db)):
    client = await client_service.adjust_balance(db, client_id, data.new_balance)
    if not client: raise HTTPException(status_code=404, detail="Client not found")
    return client
