// FitBuddy – Frontend Client Logic

document.addEventListener('DOMContentLoaded', () => {
  initFormPage();
  initDashboardPage();
});

// --- Form Page Handler ---
function initFormPage() {
  const form = document.getElementById('workout-form');
  const btnDemo = document.getElementById('btn-load-demo');
  if (!form) return;

  // Demo data prefiller
  if (btnDemo) {
    btnDemo.addEventListener('click', () => {
      document.getElementById('name').value = 'Kavin';
      document.getElementById('age').value = '20';
      document.getElementById('weight').value = '65';
      
      const goalRadio = document.querySelector('input[name="goal"][value="Muscle Gain"]');
      if (goalRadio) goalRadio.checked = true;

      const intensityRadio = document.querySelector('input[name="intensity"][value="Medium"]');
      if (intensityRadio) intensityRadio.checked = true;

      const expSelect = document.getElementById('experience');
      if (expSelect) expSelect.value = 'Beginner';

      const prefSelect = document.getElementById('preferences');
      if (prefSelect) prefSelect.value = 'Home workout';

      // Clear any errors
      document.querySelectorAll('.field-error').forEach(el => el.classList.remove('show'));
      const errorBox = document.getElementById('form-error-alert');
      if (errorBox) errorBox.style.display = 'none';
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Client-side validation
    let isValid = true;
    const nameInput = document.getElementById('name');
    const ageInput = document.getElementById('age');
    const weightInput = document.getElementById('weight');
    const goalInput = document.querySelector('input[name="goal"]:checked');
    const intensityInput = document.querySelector('input[name="intensity"]:checked');
    const experienceInput = document.getElementById('experience');
    const preferencesInput = document.getElementById('preferences');

    // Reset errors
    document.querySelectorAll('.field-error').forEach(el => {
      el.textContent = '';
      el.classList.remove('show');
    });
    const errorAlert = document.getElementById('form-error-alert');
    if (errorAlert) errorAlert.style.display = 'none';

    // Validate Name
    if (!nameInput.value.trim()) {
      showFieldError('name-error', 'Please enter your name.');
      isValid = false;
    }

    // Validate Age
    const age = parseInt(ageInput.value, 10);
    if (isNaN(age) || age < 12 || age > 100) {
      showFieldError('age-error', 'Age must be between 12 and 100 years.');
      isValid = false;
    }

    // Validate Weight
    const weight = parseFloat(weightInput.value);
    if (isNaN(weight) || weight < 20 || weight > 400) {
      showFieldError('weight-error', 'Weight must be between 20kg and 400kg.');
      isValid = false;
    }

    if (!goalInput) {
      showFieldError('goal-error', 'Please select a fitness goal.');
      isValid = false;
    }

    if (!intensityInput) {
      showFieldError('intensity-error', 'Please select an intensity level.');
      isValid = false;
    }

    if (!isValid) return;

    // Payload
    const payload = {
      name: nameInput.value.trim(),
      age: age,
      weight: weight,
      goal: goalInput.value,
      intensity: intensityInput.value,
      experience: experienceInput ? experienceInput.value : 'Beginner',
      preferences: preferencesInput ? preferencesInput.value : 'Home workout'
    };

    // UI Loading state
    const submitBtn = document.getElementById('btn-submit-plan');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnSpinner = submitBtn.querySelector('.btn-spinner');

    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnSpinner.style.display = 'inline-flex';

    try {
      const response = await fetch('/api/workout/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to generate plan.');
      }

      const planResult = await response.json();
      // Store current plan in session / local storage for fast render
      localStorage.setItem('fitbuddy_current_plan', JSON.stringify(planResult));
      localStorage.setItem('fitbuddy_current_user_id', planResult.user_id);

      // Redirect to dashboard with plan_id
      window.location.href = `/dashboard?plan_id=${planResult.id}`;

    } catch (err) {
      console.error(err);
      if (errorAlert) {
        errorAlert.textContent = `Error: ${err.message}`;
        errorAlert.style.display = 'block';
      }
      submitBtn.disabled = false;
      btnText.style.display = 'inline';
      btnSpinner.style.display = 'none';
    }
  });
}

function showFieldError(elemId, message) {
  const el = document.getElementById(elemId);
  if (el) {
    el.textContent = message;
    el.classList.add('show');
  }
}

