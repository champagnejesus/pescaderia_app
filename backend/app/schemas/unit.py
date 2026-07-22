from pydantic import BaseModel
from datetime import datetime

class UnitCreate(BaseModel):
    name: str
    abbreviation: str

class UnitResponse(BaseModel):
    id: int
    name: str
    abbreviation: str
    created_at: datetime | None = None
    class Config: from_attributes = True
