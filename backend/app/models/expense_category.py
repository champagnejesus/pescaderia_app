from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class ExpenseCategory(Base):
    __tablename__ = "expense_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    parent_id = Column(Integer, ForeignKey("expense_categories.id"), nullable=True)
    business_id = Column(Integer, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    parent = relationship("ExpenseCategory", remote_side=[id], backref="subcategories")
    expenses = relationship("Transaction", backref="expense_category")

    __table_args__ = (
        UniqueConstraint("name", "parent_id", "business_id", name="uq_expense_category"),
    )
