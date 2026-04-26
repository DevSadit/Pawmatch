// =============================================
// PawMatch - Pets JavaScript
// pets.js
// =============================================

let allPets = [];

async function loadPets(filters = {}) {
  const container = document.getElementById("petsContainer");
  const loadingDiv = document.getElementById("petsLoading");
  const countDiv = document.getElementById("petsCount");

  if (!container) return;

  if (loadingDiv) loadingDiv.style.display = "flex";
  container.innerHTML = "";

  try {
    const params = new URLSearchParams();
    if (filters.search) params.append("search", filters.search);
    if (filters.type) params.append("type", filters.type);
    if (filters.status) params.append("status", filters.status);
    if (filters.location) params.append("location", filters.location);

    const pets = await apiFetch(`/pets${params.toString() ? `?${params.toString()}` : ""}`);
    allPets = pets;

    if (loadingDiv) loadingDiv.style.display = "none";

    if (!pets.length) {
      container.innerHTML = `
        <div class="col-span-full rounded-3xl bg-surface-container-lowest p-10 text-center shadow-sm">
          <div class="mb-3 text-5xl">No pets yet</div>
          <h4 class="font-headline text-2xl font-extrabold text-on-surface">No pets found</h4>
          <p class="mt-2 text-sm text-on-surface-variant">Try changing your filters or search keywords.</p>
        </div>`;
      if (countDiv) countDiv.textContent = "0 pets found";
      return;
    }

    if (countDiv) countDiv.textContent = `${pets.length} pet${pets.length !== 1 ? "s" : ""} found`;

    pets.forEach((pet) => {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = renderPetCard(pet);
      container.appendChild(wrapper.firstElementChild);
    });
  } catch (error) {
    if (loadingDiv) loadingDiv.style.display = "none";
    container.innerHTML = `
      <div class="col-span-full rounded-3xl bg-red-50 p-10 text-center">
        <div class="mb-3 text-4xl">Server issue</div>
        <h4 class="font-headline text-2xl font-extrabold text-error">Could not load pets</h4>
        <p class="mt-2 text-sm text-on-surface-variant">${error?.message || "Please make sure the backend server is running."}</p>
      </div>`;
    console.error("Error loading pets:", error);
  }
}

function renderPetCard(pet) {
  const detailLink = `./pet-details.html?id=${pet.id}`;
  const statusMap = {
    Adoption: "bg-secondary-container text-on-secondary-container",
    Sale: "bg-primary-container/25 text-on-primary-container",
    Rehome: "bg-tertiary-container/30 text-on-tertiary-container",
  };

  return `
    <article class="overflow-hidden rounded-[1.75rem] bg-surface-container-lowest shadow-sm transition-transform duration-300 hover:-translate-y-1">
      <div class="relative h-64 overflow-hidden">
        <img
          src="${pet.image}"
          alt="${pet.name}"
          class="h-full w-full object-cover"
          onerror="this.src='https://placehold.co/400x220/e9e8e4/aaa?text=No+Image'"
        >
        <button
          type="button"
          onclick='saveToMatchesBrowse(${JSON.stringify(pet).replace(/'/g, "&apos;")})'
          class="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/80 text-tertiary shadow-sm backdrop-blur"
          aria-label="Save ${pet.name}"
        >
          <span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1">favorite</span>
        </button>
      </div>
      <div class="space-y-4 p-5">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h3 class="font-headline text-2xl font-extrabold text-on-surface">${pet.name}</h3>
            <p class="mt-1 text-sm text-on-surface-variant">${pet.breed || "Unknown breed"} · ${pet.type}</p>
          </div>
          <span class="rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] ${statusMap[pet.status] || "bg-surface-container-high text-on-surface-variant"}">${pet.status}</span>
        </div>

        <div class="flex flex-wrap gap-2 text-xs font-bold text-on-surface-variant">
          <span class="rounded-full bg-surface-container-low px-3 py-1">Location: ${pet.location || "Unknown"}</span>
          <span class="rounded-full bg-surface-container-low px-3 py-1">Age: ${pet.age || "Unknown"}</span>
          <span class="rounded-full bg-surface-container-low px-3 py-1">Gender: ${pet.gender || "Unknown"}</span>
          ${pet.vaccinated ? '<span class="rounded-full bg-green-100 px-3 py-1 text-green-700">Vaccinated</span>' : ""}
        </div>

        <p class="line-clamp-2 text-sm leading-6 text-on-surface-variant">${pet.description || "Meet this lovely pet and view the full profile to learn more."}</p>

        <div class="flex items-center justify-between gap-3">
          <div class="text-sm font-bold text-primary">
            ${pet.status === "Sale" ? `BDT ${Number(pet.price || 0).toLocaleString()}` : "Contact for adoption"}
          </div>
          <a
            href="${detailLink}"
            class="rounded-full bg-gradient-to-br from-primary to-primary-container px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-on-primary"
          >
            View Profile
          </a>
        </div>
      </div>
    </article>`;
}

async function saveToMatchesBrowse(pet) {
  try {
    const result = await saveMatch(pet, "liked");
    if (result.alreadySaved) {
      showToast(`${pet.name} is already in your matches!`, "info");
      return;
    }

    showToast(`${pet.name} saved to My Matches!`, "success");
  } catch (error) {
    showToast(error?.message || "Could not save match", "error");
  }
}

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

  if (applyBtn) applyBtn.addEventListener("click", applyFilters);

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      if (typeFilter) typeFilter.value = "";
      if (statusFilter) statusFilter.value = "";
      if (locationFilter) locationFilter.value = "";
      loadPets();
    });
  }

  if (searchInput) {
    searchInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") applyFilters();
    });
  }
}

