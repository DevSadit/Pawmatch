// =============================================
// PawMatch - CRUD Operations JavaScript
// crud.js
// =============================================
// Handles Create, Read, Update, Delete for
// pet listings (Add Pet + Manage Listings pages)
// =============================================

// ---- ADD PET PAGE ----
function initAddPetPage() {
  const form = document.getElementById("addPetForm");
  if (!form) return;

  // Check if user is logged in
  const user = getCurrentUser();
  if (!user) {
    const formWrapper = document.getElementById("formWrapper");
    const loginMsg = document.getElementById("loginRequiredMsg");
    if (formWrapper) formWrapper.style.display = "none";
    if (loginMsg) loginMsg.style.display = "block";
    return;
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

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

    // Validate required fields
    if (!petData.name || !petData.type || !petData.breed || !petData.status) {
      showToast("Please fill in all required fields", "warning");
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit Listing";
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/pets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(petData),
      });

      const data = await response.json();

      if (response.ok) {
        showToast("Pet listing created successfully! 🎉", "success");
        form.reset();
        setTimeout(() => {
          window.location.href = "./manage-listings.html";
        }, 1500);
      } else {
        showToast(data.message || "Failed to create listing", "error");
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Listing";
      }
    } catch (err) {
      showToast("Server error. Please try again.", "error");
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit Listing";
    }
  });

  // Toggle price field based on status
  const statusSelect = document.getElementById("petStatus");
  const priceGroup = document.getElementById("priceGroup");
  if (statusSelect && priceGroup) {
    statusSelect.addEventListener("change", function () {
      priceGroup.style.display = this.value === "Sale" ? "block" : "none";
    });
  }
}

// ---- MANAGE LISTINGS PAGE ----
async function initManageListingsPage() {
  const container = document.getElementById("listingsContainer");
  if (!container) return;

  const user = getCurrentUser();
  if (!user) {
    container.innerHTML = `
      <div class="text-center py-5">
        <h5>Please <a href="./login.html">login</a> to manage your listings.</h5>
      </div>`;
    return;
  }

  await loadUserListings();
}

async function loadUserListings() {
  const container = document.getElementById("listingsContainer");
  const user = getCurrentUser();
  if (!container || !user) return;

  container.innerHTML = `
    <div class="loading-spinner">
      <div class="spinner-border text-primary"><span class="visually-hidden">Loading...</span></div>
    </div>`;

  try {
    const response = await fetch(`${API_BASE}/pets`, { credentials: "include" });
    const allPets = await response.json();

    // Filter to only this user's pets (or all if admin)
    const userPets = user.role === "admin"
      ? allPets
      : allPets.filter((p) => p.owner === user.id);

    if (userPets.length === 0) {
      container.innerHTML = `
        <div class="text-center py-5">
          <div style="font-size:3rem">🐾</div>
          <h5 class="mt-3">No listings yet</h5>
          <p class="text-muted">Start by adding your first pet listing.</p>
          <a href="./add-pet.html" class="btn btn-primary-pawmatch">+ Add Pet</a>
        </div>`;
      return;
    }

    // Search/filter for own listings
    const searchInput = document.getElementById("listingSearch");
    let filteredPets = userPets;

    if (searchInput && searchInput.value) {
      const q = searchInput.value.toLowerCase();
      filteredPets = userPets.filter(
        (p) => p.name.toLowerCase().includes(q) || p.breed.toLowerCase().includes(q)
      );
    }

    // Build table
    container.innerHTML = `
      <div class="table-responsive table-dashboard">
        <table class="table table-hover mb-0">
          <thead>
            <tr>
              <th>Pet</th>
              <th>Type / Breed</th>
              <th>Status</th>
              <th>Location</th>
              <th>Price</th>
              <th>Date Added</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="listingsTableBody">
          </tbody>
        </table>
      </div>`;

    const tbody = document.getElementById("listingsTableBody");

    filteredPets.forEach((pet) => {
      const tr = document.createElement("tr");
      tr.id = `listing-row-${pet.id}`;
      tr.innerHTML = `
        <td>
          <div class="d-flex align-items-center gap-2">
            <img src="${pet.image}" alt="${pet.name}" style="width:44px;height:44px;border-radius:10px;object-fit:cover;"
              onerror="this.src='https://placehold.co/50x50/f0f0f0/aaa?text=?'">
            <strong>${pet.name}</strong>
          </div>
        </td>
        <td>${pet.type} / ${pet.breed}</td>
        <td><span class="badge bg-${getStatusBadgeClass(pet.status)}">${pet.status}</span></td>
        <td>📍 ${pet.location}</td>
        <td>${pet.status === "Sale" ? "৳ " + pet.price.toLocaleString() : "Free"}</td>
        <td>${formatDate(pet.createdAt)}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary btn-table-action" onclick="openEditModal(${pet.id})">✏️ Edit</button>
          <button class="btn btn-sm btn-outline-danger btn-table-action" onclick="deleteListing(${pet.id})">🗑️ Delete</button>
          <a href="./pet-details.html?id=${pet.id}" class="btn btn-sm btn-outline-secondary btn-table-action">👁️ View</a>
        </td>`;
      tbody.appendChild(tr);
    });

    // Count display
    const countEl = document.getElementById("listingCount");
    if (countEl) countEl.textContent = filteredPets.length;
  } catch (err) {
    container.innerHTML = `<div class="alert alert-danger">Could not load listings. Is server running?</div>`;
  }
}

