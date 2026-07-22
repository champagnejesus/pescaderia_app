from sqlalchemy import Column, Integer, String, Boolean, DateTime, func
from app.database import Base

class InvoicePref(Base):
    __tablename__ = "invoice_prefs"
    id = Column(Integer, primary_key=True, index=True)
    footer_text = Column(String(500), default="")
    show_tax_breakdown = Column(Boolean, default=True)
    default_payment_method_id = Column(Integer, nullable=True)
    business_id = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
