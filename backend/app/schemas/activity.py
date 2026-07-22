from pydantic import BaseModel
from datetime import datetime

class RecentActivityItem(BaseModel):
    id: str
    type: str
    title: str
    description: str
    reference_id: int
    reference: str
    amount: float
    status: str
    created_at: datetime | None = None
    class Config: from_attributes = True
