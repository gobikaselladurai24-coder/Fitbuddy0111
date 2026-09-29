import json
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, WorkoutPlan, Feedback
from app.schemas import FeedbackSubmitRequest, FeedbackResponse, PlanResponse, UserResponse
from app.gemini_service import gemini_service

logger = logging.getLogger("fitbuddy.routes.feedback")
router = APIRouter(prefix="/api/workout", tags=["Feedback"])


@router.post("/{plan_id}/feedback", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
def submit_plan_feedback(
    plan_id: int,
    payload: FeedbackSubmitRequest,
    db: Session = Depends(get_db)
):
    """
    Submit feedback about an existing plan, ask Gemini AI to improve/regenerate the plan
    taking the feedback into account, store the feedback and updated plan in SQLite, and return both.
    """
    feedback_text = payload.feedback_text.strip()
    if not feedback_text:
        raise HTTPException(status_code=400, detail="Feedback text cannot be empty")

    original_plan = db.query(WorkoutPlan).filter(WorkoutPlan.id == plan_id).first()
    if not original_plan:
        raise HTTPException(status_code=404, detail=f"Workout plan with ID {plan_id} not found")

    user = db.query(User).filter(User.id == original_plan.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Associated user not found")

    try:
        orig_data = json.loads(original_plan.plan_data)
    except Exception:
        orig_data = {}

    user_info = {
        "name": user.name,
        "age": user.age,
        "weight": user.weight,
        "goal": user.goal,
        "intensity": user.intensity,
        "experience": user.experience,
        "preferences": user.preferences
    }

    try:
        # Call Gemini to regenerate plan incorporating feedback
        updated_plan_dict = gemini_service.regenerate_with_feedback(
            original_plan=orig_data,
            feedback_text=feedback_text,
            user_info=user_info
        )

        nutrition_tip = updated_plan_dict.get("nutrition_tip", original_plan.nutrition_tip)
        recovery_tip = updated_plan_dict.get("recovery_tip", original_plan.recovery_tip)

        # Save new plan record in DB (preserving history as required)
        new_plan = WorkoutPlan(
            user_id=user.id,
            plan_data=json.dumps(updated_plan_dict),
            nutrition_tip=nutrition_tip,
            recovery_tip=recovery_tip
        )
        db.add(new_plan)
        db.commit()
        db.refresh(new_plan)

        # Save feedback record linking old plan and new plan
        feedback_entry = Feedback(
            user_id=user.id,
            plan_id=original_plan.id,
            feedback_text=feedback_text,
            updated_plan_id=new_plan.id
        )
        db.add(feedback_entry)
        db.commit()
        db.refresh(feedback_entry)

        updated_plan_response = PlanResponse(
            id=new_plan.id,
            user_id=user.id,
            user=UserResponse.model_validate(user),
            plan_data=updated_plan_dict,
            nutrition_tip=new_plan.nutrition_tip,
            recovery_tip=new_plan.recovery_tip,
            created_at=new_plan.created_at
        )

        return FeedbackResponse(
            id=feedback_entry.id,
            user_id=user.id,
            plan_id=original_plan.id,
            feedback_text=feedback_text,
            updated_plan_id=new_plan.id,
            created_at=feedback_entry.created_at,
            updated_plan=updated_plan_response
        )

    except Exception as e:
        logger.error(f"Error handling feedback and regeneration: {e}", exc_info=True)
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to regenerate workout plan with feedback. Please try again."
        )
