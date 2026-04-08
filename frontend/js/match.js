// =============================================
// PawMatch - Match Finder Quiz JavaScript
// match.js
// =============================================
// A multi-step quiz that recommends a pet type
// based on the user's lifestyle answers.
// Results are generated dynamically.
// =============================================

// Quiz state
let currentStep = 1;
const totalSteps = 5;
const answers = {};

// ---- Navigate to next step ----
function nextStep(step) {
  // Get current answer
  const questionName = `q${step}`;
  const selected = document.querySelector(`input[name="${questionName}"]:checked`);

  if (!selected) {
    showToast("Please select an answer before continuing", "warning");
    return;
  }

  answers[questionName] = selected.value;

  // Hide current step
  document.getElementById(`step${step}`).style.display = "none";

  // Show next step or results
  if (step < totalSteps) {
    currentStep = step + 1;
    document.getElementById(`step${currentStep}`).style.display = "block";
    updateProgressBar();
  } else {
    showResults();
  }
}

// ---- Go back a step ----
function prevStep(step) {
  document.getElementById(`step${step}`).style.display = "none";
  currentStep = step - 1;
  document.getElementById(`step${currentStep}`).style.display = "block";
  updateProgressBar();
}

// ---- Update progress bar ----
function updateProgressBar() {
  const progress = ((currentStep - 1) / totalSteps) * 100;
  const bar = document.getElementById("quizProgress");
  if (bar) {
    bar.style.width = progress + "%";
    bar.textContent = `Step ${currentStep} of ${totalSteps}`;
  }

  // Update step counter text
  const counter = document.getElementById("stepCounter");
  if (counter) counter.textContent = `Question ${currentStep} of ${totalSteps}`;
}

