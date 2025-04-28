from sqlalchemy import Column, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from .database import Base
import uuid

class Budget(Base):
    __tablename__ = 'budgets'
    budget_id = Column(UUID, primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    creator_id = Column(UUID, ForeignKey('users.user_id'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    creator = relationship("User", back_populates="budgets")
    members = relationship("BudgetMember", back_populates="budget")
