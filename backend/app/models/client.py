from sqlalchemy import Column, Integer, String, Float, DateTime, func
from app.database import Base

class Client(Base):
    __tablename__ = "clients"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    phone = Column(String(50))
    email = Column(String(255))
    address = Column(String(500))
    outstanding_balance = Column(Float, default=0.0)
    initials = Column(String(10))
    credit_limit = Column(Float, default=1500.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
