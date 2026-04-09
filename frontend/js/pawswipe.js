// =============================================
// PawMatch - PawSwipe Feature JavaScript
// pawswipe.js
// =============================================
// The main Tinder-style swipe feature.
// Pets are loaded via AJAX (AJAX Call #3).
// Swipe left = skip, swipe right = like/save.
// Liked pets are stored in localStorage.
// =============================================

let swipePets = [];       // All pets loaded for swiping
let currentIndex = 0;     // Which pet we are currently showing
let isDragging = false;   // Is the user currently dragging?
let startX = 0;           // Starting X position of drag
let currentX = 0;         // Current X position while dragging

// ---- Load pets from backend for swiping ----
// This is AJAX Call #3 as required by the PRD
async function loadSwipePets() {
  const container = document.getElementById("swipeContainer");
  const loadingDiv = document.getElementById("swipeLoading");

  if (!container) return;

  if (loadingDiv) loadingDiv.style.display = "flex";

  try {
    const response = await fetch(`${API_BASE}/pets`);
    swipePets = await response.json();
    currentIndex = 0;

    if (loadingDiv) loadingDiv.style.display = "none";

    if (swipePets.length === 0) {
      showEmptyState();
      return;
    }

    buildSwipeCards();
    updateCounter();
  } catch (err) {
    if (loadingDiv) loadingDiv.style.display = "none";
    console.error("Error loading swipe pets:", err);
    container.innerHTML = `
      <div class="swipe-empty">
        <span class="empty-icon">⚠️</span>
        <h3>Could not load pets</h3>
        <p class="text-muted">Make sure the backend server is running.</p>
      </div>`;
  }
}

// ---- Build the swipe card stack ----
// Shows top 3 cards (stacked visually)
function buildSwipeCards() {
  const container = document.getElementById("swipeContainer");
  container.innerHTML = "";

  // Show up to 3 cards in the stack
  const toShow = swipePets.slice(currentIndex, currentIndex + 3);

  if (toShow.length === 0) {
    showEmptyState();
    return;
  }

  // Build cards in reverse order so the first shows on top
  [...toShow].reverse().forEach((pet, i) => {
    const card = createSwipeCard(pet);
    container.appendChild(card);
  });

  // Add drag events to the top card
  const topCard = container.lastElementChild;
  if (topCard) {
    addDragEvents(topCard);
  }
}

// ---- Create a single swipe card element ----
function createSwipeCard(pet) {
  const card = document.createElement("div");
  card.className = "swipe-card";
  card.dataset.petId = pet.id;
  card.dataset.petData = JSON.stringify(pet);

  card.innerHTML = `
    <div class="swipe-label swipe-label-like" id="label-like-${pet.id}">LIKE</div>
    <div class="swipe-label swipe-label-nope" id="label-nope-${pet.id}">NOPE</div>

    <div class="swipe-distance-badge">
      <span class="material-symbols-outlined" style="font-size:12px;font-variation-settings:'FILL' 1">location_on</span>
      ${pet.location || "Nearby"}
    </div>

    <img class="swipe-card-img"
      src="${pet.image}"
      alt="${pet.name}"
      onerror="this.src='https://placehold.co/400x520/e9e8e4/aaa?text=No+Image'"
      draggable="false">

    <div class="swipe-card-info">
      <div class="swipe-card-name">
        ${pet.name}
        <span class="swipe-card-age">, ${pet.age}</span>
      </div>
      <div class="swipe-card-breed">${pet.breed || pet.type}</div>
      <div class="swipe-card-badges">
        <span class="swipe-badge swipe-badge-type">${pet.type}</span>
        ${pet.energyLevel ? `<span class="swipe-badge swipe-badge-energy">${pet.energyLevel}</span>` : ""}
        ${pet.vaccinated ? '<span class="swipe-badge swipe-badge-type">✓ Vaccinated</span>' : ""}
        ${pet.goodWithKids ? '<span class="swipe-badge swipe-badge-energy">Kid-friendly</span>' : ""}
      </div>
    </div>`;

  return card;
}

