import os
from pathlib import Path
from contextlib import asynccontextmanager
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.database import engine, Base, get_db
from app.models import WorkoutPlan, User
from app.schemas import HealthResponse, NutritionResponse
from app.routes.workout import router as workout_router
from app.routes.feedback import router as feedback_router
from app.routes.users import router as users_router
from app.gemini_service import (
    DEFAULT_NUTRITION_TIPS,
    DEFAULT_RECOVERY_TIPS,
    DISCLAIMER_TEXT
)

# Ensure tables are created immediately
Base.metadata.create_all(bind=engine)

# Initialize database schema
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure tables exist on startup
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(
    title="FitBuddy – AI Fitness Plan Generator",
    description="Intelligent 7-day personalized workout planner and nutrition guide powered by Google Gemini AI and SQLite.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for local and web previews
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Set up static and templates
BASE_DIR = Path(__file__).resolve().parent
static_dir = BASE_DIR / "static"
templates_dir = BASE_DIR / "templates"

if static_dir.exists():
    app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

templates = Jinja2Templates(directory=str(templates_dir))

# Include API routers
app.include_router(workout_router)
app.include_router(feedback_router)
app.include_router(users_router)


# --- Core System & Nutrition Endpoints ---

@app.get("/api/health", response_model=HealthResponse, tags=["System"])
def health_check():
    """Health check endpoint to verify backend status."""
    return HealthResponse(status="ok")


@app.get("/api/nutrition/{goal}", response_model=NutritionResponse, tags=["Nutrition"])
def get_nutrition_guidance(goal: str):
    """
    Return targeted nutritional and recovery guidance based on the user's fitness goal.
    Supported goals: Weight Loss, Muscle Gain, General Wellness.
    """
    matched_goal = "General Wellness"
    normalized = goal.strip().lower()
    if "loss" in normalized:
        matched_goal = "Weight Loss"
    elif "muscle" in normalized or "gain" in normalized or "hypertrophy" in normalized:
        matched_goal = "Muscle Gain"
    elif "well" in normalized or "general" in normalized or "health" in normalized:
        matched_goal = "General Wellness"

    nutrition_tip = DEFAULT_NUTRITION_TIPS.get(matched_goal, DEFAULT_NUTRITION_TIPS["General Wellness"])
    recovery_tip = DEFAULT_RECOVERY_TIPS.get(matched_goal, DEFAULT_RECOVERY_TIPS["General Wellness"])

    return NutritionResponse(
        goal=matched_goal,
        nutrition_tip=nutrition_tip,
        recovery_tip=recovery_tip,
        disclaimer=DISCLAIMER_TEXT
    )


# --- HTML Page Routes ---

@app.get("/", response_class=HTMLResponse, tags=["Pages"])
def page_home(request: Request):
    """Landing page introducing FitBuddy."""
    return templates.TemplateResponse("index.html", {"request": request})


@app.get("/form", response_class=HTMLResponse, tags=["Pages"])
def page_form(request: Request):
    """Fitness profile input form."""
    return templates.TemplateResponse("form.html", {"request": request})


@app.get("/dashboard", response_class=HTMLResponse, tags=["Pages"])
def page_dashboard(request: Request, plan_id: int = None, db: Session = Depends(get_db)):
    """Interactive dashboard showing 7-day workout plan and feedback tool."""
    initial_plan = None
    if plan_id:
        initial_plan = db.query(WorkoutPlan).filter(WorkoutPlan.id == plan_id).first()
    return templates.TemplateResponse("dashboard.html", {
        "request": request,
        "plan_id": plan_id,
        "initial_plan": initial_plan,
        "disclaimer": DISCLAIMER_TEXT
    })


@app.get("/plan/{plan_id}", response_class=HTMLResponse, tags=["Pages"])
def page_view_plan(plan_id: int, request: Request, db: Session = Depends(get_db)):
    """Direct URL to view a specific saved workout plan."""
    plan = db.query(WorkoutPlan).filter(WorkoutPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return templates.TemplateResponse("dashboard.html", {
        "request": request,
        "plan_id": plan_id,
        "initial_plan": plan,
        "disclaimer": DISCLAIMER_TEXT
    })
