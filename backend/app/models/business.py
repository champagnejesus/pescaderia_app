from sqlalchemy import Column, Integer, String, DateTime, func
from app.database import Base

class BusinessConfig(Base):
    __tablename__ = "business_config"
    id = Column(Integer, primary_key=True, index=True)
    business_name = Column(String(255), nullable=False)
    owner_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    phone = Column(String(50))
    address = Column(String(500))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