// ---- Add mouse + touch drag events to a card ----
function addDragEvents(card) {
  // Mouse events (desktop)
  card.addEventListener("mousedown", dragStart);
  card.addEventListener("mousemove", dragMove);
  card.addEventListener("mouseup", dragEnd);
  card.addEventListener("mouseleave", dragEnd);

  // Touch events (mobile)
  card.addEventListener("touchstart", dragStart, { passive: true });
  card.addEventListener("touchmove", dragMove, { passive: true });
  card.addEventListener("touchend", dragEnd);
}

function dragStart(e) {
  isDragging = true;
  startX = e.type === "mousedown" ? e.clientX : e.touches[0].clientX;
  this.style.transition = "none"; // Remove transition while dragging
}

function dragMove(e) {
  if (!isDragging) return;

  currentX = (e.type === "mousemove" ? e.clientX : e.touches[0].clientX) - startX;

  // Rotate slightly based on how far we've moved
  const rotation = currentX * 0.1;
  this.style.transform = `translateX(${currentX}px) rotate(${rotation}deg)`;

  // Show LIKE or NOPE label based on direction
  const petId = this.dataset.petId;
  const likeLabel = document.getElementById(`label-like-${petId}`);
  const nopeLabel = document.getElementById(`label-nope-${petId}`);

  if (currentX > 30) {
    if (likeLabel) likeLabel.style.opacity = Math.min((currentX - 30) / 60, 1);
    if (nopeLabel) nopeLabel.style.opacity = 0;
  } else if (currentX < -30) {
    if (nopeLabel) nopeLabel.style.opacity = Math.min((-currentX - 30) / 60, 1);
    if (likeLabel) likeLabel.style.opacity = 0;
  } else {
    if (likeLabel) likeLabel.style.opacity = 0;
    if (nopeLabel) nopeLabel.style.opacity = 0;
  }
}

function dragEnd(e) {
  if (!isDragging) return;
  isDragging = false;

  // Threshold: if moved more than 100px, register as swipe
  if (currentX > 100) {
    swipeRight();
  } else if (currentX < -100) {
    swipeLeft();
  } else {
    // Snap back to center
    this.style.transition = "transform 0.3s ease";
    this.style.transform = "";
    const petId = this.dataset.petId;
    const likeLabel = document.getElementById(`label-like-${petId}`);
    const nopeLabel = document.getElementById(`label-nope-${petId}`);
    if (likeLabel) likeLabel.style.opacity = 0;
    if (nopeLabel) nopeLabel.style.opacity = 0;
  }

  currentX = 0;
}

// ---- Swipe Right: Like this pet ----
async function swipeRight() {
  const container = document.getElementById("swipeContainer");
  const topCard = container.lastElementChild;
  if (!topCard) return;

  const pet = JSON.parse(topCard.dataset.petData);

  // Animate the card flying to the right
  topCard.classList.add("swiped-right");

  try {
    const result = await savePetToMatches(pet);
    if (result?.alreadySaved) {
      showToast(`${pet.name} is already in your matches!`, "info");
    }
  } catch (error) {
    showToast(error?.message || "Could not save this match", "error");
  }

  // Check if it's a strong match (example: dog + high energy = match)
  const user = getCurrentUser();
  const preferences = user?.preferences || {};
  const isMatch =
    preferences.petType && pet.type === preferences.petType;

  if (isMatch) {
    setTimeout(() => showMatchPopup(pet), 300);
  } else {
    showToast(`❤️ You liked ${pet.name}!`, "success");
  }

  // After animation, move to next card
  setTimeout(() => {
    currentIndex++;
    buildSwipeCards();
    updateCounter();
  }, 500);
}

// ---- Swipe Left: Skip this pet ----
function swipeLeft() {
  const container = document.getElementById("swipeContainer");
  const topCard = container.lastElementChild;
  if (!topCard) return;

  const pet = JSON.parse(topCard.dataset.petData);

  // Animate the card flying to the left
  topCard.classList.add("swiped-left");

  showToast(`Skipped ${pet.name}`, "info");

  // After animation, move to next card
  setTimeout(() => {
    currentIndex++;
    buildSwipeCards();
    updateCounter();
  }, 500);
}

