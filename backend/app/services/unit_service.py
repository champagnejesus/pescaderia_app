from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from app.models.unit import Unit

async def list_units(db: AsyncSession, business_id: int) -> list[Unit]:
    result = await db.execute(select(Unit).where(Unit.business_id == business_id).order_by(Unit.name))
    return result.scalars().all()

async def create_unit(db: AsyncSession, business_id: int, name: str, abbreviation: str) -> Unit:
    unit = Unit(name=name, abbreviation=abbreviation, business_id=business_id)
    db.add(unit)
    try:
        await db.flush()
    except IntegrityError:
        raise ValueError("Ya existe una unidad con ese nombre")
    return unit

async def delete_unit(db: AsyncSession, unit_id: int, business_id: int) -> bool:
    unit = await db.get(Unit, unit_id)
    if not unit or unit.business_id != business_id:
        return False
    await db.delete(unit)
    await db.flush()
    return True
