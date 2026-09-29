import React, { useState, useEffect } from 'react';
import {
  Zap,
  Flame,
  Dumbbell,
  HeartPulse,
  Activity,
  Sparkles,
  RotateCcw,
  Printer,
  History,
  Calendar,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Plus,
  Moon,
  Clock,
  ExternalLink
} from 'lucide-react';

interface Exercise {
  name: string;
  sets: number | null;
  reps: string | number | null;
  duration: string | null;
}

interface DayPlan {
  day: number;
  day_name?: string;
  focus: string;
  warmup: string[];
  exercises: Exercise[];
  cooldown: string[];
  rest_note?: string;
}

interface UserProfile {
  name: string;
  age: number;
  weight: number;
  goal: string;
  intensity: string;
  experience: string;
  preferences: string;
}

interface WorkoutPlan {
  id: number;
  user_id: number;
  user: UserProfile;
  plan_data: {
    goal: string;
    intensity: string;
    days: DayPlan[];
    nutrition_tip?: string;
    recovery_tip?: string;
  };
  nutrition_tip: string;
  recovery_tip: string;
  created_at: string;
}

const DEFAULT_SAMPLE_PLAN: WorkoutPlan = {
  id: 1,
  user_id: 1,
  user: {
    name: "Kavin",
    age: 20,
    weight: 65,
    goal: "Muscle Gain",
    intensity: "Medium",
    experience: "Beginner",
    preferences: "Home workout"
  },
  plan_data: {
    goal: "Muscle Gain",
    intensity: "Medium",
    days: [
      {
        day: 1,
        day_name: "Monday / Day 1",
        focus: "Chest, Shoulders & Triceps (Push Focus)",
        warmup: [
          "Arm rotations & neck mobility (60s)",
          "Jumping jacks (2 mins)",
          "Inchworm pushups (5 reps)"
        ],
        exercises: [
          { name: "Push-Ups (Chest Focus)", sets: 3, reps: "10-12 reps", duration: null },
          { name: "Pike Push-Ups (Shoulders)", sets: 3, reps: "8-10 reps", duration: null },
          { name: "Bench / Chair Triceps Dips", sets: 3, reps: "10-12 reps", duration: null },
          { name: "Plank Shoulder Taps", sets: 3, reps: null, duration: "30s" }
        ],
        cooldown: [
          "Chest doorway stretch (45s)",
          "Child's pose deep breathing (60s)"
        ],
        rest_note: "Hydrate well and consume 25-30g protein within 2 hours post-workout."
      },
      {
        day: 2,
        day_name: "Tuesday / Day 2",
        focus: "Leg Hypertrophy & Core Stability",
        warmup: [
          "Bodyweight air squats (15 reps)",
          "Hip openers & glute bridges (12 reps)"
        ],
        exercises: [
          { name: "Backpack / Goblet Squats", sets: 3, reps: "12 reps", duration: null },
          { name: "Walking Lunges", sets: 3, reps: "10 reps/leg", duration: null },
          { name: "Single-Leg Romanian Deadlift", sets: 3, reps: "10 reps/leg", duration: null },
          { name: "Calf Raises on Ledge", sets: 3, reps: "20 reps", duration: null },
          { name: "Bicycle Crunches", sets: 3, reps: "20 total", duration: null }
        ],
        cooldown: [
          "Standing quadriceps stretch (30s each)",
          "Seated hamstring reach (45s)"
        ],
        rest_note: "Focus on controlled eccentric lowering for optimal muscle stimulus."
      },
      {
        day: 3,
        day_name: "Wednesday / Day 3",
        focus: "Active Recovery, Mobility & Core Flow",
        warmup: [
          "Gentle spinal circles (60s)",
          "Dynamic wrist and shoulder openers (2 mins)"
        ],
        exercises: [
          { name: "Brisk Outdoor Walk / Light Cardio", sets: 1, reps: null, duration: "30 mins" },
          { name: "Bird-Dog Core Stability Hold", sets: 3, reps: "10 reps/side", duration: null },
          { name: "World's Greatest Stretch", sets: 3, reps: "5 reps/side", duration: null }
        ],
        cooldown: [
          "Supine twist (60s each)",
          "Diaphragmatic box breathing (3 mins)"
        ],
        rest_note: "Active recovery accelerates tissue oxygenation and promotes muscle repair."
      },
      {
        day: 4,
        day_name: "Thursday / Day 4",
        focus: "Back, Biceps & Posterior Chain (Pull Focus)",
        warmup: [
          "Cat-Cow spinal waves (60s)",
          "Towel / band pull-aparts (2 mins)"
        ],
        exercises: [
          { name: "Inverted Table / Towel Rows", sets: 3, reps: "8-10 reps", duration: null },
          { name: "Backpack Bicep Curls", sets: 3, reps: "12 reps", duration: null },
          { name: "Prone Cobra / Superman Hold", sets: 3, reps: "12 reps", duration: "10s hold" },
          { name: "Hollow Body Core Hold", sets: 3, reps: null, duration: "30s" }
        ],
        cooldown: [
          "Lat stretch against doorframe (45s)",
          "Cross-body shoulder stretch (30s)"
        ],
        rest_note: "Squeeze your shoulder blades together at peak contraction."
      },
      {
        day: 5,
        day_name: "Friday / Day 5",
        focus: "Full Body Dynamic Functional Conditioning",
        warmup: [
          "Light jog in place (2 mins)",
          "High knees and butt kicks (60s)"
        ],
        exercises: [
          { name: "Squat to Overhead Reach", sets: 3, reps: "12 reps", duration: null },
          { name: "Diamond Push-Ups (or Knee)", sets: 3, reps: "8-10 reps", duration: null },
          { name: "Bulgarian Split Squats", sets: 3, reps: "8 reps/leg", duration: null },
          { name: "Mountain Climbers", sets: 3, reps: null, duration: "35s" }
        ],
        cooldown: [
          "Downward Dog to Cobra flow (2 mins)",
          "Child's pose (90s)"
        ],
        rest_note: "Finish the work week strong with proper form on every rep."
      },
      {
        day: 6,
        day_name: "Saturday / Day 6",
        focus: "Core Conditioning & High-Intensity Burst",
        warmup: [
          "Arm sweeps, torso twists (2 mins)",
          "Seal claps (60s)"
        ],
        exercises: [
          { name: "Burpees (Low or High Impact)", sets: 3, reps: "10 reps", duration: null },
          { name: "Russian Twists", sets: 3, reps: "20 twists", duration: null },
          { name: "Jump Squats / Rapid Air Squats", sets: 3, reps: "12 reps", duration: null },
          { name: "Forearm Plank", sets: 3, reps: null, duration: "45s" }
        ],
        cooldown: [
          "Hamstring stretch (60s)",
          "Glute pigeon stretch (45s each)"
        ],
        rest_note: "Replenish sodium, potassium, and magnesium with electrolytes."
      },
      {
        day: 7,
        day_name: "Sunday / Day 7",
        focus: "Complete Rest, Restoration & Meal Prep",
        warmup: [
          "Morning sun salutations (5 mins)"
        ],
        exercises: [
          { name: "Leisure Nature Stroll", sets: 1, reps: null, duration: "30-45 mins" },
          { name: "Full Body Gentle Foam Rolling & Mobility", sets: 1, reps: null, duration: "15 mins" }
        ],
        cooldown: [
          "Meditation & sleep preparation (5 mins)"
        ],
        rest_note: "Full restorative rest. Sleep early to prepare for next week's progressive overload."
      }
    ],
    nutrition_tip: "Maintain a moderate caloric surplus (+300 kcal) with 1.8g - 2.0g protein per kg of bodyweight (approx. 120-130g protein daily for 65kg). Emphasize chicken breast, eggs, Greek yogurt, lentils, oats, and peanut butter.",
    recovery_tip: "Target 8 hours of uninterrupted sleep nightly. Muscle tissue repairs during stage 3 non-REM and REM sleep cycles. Take warm showers and stretch before bed."
  },
  nutrition_tip: "Maintain a moderate caloric surplus (+300 kcal) with 1.8g - 2.0g protein per kg of bodyweight (approx. 120-130g protein daily for 65kg). Emphasize chicken breast, eggs, Greek yogurt, lentils, oats, and peanut butter.",
  recovery_tip: "Target 8 hours of uninterrupted sleep nightly. Muscle tissue repairs during stage 3 non-REM and REM sleep cycles. Take warm showers and stretch before bed.",
  created_at: new Date().toISOString()
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'form' | 'dashboard'>('home');
  const [plan, setPlan] = useState<WorkoutPlan | null>(DEFAULT_SAMPLE_PLAN);
  const [historyPlans, setHistoryPlans] = useState<WorkoutPlan[]>([DEFAULT_SAMPLE_PLAN]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [formError, setFormError] = useState('');
  const [feedbackError, setFeedbackError] = useState('');
  const [updatedSuccess, setUpdatedSuccess] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Form inputs
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    weight: '',
    goal: 'Muscle Gain',
    intensity: 'Medium',
    experience: 'Beginner',
    preferences: 'Home workout'
  });

  // Load demo data
  const handleLoadDemo = () => {
    setFormData({
      name: 'Kavin',
      age: '20',
      weight: '65',
      goal: 'Muscle Gain',
      intensity: 'Medium',
      experience: 'Beginner',
      preferences: 'Home workout'
    });
    setFormError('');
  };

  // Submit assessment form
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const name = formData.name.trim();
    const age = parseInt(formData.age, 10);
    const weight = parseFloat(formData.weight);

    if (!name) {
      setFormError('Please enter your full name.');
      return;
    }
    if (isNaN(age) || age < 12 || age > 100) {
      setFormError('Age must be between 12 and 100 years.');
      return;
    }
    if (isNaN(weight) || weight < 20 || weight > 400) {
      setFormError('Weight must be between 20 kg and 400 kg.');
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/workout/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          age,
          weight,
          goal: formData.goal,
          intensity: formData.intensity,
          experience: formData.experience,
          preferences: formData.preferences
        })
      });

      if (response.ok) {
        const newPlan: WorkoutPlan = await response.json();
        setPlan(newPlan);
        setHistoryPlans(prev => [newPlan, ...prev]);
        setUpdatedSuccess(false);
        setCurrentPage('dashboard');
      } else {
        // Fallback local generator for web preview if FastAPI server is in transition
        generateLocalPlanFallback(name, age, weight, formData.goal, formData.intensity, formData.experience, formData.preferences);
      }
    } catch (err) {
      // Local fallback on network error
      generateLocalPlanFallback(name, age, weight, formData.goal, formData.intensity, formData.experience, formData.preferences);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateLocalPlanFallback = (
    name: string,
    age: number,
    weight: number,
    goal: string,
    intensity: string,
    experience: string,
    preferences: string
  ) => {
    const isMuscle = goal.includes('Muscle');
    const isLoss = goal.includes('Loss');
    const sets = intensity === 'High' ? 4 : (intensity === 'Medium' ? 3 : 2);
    const reps = isMuscle ? '8-12 reps' : (isLoss ? '12-15 reps' : '10-12 reps');

    const generated: WorkoutPlan = {
      id: Date.now(),
      user_id: 1,
      user: { name, age, weight, goal, intensity, experience, preferences },
      plan_data: {
        goal,
        intensity,
        days: [
          {
            day: 1,
            day_name: "Monday / Day 1",
            focus: isMuscle ? "Upper Body Hypertrophy (Chest & Back)" : "Full Body Conditioning",
            warmup: ["Arm circles (60s)", "Cat-Cow mobility (60s)", "Jumping jacks (2 mins)"],
            exercises: [
              { name: preferences.includes('Home') ? "Standard Push-Ups" : "Dumbbell Bench Press", sets, reps, duration: null },
              { name: preferences.includes('Home') ? "Doorframe Inverted Row" : "Lat Pulldown", sets, reps, duration: null },
              { name: "Overhead Shoulder Press", sets, reps, duration: null },
              { name: "Plank with Shoulder Taps", sets: 3, reps: null, duration: "30-45s" }
            ],
            cooldown: ["Chest doorway stretch (45s)", "Child's pose breathing (60s)"],
            rest_note: "Log your weights/reps and stay hydrated."
          },
          {
            day: 2,
            day_name: "Tuesday / Day 2",
            focus: "Lower Body Power & Core Foundation",
            warmup: ["Air squats (15 reps)", "Glute bridges (12 reps)", "Leg swings (60s)"],
            exercises: [
              { name: "Goblet Squats", sets, reps, duration: null },
              { name: "Walking Lunges", sets, reps: "10 reps/leg", duration: null },
              { name: "Romanian Deadlift", sets, reps: "10 reps/leg", duration: null },
              { name: "Bicycle Crunches", sets: 3, reps: "20 total", duration: null }
            ],
            cooldown: ["Standing quad stretch (30s each)", "Hamstring reach stretch (45s)"],
            rest_note: "Replenish glycogen and stretch calves and hip flexors."
          },
          {
            day: 3,
            day_name: "Wednesday / Day 3",
            focus: "Active Recovery, Mobility & Core Flow",
            warmup: ["Spinal twists (60s)", "Thoracic openers (2 mins)"],
            exercises: [
              { name: "Brisk Outdoor Walk / Low-Impact Cardio", sets: 1, reps: null, duration: "30 mins" },
              { name: "Bird-Dog Core Holds", sets: 3, reps: "10 reps/side", duration: null },
              { name: "World's Greatest Stretch", sets: 3, reps: "5 reps/side", duration: null }
            ],
            cooldown: ["Deep box breathing meditation (3 mins)"],
            rest_note: "Active rest promotes nutrient-rich blood flow to tired muscles."
          },
          {
            day: 4,
            day_name: "Thursday / Day 4",
            focus: "Push & Core Power Circuit",
            warmup: ["Jumping jacks (60s)", "Inchworm walks (5 reps)"],
            exercises: [
              { name: "Diamond Push-Ups", sets, reps, duration: null },
              { name: "Lateral Raises", sets, reps: "12-15 reps", duration: null },
              { name: "Chair / Bench Dips", sets, reps: "10-12 reps", duration: null },
              { name: "Mountain Climbers", sets: 3, reps: null, duration: "30s" }
            ],
            cooldown: ["Triceps & chest stretch (60s)", "Cobra pose (60s)"],
            rest_note: "Focus on mind-muscle connection during push movements."
          },
          {
            day: 5,
            day_name: "Friday / Day 5",
            focus: "Pull & Posterior Chain Volume",
            warmup: ["Torso rotations (60s)", "Light jog in place (2 mins)"],
            exercises: [
              { name: "Bodyweight Rows / Towel Rows", sets, reps, duration: null },
              { name: "Bicep Curls", sets, reps: "12 reps", duration: null },
              { name: "Bulgarian Split Squats", sets: 3, reps: "8-10 reps/leg", duration: null },
              { name: "Hollow Body Core Hold", sets: 3, reps: null, duration: "35s" }
            ],
            cooldown: ["Pigeon pose glute stretch (45s each)", "Child's pose (60s)"],
            rest_note: "Great job completing your primary training days!"
          },
          {
            day: 6,
            day_name: "Saturday / Day 6",
            focus: isLoss ? "High-Intensity Interval Circuit" : "Core & Hypertrophy Booster",
            warmup: ["High knees (60s)", "Arm sweeps (60s)"],
            exercises: [
              { name: "Burpees or Low-Impact Thrusts", sets: 3, reps: "10-12 reps", duration: null },
              { name: "Rapid Air Squats", sets: 3, reps: "15 reps", duration: null },
              { name: "Russian Twists", sets: 3, reps: "20 twists", duration: null },
              { name: "Forearm Plank", sets: 3, reps: null, duration: "45s" }
            ],
            cooldown: ["Hamstring stretch (60s)", "Full body stretch (2 mins)"],
            rest_note: "Rehydrate with water and essential minerals."
          },
          {
            day: 7,
            day_name: "Sunday / Day 7",
            focus: "Complete Rest, Restoration & Recovery",
            warmup: ["Gentle morning breathing (5 mins)"],
            exercises: [
              { name: "Leisure Nature Walk", sets: 1, reps: null, duration: "30-45 mins" },
              { name: "Full Body Foam Rolling & Gentle Yoga", sets: 1, reps: null, duration: "15 mins" }
            ],
            cooldown: ["Restorative meditation (5 mins)"],
            rest_note: "Complete rest day. Prep wholesome meals and sleep early for next week."
          }
        ],
        nutrition_tip: isMuscle 
          ? `Target 1.8-2.0g protein/kg (${Math.round(weight * 1.9)}g daily) with a +300 kcal surplus. Focus on lean chicken, eggs, lentils, oats, and nuts.`
          : (isLoss 
              ? `Maintain a moderate 300-500 kcal deficit. Prioritize ${Math.round(weight * 1.6)}g protein, cruciferous vegetables, and 3L water daily.`
              : "Focus on a balanced Mediterranean-style plate with lean proteins, complex grains, and vibrant vegetables."),
        recovery_tip: "Prioritize 7-9 hours of consistent, deep sleep. Allow 48 hours before retraining the same muscle groups."
      },
      nutrition_tip: isMuscle 
        ? `Target 1.8-2.0g protein/kg (${Math.round(weight * 1.9)}g daily) with a +300 kcal surplus. Focus on lean chicken, eggs, lentils, oats, and nuts.`
        : (isLoss 
            ? `Maintain a moderate 300-500 kcal deficit. Prioritize ${Math.round(weight * 1.6)}g protein, cruciferous vegetables, and 3L water daily.`
            : "Focus on a balanced Mediterranean-style plate with lean proteins, complex grains, and vibrant vegetables."),
      recovery_tip: "Prioritize 7-9 hours of consistent, deep sleep. Allow 48 hours before retraining the same muscle groups.",
      created_at: new Date().toISOString()
    };

    setPlan(generated);
    setHistoryPlans(prev => [generated, ...prev]);
    setUpdatedSuccess(false);
    setCurrentPage('dashboard');
  };

  // Submit feedback & regenerate
  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackError('');
    const text = feedbackText.trim();
    if (!text) {
      setFeedbackError('Please enter changes you want in your workout plan.');
      return;
    }

    if (!plan) return;

    setIsRegenerating(true);

    try {
      const response = await fetch(`/api/workout/${plan.id}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback_text: text })
      });

      if (response.ok) {
        const feedbackData = await response.json();
        const updated: WorkoutPlan = feedbackData.updated_plan;
        setPlan(updated);
        setHistoryPlans(prev => [updated, ...prev]);
        setUpdatedSuccess(true);
        setFeedbackText('');
      } else {
        // Fallback local update
        regenerateLocalFallback(text);
      }
    } catch (err) {
      regenerateLocalFallback(text);
    } finally {
      setIsRegenerating(false);
    }
  };

  const regenerateLocalFallback = (feedback: string) => {
    if (!plan) return;

    const lower = feedback.toLowerCase();
    const updatedDays = plan.plan_data.days.map(d => {
      let modExercises = [...d.exercises];
      if (lower.includes('cardio') && !modExercises.some(e => e.name.includes('Cardio'))) {
        modExercises.push({ name: "Post-Workout Cardio Finisher", sets: 1, reps: null, duration: "15 mins" });
      }
      if (lower.includes('leg') && (d.day === 1 || d.day === 4)) {
        modExercises.push({ name: "Bodyweight Bulgarian Split Squats", sets: 3, reps: "10 reps/leg", duration: null });
      }
      return {
        ...d,
        exercises: modExercises,
        rest_note: `${d.rest_note} [Adjusted: ${feedback}]`
      };
    });

    const updatedPlan: WorkoutPlan = {
      ...plan,
      id: Date.now(),
      plan_data: {
        ...plan.plan_data,
        days: updatedDays
      },
      recovery_tip: `${plan.recovery_tip} (Plan optimized for feedback: "${feedback}")`,
      created_at: new Date().toISOString()
    };

    setPlan(updatedPlan);
    setHistoryPlans(prev => [updatedPlan, ...prev]);
    setUpdatedSuccess(true);
    setFeedbackText('');
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-[#f8fafc] flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#111827]/85 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <button
            onClick={() => setCurrentPage('home')}
            className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-white hover:opacity-90 transition-opacity"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-blue-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              FitBuddy
            </span>
          </button>

          <nav className="flex items-center gap-6 text-sm font-medium">
            <button
              onClick={() => setCurrentPage('home')}
              className={`transition-colors ${currentPage === 'home' ? 'text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Home
            </button>
            <button
              onClick={() => setCurrentPage('form')}
              className={`transition-colors ${currentPage === 'form' ? 'text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Create Plan
            </button>
            <button
              onClick={() => setCurrentPage('dashboard')}
              className={`transition-colors ${currentPage === 'dashboard' ? 'text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Dashboard
            </button>
            <a
              href="/docs"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300 hover:text-white hover:border-slate-600 transition"
            >
              API Docs
              <ExternalLink className="w-3 h-3" />
            </a>
          </nav>

          <button
            onClick={() => setCurrentPage('form')}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white shadow-md shadow-emerald-500/20 transition-all transform active:scale-95"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Main Page Routing */}
      <main className="flex-1">
        {/* PAGE 1: HOME LANDING */}
        {currentPage === 'home' && (
          <div>
            <section className="relative overflow-hidden pt-20 pb-16 px-4 text-center">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(16,185,129,0.15),transparent_60%)] pointer-events-none" />
              
              <div className="max-w-3xl mx-auto relative z-10">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold mb-6">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Powered by Google Gemini AI & FastAPI
                </div>

                <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight mb-4">
                  FitBuddy
                  <span className="block text-2xl sm:text-4xl mt-2 font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-slate-300 to-slate-400">
                    AI-Powered Personal Fitness Planner
                  </span>
                </h1>

                <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                  Create a personalized 7-day fitness plan based on your goals, preferences, and workout intensity. Tailored exercises, structured daily volume, and certified nutrition & recovery strategies.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
                  <button
                    onClick={() => setCurrentPage('form')}
                    className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-base shadow-xl shadow-emerald-500/30 flex items-center gap-2 transform active:scale-95 transition-all"
                  >
                    Create My Plan
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => setCurrentPage('dashboard')}
                    className="px-6 py-3.5 rounded-2xl bg-[#162032] hover:bg-[#1f2d45] border border-white/10 text-white font-semibold text-base transition-colors"
                  >
                    View Sample Plan
                  </button>
                </div>

                {/* 3 Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
                  <div className="bg-[#162032]/80 border border-white/5 rounded-2xl p-5 backdrop-blur-sm">
                    <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400 block mb-1">
                      7 Days
                    </span>
                    <span className="text-xs text-slate-400 font-medium">Dynamic Periodized Routine</span>
                  </div>
                  <div className="bg-[#162032]/80 border border-white/5 rounded-2xl p-5 backdrop-blur-sm">
                    <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400 block mb-1">
                      100%
                    </span>
                    <span className="text-xs text-slate-400 font-medium">Customized To Your Body</span>
                  </div>
                  <div className="bg-[#162032]/80 border border-white/5 rounded-2xl p-5 backdrop-blur-sm">
                    <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400 block mb-1">
                      Instant
                    </span>
                    <span className="text-xs text-slate-400 font-medium">AI Feedback Tuning</span>
                  </div>
                </div>
              </div>
            </section>

            {/* How It Works Grid */}
            <section className="py-16 px-4 max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">How FitBuddy Works</h2>
                <p className="text-slate-400 text-sm">Four simple steps to your scientifically designed workout routine.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-[#162032] border border-white/10 rounded-2xl p-6 relative hover:border-emerald-500/40 transition">
                  <span className="absolute top-4 right-4 text-xs font-bold text-slate-500">01</span>
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400 mb-4">
                    <Activity className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Fitness Profile</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">Enter your age, weight, target goals, and training environment in seconds.</p>
                </div>

                <div className="bg-[#162032] border border-white/10 rounded-2xl p-6 relative hover:border-emerald-500/40 transition">
                  <span className="absolute top-4 right-4 text-xs font-bold text-slate-500">02</span>
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 mb-4">
                    <Flame className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Set Your Target</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">Choose Weight Loss, Muscle Gain, or General Wellness with custom intensity.</p>
                </div>

                <div className="bg-[#162032] border border-white/10 rounded-2xl p-6 relative hover:border-emerald-500/40 transition">
                  <span className="absolute top-4 right-4 text-xs font-bold text-slate-500">03</span>
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 mb-4">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Gemini AI Synthesis</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">Structured warm-ups, exercises, sets/reps, cool-downs, and nutrition tips.</p>
                </div>

                <div className="bg-[#162032] border border-white/10 rounded-2xl p-6 relative hover:border-emerald-500/40 transition">
                  <span className="absolute top-4 right-4 text-xs font-bold text-slate-500">04</span>
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400 mb-4">
                    <RotateCcw className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Feedback & Tuning</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">Request modifications anytime to regenerate a refined plan in SQLite.</p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* PAGE 2: FITNESS ASSESSMENT FORM */}
        {currentPage === 'form' && (
          <div className="py-12 px-4 max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Step 1 of 2</span>
              <h1 className="text-3xl font-extrabold tracking-tight mt-1 mb-2">Personalized Fitness Assessment</h1>
              <p className="text-sm text-slate-400">Provide your physiological attributes so FitBuddy can architect your 7-day routine.</p>

              {/* Demo quick fill button */}
              <div className="mt-4 inline-flex items-center gap-2 bg-[#162032] border border-white/10 px-4 py-1.5 rounded-full text-xs text-slate-300">
                <span>Want to test quickly?</span>
                <button
                  type="button"
                  onClick={handleLoadDemo}
                  className="font-semibold text-blue-400 hover:text-blue-300 bg-blue-500/15 border border-blue-500/30 px-3 py-1 rounded-full transition"
                >
                  ⚡ Fill Demo Data (Kavin, 20yo, Muscle Gain)
                </button>
              </div>
            </div>

            {formError && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-6">
              {/* Card 1: Personal Info */}
              <div className="bg-[#162032] border border-white/10 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center">
                    1
                  </div>
                  <div>
                    <h2 className="font-bold text-base">Personal Information</h2>
                    <p className="text-xs text-slate-400">Your baseline physiological parameters</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kavin"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#111827] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                      Age (years) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={12}
                      max={100}
                      placeholder="e.g. 20"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      className="w-full bg-[#111827] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                      Weight (kg) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      required
                      min={20}
                      max={400}
                      placeholder="e.g. 65"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      className="w-full bg-[#111827] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Fitness Goal */}
              <div className="bg-[#162032] border border-white/10 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center">
                    2
                  </div>
                  <div>
                    <h2 className="font-bold text-base">Select Fitness Goal <span className="text-red-400">*</span></h2>
                    <p className="text-xs text-slate-400">Choose your primary physiological adaptation</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {[
                    {
                      id: 'Weight Loss',
                      title: 'Weight Loss',
                      icon: '🔥',
                      desc: 'Caloric deficit, metabolic circuits, and fat oxidation'
                    },
                    {
                      id: 'Muscle Gain',
                      title: 'Muscle Gain',
                      icon: '💪',
                      desc: 'Progressive hypertrophy, strength, and protein fueling'
                    },
                    {
                      id: 'General Wellness',
                      title: 'General Wellness',
                      icon: '🌿',
                      desc: 'Functional mobility, cardiovascular health, and stamina'
                    }
                  ].map((g) => (
                    <label
                      key={g.id}
                      className={`cursor-pointer rounded-xl border p-4 text-center transition block ${
                        formData.goal === g.id
                          ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
                          : 'border-white/10 bg-[#111827] hover:border-white/20'
                      }`}
                    >
                      <input
                        type="radio"
                        name="goal"
                        value={g.id}
                        checked={formData.goal === g.id}
                        onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                        className="sr-only"
                      />
                      <span className="text-2xl block mb-2">{g.icon}</span>
                      <span className="font-bold text-sm text-white block mb-1">{g.title}</span>
                      <span className="text-xs text-slate-400 block leading-tight">{g.desc}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Card 3: Intensity */}
              <div className="bg-[#162032] border border-white/10 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center">
                    3
                  </div>
                  <div>
                    <h2 className="font-bold text-base">Workout Intensity <span className="text-red-400">*</span></h2>
                    <p className="text-xs text-slate-400">Pacing, rest intervals, and volume density</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {[
                    { id: 'Low', title: 'Low Intensity', tag: 'Gentle', badgeBg: 'bg-blue-500/15 text-blue-400', desc: 'Gentle pacing, generous rest, beginner-friendly' },
                    { id: 'Medium', title: 'Medium Intensity', tag: 'Balanced', badgeBg: 'bg-emerald-500/15 text-emerald-400', desc: 'Standard training volume, 60-90s rest, steady progress' },
                    { id: 'High', title: 'High Intensity', tag: 'Challenging', badgeBg: 'bg-amber-500/15 text-amber-400', desc: 'Demanding circuits, supersets, metabolic challenge' }
                  ].map((lvl) => (
                    <label
                      key={lvl.id}
                      className={`cursor-pointer rounded-xl border p-4 text-center transition block ${
                        formData.intensity === lvl.id
                          ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
                          : 'border-white/10 bg-[#111827] hover:border-white/20'
                      }`}
                    >
                      <input
                        type="radio"
                        name="intensity"
                        value={lvl.id}
                        checked={formData.intensity === lvl.id}
                        onChange={(e) => setFormData({ ...formData, intensity: e.target.value })}
                        className="sr-only"
                      />
                      <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full mb-2 ${lvl.badgeBg}`}>
                        {lvl.tag}
                      </span>
                      <span className="font-bold text-sm text-white block mb-1">{lvl.title}</span>
                      <span className="text-xs text-slate-400 block leading-tight">{lvl.desc}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Card 4: Experience & Preferences */}
              <div className="bg-[#162032] border border-white/10 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center">
                    4
                  </div>
                  <div>
                    <h2 className="font-bold text-base">Experience & Equipment</h2>
                    <p className="text-xs text-slate-400">Tailor exercise complexity and available equipment</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1.5">Fitness Experience</label>
                    <select
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      className="w-full bg-[#111827] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                    >
                      <option value="Beginner">Beginner (0 - 6 months)</option>
                      <option value="Intermediate">Intermediate (6 months - 2 years)</option>
                      <option value="Advanced">Advanced (2+ years)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1.5">Workout Environment / Equipment</label>
                    <select
                      value={formData.preferences}
                      onChange={(e) => setFormData({ ...formData, preferences: e.target.value })}
                      className="w-full bg-[#111827] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                    >
                      <option value="Home workout">Home Workout (Bodyweight & Minimal)</option>
                      <option value="Home Gym with Dumbbells">Home Gym with Dumbbells / Bands</option>
                      <option value="Full Commercial Gym">Full Commercial Gym (Barbells & Machines)</option>
                      <option value="Outdoor Calisthenics">Outdoor Calisthenics</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="text-center pt-2">
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full sm:w-80 mx-auto py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-base shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition disabled:opacity-60"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Generating Plan with Gemini AI...</span>
                    </>
                  ) : (
                    <>
                      <span>Generate My 7-Day Plan</span>
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
                <p className="text-xs text-slate-500 mt-2">Takes ~2-3 seconds. Persisted in SQLite.</p>
              </div>
            </form>
          </div>
        )}

        {/* PAGE 3: DASHBOARD */}
        {currentPage === 'dashboard' && plan && (
          <div className="py-10 px-4 max-w-6xl mx-auto">
            {/* Top Bar */}
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400">7-Day Fitness Architecture</span>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-0.5">Your Personalized Workout Plan</h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Periodized according to your physiological target and available equipment</p>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl border border-white/10 bg-[#162032] hover:bg-[#1f2d45] text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Plan
                </button>
                <button
                  onClick={() => setShowHistoryModal(true)}
                  className="px-3 py-1.5 rounded-xl border border-white/10 bg-[#162032] hover:bg-[#1f2d45] text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition"
                >
                  <History className="w-3.5 h-3.5" />
                  History ({historyPlans.length})
                </button>
                <button
                  onClick={() => setCurrentPage('form')}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-xs font-semibold text-white shadow-md shadow-emerald-500/20 flex items-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Assessment
                </button>
              </div>
            </div>

            {/* Success Banner if plan regenerated */}
            {updatedSuccess && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <span>
                    <strong>Plan Successfully Updated!</strong> Gemini AI revised the 7-day schedule below based on your feedback.
                  </span>
                </div>
                <button onClick={() => setUpdatedSuccess(false)} className="text-xs text-emerald-400 hover:underline">
                  Dismiss
                </button>
              </div>
            )}

            {/* Athlete Profile Card */}
            <div className="bg-[#162032] border border-white/10 rounded-2xl p-5 mb-8 flex flex-wrap items-center justify-between gap-6 shadow-xl">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center text-xl">
                  🏋️
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">{plan.user.name}</h2>
                  <p className="text-xs text-slate-400">
                    {plan.user.age} years old • {plan.user.weight} kg • Plan #{plan.id}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 flex-wrap">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Goal</span>
                  <span className="text-sm font-semibold text-emerald-400">{plan.user.goal}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Intensity</span>
                  <span className="text-sm font-semibold text-blue-400">{plan.user.intensity}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Experience</span>
                  <span className="text-sm font-semibold text-slate-200">{plan.user.experience}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Environment</span>
                  <span className="text-sm font-semibold text-slate-200">{plan.user.preferences}</span>
                </div>
              </div>
            </div>

            {/* Weekly Schedule Days Grid */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-extrabold tracking-tight">Weekly Schedule (Days 1 – 7)</h2>
                <span className="text-xs text-slate-400 bg-[#162032] border border-white/10 px-3 py-1 rounded-full">
                  Evidence-Based Periodization
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {plan.plan_data.days.map((day) => (
                  <div
                    key={day.day}
                    className="bg-[#162032] border border-white/10 rounded-2xl overflow-hidden flex flex-col hover:border-white/20 transition shadow-lg"
                  >
                    {/* Day Header */}
                    <div className="bg-[#111827] px-5 py-3.5 border-b border-white/10 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-extrabold text-emerald-400">
                          {day.day_name || `Day ${day.day}`}
                        </span>
                        <h3 className="font-bold text-sm text-white mt-0.5 line-clamp-1">{day.focus}</h3>
                      </div>
                    </div>

                    {/* Day Content */}
                    <div className="p-5 flex-1 flex flex-col gap-4 text-xs">
                      {/* Warm-Up */}
                      {day.warmup && day.warmup.length > 0 && (
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                            Warm-Up
                          </span>
                          <ul className="space-y-1">
                            {day.warmup.map((step, idx) => (
                              <li key={idx} className="text-slate-300 flex items-start gap-1.5 leading-relaxed">
                                <span className="text-blue-400">•</span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Exercises */}
                      {day.exercises && day.exercises.length > 0 && (
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                            Exercises
                          </span>
                          <div className="space-y-1.5">
                            {day.exercises.map((ex, idx) => {
                              const params = [];
                              if (ex.sets) params.push(`${ex.sets} sets`);
                              if (ex.reps) params.push(`${ex.reps}`);
                              if (ex.duration) params.push(`${ex.duration}`);
                              return (
                                <div
                                  key={idx}
                                  className="bg-[#111827] border border-white/5 rounded-lg p-2.5 flex items-center justify-between gap-2"
                                >
                                  <span className="font-medium text-slate-200">{ex.name}</span>
                                  <span className="text-[11px] font-semibold text-emerald-400 flex-shrink-0">
                                    {params.join(' • ')}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Cool-Down */}
                      {day.cooldown && day.cooldown.length > 0 && (
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                            Cool-Down
                          </span>
                          <ul className="space-y-1">
                            {day.cooldown.map((step, idx) => (
                              <li key={idx} className="text-slate-300 flex items-start gap-1.5 leading-relaxed">
                                <span className="text-blue-400">•</span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Day Footer Rest Note */}
                    {day.rest_note && (
                      <div className="bg-black/20 border-t border-white/5 px-5 py-2.5 text-[11px] text-slate-400 flex items-start gap-2">
                        <span>💡</span>
                        <span>{day.rest_note}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Nutrition & Recovery Guidance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              {/* Nutrition */}
              <div className="bg-[#162032] border border-white/10 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-xl">
                    🥗
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">Nutrition Strategy</h3>
                    <p className="text-xs text-slate-400">Macronutrients & meal fueling</p>
                  </div>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {plan.nutrition_tip || plan.plan_data.nutrition_tip}
                </p>
              </div>

              {/* Recovery */}
              <div className="bg-[#162032] border border-white/10 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-xl">
                    💤
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">Recovery & Sleep Protocol</h3>
                    <p className="text-xs text-slate-400">Tissue repair & nervous system regulation</p>
                  </div>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {plan.recovery_tip || plan.plan_data.recovery_tip}
                </p>
              </div>
            </div>

            {/* Feedback & Plan Regeneration */}
            <div className="bg-gradient-to-br from-[#162032] to-[#1c293f] border border-blue-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 block mb-1">
                AI Plan Optimization
              </span>
              <h2 className="text-xl font-extrabold text-white mb-1">Improve Your Plan</h2>
              <p className="text-xs sm:text-sm text-slate-400 mb-5">
                Tell FitBuddy what you want to change (e.g. <em>"More cardio"</em>, <em>"More rest days"</em>, <em>"Focus more on legs"</em>, or <em>"Only bodyweight exercises"</em>).
              </p>

              {feedbackError && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{feedbackError}</span>
                </div>
              )}

              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                <div>
                  <textarea
                    rows={3}
                    placeholder="Tell FitBuddy what you want to change..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    className="w-full bg-[#111827] border border-white/10 rounded-xl p-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4">
                  <button
                    type="submit"
                    disabled={isRegenerating}
                    className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-bold text-sm shadow-md shadow-blue-500/25 flex items-center gap-2 transition disabled:opacity-50"
                  >
                    {isRegenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Optimizing with Gemini AI...</span>
                      </>
                    ) : (
                      <>
                        <RotateCcw className="w-4 h-4" />
                        <span>Regenerate Plan</span>
                      </>
                    )}
                  </button>

                  {/* Quick preset tags */}
                  <div className="flex items-center gap-2 flex-wrap text-xs text-slate-400">
                    <span className="text-[11px] text-slate-500">Quick suggestions:</span>
                    {[
                      { label: '🏃 More Cardio', val: 'Add 15 minutes of cardio after workouts' },
                      { label: '🛌 More Rest Days', val: 'Add more rest days and gentler stretching' },
                      { label: '🦵 Focus on Legs', val: 'Focus more on glutes and leg strength' },
                      { label: '🏠 Bodyweight Only', val: 'Use only bodyweight exercises, no equipment' }
                    ].map((tag) => (
                      <button
                        key={tag.label}
                        type="button"
                        onClick={() => setFeedbackText(tag.val)}
                        className="bg-[#111827] hover:bg-slate-800 border border-white/10 hover:border-white/20 text-slate-300 text-xs px-2.5 py-1 rounded-full transition"
                      >
                        {tag.label}
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            </div>

            {/* Medical Notice */}
            <div className="bg-[#111827] border border-white/10 rounded-xl p-4 text-xs text-slate-400 flex items-start gap-3">
              <span className="text-base flex-shrink-0">⚕️</span>
              <p className="leading-relaxed">
                <strong>Medical Notice:</strong> AI-generated fitness information is general guidance and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a physician before starting any strenuous exercise program.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Plan History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#162032] border border-white/10 rounded-2xl max-w-lg w-full max-h-[80vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-bold text-base text-white">Saved Workout Plans</h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold px-2"
              >
                &times;
              </button>
            </div>
            <div className="p-4 overflow-y-auto space-y-3">
              {historyPlans.map((hp) => (
                <div
                  key={hp.id}
                  onClick={() => {
                    setPlan(hp);
                    setShowHistoryModal(false);
                  }}
                  className="bg-[#111827] hover:bg-[#1f2d45] border border-white/10 rounded-xl p-3.5 cursor-pointer flex items-center justify-between transition"
                >
                  <div>
                    <span className="font-bold text-sm text-white block">
                      Plan #{hp.id} – {hp.user.goal}
                    </span>
                    <span className="text-xs text-slate-400">
                      {hp.user.intensity} intensity • {hp.user.name} ({hp.user.weight}kg)
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    Load
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-white/10 bg-[#111827] py-6 px-4">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <p>&copy; 2026 FitBuddy. Engineered with Python, FastAPI, Google Gemini AI, and SQLite.</p>
          <div className="flex items-center gap-4">
            <a href="/api/health" className="hover:text-slate-300 transition">
              System Health
            </a>
            <a href="/docs" target="_blank" rel="noreferrer" className="hover:text-slate-300 transition">
              OpenAPI Swagger
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
