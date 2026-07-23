from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class PurchasePrice(Base):
    __tablename__ = "purchase_prices"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    purchase_id = Column(Integer, ForeignKey("purchases.id"), nullable=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=True)
    unit_price = Column(Float, nullable=False)
    quantity = Column(Float, nullable=False)
    recorded_at = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product", backref="price_history")
    purchase = relationship("Purchase", backref="price_records")
    supplier = relationship("Supplier", backref="price_records")
