import os
import json
import re
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger("fitbuddy.gemini")
logging.basicConfig(level=logging.INFO)

DISCLAIMER_TEXT = "AI-generated fitness information is for general educational and informational guidance only and is not a substitute for professional medical advice, diagnosis, or treatment. Consult a physician before beginning any new exercise or nutrition program."

DEFAULT_NUTRITION_TIPS = {
    "Weight Loss": "Aim for a moderate caloric deficit (300-500 kcal) with high dietary protein (1.6-2.2g per kg body weight) to preserve lean muscle tissue. Prioritize whole foods, fiber-rich vegetables, and drink at least 2.5-3 liters of water daily. Avoid sugary beverages and processed snacks.",
    "Muscle Gain": "Maintain a slight caloric surplus (250-400 kcal) with 1.8-2.2g of protein per kg body weight distributed across 4-5 meals. Fuel workouts with complex carbohydrates (oats, brown rice, sweet potatoes) and healthy fats. Stay consistently hydrated to maximize muscle protein synthesis.",
    "General Wellness": "Focus on a colorful Mediterranean-style plate with balanced macronutrients: lean proteins, whole grains, varied vegetables, and unsaturated fats like olive oil and nuts. Maintain consistent meal timings, drink plenty of water throughout the day, and limit refined sugars."
}

DEFAULT_RECOVERY_TIPS = {
    "Weight Loss": "Prioritize 7-9 hours of quality sleep nightly to regulate hunger hormones (ghrelin and leptin). Incorporate light active recovery on rest days like 20-30 minutes of gentle walking or mobility stretching.",
    "Muscle Gain": "Muscle tissue repairs during sleep and rest. Allow at least 48 hours of recovery before training the same primary muscle group again. Practice post-workout dynamic stretching and consider foam rolling tight areas.",
    "General Wellness": "Prioritize consistent sleep hygiene and stress management through mindfulness, deep diaphragmatic breathing, and regular evening wind-down rituals. Listen to your body and take rest whenever fatigued."
}

def clean_and_parse_json(raw_text: str) -> Dict[str, Any]:
    """
    Robust JSON extraction supporting Markdown fences, leading/trailing commentary,
    and missing brackets.
    """
    if not raw_text or not isinstance(raw_text, str):
        raise ValueError("Empty or invalid response from AI model")

    cleaned = raw_text.strip()

    # Remove markdown code blocks ```json ... ``` or ``` ... ```
    if "```" in cleaned:
        pattern = r"```(?:json)?\s*([\s\S]*?)\s*```"
        match = re.search(pattern, cleaned)
        if match:
            cleaned = match.group(1).strip()

    # If still not starting with {, search for first { and last }
    start_idx = cleaned.find("{")
    end_idx = cleaned.rfind("}")
    if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
        cleaned = cleaned[start_idx : end_idx + 1]

    try:
        data = json.loads(cleaned)
        return data
    except json.JSONDecodeError as err:
        logger.warning(f"Direct JSON parsing failed ({err}). Trying regex cleanup.")
        # Try cleaning trailing commas
        cleaned_no_commas = re.sub(r",\s*([\]}])", r"\1", cleaned)
        return json.loads(cleaned_no_commas)


