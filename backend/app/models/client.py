from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, Boolean, func
from app.database import Base

class Client(Base):
    __tablename__ = "clients"
    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("business_config.id", ondelete="CASCADE"), nullable=False, default=1, index=True)
    name = Column(String(255), nullable=False)
    phone = Column(String(50))
    email = Column(String(255))
    address = Column(String(500))
    outstanding_balance = Column(Numeric(12, 2), default=0.0)
    initials = Column(String(10))
    credit_limit = Column(Numeric(12, 2), default=1500.0)
    allows_credit = Column(Boolean, default=False, nullable=False)
    payment_terms = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
