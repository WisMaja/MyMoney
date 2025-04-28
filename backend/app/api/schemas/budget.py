from pydantic import BaseModel
from uuid import UUID
from typing import Optional

class BudgetBase(BaseModel):
    name: str

class BudgetCreate(BudgetBase):
    pass

class BudgetUpdate(BudgetBase):
    pass

class Budget(BudgetBase):
    budget_id: UUID
    creator_id: UUID

    class Config:
        orm_mode = True