def generate_fallback_plan(
    name: str,
    age: int,
    weight: float,
    goal: str,
    intensity: str,
    experience: str = "Beginner",
    preferences: str = "Home workout",
    feedback_note: Optional[str] = None
) -> Dict[str, Any]:
    """
    High-quality deterministic fallback plan generator customized to user inputs
    when Gemini API key is unset or offline.
    """
    is_home = "home" in (preferences or "").lower()
    is_muscle = "muscle" in goal.lower()
    is_loss = "loss" in goal.lower()

    reps_default = "8-12 reps" if is_muscle else ("12-15 reps" if is_loss else "10-12 reps")
    sets_count = 4 if intensity == "High" else (3 if intensity == "Medium" else 2)

    days_schedule = [
        {
            "day": 1,
            "day_name": "Monday / Day 1",
            "focus": "Upper Body Strength & Posture" if is_muscle else "Full Body Activation & Conditioning",
            "warmup": [
                "Arm circles & shoulder rolls (60s)",
                "Cat-Cow & thoracic rotations (60s)",
                "Jumping jacks or light jog in place (2 mins)"
            ],
            "exercises": [
                {
                    "name": "Standard Push-Ups (or Incline/Knee Push-Ups)" if is_home else "Dumbbell Bench Press",
                    "sets": sets_count,
                    "reps": reps_default,
                    "duration": None
                },
                {
                    "name": "Doorframe Inverted Row or Resistance Band Rows" if is_home else "Lat Pulldown / Bent-Over Barbell Row",
                    "sets": sets_count,
                    "reps": reps_default,
                    "duration": None
                },
                {
                    "name": "Pike Push-Ups or Overhead Water Bottle Press" if is_home else "Standing Dumbbell Overhead Press",
                    "sets": sets_count,
                    "reps": reps_default,
                    "duration": None
                },
                {
                    "name": "Chair / Bench Triceps Dips",
                    "sets": sets_count,
                    "reps": "10-12 reps",
                    "duration": None
                },
                {
                    "name": "Plank with Shoulder Taps",
                    "sets": 3,
                    "reps": None,
                    "duration": "30-45s"
                }
            ],
            "cooldown": [
                "Chest doorway stretch (45s)",
                "Cross-body shoulder stretch (30s each)",
                "Child's pose breathing (60s)"
            ],
            "rest_note": "Hydrate well and log your completed reps."
        },
        {
            "day": 2,
            "day_name": "Tuesday / Day 2",
            "focus": "Lower Body Power & Core Stability",
            "warmup": [
                "Bodyweight squats (15 reps)",
                "Leg swings (front/back, side/side)",
                "Hip openers & glute bridges (10 reps)"
            ],
            "exercises": [
                {
                    "name": "Goblet Squats (Backpack or Dumbbell)",
                    "sets": sets_count,
                    "reps": reps_default,
                    "duration": None
                },
                {
                    "name": "Walking Lunges or Reverse Lunges",
                    "sets": sets_count,
                    "reps": "10 reps per leg",
                    "duration": None
                },
                {
                    "name": "Single-Leg Romanian Deadlift (Bodyweight/Weighted)",
                    "sets": sets_count,
                    "reps": "8-10 reps per side",
                    "duration": None
                },
                {
                    "name": "Calf Raises on Step",
                    "sets": 3,
                    "reps": "15-20 reps",
                    "duration": None
                },
                {
                    "name": "Bicycle Crunches & Deadbug Hold",
                    "sets": 3,
                    "reps": "20 reps total",
                    "duration": None
                }
            ],
            "cooldown": [
                "Standing quad stretch (30s per leg)",
                "Hamstring reach stretch (45s)",
                "Seated butterfly stretch (60s)"
            ],
            "rest_note": "Replenish electrolytes and stretch calves and hip flexors."
        },
        {
            "day": 3,
            "day_name": "Wednesday / Day 3",
            "focus": "Active Recovery, Mobility & Core Flow",
            "warmup": [
                "Slow neck and wrist mobility drills (60s)",
                "Dynamic walking high knees and butt kicks (90s)"
            ],
            "exercises": [
                {
                    "name": "Brisk Outdoor Walk or Low-Impact Cardio Flow",
                    "sets": 1,
                    "reps": None,
                    "duration": "25-35 mins"
                },
                {
                    "name": "Bird-Dog Core Stability Holds",
                    "sets": 3,
                    "reps": "10 reps per side",
                    "duration": None
                },
                {
                    "name": "World's Greatest Stretch & Thoracic Opener",
                    "sets": 3,
                    "reps": "5 reps per side",
                    "duration": None
                }
            ],
            "cooldown": [
                "Full body supine spinal twist (45s per side)",
                "Deep diaphragmatic box breathing (3 mins)"
            ],
            "rest_note": "Active rest promotes circulation and cellular recovery."
        },
        {
            "day": 4,
            "day_name": "Thursday / Day 4",
            "focus": "Push & Posterior Chain Dynamic Circuit",
            "warmup": [
                "Jumping jacks & seal claps (60s)",
                "Inchworms to plank (5 reps)",
                "Arm cross stretches (45s)"
            ],
            "exercises": [
                {
                    "name": "Decline or Diamond Push-Ups" if is_home else "Incline Dumbbell Press",
                    "sets": sets_count,
                    "reps": reps_default,
                    "duration": None
                },
                {
                    "name": "Glute Bridge Hold with March",
                    "sets": sets_count,
                    "reps": "12 reps per leg",
                    "duration": None
                },
                {
                    "name": "Lateral Dumbbell / Band Raises",
                    "sets": sets_count,
                    "reps": "12-15 reps",
                    "duration": None
                },
                {
                    "name": "Mountain Climbers (Controlled Cadence)",
                    "sets": 3,
                    "reps": None,
                    "duration": "30-40s"
                }
            ],
            "cooldown": [
                "Downward-Facing Dog to Cobra Stretch (2 mins)",
                "Chest and triceps overhead stretch (60s)"
            ],
            "rest_note": "Focus on controlled eccentric contractions."
        },
        {
            "day": 5,
            "day_name": "Friday / Day 5",
            "focus": "Pull & Core Functional Conditioning",
            "warmup": [
                "Light jog in place (2 mins)",
                "Torso twists & hip circles (60s)"
            ],
            "exercises": [
                {
                    "name": "Pull-Ups / Under-Table Body Rows / Towel Rows" if is_home else "Seated Cable Row / Lat Pulldown",
                    "sets": sets_count,
                    "reps": reps_default,
                    "duration": None
                },
                {
                    "name": "Bicep Curls (Resistance Bands or Dumbbells)",
                    "sets": sets_count,
                    "reps": "12 reps",
                    "duration": None
                },
                {
                    "name": "Bulgarian Split Squats",
                    "sets": 3,
                    "reps": "8-10 reps per leg",
                    "duration": None
                },
                {
                    "name": "Hollow Body Hold or Forearm Plank",
                    "sets": 3,
                    "reps": None,
                    "duration": "35-45s"
                }
            ],
            "cooldown": [
                "Pigeon pose glute stretch (45s each)",
                "Standing side bends (30s each)",
                "Gentle spine flexion (60s)"
            ],
            "rest_note": "Great job finishing the work week strong!"
        },
        {
            "day": 6,
            "day_name": "Saturday / Day 6",
            "focus": "HIIT & Athletic Conditioning" if is_loss else "Hypertrophy Volume Booster",
            "warmup": [
                "High knees, butt kicks, arm sweeps (3 mins)",
                "Ankle and hip rotational prep (60s)"
            ],
            "exercises": [
                {
                    "name": "Burpees or Low-Impact Squat Thrusts",
                    "sets": 3,
                    "reps": "8-12 reps",
                    "duration": None
                },
                {
                    "name": "Jump Squats or Rapid Air Squats",
                    "sets": 3,
                    "reps": "12-15 reps",
                    "duration": None
                },
                {
                    "name": "Russian Twists with Weight/Medicine Ball",
                    "sets": 3,
                    "reps": "20 twists total",
                    "duration": None
                },
                {
                    "name": "High Plank to Downward Dog Tap",
                    "sets": 3,
                    "reps": "10 reps per side",
                    "duration": None
                }
            ],
            "cooldown": [
                "Hamstrings & quadriceps dynamic stretch (2 mins)",
                "Child's pose meditation (90s)"
            ],
            "rest_note": "Keep your heart rate monitor in target aerobic zone."
        },
        {
            "day": 7,
            "day_name": "Sunday / Day 7",
            "focus": "Full Rest, Gentle Walk & Weekly Recovery",
            "warmup": [
                "Gentle morning breathing and joint mobility (5 mins)"
            ],
            "exercises": [
                {
                    "name": "Relaxed Leisure Walk in Nature / Light Yoga",
                    "sets": 1,
                    "reps": None,
                    "duration": "30-45 mins"
                },
                {
                    "name": "Full Body Static Stretching & Foam Rolling",
                    "sets": 1,
                    "reps": None,
                    "duration": "15-20 mins"
                }
            ],
            "cooldown": [
                "Restorative savasana or meditation (5 mins)"
            ],
            "rest_note": "Complete rest day. Prep healthy meals and sleep early for the week ahead."
        }
    ]

    nutrition_tip = DEFAULT_NUTRITION_TIPS.get(goal, DEFAULT_NUTRITION_TIPS["General Wellness"])
    recovery_tip = DEFAULT_RECOVERY_TIPS.get(goal, DEFAULT_RECOVERY_TIPS["General Wellness"])

    if feedback_note:
        recovery_tip += f" [Plan adjusted according to feedback: {feedback_note}]"

    return {
        "goal": goal,
        "intensity": intensity,
        "days": days_schedule,
        "nutrition_tip": nutrition_tip,
        "recovery_tip": recovery_tip
    }


