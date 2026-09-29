# FitBuddy – AI Fitness Plan Generator

FitBuddy is an intelligent, full-stack fitness web application that generates personalized 7-day workout routines, nutrition protocols, and recovery strategies powered by Google Gemini AI, FastAPI, and SQLite.

---

## 🌟 Key Features

1. **User Fitness Assessment**: Capture baseline physiological data including Name, Age, Weight, Primary Goal, Workout Intensity, Fitness Experience, and Equipment Environment.
2. **AI-Powered 7-Day Workout Synthesis**: Generates a complete 7-day periodized training plan with daily focus, warm-up exercises, detailed sets/reps/duration, and cool-downs using Google Gemini AI.
3. **Certified Nutrition & Recovery Protocols**: Tailored macronutrient, hydration, sleep, and active-recovery guidelines customized to each user's goal (Weight Loss, Muscle Gain, or General Wellness).
4. **SQLite Database Persistence**: Stores user profiles, generated workout plans, and feedback iterations automatically with SQLAlchemy ORM.
5. **Interactive Plan Feedback & Regeneration**: Users can request specific modifications (e.g., *"More cardio"*, *"Focus on legs"*, *"More rest days"*); Gemini AI regenerates and refines the plan while preserving history.
6. **Plan History & Retrieval**: Revisit and inspect previously generated plans at any time.
7. **Clean 2026 UI/UX**: Dark-mode aesthetic with fluid typography, responsive card layouts, print-friendly stylesheets, and real-time status indicators.
8. **Interactive OpenAPI / Swagger Documentation**: Available out of the box at `/docs` and `/redoc`.

---

## 🛠️ Technology Stack

