from sqlalchemy import Column, Integer, String, Boolean, Numeric, DateTime, ForeignKey, func
from app.database import Base

class TaxConfig(Base):
    __tablename__ = "tax_config"
    id = Column(Integer, primary_key=True, index=True)
    is_enabled = Column(Boolean, default=False)
    name = Column(String(100), default="IVA")
    rate = Column(Numeric(5, 2), default=0.0)
    included_in_price = Column(Boolean, default=True)
    business_id = Column(Integer, ForeignKey("business_config.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
