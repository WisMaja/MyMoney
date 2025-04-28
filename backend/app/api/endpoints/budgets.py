from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from ..schemas import BudgetCreate, BudgetUpdate, Budget
from ..crud import create_budget, get_budgets, get_budget, update_budget, delete_budget
from ..database import get_db

router = APIRouter()

@router.post("/", response_model=Budget)
def create_budget_endpoint(budget: BudgetCreate, db: Session = Depends(get_db)):
    user_id = <user_id>  # Zmienna dla ID aktualnie zalogowanego użytkownika
    return create_budget(db, user_id, budget)

@router.get("/", response_model=List[Budget])
def get_budgets_endpoint(db: Session = Depends(get_db)):
    user_id = <user_id>  # Zmienna dla ID aktualnie zalogowanego użytkownika
    return get_budgets(db, user_id)

@router.get("/{budget_id}", response_model=Budget)
def get_budget_endpoint(budget_id: UUID, db: Session = Depends(get_db)):
    user_id = <user_id>  # Zmienna dla ID aktualnie zalogowanego użytkownika
    db_budget = get_budget(db, budget_id, user_id)
    if db_budget is None:
        raise HTTPException(status_code=404, detail="Budget not found")
    return db_budget

@router.put("/{budget_id}", response_model=Budget)
def update_budget_endpoint(budget_id: UUID, budget: BudgetUpdate, db: Session = Depends(get_db)):
    user_id = <user_id>  # Zmienna dla ID aktualnie zalogowanego użytkownika
    db_budget = update_budget(db, budget_id, user_id, budget)
    if db_budget is None:
        raise HTTPException(status_code=404, detail="Budget not found")
    return db_budget

@router.delete("/{budget_id}")
def delete_budget_endpoint(budget_id: UUID, db: Session = Depends(get_db)):
    user_id = <user_id>  # Zmienna dla ID aktualnie zalogowanego użytkownika
    result = delete_budget(db, budget_id, user_id)
    if not result:
        raise HTTPException(status_code=404, detail="Budget not found")
    return {"message": "Budget deleted successfully"}
