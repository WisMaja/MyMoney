from sqlalchemy.orm import Session
from uuid import UUID
from . import models, schemas

def create_budget(db: Session, user_id: UUID, budget: schemas.BudgetCreate):
    db_budget = models.Budget(name=budget.name, creator_id=user_id)
    db.add(db_budget)
    db.commit()
    db.refresh(db_budget)
    return db_budget

def get_budgets(db: Session, user_id: UUID):
    return db.query(models.Budget).filter(models.Budget.creator_id == user_id).all()

def get_budget(db: Session, budget_id: UUID, user_id: UUID):
    return db.query(models.Budget).filter(models.Budget.budget_id == budget_id, models.Budget.creator_id == user_id).first()

def update_budget(db: Session, budget_id: UUID, user_id: UUID, budget: schemas.BudgetUpdate):
    db_budget = db.query(models.Budget).filter(models.Budget.budget_id == budget_id, models.Budget.creator_id == user_id).first()
    if db_budget:
        db_budget.name = budget.name
        db.commit()
        db.refresh(db_budget)
    return db_budget

def delete_budget(db: Session, budget_id: UUID, user_id: UUID):
    db_budget = db.query(models.Budget).filter(models.Budget.budget_id == budget_id, models.Budget.creator_id == user_id).first()
    if db_budget:
        db.delete(db_budget)
        db.commit()
        return True
    return False
