from sqlalchemy import Column, Integer, String, Float, DateTime, func
from app.database import Base

class Supplier(Base):
    __tablename__ = "suppliers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    pending_payment = Column(Float, default=0.0)
    status = Column(String(50), default="PENDIENTE")
    image_url = Column(String(1000))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
