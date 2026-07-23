from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database import Base

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False, index=True)  # DEPRECATED: kept for backward compat, prefer category_id
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True, index=True)
    stock = Column(Float, nullable=False, default=0.0)
    unit = Column(String(20), nullable=False, default="kg")
    price_compra = Column(Float, default=0.0, server_default="0.0")
    price_venta = Column(Float, default=0.0, server_default="0.0")
    avg_purchase_price = Column(Float, default=0.0)
    price = Column(Float, default=0.0, server_default="0.0")  # DEPRECATED: use price_venta
    image_url = Column(String(1000))
    description = Column(String(2000))
    is_extra_quality = Column(Boolean, default=False)
    low_stock_threshold = Column(Float, default=10.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    category_rel = relationship("Category", backref="products", lazy="joined")
