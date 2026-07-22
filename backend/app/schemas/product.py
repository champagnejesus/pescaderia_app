from pydantic import BaseModel
from datetime import datetime

class ProductCreate(BaseModel):
    name: str
    category: str
    stock: float = 0.0
    unit: str = "kg"
    price_compra: float = 0.0
    price_venta: float = 0.0
    image_url: str = ""
    description: str = ""
    is_extra_quality: bool = False
    low_stock_threshold: float = 10.0

class ProductUpdate(BaseModel):
    name: str | None = None
    category: str | None = None
    stock: float | None = None
    unit: str | None = None
    price_compra: float | None = None
    price_venta: float | None = None
    image_url: str | None = None
    description: str | None = None
    is_extra_quality: bool | None = None
    low_stock_threshold: float | None = None

class StockAdjust(BaseModel):
    stock: float

class ProductResponse(BaseModel):
    id: int
    name: str
    category: str
    stock: float
    unit: str
    price_compra: float = 0.0
    price_venta: float = 0.0
    image_url: str | None = None
    description: str | None = None
    is_extra_quality: bool
    low_stock_threshold: float
    created_at: datetime | None = None
    updated_at: datetime | None = None
    class Config: from_attributes = True
