import json
import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from app.main import app
from app.gemini_service import generate_fallback_plan

client = TestClient(app)

def mock_gemini_call(*args, **kwargs):
    """Deterministic mock plan for unit tests without network dependence."""
    return json.dumps(generate_fallback_plan(
        name="Kavin",
        age=20,
        weight=65.0,
        goal="Muscle Gain",
        intensity="Medium",
        experience="Beginner",
        preferences="Home workout"
    ))

def test_workout_generation_validation():
    """Verify input validation for invalid age and weight."""
    # Invalid age
    res_age = client.post("/api/workout/generate", json={
        "name": "Alex",
        "age": 5,  # Too young
        "weight": 70.0,
        "goal": "Muscle Gain",
        "intensity": "Medium"
    })
    assert res_age.status_code == 422

    # Invalid weight
    res_weight = client.post("/api/workout/generate", json={
        "name": "Alex",
        "age": 25,
        "weight": 5.0,  # Below 20kg
        "goal": "Muscle Gain",
        "intensity": "Medium"
    })
    assert res_weight.status_code == 422


@patch("app.gemini_service.GeminiFitnessService._call_gemini_api", side_effect=mock_gemini_call)
def test_workout_generation_and_retrieval(mock_api):
    """Verify complete generation, database storage, and retrieval with mocked Gemini."""
    payload = {
        "name": "Kavin",
        "age": 20,
        "weight": 65.0,
        "goal": "Muscle Gain",
        "intensity": "Medium",
        "experience": "Beginner",
        "preferences": "Home workout"
    }
    # Generate
    response = client.post("/api/workout/generate", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["user"]["name"] == "Kavin"
    assert data["plan_data"]["goal"] == "Muscle Gain"
    assert len(data["plan_data"]["days"]) >= 5
    assert "nutrition_tip" in data
    assert "recovery_tip" in data

    plan_id = data["id"]
    user_id = data["user_id"]

    # Retrieve by ID
    get_res = client.get(f"/api/workout/{plan_id}")
    assert get_res.status_code == 200
    retrieved = get_res.json()
    assert retrieved["id"] == plan_id
    assert retrieved["user"]["name"] == "Kavin"

    # Submit Feedback
    feedback_payload = {
        "feedback_text": "Please include more core exercises and 15 mins post-workout walk"
    }
    fb_res = client.post(f"/api/workout/{plan_id}/feedback", json=feedback_payload)
    assert fb_res.status_code == 201
    fb_data = fb_res.json()
    assert fb_data["plan_id"] == plan_id
    assert fb_data["updated_plan_id"] is not None
    assert fb_data["updated_plan"]["user_id"] == user_id

    # Retrieve user's plans history
    history_res = client.get(f"/api/users/{user_id}/plans")
    assert history_res.status_code == 200
    history = history_res.json()
    assert len(history) >= 2


def test_nutrition_endpoint():
    """Verify nutrition and recovery recommendation endpoint."""
    res = client.get("/api/nutrition/Weight%20Loss")
    assert res.status_code == 200
    data = res.json()
    assert data["goal"] == "Weight Loss"
    assert "caloric" in data["nutrition_tip"].lower() or "protein" in data["nutrition_tip"].lower()
    assert "disclaimer" in data
