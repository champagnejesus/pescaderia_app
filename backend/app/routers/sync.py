from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_user
from app.schemas.sync import SyncPullRequest, SyncPullResponse, SyncPushRequest, SyncPushResponse
from app.services.sync_service import pull_changes
from app.services import product_service, order_service

router = APIRouter(dependencies=[Depends(get_current_user)])

@router.post("/pull", response_model=SyncPullResponse)
async def sync_pull(req: SyncPullRequest, db: AsyncSession = Depends(get_db)):
    data = await pull_changes(db, req.since)
    return SyncPullResponse(**data, server_time=datetime.now(timezone.utc))

@router.post("/push", response_model=SyncPushResponse)
async def sync_push(req: SyncPushRequest, db: AsyncSession = Depends(get_db)):
    accepted = 0; rejected = []
    for change in req.changes:
        try:
            if change.entity == "product" and change.action in ("create", "update"):
                if change.action == "create":
                    await product_service.create_product(db, change.data)
            elif change.entity == "order" and change.action == "create":
                await order_service.create_order(db, {**change.data, "items": change.data.get("items", [])})
            accepted += 1
        except Exception as e: rejected.append(str(e))
    return SyncPushResponse(accepted=accepted, rejected=rejected, server_time=datetime.now(timezone.utc))