// ---- Delete a listing ----
async function deleteListing(petId) {
  if (!confirm("Are you sure you want to delete this listing?")) return;

  try {
    const response = await fetch(`${API_BASE}/pets/${petId}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (response.ok) {
      const row = document.getElementById(`listing-row-${petId}`);
      if (row) {
        row.style.opacity = "0";
        row.style.transition = "opacity 0.3s";
        setTimeout(() => {
          row.remove();
          showToast("Listing deleted", "success");
        }, 300);
      }
    } else {
      showToast("Could not delete listing", "error");
    }
  } catch (err) {
    showToast("Server error", "error");
  }
}

// ---- Open Edit Modal ----
async function openEditModal(petId) {
  try {
    const response = await fetch(`${API_BASE}/pets/${petId}`);
    const pet = await response.json();

    // Populate modal form fields
    document.getElementById("editPetId").value = pet.id;
    document.getElementById("editPetName").value = pet.name;
    document.getElementById("editPetType").value = pet.type;
    document.getElementById("editPetBreed").value = pet.breed;
    document.getElementById("editPetAge").value = pet.age;
    document.getElementById("editPetGender").value = pet.gender;
    document.getElementById("editPetLocation").value = pet.location;
    document.getElementById("editPetStatus").value = pet.status;
    document.getElementById("editPetPrice").value = pet.price;
    document.getElementById("editPetDescription").value = pet.description;
    document.getElementById("editPetImage").value = pet.image;
    document.getElementById("editPetVaccinated").checked = pet.vaccinated;

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById("editModal"));
    modal.show();
  } catch (err) {
    showToast("Could not load pet data", "error");
  }
}

// ---- Submit Edit Form ----
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
    const response = await fetch(`${API_BASE}/pets/${petId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(updatedData),
    });

    if (response.ok) {
      bootstrap.Modal.getInstance(document.getElementById("editModal")).hide();
      showToast("Listing updated successfully! ✅", "success");
      loadUserListings(); // Refresh the table
    } else {
      showToast("Could not update listing", "error");
    }
  } catch (err) {
    showToast("Server error", "error");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Save Changes";
    }
  }
}

// ---- Initialize ----
document.addEventListener("DOMContentLoaded", function () {
  initAddPetPage();
  initManageListingsPage();

  // Listing search
  const searchInput = document.getElementById("listingSearch");
  if (searchInput) {
    searchInput.addEventListener("input", loadUserListings);
  }
});
