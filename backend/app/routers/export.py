from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_user
from app.services import export_service

router = APIRouter(dependencies=[Depends(get_current_user)])

ENTITY_MAP = {
    "productos": export_service.export_products_csv,
    "clientes": export_service.export_clients_csv,
    "pedidos": export_service.export_orders_csv,
}

@router.get("/{entity}")
async def export_entity(entity: str, user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if entity not in ENTITY_MAP:
        raise HTTPException(status_code=404, detail="Entidad no disponible para exportar")
    csv_content = await ENTITY_MAP[entity](db, user["id"])
    return Response(content=csv_content, media_type="text/csv", headers={"Content-Disposition": f"attachment; filename={entity}.csv"})

@router.get("/all")
async def export_all(user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    data, filename = await export_service.export_all_zip(db, user["id"])
    return Response(content=data, media_type="application/zip", headers={"Content-Disposition": f"attachment; filename={filename}"})
