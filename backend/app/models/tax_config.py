from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, func
from app.database import Base

class TaxConfig(Base):
    __tablename__ = "tax_config"
    id = Column(Integer, primary_key=True, index=True)
    is_enabled = Column(Boolean, default=False)
    name = Column(String(100), default="IVA")
    rate = Column(Float, default=0.0)
    included_in_price = Column(Boolean, default=True)
    # TODO: Add ForeignKey("business_config.id") when multi-tenant support is needed
    business_id = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
