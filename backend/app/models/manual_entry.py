from sqlalchemy import Column, Integer, String, Float, DateTime, func
from app.database import Base

class ManualEntry(Base):
    __tablename__ = "manual_entries"
    id = Column(Integer, primary_key=True, index=True)
    account_type = Column(String(20), nullable=False, index=True)  # "receivable" or "payable"
    debtor_id = Column(Integer, nullable=False, index=True)
    debtor_name = Column(String(255), nullable=False)
    description = Column(String(500), nullable=False)
    amount = Column(Float, nullable=False)
    pending_amount = Column(Float, nullable=False)
    status = Column(String(50), default="PENDIENTE")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
