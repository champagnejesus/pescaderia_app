from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from io import BytesIO
from app.database import get_db
from app.dependencies import get_current_user
from app.services import pdf_service

router = APIRouter(dependencies=[Depends(get_current_user)])


@router.get("/order/{order_id}")
async def download_order_pdf(
    order_id: int,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        pdf_bytes = await pdf_service.generate_order_pdf(db, order_id)
        return StreamingResponse(
            BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=pedido_{order_id}.pdf"}
        )
    except ValueError as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/purchase/{purchase_id}")
async def download_purchase_pdf(
    purchase_id: int,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        pdf_bytes = await pdf_service.generate_purchase_pdf(db, purchase_id)
        return StreamingResponse(
            BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=compra_{purchase_id}.pdf"}
        )
    except ValueError as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/report/{report_type}")
async def download_report_pdf(
    report_type: str,
    start_date: str = Query(None),
    end_date: str = Query(None),
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if report_type not in ("sales", "products", "clients", "inventory"):
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Invalid report type. Use: sales, products, clients, inventory")
    
    pdf_bytes = await pdf_service.generate_report_pdf(db, report_type, start_date, end_date)
    return StreamingResponse(
        BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=reporte_{report_type}.pdf"}
    )