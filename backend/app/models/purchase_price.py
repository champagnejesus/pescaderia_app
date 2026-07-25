from sqlalchemy import Column, Integer, Numeric, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database import Base

class PurchasePrice(Base):
    __tablename__ = "purchase_prices"

    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("business_config.id", ondelete="CASCADE"), nullable=False, default=1, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="RESTRICT"), nullable=False, index=True)
    purchase_id = Column(Integer, ForeignKey("purchases.id", ondelete="CASCADE"), nullable=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id", ondelete="SET NULL"), nullable=True, index=True)
    unit_price = Column(Numeric(12, 2), nullable=False)
    quantity = Column(Numeric(10, 3), nullable=False)
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())

    product = relationship("Product", backref="price_history")
    purchase = relationship("Purchase", backref="price_records")
    supplier = relationship("Supplier", backref="price_records")