async function initPetDetailsPage() {
  const container = document.getElementById("petDetailsContainer");
  const loading = document.getElementById("petLoading");
  if (!container) return;

  const urlParams = new URLSearchParams(window.location.search);
  const petId = urlParams.get("id");

  if (!petId) {
    if (loading) loading.style.display = "none";
    container.innerHTML = `<div class="rounded-3xl bg-red-50 p-8 text-error">No pet ID specified.</div>`;
    return;
  }

  try {
    const pet = await apiFetch(`/pets/${petId}`);
    document.title = `${pet.name} - PawMatch`;
    if (loading) loading.style.display = "none";

    container.innerHTML = `
      <section class="grid gap-8 lg:grid-cols-[1.1fr,0.9fr] lg:items-start">
        <div class="overflow-hidden rounded-[2rem] bg-surface-container-lowest shadow-sm">
          <img
            src="${pet.image}"
            alt="${pet.name}"
            class="h-[320px] w-full object-cover sm:h-[420px]"
            onerror="this.src='https://placehold.co/600x400/f0f0f0/aaa?text=No+Image'"
          >
        </div>

        <div class="space-y-6">
          <div class="space-y-3">
            <div class="flex flex-wrap items-center gap-3">
              <h1 class="font-headline text-4xl font-extrabold text-on-surface">${pet.name}</h1>
              <span class="rounded-full bg-secondary-container px-4 py-1 text-xs font-black uppercase tracking-[0.18em] text-on-secondary-container">${pet.status}</span>
            </div>
            <p class="text-lg text-on-surface-variant">${pet.breed || "Unknown breed"} · ${pet.type}</p>
          </div>

          <div class="grid grid-cols-2 gap-3">
            ${renderDetailChip("Age", pet.age || "Unknown")}
            ${renderDetailChip("Gender", pet.gender || "Unknown")}
            ${renderDetailChip("Location", pet.location || "Unknown")}
            ${renderDetailChip("Energy", pet.energyLevel || "Medium")}
            ${renderDetailChip("Kid Friendly", pet.goodWithKids ? "Yes" : "No")}
            ${renderDetailChip("Home Type", pet.homeType || "Any")}
          </div>

          <div class="rounded-3xl bg-surface-container-low p-5">
            <p class="text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">About ${pet.name}</p>
            <p class="mt-3 text-sm leading-7 text-on-surface-variant">${pet.description || "No description available yet."}</p>
          </div>

          <div class="flex flex-wrap gap-3">
            <a
              href="./adoption-process.html"
              class="rounded-full bg-gradient-to-br from-primary to-primary-container px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] text-on-primary"
            >
              ${pet.status === "Sale" ? "Buy or Contact" : "Adopt Me"}
            </a>
            <button
              onclick='saveToMatches(${JSON.stringify(pet).replace(/'/g, "&apos;")})'
              class="rounded-full bg-surface-container-high px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] text-on-surface"
            >
              Save Match
            </button>
          </div>

          ${pet.status === "Sale" ? `<div class="text-lg font-extrabold text-primary">Price: BDT ${Number(pet.price || 0).toLocaleString()}</div>` : ""}
          <div class="text-sm ${pet.vaccinated ? "text-secondary" : "text-error"}">${pet.vaccinated ? "Vaccinated" : "Vaccination not confirmed"}</div>
        </div>
      </section>`;

    loadRelatedPets(pet.type, pet.id);
  } catch (error) {
    if (loading) loading.style.display = "none";
    container.innerHTML = `<div class="rounded-3xl bg-red-50 p-8 text-error">${error?.message || "Pet not found or server error."}</div>`;
    console.error(error);
  }
}

function renderDetailChip(label, value) {
  return `
    <div class="rounded-2xl bg-surface-container-lowest p-4 shadow-sm">
      <p class="text-[11px] font-black uppercase tracking-[0.18em] text-on-surface-variant">${label}</p>
      <p class="mt-2 text-sm font-bold text-on-surface">${value}</p>
    </div>`;
}

async function loadRelatedPets(type, currentId) {
  const container = document.getElementById("relatedPetsContainer");
  const section = document.getElementById("relatedSection");
  if (!container || !section) return;

  try {
    const pets = await apiFetch(`/pets?type=${encodeURIComponent(type)}`);
    const related = pets.filter((pet) => pet.id !== currentId).slice(0, 3);

    if (!related.length) {
      section.remove();
      return;
    }

    container.innerHTML = "";
    related.forEach((pet) => {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = renderPetCard(pet);
      container.appendChild(wrapper.firstElementChild);
    });
  } catch (error) {
    console.error("Could not load related pets", error);
  }
}

async function saveToMatches(pet) {
  try {
    const result = await saveMatch(pet, "liked");
    if (result.alreadySaved) {
      showToast(`${pet.name} is already in your matches!`, "info");
      return;
    }

    showToast(`${pet.name} saved to My Matches!`, "success");
  } catch (error) {
    showToast(error?.message || "Could not save match", "error");
  }
}

document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("petsContainer")) {
    loadPets();
    initFilters();
  }

  if (document.getElementById("petDetailsContainer")) {
    initPetDetailsPage();
  }
});
