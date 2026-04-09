// =============================================
// PawMatch - CRUD Operations JavaScript
// crud.js
// =============================================

async function initAddPetPage() {
  const form = document.getElementById("addPetForm");
  if (!form) return;

  const user = await syncCurrentUser().catch(() => getCurrentUser());
  if (!user) {
    const formWrapper = document.getElementById("formWrapper");
    const loginMsg = document.getElementById("loginRequiredMsg");
    if (formWrapper) formWrapper.style.display = "none";
    if (loginMsg) loginMsg.style.display = "block";
    return;
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "Saving...";

    const petData = {
      name: document.getElementById("petName").value.trim(),
      type: document.getElementById("petType").value,
      breed: document.getElementById("petBreed").value.trim(),
      age: document.getElementById("petAge").value.trim(),
      gender: document.getElementById("petGender").value,
      location: document.getElementById("petLocation").value.trim(),
      status: document.getElementById("petStatus").value,
      price: parseFloat(document.getElementById("petPrice").value) || 0,
      vaccinated: document.getElementById("petVaccinated").checked,
      description: document.getElementById("petDescription").value.trim(),
      image: document.getElementById("petImage").value.trim() || "https://placehold.co/400x300?text=Pet+Photo",
      energyLevel: document.getElementById("petEnergy").value,
      goodWithKids: document.getElementById("petKids").checked,
      homeType: document.getElementById("petHomeType").value,
    };

    if (!petData.name || !petData.type || !petData.breed || !petData.status) {
      showToast("Please fill in all required fields", "warning");
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit Listing";
      return;
    }

    try {
      await apiFetch("/pets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(petData),
      });

      showToast("Pet listing created successfully!", "success");
      form.reset();
      setTimeout(() => {
        window.location.href = "./manage-listings.html";
      }, 1200);
    } catch (error) {
      showToast(error?.message || "Failed to create listing", "error");
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit Listing";
    }
  });

  const statusSelect = document.getElementById("petStatus");
  const priceGroup = document.getElementById("priceGroup");
  if (statusSelect && priceGroup) {
    statusSelect.addEventListener("change", function () {
      priceGroup.style.display = this.value === "Sale" ? "block" : "none";
    });
    priceGroup.style.display = statusSelect.value === "Sale" ? "block" : "none";
  }
}

async function initManageListingsPage() {
  const container = document.getElementById("listingsContainer");
  if (!container) return;

  const user = await syncCurrentUser().catch(() => getCurrentUser());
  if (!user) {
    container.innerHTML = `
      <div class="rounded-[1.75rem] bg-surface-container-lowest p-10 text-center shadow-sm">
        <h3 class="font-headline text-2xl font-extrabold text-on-surface">Please login first</h3>
        <p class="mt-2 text-sm text-on-surface-variant">Login to create, edit, or remove your pet listings.</p>
        <a href="./login.html" class="mt-5 inline-block rounded-full bg-gradient-to-br from-primary to-primary-container px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] text-on-primary">Login</a>
      </div>`;
    return;
  }

  await loadUserListings();
}

