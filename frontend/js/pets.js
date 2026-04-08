// =============================================
// PawMatch - Pets JavaScript
// pets.js
// =============================================
// Handles the Browse Pets page:
// - Loading pets from backend via AJAX
// - Search and filter functionality
// - Rendering pet cards
// =============================================

// Store all loaded pets globally for client-side filtering
let allPets = [];

// ---- Load all pets from the backend ----
// This is AJAX Call #1 as required by the PRD
async function loadPets(filters = {}) {
  const container = document.getElementById("petsContainer");
  const loadingDiv = document.getElementById("petsLoading");
  const countDiv = document.getElementById("petsCount");

  if (!container) return;

  // Show loading spinner
  if (loadingDiv) loadingDiv.style.display = "flex";
  container.innerHTML = "";

  try {
    // Build query string from filters
    const params = new URLSearchParams();
    if (filters.search) params.append("search", filters.search);
    if (filters.type) params.append("type", filters.type);
    if (filters.status) params.append("status", filters.status);
    if (filters.location) params.append("location", filters.location);

    const url = `${API_BASE}/pets${params.toString() ? "?" + params.toString() : ""}`;

    const response = await fetch(url);
    const pets = await response.json();
    allPets = pets;

    if (loadingDiv) loadingDiv.style.display = "none";

    if (pets.length === 0) {
      container.innerHTML = `
        <div class="col-12 text-center py-5">
          <div style="font-size:3rem">🐾</div>
          <h4 class="mt-3">No pets found</h4>
          <p class="text-muted">Try changing your search filters.</p>
        </div>`;
      if (countDiv) countDiv.textContent = "0 pets found";
      return;
    }

    if (countDiv) countDiv.textContent = `${pets.length} pet${pets.length !== 1 ? "s" : ""} found`;

    // Render each pet card
    pets.forEach((pet) => {
      const col = document.createElement("div");
      col.className = "col-md-4 col-sm-6 mb-4";
      col.innerHTML = renderPetCard(pet);
      container.appendChild(col);
    });
  } catch (err) {
    if (loadingDiv) loadingDiv.style.display = "none";
    container.innerHTML = `
      <div class="col-12 text-center py-5">
        <div style="font-size:3rem">⚠️</div>
        <h4 class="mt-3">Could not load pets</h4>
        <p class="text-muted">Make sure the backend server is running on port 5000.</p>
      </div>`;
    console.error("Error loading pets:", err);
  }
}

// ---- Render a single pet card HTML ----
function renderPetCard(pet) {
  const statusBadgeClass = getStatusBadgeClass(pet.status);
  const vaccinatedBadge = pet.vaccinated
    ? '<span class="badge bg-success ms-1" style="font-size:0.7rem">✅ Vaccinated</span>'
    : "";

  return `
    <div class="pet-card h-100">
      <img src="${pet.image}" alt="${pet.name}"
        onerror="this.src='https://placehold.co/400x300/f0f0f0/aaa?text=No+Image'">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-start mb-1">
          <span class="pet-name">${pet.name}</span>
          <span class="badge bg-${statusBadgeClass}">${pet.status}</span>
        </div>
        <div class="pet-breed">${pet.breed} · ${pet.type}</div>
        <div class="pet-tags">
          <span class="pet-tag">📍 ${pet.location}</span>
          <span class="pet-tag">🎂 ${pet.age}</span>
          <span class="pet-tag">${pet.gender === "Male" ? "♂️" : "♀️"} ${pet.gender}</span>
          ${pet.vaccinated ? '<span class="pet-tag" style="background:#e8f5e9;color:#2e7d32">✅ Vaccinated</span>' : ""}
        </div>
        ${pet.status === "Sale" ? `<div class="fw-bold text-warning mb-2">৳ ${pet.price.toLocaleString()}</div>` : ""}
        <p class="text-muted" style="font-size:0.85rem; -webkit-line-clamp:2; display:-webkit-box; -webkit-box-orient:vertical; overflow:hidden;">
          ${pet.description}
        </p>
        <a href="./pet-details.html?id=${pet.id}" class="btn btn-primary-pawmatch btn-sm w-100 mt-2">
          View Profile →
        </a>
      </div>
    </div>`;
}

