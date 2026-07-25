from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, func
from app.database import Base

class ManualEntry(Base):
    __tablename__ = "manual_entries"
    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("business_config.id", ondelete="CASCADE"), nullable=False, default=1, index=True)
    account_type = Column(String(20), nullable=False, index=True)  # "receivable" or "payable"
    debtor_id = Column(Integer, nullable=False, index=True)
    debtor_name = Column(String(255), nullable=False)
    description = Column(String(500), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    pending_amount = Column(Numeric(12, 2), nullable=False)
    status = Column(String(50), default="PENDIENTE")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