- **Backend Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.10+)
- **Server**: [Uvicorn](https://www.uvicorn.org/) (ASGI Server)
- **AI Engine**: [Google Gemini AI](https://ai.google.dev/) (`gemini-3.8-flash` via `@google/genai` / REST API)
- **Database & ORM**: SQLite with [SQLAlchemy 2.0](https://www.sqlalchemy.org/)
- **Data Validation**: [Pydantic v2](https://docs.pydantic.dev/)
- **Templating**: [Jinja2](https://jinja.palletsprojects.com/)
- **Frontend**: HTML5, CSS3 (Modern custom variables & responsive design), Vanilla ES6+ JavaScript
- **Test Suite**: [Pytest](https://docs.pytest.org/) & HTTPX `TestClient`

---

## 📁 Project Structure

```text
FitBuddy/
│
├── app/
│   ├── __init__.py           # Application package init
│   ├── main.py               # FastAPI entry point, lifespan, page routes
│   ├── database.py           # SQLite SQLAlchemy engine and session provider
│   ├── models.py             # SQLAlchemy ORM models (User, WorkoutPlan, Feedback)
│   ├── schemas.py            # Pydantic v2 request/response schemas
│   ├── gemini_service.py     # Gemini AI integration, JSON cleaning & fallback
│   │
│   ├── routes/
│   │   ├── __init__.py       # Route package init
│   │   ├── workout.py        # /api/workout/generate and /api/workout/{plan_id}
│   │   ├── feedback.py       # /api/workout/{plan_id}/feedback
│   │   └── users.py          # /api/users/{user_id}/plans
│   │
│   ├── templates/
│   │   ├── index.html        # Landing page with hero, features, and CTA
│   │   ├── form.html         # Interactive multi-section assessment form
│   │   └── dashboard.html    # 7-day schedule, feedback tool, history modal
│   │
│   └── static/
│       ├── css/
│       │   └── style.css     # Responsive dark-theme styling & print styles
│       └── js/
│           └── app.js        # Client validation, API communication, feedback loop
│
├── tests/
│   ├── __init__.py           # Test package init
│   ├── test_health.py        # Health endpoint verification
│   └── test_workout.py       # Generation, validation, feedback, and history tests
│
├── .env                      # Local environment variables (ignored by git)
├── .env.example              # Template environment variables
├── .gitignore                # Git ignore rules for Python, DB, and environments
├── requirements.txt          # Python dependencies
├── run.py                    # Convenience launcher script
└── README.md                 # Full project documentation
```

---

## 🚀 Quick Start (Windows & VS Code)

### 1. Prerequisites
- Python 3.10 or higher installed. (Make sure **"Add Python to PATH"** was checked during Python installation).

### 2. Open Project in VS Code
1. Open Visual Studio Code.
2. Select **File > Open Folder...** and select the `FitBuddy` root directory.
3. Open a new terminal (`Ctrl + ~` or **Terminal > New Terminal**).

### 3. Create Virtual Environment
Run the following in PowerShell:

```powershell
python -m venv .venv
```

### 4. Install Dependencies
Install packages directly using the virtual environment's pip binary:

```powershell
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

> **Note on PowerShell Script Execution**: Using `.\.venv\Scripts\python.exe` directly avoids Windows PowerShell execution policy restrictions (`Execution_Policies`), ensuring smooth operation without running `Set-ExecutionPolicy`.

### 5. Configure Environment Variables
Copy the template `.env.example` to `.env`:

```powershell
copy .env.example .env
```

Open `.env` and add your Google Gemini API key:
```ini
GEMINI_API_KEY=your_actual_gemini_api_key_here
DATABASE_URL=sqlite:///./fitbuddy.db
PORT=8000
HOST=127.0.0.1
```

*(If no API key is provided, FitBuddy includes a certified deterministic fallback generator that ensures zero application crashes).*

---

## 🏃 Running the Application

### Option A: Using Uvicorn Directly (Recommended)
```powershell
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

### Option B: Using `run.py`
```powershell
.\.venv\Scripts\python.exe run.py
```

### Option C: If Virtual Environment Is Activated
If you activated the virtual environment (`.\.venv\Scripts\Activate.ps1`):
```powershell
uvicorn app.main:app --reload
```

---

## 🌐 URLs & Navigation

- **Web Application**: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **Fitness Assessment Form**: [http://127.0.0.1:8000/form](http://127.0.0.1:8000/form)
- **Interactive Dashboard**: [http://127.0.0.1:8000/dashboard](http://127.0.0.1:8000/dashboard)
- **Interactive OpenAPI Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc Documentation**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

## 🧪 Testing

Run the test suite with pytest. The tests use mocks for external network calls so no Gemini API key is needed:

```powershell
.\.venv\Scripts\python.exe -m pytest tests/ -v
```

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | System health status (`{"status": "ok"}`) |
| `POST` | `/api/workout/generate` | Generates a 7-day personalized plan and saves to SQLite |
| `GET` | `/api/workout/{plan_id}` | Retrieves a stored workout plan by ID |
| `POST` | `/api/workout/{plan_id}/feedback` | Submits feedback and regenerates an improved plan |
| `GET` | `/api/nutrition/{goal}` | Retrieves nutrition and recovery guidance for a goal |
| `GET` | `/api/users/{user_id}/plans` | Retrieves plan history for a user |
| `GET` | `/` | Web landing page |
| `GET` | `/form` | Assessment input page |
| `GET` | `/dashboard` | Interactive 7-day schedule & feedback viewer |

---

## ⚡ Demo Test Profile

Click the **"⚡ Fill Demo Data"** pill on the assessment form or use these values:

- **Name**: `Kavin`
- **Age**: `20`
- **Weight**: `65` kg
- **Goal**: `Muscle Gain`
- **Intensity**: `Medium`
- **Experience**: `Beginner`
- **Preference**: `Home workout`

---

## 🔧 Troubleshooting Common Errors

### 1. `uvicorn : The term 'uvicorn' is not recognized`
**Cause**: The virtual environment is not activated or uvicorn is not in system PATH.  
**Fix**: Always run uvicorn via `.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload`.

### 2. `Execution of scripts is disabled on this system` (PowerShell Policy)
**Cause**: Windows restricts unsigned `.ps1` execution by default.  
**Fix**: You do not need to activate the script. Call the Python binary directly: `.\.venv\Scripts\python.exe -m ...`

### 3. `requirements.txt not found`
**Cause**: Terminal is in a child directory or outside the project root.  
**Fix**: In terminal, verify directory with `pwd` or `dir`. Navigate to the directory containing `requirements.txt`.

### 4. `pydantic-core wheel / build errors`
**Cause**: Python version mismatch or missing C++ build tools for ancient Python versions.  
**Fix**: Ensure you are on Python 3.10, 3.11, or 3.12 (64-bit). Run:
```powershell
python -m pip install --upgrade pip setuptools wheel
python -m pip install -r requirements.txt
```

### 5. Corrupted Virtual Environment
If any installation was interrupted, delete `.venv` and recreate:
```powershell
Remove-Item -Recurse -Force .venv
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

---

## ⚖️ Medical Disclaimer
AI-generated fitness information is for general educational and informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a physician before beginning any new exercise or nutrition program.
