from pydantic import BaseModel
from datetime import datetime

class SyncPullRequest(BaseModel):
    since: datetime | None = None

class SyncPullResponse(BaseModel):
    products: list = []
    clients: list = []
    suppliers: list = []
    orders: list = []
    transactions: list = []
    server_time: datetime

class SyncPushItem(BaseModel):
    action: str
    entity: str
    data: dict
    client_timestamp: datetime | None = None

class SyncPushRequest(BaseModel):
    changes: list[SyncPushItem]

class SyncPushResponse(BaseModel):
    accepted: int = 0
    rejected: list[str] = []
    server_time: datetime
