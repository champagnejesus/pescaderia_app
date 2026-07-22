from pydantic import BaseModel
from datetime import datetime

class CategoryCreate(BaseModel):
    name: str

class CategoryResponse(BaseModel):
    id: int
    name: str
    created_at: datetime | None = None
    class Config: from_attributes = True
