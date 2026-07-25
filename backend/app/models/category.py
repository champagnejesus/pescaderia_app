from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func, UniqueConstraint
from app.database import Base

class Category(Base):
    __tablename__ = "categories"
    __table_args__ = (UniqueConstraint("name", "business_id", name="uq_category_name_business"),)
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    business_id = Column(Integer, ForeignKey("business_config.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