// ---- Super Like ----
async function superLike() {
  const container = document.getElementById("swipeContainer");
  const topCard = container.lastElementChild;
  if (!topCard) return;

  const pet = JSON.parse(topCard.dataset.petData);
  try {
    await savePetToMatches(pet, "super-liked");
  } catch (error) {
    showToast(error?.message || "Could not save this match", "error");
  }

  showToast(`⭐ Super Liked ${pet.name}!`, "success");
  showMatchPopup(pet, true);

  topCard.classList.add("swiped-right");
  setTimeout(() => {
    currentIndex++;
    buildSwipeCards();
    updateCounter();
  }, 500);
}

// ---- View Details of current card ----
function viewCurrentPet() {
  const container = document.getElementById("swipeContainer");
  const topCard = container.lastElementChild;
  if (!topCard) return;

  const pet = JSON.parse(topCard.dataset.petData);
  window.location.href = `./pet-details.html?id=${pet.id}`;
}

// ---- Save pet to backend or local fallback ----
function savePetToMatches(pet, action = "liked") {
  return saveMatch(pet, action);
}

// ---- Show Match Popup ----
function showMatchPopup(pet, isSuper = false) {
  const popup = document.getElementById("matchPopup");
  const popupPetName = document.getElementById("matchPetName");
  const popupPetImage = document.getElementById("matchPetImage");

  if (popup && popupPetName) {
    popupPetName.textContent = pet.name;
    if (popupPetImage) popupPetImage.src = pet.image;

    const title = document.getElementById("matchTitle");
    if (title) {
      title.textContent = isSuper ? "⭐ Super Match!" : "🎉 It's a Match!";
    }

    popup.classList.add("show");
  }
}

// ---- Close Match Popup ----
function closeMatchPopup() {
  const popup = document.getElementById("matchPopup");
  if (popup) popup.classList.remove("show");
}

// ---- Update the counter display ----
function updateCounter() {
  const counterEl = document.getElementById("swipeCounter");
  if (!counterEl) return;

  const remaining = swipePets.length - currentIndex;
  counterEl.innerHTML = `
    <strong>${remaining}</strong> pets remaining ·
    <strong>${currentIndex}</strong> viewed`;
}

// ---- Show empty state when no more pets ----
function showEmptyState() {
  const container = document.getElementById("swipeContainer");
  if (!container) return;

  container.innerHTML = `
    <div class="swipe-empty">
      <span class="empty-icon">🐾</span>
      <h3>You've seen all the pets!</h3>
      <p class="text-muted">Check your matches or browse more pets.</p>
      <div class="d-flex gap-2 justify-content-center mt-3">
        <a href="./my-matches.html" class="btn btn-primary-pawmatch">💖 View My Matches</a>
        <button class="btn btn-outline-pawmatch" onclick="restartSwipe()">🔄 Start Over</button>
      </div>
    </div>`;
}

// ---- Restart swipe from beginning ----
function restartSwipe() {
  currentIndex = 0;
  buildSwipeCards();
  updateCounter();
}

// ---- Initialize PawSwipe page ----
document.addEventListener("DOMContentLoaded", function () {
  const swipeContainer = document.getElementById("swipeContainer");
  if (!swipeContainer) return;

  loadSwipePets();

  // Button: Like (swipe right via button click)
  const likeBtn = document.getElementById("btnLike");
  if (likeBtn) likeBtn.addEventListener("click", swipeRight);

  // Button: Dislike (swipe left via button click)
  const dislikeBtn = document.getElementById("btnDislike");
  if (dislikeBtn) dislikeBtn.addEventListener("click", swipeLeft);

  // Button: Super Like
  const superBtn = document.getElementById("btnSuper");
  if (superBtn) superBtn.addEventListener("click", superLike);

  // Button: View details
  const infoBtn = document.getElementById("btnInfo");
  if (infoBtn) infoBtn.addEventListener("click", viewCurrentPet);

  // Match popup close
  const keepSwipingBtn = document.getElementById("keepSwiping");
  if (keepSwipingBtn) keepSwipingBtn.addEventListener("click", closeMatchPopup);

  // Close popup on background click
  const popup = document.getElementById("matchPopup");
  if (popup) {
    popup.addEventListener("click", function (e) {
      if (e.target === popup) closeMatchPopup();
    });
  }
});
