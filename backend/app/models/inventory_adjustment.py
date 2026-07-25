from sqlalchemy import Column, Integer, Numeric, String, DateTime, ForeignKey, Text, func
from sqlalchemy.orm import relationship
from app.database import Base

class InventoryAdjustment(Base):
    __tablename__ = "inventory_adjustments"

    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("business_config.id", ondelete="CASCADE"), nullable=False, default=1, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="RESTRICT"), nullable=False, index=True)
    type = Column(String(50), nullable=False)  # "Ajuste Manual" | "Conteo Físico"
    quantity_before = Column(Numeric(10, 3), nullable=False)
    quantity_adjusted = Column(Numeric(10, 3), nullable=False)  # the change (can be negative)
    quantity_after = Column(Numeric(10, 3), nullable=False)
    reason = Column(String(100), nullable=False)  # Mermas, Daño, Conteo, Corrección
    notes = Column(Text, nullable=True)
    created_by = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    product = relationship("Product", backref="adjustments")