async function loadUserListings() {
  const container = document.getElementById("listingsContainer");
  const countEl = document.getElementById("listingCount");
  const searchInput = document.getElementById("listingSearch");
  const user = await syncCurrentUser().catch(() => getCurrentUser());

  if (!container || !user) return;

  container.innerHTML = `
    <div class="flex justify-center py-16">
      <div class="h-10 w-10 animate-spin rounded-full border-4 border-primary-container border-t-primary"></div>
    </div>`;

  try {
    const allPets = await apiFetch("/pets");
    const ownPets = allPets.filter((pet) => pet.owner === user.id || pet.owner === user._id);

    const query = searchInput?.value.trim().toLowerCase() || "";
    const filteredPets = query
      ? ownPets.filter((pet) => `${pet.name} ${pet.breed}`.toLowerCase().includes(query))
      : ownPets;

    if (countEl) countEl.textContent = filteredPets.length;

    if (!filteredPets.length) {
      container.innerHTML = `
        <div class="rounded-[1.75rem] bg-surface-container-lowest p-10 text-center shadow-sm">
          <div class="mb-3 text-5xl">No listings yet</div>
          <h3 class="font-headline text-2xl font-extrabold text-on-surface">Nothing to manage yet</h3>
          <p class="mt-2 text-sm text-on-surface-variant">Create your first listing and it will appear here.</p>
          <a href="./add-pet.html" class="mt-5 inline-block rounded-full bg-gradient-to-br from-primary to-primary-container px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] text-on-primary">Add Pet</a>
        </div>`;
      return;
    }

    container.innerHTML = filteredPets
      .map((pet) => `
        <article id="listing-row-${pet.id}" class="mb-5 overflow-hidden rounded-[1.75rem] bg-surface-container-lowest shadow-sm lg:grid lg:grid-cols-[220px,1fr]">
          <img
            src="${pet.image}"
            alt="${pet.name}"
            class="h-56 w-full object-cover lg:h-full"
            onerror="this.src='https://placehold.co/400x260/f0f0f0/aaa?text=No+Image'"
          >
          <div class="space-y-5 p-5">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 class="font-headline text-2xl font-extrabold text-on-surface">${pet.name}</h2>
                <p class="mt-1 text-sm text-on-surface-variant">${pet.type} · ${pet.breed}</p>
              </div>
              <span class="rounded-full bg-surface-container-low px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-on-surface-variant">${pet.status}</span>
            </div>

            <div class="flex flex-wrap gap-2 text-xs font-bold text-on-surface-variant">
              <span class="rounded-full bg-surface-container-low px-3 py-1">${pet.location || "Unknown location"}</span>
              <span class="rounded-full bg-surface-container-low px-3 py-1">${pet.status === "Sale" ? `BDT ${Number(pet.price || 0).toLocaleString()}` : "Free / Contact"}</span>
              <span class="rounded-full bg-surface-container-low px-3 py-1">${formatDate(pet.createdAt)}</span>
            </div>

            <p class="text-sm leading-7 text-on-surface-variant">${pet.description || "No description added yet."}</p>

            <div class="flex flex-wrap gap-3">
              <button onclick="openEditModal('${pet.id}')" class="rounded-full bg-surface-container-high px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-on-surface">Edit</button>
              <button onclick="deleteListing('${pet.id}')" class="rounded-full bg-red-50 px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-error">Delete</button>
              <a href="./pet-details.html?id=${pet.id}" class="rounded-full bg-gradient-to-br from-primary to-primary-container px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-on-primary">View</a>
            </div>
          </div>
        </article>`)
      .join("");
  } catch (error) {
    container.innerHTML = `<div class="rounded-3xl bg-red-50 p-8 text-center text-error">${error?.message || "Could not load listings."}</div>`;
  }
}

async function deleteListing(petId) {
  if (!confirm("Are you sure you want to delete this listing?")) return;

  try {
    await apiFetch(`/pets/${petId}`, { method: "DELETE" });
    const row = document.getElementById(`listing-row-${petId}`);
    if (row) {
      row.style.opacity = "0";
      row.style.transform = "scale(0.98)";
      row.style.transition = "all 0.3s ease";
      setTimeout(() => loadUserListings(), 300);
    } else {
      loadUserListings();
    }
    showToast("Listing deleted", "success");
  } catch (error) {
    showToast(error?.message || "Could not delete listing", "error");
  }
}

async function openEditModal(petId) {
  try {
    const pet = await apiFetch(`/pets/${petId}`);

    document.getElementById("editPetId").value = pet.id;
    document.getElementById("editPetName").value = pet.name;
    document.getElementById("editPetType").value = pet.type;
    document.getElementById("editPetBreed").value = pet.breed;
    document.getElementById("editPetAge").value = pet.age;
    document.getElementById("editPetGender").value = pet.gender;
    document.getElementById("editPetLocation").value = pet.location;
    document.getElementById("editPetStatus").value = pet.status;
    document.getElementById("editPetPrice").value = pet.price || 0;
    document.getElementById("editPetDescription").value = pet.description || "";
    document.getElementById("editPetImage").value = pet.image || "";
    document.getElementById("editPetVaccinated").checked = Boolean(pet.vaccinated);

    const modal = document.getElementById("editModal");
    if (modal) modal.style.display = "flex";
  } catch (error) {
    showToast(error?.message || "Could not load pet data", "error");
  }
}

async function submitEdit() {
  const petId = document.getElementById("editPetId").value;
  const submitBtn = document.getElementById("saveEditBtn");

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Saving...";
  }

  const updatedData = {
    name: document.getElementById("editPetName").value.trim(),
    type: document.getElementById("editPetType").value,
    breed: document.getElementById("editPetBreed").value.trim(),
    age: document.getElementById("editPetAge").value.trim(),
    gender: document.getElementById("editPetGender").value,
    location: document.getElementById("editPetLocation").value.trim(),
    status: document.getElementById("editPetStatus").value,
    price: parseFloat(document.getElementById("editPetPrice").value) || 0,
    description: document.getElementById("editPetDescription").value.trim(),
    image: document.getElementById("editPetImage").value.trim(),
    vaccinated: document.getElementById("editPetVaccinated").checked,
  };

  try {
    await apiFetch(`/pets/${petId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData),
    });

    if (typeof closeEditModal === "function") closeEditModal();
    await loadUserListings();
    showToast("Listing updated successfully!", "success");
  } catch (error) {
    showToast(error?.message || "Could not update listing", "error");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Save Changes";
    }
  }
}

document.addEventListener("DOMContentLoaded", function () {
  initAddPetPage();
  initManageListingsPage();

  const searchInput = document.getElementById("listingSearch");
  if (searchInput) {
    searchInput.addEventListener("input", loadUserListings);
  }
});