// ---- Set up filter/search functionality ----
function initFilters() {
  const searchInput = document.getElementById("searchInput");
  const typeFilter = document.getElementById("typeFilter");
  const statusFilter = document.getElementById("statusFilter");
  const locationFilter = document.getElementById("locationFilter");
  const applyBtn = document.getElementById("applyFilters");
  const resetBtn = document.getElementById("resetFilters");

  function applyFilters() {
    loadPets({
      search: searchInput?.value.trim() || "",
      type: typeFilter?.value || "",
      status: statusFilter?.value || "",
      location: locationFilter?.value.trim() || "",
    });
  }

  // Apply filters button click
  if (applyBtn) applyBtn.addEventListener("click", applyFilters);

  // Reset filters
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      if (typeFilter) typeFilter.value = "";
      if (statusFilter) statusFilter.value = "";
      if (locationFilter) locationFilter.value = "";
      loadPets();
    });
  }

  // Live search on Enter key
  if (searchInput) {
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") applyFilters();
    });
  }

  // Sort dropdown
  const sortSelect = document.getElementById("sortPets");
  if (sortSelect) {
    sortSelect.addEventListener("change", function () {
      const sortBy = this.value;
      const container = document.getElementById("petsContainer");
      const cards = Array.from(container.children);

      cards.sort((a, b) => {
        const petA = allPets.find((p) => a.innerHTML.includes(p.name)) || {};
        const petB = allPets.find((p) => b.innerHTML.includes(p.name)) || {};

        if (sortBy === "name-asc") return (petA.name || "").localeCompare(petB.name || "");
        if (sortBy === "name-desc") return (petB.name || "").localeCompare(petA.name || "");
        if (sortBy === "newest") return new Date(petB.createdAt) - new Date(petA.createdAt);
        if (sortBy === "oldest") return new Date(petA.createdAt) - new Date(petB.createdAt);
        return 0;
      });

      cards.forEach((card) => container.appendChild(card));
    });
  }
}

