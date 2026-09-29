from datetime import datetime
from typing import List, Optional, Union, Any, Dict
from pydantic import BaseModel, Field, field_validator, ConfigDict

# --- Sub-models for structured workout plan ---

class Exercise(BaseModel):
    name: str = Field(..., description="Name of the exercise")
    sets: Optional[int] = Field(None, description="Number of sets")
    reps: Optional[Union[int, str]] = Field(None, description="Target repetitions or rep range")
    duration: Optional[str] = Field(None, description="Duration if time-based (e.g. '30s', '15 mins')")


class DayPlan(BaseModel):
    day: int = Field(..., ge=1, le=7, description="Day number (1 to 7)")
    day_name: Optional[str] = Field(None, description="e.g. Monday, Day 1")
    focus: str = Field(..., description="Workout focus or target muscle group / Rest")
    warmup: List[str] = Field(default_factory=list, description="Warm-up routine steps")
    exercises: List[Exercise] = Field(default_factory=list, description="List of exercises")
    cooldown: List[str] = Field(default_factory=list, description="Cool-down and stretching steps")
    rest_note: Optional[str] = Field(None, description="Recovery guidance for the day")


class WorkoutPlanData(BaseModel):
    goal: str
    intensity: str
    days: List[DayPlan]
    nutrition_tip: str
    recovery_tip: str


# --- Request and Response Models ---

class PlanGenerateRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="User's full name")
    age: int = Field(..., ge=12, le=100, description="Age in years (12-100)")
    weight: float = Field(..., ge=20.0, le=400.0, description="Weight in kg")
    goal: str = Field(..., description="Fitness goal: Weight Loss, Muscle Gain, or General Wellness")
    intensity: str = Field(..., description="Workout intensity: Low, Medium, or High")
    experience: Optional[str] = Field("Beginner", description="Experience level: Beginner, Intermediate, Advanced")
    preferences: Optional[str] = Field("Home workout", description="Equipment/setting preference")

    @field_validator("goal")
    @classmethod
    def validate_goal(cls, v: str) -> str:
        valid_goals = ["Weight Loss", "Muscle Gain", "General Wellness"]
        cleaned = v.strip().title()
        if cleaned not in valid_goals:
            # Check loose match
            for vg in valid_goals:
                if vg.lower() in cleaned.lower():
                    return vg
            raise ValueError(f"Goal must be one of: {', '.join(valid_goals)}")
        return cleaned

    @field_validator("intensity")
    @classmethod
    def validate_intensity(cls, v: str) -> str:
        valid_intensities = ["Low", "Medium", "High"]
        cleaned = v.strip().title()
        if cleaned not in valid_intensities:
            for vi in valid_intensities:
                if vi.lower() in cleaned.lower():
                    return vi
            raise ValueError(f"Intensity must be one of: {', '.join(valid_intensities)}")
        return cleaned


class UserResponse(BaseModel):
    id: int
    name: str
    age: int
    weight: float
    goal: str
    intensity: str
    experience: Optional[str]
    preferences: Optional[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PlanResponse(BaseModel):
    id: int
    user_id: int
    user: Optional[UserResponse] = None
    plan_data: Union[WorkoutPlanData, Dict[str, Any]]
    nutrition_tip: str
    recovery_tip: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FeedbackSubmitRequest(BaseModel):
    feedback_text: str = Field(..., min_length=2, max_length=1000, description="Feedback or requested modifications")


class FeedbackResponse(BaseModel):
    id: int
    user_id: int
    plan_id: int
    feedback_text: str
    updated_plan_id: Optional[int]
    created_at: datetime
    updated_plan: Optional[PlanResponse] = None

    model_config = ConfigDict(from_attributes=True)


class NutritionResponse(BaseModel):
    goal: str
    nutrition_tip: str
    recovery_tip: str
    disclaimer: str


class HealthResponse(BaseModel):
    status: str
