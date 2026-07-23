from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ExpenseCategoryCreate(BaseModel):
    name: str
    parent_id: Optional[int] = None

class ExpenseCategoryUpdate(BaseModel):
    name: Optional[str] = None
    is_active: Optional[bool] = None

class ExpenseCategoryResponse(BaseModel):
    id: int
    name: str
    parent_id: Optional[int]
    is_active: bool
    created_at: datetime
    subcategories: List["ExpenseCategoryResponse"] = []

    class Config:
        from_attributes = True

class ExpenseCategoryListResponse(BaseModel):
    categories: List[ExpenseCategoryResponse]
    total: int
