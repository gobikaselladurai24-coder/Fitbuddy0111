import json
import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, WorkoutPlan
from app.schemas import PlanResponse, UserResponse

logger = logging.getLogger("fitbuddy.routes.users")
router = APIRouter(prefix="/api/users", tags=["Users"])


@router.get("/{user_id}/plans", response_model=List[PlanResponse])
def get_user_plans(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Retrieve all previously generated workout plans for a given user ID,
    ordered by most recent first.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail=f"User with ID {user_id} not found")

    plans = db.query(WorkoutPlan).filter(WorkoutPlan.user_id == user_id).order_by(WorkoutPlan.created_at.desc()).all()

    user_resp = UserResponse.model_validate(user)
    result = []
    for p in plans:
        try:
            plan_data = json.loads(p.plan_data)
        except Exception:
            plan_data = {"raw": p.plan_data}

        result.append(
            PlanResponse(
                id=p.id,
                user_id=p.user_id,
                user=user_resp,
                plan_data=plan_data,
                nutrition_tip=p.nutrition_tip,
                recovery_tip=p.recovery_tip,
                created_at=p.created_at
            )
        )

    return result