// ---- Pet Details Page ----
async function initPetDetailsPage() {
  const container = document.getElementById("petDetailsContainer");
  if (!container) return;

  const urlParams = new URLSearchParams(window.location.search);
  const petId = urlParams.get("id");

  if (!petId) {
    container.innerHTML = "<p class='text-danger'>No pet ID specified.</p>";
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/pets/${petId}`);
    if (!response.ok) throw new Error("Pet not found");

    const pet = await response.json();

    document.title = `${pet.name} - PawMatch`;

    container.innerHTML = `
      <div class="row">
        <div class="col-md-6 mb-4">
          <img src="${pet.image}" alt="${pet.name}" class="img-fluid rounded-xl w-100"
            style="max-height:420px; object-fit:cover;"
            onerror="this.src='https://placehold.co/600x400/f0f0f0/aaa?text=No+Image'">
        </div>
        <div class="col-md-6">
          <div class="d-flex align-items-center gap-3 mb-2">
            <h2 class="mb-0 fw-900">${pet.name}</h2>
            <span class="badge bg-${getStatusBadgeClass(pet.status)} fs-6">${pet.status}</span>
          </div>
          <p class="text-muted mb-3">${pet.breed} · ${pet.type}</p>

          <div class="row g-2 mb-3">
            <div class="col-6">
              <div class="info-detail-box">
                <div class="info-detail-label">Age</div>
                <div class="info-detail-value">🎂 ${pet.age}</div>
              </div>
            </div>
            <div class="col-6">
              <div class="info-detail-box">
                <div class="info-detail-label">Gender</div>
                <div class="info-detail-value">${pet.gender === "Male" ? "♂️" : "♀️"} ${pet.gender}</div>
              </div>
            </div>
            <div class="col-6">
              <div class="info-detail-box">
                <div class="info-detail-label">Location</div>
                <div class="info-detail-value">📍 ${pet.location}</div>
              </div>
            </div>
            <div class="col-6">
              <div class="info-detail-box">
                <div class="info-detail-label">Energy Level</div>
                <div class="info-detail-value">⚡ ${pet.energyLevel}</div>
              </div>
            </div>
            <div class="col-6">
              <div class="info-detail-box">
                <div class="info-detail-label">Good With Kids</div>
                <div class="info-detail-value">${pet.goodWithKids ? "✅ Yes" : "❌ No"}</div>
              </div>
            </div>
            <div class="col-6">
              <div class="info-detail-box">
                <div class="info-detail-label">Home Type</div>
                <div class="info-detail-value">🏠 ${pet.homeType}</div>
              </div>
            </div>
          </div>

          ${pet.vaccinated ? '<div class="alert alert-success py-2 mb-3"><small>✅ This pet is vaccinated</small></div>' : '<div class="alert alert-warning py-2 mb-3"><small>⚠️ Not yet vaccinated</small></div>'}

          ${pet.status === "Sale" ? `<div class="mb-3"><span class="fw-bold text-warning fs-4">৳ ${pet.price.toLocaleString()}</span></div>` : ""}

          <div class="d-flex gap-2">
            <a href="./adoption-process.html" class="btn btn-primary-pawmatch">
              ${pet.status === "Sale" ? "💰 Buy / Contact" : "💖 Adopt Me"}
            </a>
            <button class="btn btn-outline-pawmatch" onclick="saveToMatches(${JSON.stringify(pet).replace(/"/g, '&quot;')})">
              ❤️ Save
            </button>
          </div>
        </div>
      </div>

      <div class="mt-4">
        <h5 class="fw-700">About ${pet.name}</h5>
        <p>${pet.description}</p>
      </div>`;

    // Load related pets
    loadRelatedPets(pet.type, pet.id);
  } catch (err) {
    container.innerHTML = `<div class="alert alert-danger">Pet not found or server error.</div>`;
    console.error(err);
  }
}

// ---- Load related pets (same type) ----
async function loadRelatedPets(type, currentId) {
  const container = document.getElementById("relatedPetsContainer");
  if (!container) return;

  try {
    const response = await fetch(`${API_BASE}/pets?type=${type}`);
    const pets = await response.json();
    const related = pets.filter((p) => p.id !== currentId).slice(0, 3);

    if (related.length === 0) {
      container.closest("section")?.remove();
      return;
    }

    related.forEach((pet) => {
      const col = document.createElement("div");
      col.className = "col-md-4 mb-4";
      col.innerHTML = renderPetCard(pet);
      container.appendChild(col);
    });
  } catch (err) {
    console.error("Could not load related pets");
  }
}

// ---- Save to My Matches (localStorage) ----
function saveToMatches(pet) {
  const matches = JSON.parse(localStorage.getItem("pawmatch_saved") || "[]");
  const alreadySaved = matches.find((m) => m.id === pet.id);

  if (alreadySaved) {
    showToast(`${pet.name} is already in your matches!`, "info");
    return;
  }

  matches.push({
    ...pet,
    savedAt: new Date().toISOString(),
    action: "liked",
  });

  localStorage.setItem("pawmatch_saved", JSON.stringify(matches));
  showToast(`❤️ ${pet.name} saved to My Matches!`, "success");
}

// ---- Initialize on page load ----
document.addEventListener("DOMContentLoaded", function () {
  // Browse Pets page
  if (document.getElementById("petsContainer")) {
    loadPets();
    initFilters();
  }

  // Pet Details page
  if (document.getElementById("petDetailsContainer")) {
    initPetDetailsPage();
  }
});
