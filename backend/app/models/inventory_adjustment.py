from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class InventoryAdjustment(Base):
    __tablename__ = "inventory_adjustments"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    type = Column(String(50), nullable=False)  # "Ajuste Manual" | "Conteo Físico"
    quantity_before = Column(Float, nullable=False)
    quantity_adjusted = Column(Float, nullable=False)  # the change (can be negative)
    quantity_after = Column(Float, nullable=False)
    reason = Column(String(100), nullable=False)  # Mermas, Daño, Conteo, Corrección
    notes = Column(Text, nullable=True)
    created_by = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product", backref="adjustments")