// ---- Calculate and show results ----
function showResults() {
  // Simple scoring logic
  const scores = { Dog: 0, Cat: 0, Rabbit: 0, Bird: 0, Fish: 0 };

  // Q1: How active are you?
  if (answers.q1 === "very-active") { scores.Dog += 3; }
  else if (answers.q1 === "moderately-active") { scores.Dog += 1; scores.Cat += 1; scores.Rabbit += 1; }
  else { scores.Cat += 3; scores.Fish += 2; scores.Rabbit += 2; }

  // Q2: How much time do you have per day?
  if (answers.q2 === "lots") { scores.Dog += 3; scores.Bird += 1; }
  else if (answers.q2 === "some") { scores.Cat += 2; scores.Dog += 1; scores.Rabbit += 2; }
  else { scores.Fish += 3; scores.Cat += 2; }

  // Q3: Where do you live?
  if (answers.q3 === "house-yard") { scores.Dog += 3; }
  else if (answers.q3 === "apartment") { scores.Cat += 2; scores.Rabbit += 2; scores.Bird += 2; }
  else { scores.Fish += 3; scores.Cat += 1; }

  // Q4: Do you have children?
  if (answers.q4 === "yes-young") { scores.Dog += 2; scores.Rabbit += 1; }
  else if (answers.q4 === "yes-old") { scores.Dog += 2; scores.Cat += 2; scores.Rabbit += 2; }
  else { scores.Cat += 1; scores.Bird += 1; }

  // Q5: Experience with pets?
  if (answers.q5 === "experienced") { scores.Dog += 2; scores.Cat += 1; }
  else if (answers.q5 === "some") { scores.Cat += 2; scores.Rabbit += 2; }
  else { scores.Fish += 3; scores.Cat += 2; }

  // Find the top match
  const topPet = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];

  // Pet recommendation data
  const recommendations = {
    Dog: {
      emoji: "🐶",
      title: "You're a Dog Person!",
      description: "You have the energy, space, and time for a loyal canine companion. Dogs thrive with active owners like you! They'll be your best friend, workout buddy, and protector.",
      traits: ["Loyal & loving", "Great for active lifestyles", "Good with families", "Needs daily walks"],
      tip: "Consider adopting from a shelter — many wonderful dogs need homes!",
    },
    Cat: {
      emoji: "🐱",
      title: "You're a Cat Person!",
      description: "Your lifestyle is a perfect match for a graceful, independent feline. Cats are low-maintenance, affectionate on their terms, and ideal for apartment living.",
      traits: ["Independent & clean", "Perfect for apartments", "Low maintenance", "Quiet companions"],
      tip: "Cats are great for busy people — they're happy to nap while you work!",
    },
    Rabbit: {
      emoji: "🐰",
      title: "A Rabbit is Your Match!",
      description: "Rabbits are gentle, quiet, and surprisingly affectionate pets. They're perfect for small spaces and families with older children.",
      traits: ["Quiet & gentle", "Litter trainable", "Low space needed", "Long lifespan (8-12 years)"],
      tip: "Rabbits need space to hop around — a bunny-proofed room is ideal!",
    },
    Bird: {
      emoji: "🐦",
      title: "A Bird is Your Match!",
      description: "Birds are social, intelligent, and entertaining companions. They don't need outdoor walks but love interaction and stimulation.",
      traits: ["Social & vocal", "Low space needed", "Interactive", "Apartment-friendly"],
      tip: "Parrots and budgies can learn to talk! Great for social households.",
    },
    Fish: {
      emoji: "🐠",
      title: "Fish are Your Match!",
      description: "For a relaxing and beautiful pet experience, fish are ideal. They're low-maintenance, therapeutic to watch, and perfect for busy schedules.",
      traits: ["Very low maintenance", "Therapeutic", "No walks needed", "Budget-friendly"],
      tip: "A well-maintained aquarium is actually one of the most stress-relieving home additions!",
    },
  };

  const rec = recommendations[topPet];

  // Hide quiz steps, show results
  for (let i = 1; i <= totalSteps; i++) {
    const el = document.getElementById(`step${i}`);
    if (el) el.style.display = "none";
  }
  document.getElementById("quizIntro")?.style.setProperty("display", "none", "important");

  const resultsEl = document.getElementById("quizResults");
  if (resultsEl) {
    resultsEl.style.display = "block";
    resultsEl.innerHTML = `
      <div class="text-center mb-4">
        <div style="font-size:5rem; animation: bounceIn 0.6s ease">${rec.emoji}</div>
        <h2 class="fw-900 mt-2" style="font-size:2rem">${rec.title}</h2>
        <p class="text-muted" style="font-size:1rem; max-width:500px; margin:0 auto">${rec.description}</p>
      </div>

      <div class="row g-3 mb-4">
        ${rec.traits.map(trait => `
          <div class="col-6">
            <div style="background:#f8f9fa; border-radius:10px; padding:12px 16px; font-size:0.9rem;">
              ✅ ${trait}
            </div>
          </div>`).join("")}
      </div>

      <div class="alert" style="background:#fff3e0; border:1px solid #ffe0b2; border-radius:12px; font-size:0.9rem;">
        💡 <strong>Pro Tip:</strong> ${rec.tip}
      </div>

      <div class="text-center mt-4">
        <a href="./pets.html?type=${topPet}" class="btn btn-primary-pawmatch me-2">
          🔍 Browse ${topPet}s Available
        </a>
        <a href="./pawswipe.html" class="btn btn-outline-pawmatch me-2">
          🐾 Try PawSwipe
        </a>
        <button class="btn btn-outline-secondary" onclick="restartQuiz()">
          🔄 Retake Quiz
        </button>
      </div>`;
  }

  // Update progress bar to 100%
  const bar = document.getElementById("quizProgress");
  if (bar) { bar.style.width = "100%"; bar.textContent = "Complete!"; }
}

// ---- Restart quiz ----
function restartQuiz() {
  // Reset all answers
  Object.keys(answers).forEach(k => delete answers[k]);
  currentStep = 1;

  // Clear radio selections
  document.querySelectorAll('input[type="radio"]').forEach(r => r.checked = false);

  // Hide results, show intro
  document.getElementById("quizResults").style.display = "none";

  const intro = document.getElementById("quizIntro");
  if (intro) intro.style.display = "block";

  // Show step 1
  for (let i = 1; i <= totalSteps; i++) {
    const el = document.getElementById(`step${i}`);
    if (el) el.style.display = i === 1 ? "block" : "none";
  }

  updateProgressBar();
}

// ---- Initialize ----
document.addEventListener("DOMContentLoaded", function () {
  const quizContainer = document.getElementById("quizContainer");
  if (!quizContainer) return;

  // Start quiz button
  const startBtn = document.getElementById("startQuizBtn");
  if (startBtn) {
    startBtn.addEventListener("click", function () {
      document.getElementById("quizIntro").style.display = "none";
      document.getElementById("step1").style.display = "block";
      updateProgressBar();
    });
  }
});
