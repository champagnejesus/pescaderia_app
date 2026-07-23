from sqlalchemy import Column, Integer, String, DateTime, func, UniqueConstraint
from app.database import Base

class Category(Base):
    __tablename__ = "categories"
    __table_args__ = (UniqueConstraint("name", "business_id", name="uq_category_name_business"),)
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    # TODO: Add ForeignKey("business_config.id") when multi-tenant support is needed
    business_id = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
