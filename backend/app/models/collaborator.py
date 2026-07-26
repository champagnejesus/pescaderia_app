from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, func
from app.database import Base

class Collaborator(Base):
    __tablename__ = "collaborators"
    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("business_config.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="Usuario")  # Administrador, Gerente, Usuario, etc.
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
