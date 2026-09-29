import json
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, WorkoutPlan
from app.schemas import PlanGenerateRequest, PlanResponse, UserResponse
from app.gemini_service import gemini_service

logger = logging.getLogger("fitbuddy.routes.workout")
router = APIRouter(prefix="/api/workout", tags=["Workout"])


@router.post("/generate", response_model=PlanResponse, status_code=status.HTTP_201_CREATED)
def generate_workout_plan(
    payload: PlanGenerateRequest,
    db: Session = Depends(get_db)
):
    """
    Accept user information, create user record in SQLite, generate a 7-day workout plan
    using Gemini AI, store the plan in the database, and return the structured response.
    """
    try:
        # Create or update user
        user = User(
            name=payload.name.strip(),
            age=payload.age,
            weight=payload.weight,
            goal=payload.goal,
            intensity=payload.intensity,
            experience=payload.experience or "Beginner",
            preferences=payload.preferences or "Home workout"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        # Call Gemini AI
        plan_dict = gemini_service.generate_plan(
            name=user.name,
            age=user.age,
            weight=user.weight,
            goal=user.goal,
            intensity=user.intensity,
            experience=user.experience,
            preferences=user.preferences
        )

        nutrition_tip = plan_dict.get("nutrition_tip", "Stay hydrated and eat balanced meals.")
        recovery_tip = plan_dict.get("recovery_tip", "Prioritize 7-8 hours of sleep.")

        # Save workout plan
        workout_plan = WorkoutPlan(
            user_id=user.id,
            plan_data=json.dumps(plan_dict),
            nutrition_tip=nutrition_tip,
            recovery_tip=recovery_tip
        )
        db.add(workout_plan)
        db.commit()
        db.refresh(workout_plan)

        return PlanResponse(
            id=workout_plan.id,
            user_id=user.id,
            user=UserResponse.model_validate(user),
            plan_data=plan_dict,
            nutrition_tip=workout_plan.nutrition_tip,
            recovery_tip=workout_plan.recovery_tip,
            created_at=workout_plan.created_at
        )

    except ValueError as ve:
        logger.error(f"Validation error in generate_workout_plan: {ve}")
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"Unexpected error generating plan: {e}", exc_info=True)
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to generate workout plan. Please verify parameters and try again."
        )


@router.get("/{plan_id}", response_model=PlanResponse)
def get_workout_plan(
    plan_id: int,
    db: Session = Depends(get_db)
):
    """
    Retrieve a stored workout plan by its ID.
    """
    plan = db.query(WorkoutPlan).filter(WorkoutPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail=f"Workout plan with ID {plan_id} not found")

    user = db.query(User).filter(User.id == plan.user_id).first()
    try:
        plan_data = json.loads(plan.plan_data)
    except Exception:
        plan_data = {"raw": plan.plan_data}

    return PlanResponse(
        id=plan.id,
        user_id=plan.user_id,
        user=UserResponse.model_validate(user) if user else None,
        plan_data=plan_data,
        nutrition_tip=plan.nutrition_tip,
        recovery_tip=plan.recovery_tip,
        created_at=plan.created_at
    )
