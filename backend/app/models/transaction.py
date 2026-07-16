from sqlalchemy import Column, Integer, String, Float, DateTime, func
from app.database import Base

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    time = Column(String(50), nullable=False)
    type = Column(String(50), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    status = Column(String(50), default="PAGADO")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