// --- Dashboard Page Handler ---
function initDashboardPage() {
  const daysContainer = document.getElementById('days-container');
  if (!daysContainer) return;

  const urlParams = new URLSearchParams(window.location.search);
  const planIdFromUrl = urlParams.get('plan_id') || document.body.getAttribute('data-plan-id');

  let currentPlan = null;

  // Print button
  const btnPrint = document.getElementById('btn-print-plan');
  if (btnPrint) {
    btnPrint.addEventListener('click', () => window.print());
  }

  // Quick tag buttons for feedback
  document.querySelectorAll('.tag-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tagText = btn.getAttribute('data-tag');
      const textarea = document.getElementById('feedback-input');
      if (textarea) {
        textarea.value = tagText;
        textarea.focus();
      }
    });
  });

  // History modal handler
  const btnHistory = document.getElementById('btn-view-history');
  const historyModal = document.getElementById('history-modal');
  const btnCloseModal = document.getElementById('btn-close-modal');

  if (btnHistory && historyModal) {
    btnHistory.addEventListener('click', async () => {
      historyModal.style.display = 'flex';
      await loadUserHistory(currentPlan ? currentPlan.user_id : null);
    });

    btnCloseModal.addEventListener('click', () => {
      historyModal.style.display = 'none';
    });

    historyModal.addEventListener('click', (e) => {
      if (e.target === historyModal) historyModal.style.display = 'none';
    });
  }

  // Load initial plan
  if (planIdFromUrl) {
    fetchPlanById(planIdFromUrl);
  } else {
    // Check localStorage fallback
    const cached = localStorage.getItem('fitbuddy_current_plan');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        renderPlan(parsed);
        currentPlan = parsed;
        updateHistoryCount(parsed.user_id);
      } catch (e) {
        loadDefaultSamplePlan();
      }
    } else {
      loadDefaultSamplePlan();
    }
  }

  // Feedback form submission
  const feedbackForm = document.getElementById('feedback-form');
  if (feedbackForm) {
    feedbackForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const feedbackInput = document.getElementById('feedback-input');
      const feedbackText = feedbackInput.value.trim();
      const errorAlert = document.getElementById('feedback-error-alert');

      if (!feedbackText) {
        if (errorAlert) {
          errorAlert.textContent = 'Please enter changes you want in your workout plan.';
          errorAlert.style.display = 'block';
        }
        return;
      }
      if (errorAlert) errorAlert.style.display = 'none';

      if (!currentPlan || !currentPlan.id) {
        if (errorAlert) {
          errorAlert.textContent = 'Please create a plan first before requesting revisions.';
          errorAlert.style.display = 'block';
        }
        return;
      }

      const btnRegen = document.getElementById('btn-regenerate');
      const btnText = btnRegen.querySelector('.btn-text');
      const btnSpinner = btnRegen.querySelector('.btn-spinner');

      btnRegen.disabled = true;
      btnText.style.display = 'none';
      btnSpinner.style.display = 'inline-flex';

      try {
        const response = await fetch(`/api/workout/${currentPlan.id}/feedback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ feedback_text: feedbackText })
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.detail || 'Failed to regenerate plan.');
        }

        const feedbackResult = await response.json();
        const updatedPlan = feedbackResult.updated_plan;

        currentPlan = updatedPlan;
        localStorage.setItem('fitbuddy_current_plan', JSON.stringify(updatedPlan));

        // Re-render dashboard without page reload
        renderPlan(updatedPlan);

        // Show banner
        const banner = document.getElementById('updated-plan-banner');
        if (banner) {
          banner.style.display = 'block';
          banner.scrollIntoView({ behavior: 'smooth' });
        }

        // Reset feedback form
        feedbackInput.value = '';
        updateHistoryCount(updatedPlan.user_id);

      } catch (err) {
        console.error(err);
        if (errorAlert) {
          errorAlert.textContent = `Error: ${err.message}`;
          errorAlert.style.display = 'block';
        }
      } finally {
        btnRegen.disabled = false;
        btnText.style.display = 'inline';
        btnSpinner.style.display = 'none';
      }
    });
  }

  async function fetchPlanById(id) {
    try {
      const response = await fetch(`/api/workout/${id}`);
      if (!response.ok) throw new Error('Could not find plan.');
      const data = await response.json();
      currentPlan = data;
      localStorage.setItem('fitbuddy_current_plan', JSON.stringify(data));
      renderPlan(data);
      updateHistoryCount(data.user_id);
    } catch (e) {
      console.warn('Could not load plan by ID. Loading sample.', e);
      loadDefaultSamplePlan();
    }
  }

  async function loadDefaultSamplePlan() {
    // Generate a default preview plan for demonstration
    const sample = {
      id: 1,
      user_id: 1,
      user: {
        name: "Kavin (Demo)",
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
            focus: "Chest, Shoulders & Triceps (Push Volume)",
            warmup: ["Arm rotations & neck mobility (60s)", "Jumping jacks (2 mins)", "Inchworm pushups (5 reps)"],
            exercises: [
              { name: "Push-Ups (Chest Focus)", sets: 3, reps: "10-12 reps", duration: null },
              { name: "Pike Push-Ups (Shoulders)", sets: 3, reps: "8-10 reps", duration: null },
              { name: "Bench / Chair Triceps Dips", sets: 3, reps: "10-12 reps", duration: null },
              { name: "Plank Shoulder Taps", sets: 3, reps: null, duration: "30s" }
            ],
            cooldown: ["Chest doorway stretch (45s)", "Child's pose deep breathing (60s)"],
            rest_note: "Drink water and get 25-30g protein post-workout."
          },
          {
            day: 2,
            day_name: "Tuesday / Day 2",
            focus: "Leg Hypertrophy & Core Power",
            warmup: ["Bodyweight air squats (15 reps)", "Hip openers & glute bridges (12 reps)"],
            exercises: [
              { name: "Backpack / Goblet Squats", sets: 3, reps: "12 reps", duration: null },
              { name: "Walking Lunges", sets: 3, reps: "10 reps/leg", duration: null },
              { name: "Single-Leg Romanian Deadlift", sets: 3, reps: "10 reps/leg", duration: null },
              { name: "Calf Raises on Ledge", sets: 3, reps: "20 reps", duration: null },
              { name: "Bicycle Crunches", sets: 3, reps: "20 total", duration: null }
            ],
            cooldown: ["Standing quadriceps stretch (30s each)", "Seated hamstring reach (45s)"],
            rest_note: "Focus on deep quad stretch and calf recovery."
          },
          {
            day: 3,
            day_name: "Wednesday / Day 3",
            focus: "Active Recovery, Mobility & Core Flow",
            warmup: ["Gentle spinal circles (60s)", "Dynamic wrist and shoulder openers (2 mins)"],
            exercises: [
              { name: "Brisk Outdoor Walk / Light Cardio", sets: 1, reps: null, duration: "30 mins" },
              { name: "Bird-Dog Core Stability Hold", sets: 3, reps: "10 reps/side", duration: null },
              { name: "World's Greatest Stretch", sets: 3, reps: "5 reps/side", duration: null }
            ],
            cooldown: ["Supine twist (60s each)", "Diaphragmatic box breathing (3 mins)"],
            rest_note: "Active recovery accelerates tissue oxygenation and glycogen replenishment."
          },
          {
            day: 4,
            day_name: "Thursday / Day 4",
            focus: "Back, Biceps & Posterior Chain (Pull Focus)",
            warmup: ["Cat-Cow spinal waves (60s)", "Band pull-aparts or towel rows (2 mins)"],
            exercises: [
              { name: "Inverted Table / Towel Rows", sets: 3, reps: "8-10 reps", duration: null },
              { name: "Backpack Bicep Curls", sets: 3, reps: "12 reps", duration: null },
              { name: "Prone Cobra / Superman Hold", sets: 3, reps: "12 reps", duration: "10s hold" },
              { name: "Hollow Body Core Hold", sets: 3, reps: null, duration: "30s" }
            ],
            cooldown: ["Lat stretch against wall (45s)", "Cross-body shoulder stretch (30s)"],
            rest_note: "Squeeze the shoulder blades at peak contraction."
          },
          {
            day: 5,
            day_name: "Friday / Day 5",
            focus: "Full Body Dynamic Functional Circuit",
            warmup: ["Light jog in place (2 mins)", "High knees and butt kicks (60s)"],
            exercises: [
              { name: "Squat to Overhead Reach", sets: 3, reps: "12 reps", duration: null },
              { name: "Diamond Push-Ups (or Knee)", sets: 3, reps: "8-10 reps", duration: null },
              { name: "Bulgarian Split Squats", sets: 3, reps: "8 reps/leg", duration: null },
              { name: "Mountain Climbers", sets: 3, reps: null, duration: "35s" }
            ],
            cooldown: ["Downward Dog to Cobra flow (2 mins)", "Child's pose (90s)"],
            rest_note: "Finish the training week with explosive control."
          },
          {
            day: 6,
            day_name: "Saturday / Day 6",
            focus: "Core Conditioning & High-Intensity Burst",
            warmup: ["Arm sweeps, torso twists (2 mins)", "Seal claps (60s)"],
            exercises: [
              { name: "Burpees (Low or High Impact)", sets: 3, reps: "10 reps", duration: null },
              { name: "Russian Twists", sets: 3, reps: "20 twists", duration: null },
              { name: "Jump Squats / Rapid Air Squats", sets: 3, reps: "12 reps", duration: null },
              { name: "Forearm Plank", sets: 3, reps: null, duration: "45s" }
            ],
            cooldown: ["Hamstring stretch (60s)", "Glute pigeon stretch (45s each)"],
            rest_note: "Hydrate with sodium and potassium minerals."
          },
          {
            day: 7,
            day_name: "Sunday / Day 7",
            focus: "Complete Rest & Restoration",
            warmup: ["Morning sun salutations (5 mins)"],
            exercises: [
              { name: "Leisure Nature Stroll", sets: 1, reps: null, duration: "30-45 mins" },
              { name: "Full Body Gentle Foam Rolling", sets: 1, reps: null, duration: "15 mins" }
            ],
            cooldown: ["Meditation & sleep preparation (5 mins)"],
            rest_note: "Full restorative rest. Prep your nutrition and rest well for the upcoming week."
          }
        ],
        nutrition_tip: "Maintain a moderate caloric surplus (+300 kcal) with 1.8g - 2.0g protein per kg of bodyweight (approx. 120-130g protein daily). Emphasize chicken breast, eggs, lentils, oats, and peanut butter.",
        recovery_tip: "Target 8 hours of uninterrupted sleep. Muscle tissue repairs during stage 3 non-REM and REM sleep cycles. Take warm showers and stretch before bed."
      },
      nutrition_tip: "Maintain a moderate caloric surplus (+300 kcal) with 1.8g - 2.0g protein per kg of bodyweight (approx. 120-130g protein daily). Emphasize chicken breast, eggs, lentils, oats, and peanut butter.",
      recovery_tip: "Target 8 hours of uninterrupted sleep. Muscle tissue repairs during stage 3 non-REM and REM sleep cycles. Take warm showers and stretch before bed."
    };
    currentPlan = sample;
    renderPlan(sample);
  }

  function renderPlan(plan) {
    if (!plan) return;

    // Profile Card
    const user = plan.user || {};
    const profileName = document.getElementById('profile-name');
    const profileMeta = document.getElementById('profile-meta');
    const profileGoal = document.getElementById('profile-goal');
    const profileIntensity = document.getElementById('profile-intensity');
    const profileExp = document.getElementById('profile-experience');
    const profilePref = document.getElementById('profile-pref');

    if (profileName) profileName.textContent = user.name || 'Athlete';
    if (profileMeta) profileMeta.textContent = `${user.age || '—'} years • ${user.weight || '—'} kg • ID #${plan.id}`;
    if (profileGoal) profileGoal.textContent = user.goal || plan.plan_data?.goal || 'General Wellness';
    if (profileIntensity) profileIntensity.textContent = user.intensity || plan.plan_data?.intensity || 'Medium';
    if (profileExp) profileExp.textContent = user.experience || 'Beginner';
    if (profilePref) profilePref.textContent = user.preferences || 'Home workout';

    // Nutrition & Recovery tips
    const nutritionText = document.getElementById('nutrition-tip-text');
    const recoveryText = document.getElementById('recovery-tip-text');

    if (nutritionText) {
      nutritionText.textContent = plan.nutrition_tip || plan.plan_data?.nutrition_tip || 'Focus on balanced whole foods and hydration.';
    }
    if (recoveryText) {
      recoveryText.textContent = plan.recovery_tip || plan.plan_data?.recovery_tip || 'Prioritize 7-8 hours of quality sleep and stretching.';
    }

    // Days Grid
    const daysData = plan.plan_data?.days || [];
    daysContainer.innerHTML = '';

    if (!daysData.length) {
      daysContainer.innerHTML = '<div class="alert-box alert-error">No day schedule found in plan data.</div>';
      return;
    }

    daysData.forEach(day => {
      const card = createDayCard(day);
      daysContainer.appendChild(card);
    });
  }

  function createDayCard(day) {
    const card = document.createElement('div');
    card.className = 'day-card';

    const dayName = day.day_name || `Day ${day.day}`;
    const focus = day.focus || 'Workout Session';

    let warmupHtml = '';
    if (day.warmup && day.warmup.length > 0) {
      warmupHtml = `
        <div class="day-sub-section">
          <div class="day-sub-heading">Warm-Up</div>
          <ul class="routine-list">
            ${day.warmup.map(item => `
              <li class="routine-item">
                <span class="bullet-dot">•</span>
                <span>${escapeHtml(item)}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      `;
    }

    let exercisesHtml = '';
    if (day.exercises && day.exercises.length > 0) {
      exercisesHtml = `
        <div class="day-sub-section">
          <div class="day-sub-heading">Exercises</div>
          <div class="exercise-list">
            ${day.exercises.map(ex => {
              let params = [];
              if (ex.sets) params.push(`${ex.sets} sets`);
              if (ex.reps) params.push(`${ex.reps}`);
              if (ex.duration) params.push(`${ex.duration}`);
              const paramStr = params.join(' • ');

              return `
                <div class="exercise-card">
                  <div class="ex-info">
                    <span class="ex-name">${escapeHtml(ex.name)}</span>
                    <span class="ex-params">${escapeHtml(paramStr)}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    let cooldownHtml = '';
    if (day.cooldown && day.cooldown.length > 0) {
      cooldownHtml = `
        <div class="day-sub-section">
          <div class="day-sub-heading">Cool-Down</div>
          <ul class="routine-list">
            ${day.cooldown.map(item => `
              <li class="routine-item">
                <span class="bullet-dot">•</span>
                <span>${escapeHtml(item)}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      `;
    }

    let restFooter = '';
    if (day.rest_note) {
      restFooter = `
        <div class="day-footer">
          <span>💡</span>
          <span>${escapeHtml(day.rest_note)}</span>
        </div>
      `;
    }

    card.innerHTML = `
      <div class="day-header">
        <div>
          <span class="day-number-tag">${escapeHtml(dayName)}</span>
          <h3 class="day-focus-title">${escapeHtml(focus)}</h3>
        </div>
      </div>
      <div class="day-body">
        ${warmupHtml}
        ${exercisesHtml}
        ${cooldownHtml}
      </div>
      ${restFooter}
    `;

    return card;
  }

  async function updateHistoryCount(userId) {
    if (!userId) return;
    try {
      const res = await fetch(`/api/users/${userId}/plans`);
      if (res.ok) {
        const plans = await res.json();
        const countSpan = document.getElementById('history-count');
        if (countSpan) countSpan.textContent = plans.length;
      }
    } catch (e) {
      // quiet fail
    }
  }

  async function loadUserHistory(userId) {
    const modalBody = document.getElementById('history-modal-body');
    if (!modalBody) return;

    if (!userId) {
      modalBody.innerHTML = '<p class="text-muted">No user profile selected. Generate a plan first!</p>';
      return;
    }

    modalBody.innerHTML = '<div class="spinner-circle"></div> Fetching saved plans...';

    try {
      const res = await fetch(`/api/users/${userId}/plans`);
      if (!res.ok) throw new Error('Could not load plan history.');
      const plans = await res.json();

      if (!plans.length) {
        modalBody.innerHTML = '<p class="text-muted">No previous plans found.</p>';
        return;
      }

      modalBody.innerHTML = plans.map(p => {
        const dateStr = new Date(p.created_at).toLocaleDateString(undefined, {
          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
        const goal = p.plan_data?.goal || 'Workout Plan';
        const intensity = p.plan_data?.intensity || 'Medium';

        return `
          <div class="history-item" onclick="selectHistoryPlan(${p.id})">
            <div>
              <strong>Plan #${p.id} – ${escapeHtml(goal)}</strong>
              <div style="font-size: 0.8rem; color: #94a3b8;">${escapeHtml(intensity)} intensity • ${dateStr}</div>
            </div>
            <button class="btn btn-outline btn-sm">Load</button>
          </div>
        `;
      }).join('');
    } catch (e) {
      modalBody.innerHTML = `<p class="alert-error">Failed: ${e.message}</p>`;
    }
  }
}

// Global hook for history item selection
window.selectHistoryPlan = async function(planId) {
  const modal = document.getElementById('history-modal');
  if (modal) modal.style.display = 'none';

  try {
    const res = await fetch(`/api/workout/${planId}`);
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('fitbuddy_current_plan', JSON.stringify(data));
      window.location.href = `/dashboard?plan_id=${planId}`;
    }
  } catch (e) {
    alert('Failed to load plan: ' + e.message);
  }
};

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