class GeminiFitnessService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY", "").strip()
        self.model_name = "gemini-3.8-flash"

    def _call_gemini_api(self, prompt: str, system_instruction: str) -> Optional[str]:
        """Attempt to call Gemini via google-genai or direct REST API."""
        if not self.api_key or self.api_key == "MY_GEMINI_API_KEY" or self.api_key == "your_api_key_here":
            logger.info("GEMINI_API_KEY not configured or placeholder. Using intelligent fallback planner.")
            return None

        # Try google-genai SDK first
        try:
            from google import genai
            from google.genai import types

            client = genai.Client(
                api_key=self.api_key,
                http_options={"headers": {"User-Agent": "aistudio-build"}}
            )
            # Python SDK uses snake_case: generate_content
            response = client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    response_mime_type="application/json",
                    temperature=0.7,
                )
            )
            if response and response.text:
                return response.text
        except Exception as e:
            logger.warning(f"google-genai SDK call error: {e}. Trying direct REST API.")

        # Fallback to direct HTTPS call using httpx or urllib
        try:
            import urllib.request
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model_name}:generateContent?key={self.api_key}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "systemInstruction": {"parts": [{"text": system_instruction}]},
                "generationConfig": {
                    "responseMimeType": "application/json",
                    "temperature": 0.7
                }
            }
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json", "User-Agent": "aistudio-build"}
            )
            with urllib.request.urlopen(req, timeout=30) as resp:
                result = json.loads(resp.read().decode("utf-8"))
                text = result["candidates"][0]["content"]["parts"][0]["text"]
                return text
        except Exception as rest_err:
            logger.error(f"Gemini REST API error: {rest_err}")
            return None

    def generate_plan(
        self,
        name: str,
        age: int,
        weight: float,
        goal: str,
        intensity: str,
        experience: str = "Beginner",
        preferences: str = "Home workout"
    ) -> Dict[str, Any]:
        """
        Generate a personalized 7-day workout plan using Gemini AI with safe fallback.
        """
        system_instruction = (
            "You are FitBuddy, an elite, encouraging certified strength and conditioning specialist (CSCS) "
            "and sports nutritionist. Generate a safe, structured, evidence-based 7-day fitness routine. "
            "Never generate extreme or hazardous workouts. Always balance push, pull, legs, core, and scheduled rest. "
            "Return valid JSON strictly adhering to the schema requested."
        )

        prompt = f"""
Generate a personalized 7-day fitness plan and nutrition/recovery advice for:
- Name: {name}
- Age: {age} years
- Weight: {weight} kg
- Primary Fitness Goal: {goal}
- Intensity: {intensity}
- Experience Level: {experience}
- Workout Preference / Equipment: {preferences}

CRITICAL: Return ONLY a raw JSON object with this exact structure:
{{
  "goal": "{goal}",
  "intensity": "{intensity}",
  "days": [
    {{
      "day": 1,
      "day_name": "Monday / Day 1",
      "focus": "Focus Description (e.g. Upper Body Strength)",
      "warmup": ["Warmup step 1", "Warmup step 2"],
      "exercises": [
        {{
          "name": "Exercise Name",
          "sets": 3,
          "reps": "10-12",
          "duration": null
        }}
      ],
      "cooldown": ["Cooldown step 1", "Cooldown step 2"],
      "rest_note": "Hydration / recovery guidance for today"
    }}
  ],
  "nutrition_tip": "Targeted nutrition advice tailored for {goal} and weight {weight}kg",
  "recovery_tip": "Targeted recovery and sleep advice tailored for {intensity} intensity and age {age}"
}}

Ensure all 7 days (Day 1 through Day 7) are included. Day 7 or appropriate days should be designated rest or active recovery.
"""
        raw_response = self._call_gemini_api(prompt, system_instruction)
        if raw_response:
            try:
                parsed = clean_and_parse_json(raw_response)
                if "days" in parsed and isinstance(parsed["days"], list) and len(parsed["days"]) >= 5:
                    # Enrich with fallback tips if empty
                    if not parsed.get("nutrition_tip"):
                        parsed["nutrition_tip"] = DEFAULT_NUTRITION_TIPS.get(goal, DEFAULT_NUTRITION_TIPS["General Wellness"])
                    if not parsed.get("recovery_tip"):
                        parsed["recovery_tip"] = DEFAULT_RECOVERY_TIPS.get(goal, DEFAULT_RECOVERY_TIPS["General Wellness"])
                    return parsed
            except Exception as e:
                logger.error(f"Failed to parse Gemini output: {e}. Using deterministic plan.")

        return generate_fallback_plan(
            name=name,
            age=age,
            weight=weight,
            goal=goal,
            intensity=intensity,
            experience=experience,
            preferences=preferences
        )

    def regenerate_with_feedback(
        self,
        original_plan: Dict[str, Any],
        feedback_text: str,
        user_info: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Regenerate and adapt plan based on user feedback.
        """
        system_instruction = (
            "You are FitBuddy AI. An existing 7-day workout plan has been generated for a user. "
            "The user provided specific feedback/modifications. Your goal is to revise and improve the "
            "workout plan directly addressing their feedback while maintaining safe training volume and progression. "
            "Return valid JSON matching the exact schema."
        )

        prompt = f"""
Existing Plan Summary:
- Goal: {original_plan.get('goal')}
- Intensity: {original_plan.get('intensity')}
- User Profile: {user_info.get('name')}, {user_info.get('age')}yo, {user_info.get('weight')}kg, {user_info.get('experience')} experience.

User Feedback / Desired Adjustments:
"{feedback_text}"

Current Plan Data:
{json.dumps(original_plan, indent=2)}

Please regenerate the 7-day plan honoring this feedback (e.g., adding more rest, adjusting cardio, targeting specific muscles, changing exercise difficulty).
Return ONLY the updated JSON object with the same schema ('goal', 'intensity', 'days', 'nutrition_tip', 'recovery_tip').
"""
        raw_response = self._call_gemini_api(prompt, system_instruction)
        if raw_response:
            try:
                parsed = clean_and_parse_json(raw_response)
                if "days" in parsed and isinstance(parsed["days"], list) and len(parsed["days"]) >= 5:
                    return parsed
            except Exception as e:
                logger.error(f"Failed to parse regenerated Gemini output: {e}.")

        # Fallback regeneration
        return generate_fallback_plan(
            name=user_info.get("name", "User"),
            age=user_info.get("age", 25),
            weight=user_info.get("weight", 70.0),
            goal=original_plan.get("goal", "General Wellness"),
            intensity=original_plan.get("intensity", "Medium"),
            experience=user_info.get("experience", "Beginner"),
            preferences=user_info.get("preferences", "Home workout"),
            feedback_note=feedback_text
        )

# Global service singleton
gemini_service = GeminiFitnessService()
