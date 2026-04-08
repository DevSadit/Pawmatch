// =============================================
// PawMatch - My Matches Page JavaScript
// my-matches.js
// =============================================
// Loads saved pets from localStorage and
// displays them. Users can remove pets from
// their matches list.
// =============================================

function loadMyMatches() {
  const container = document.getElementById("matchesContainer");
  const emptyState = document.getElementById("matchesEmpty");
  const countEl = document.getElementById("matchesCount");

  if (!container) return;

  // Get saved pets from localStorage
  const matches = JSON.parse(localStorage.getItem("pawmatch_saved") || "[]");

  if (countEl) countEl.textContent = matches.length;

  if (matches.length === 0) {
    container.style.display = "none";
    if (emptyState) emptyState.style.display = "block";
    return;
  }

  container.style.display = "";
  if (emptyState) emptyState.style.display = "none";
  container.innerHTML = "";

  matches.forEach((pet) => {
    const col = document.createElement("div");
    col.className = "col-md-4 col-sm-6 mb-4";
    col.id = `match-card-${pet.id}`;

    const savedDate = pet.savedAt ? new Date(pet.savedAt).toLocaleDateString("en-GB", {
      day: "numeric", month: "short", year: "numeric"
    }) : "";

    const actionBadge = pet.action === "super-liked"
      ? '<span class="badge" style="background:#4ecdc4">⭐ Super Liked</span>'
      : '<span class="badge bg-success">❤️ Liked</span>';

    col.innerHTML = `
      <div class="pet-card h-100">
        <img src="${pet.image}" alt="${pet.name}"
          onerror="this.src='https://placehold.co/400x300/f0f0f0/aaa?text=No+Image'">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="pet-name">${pet.name}</span>
            ${actionBadge}
          </div>
          <div class="pet-breed mb-1">${pet.breed} · ${pet.type}</div>
          <div class="pet-tags mb-2">
            <span class="pet-tag">📍 ${pet.location}</span>
            <span class="pet-tag">🎂 ${pet.age}</span>
            <span class="pet-tag">${pet.status}</span>
          </div>
          ${savedDate ? `<small class="text-muted d-block mb-2">Saved on ${savedDate}</small>` : ""}
          <div class="d-flex gap-2">
            <a href="./pet-details.html?id=${pet.id}" class="btn btn-primary-pawmatch btn-sm flex-fill">
              View Profile
            </a>
            <button class="btn btn-outline-danger btn-sm" onclick="removeMatch(${pet.id})" title="Remove">
              🗑️
            </button>
          </div>
        </div>
      </div>`;

    container.appendChild(col);
  });
}

// ---- Remove a pet from matches ----
function removeMatch(petId) {
  const matches = JSON.parse(localStorage.getItem("pawmatch_saved") || "[]");
  const filtered = matches.filter((m) => m.id !== petId);
  localStorage.setItem("pawmatch_saved", JSON.stringify(filtered));

  // Remove the card from DOM with animation
  const card = document.getElementById(`match-card-${petId}`);
  if (card) {
    card.style.transition = "all 0.3s ease";
    card.style.opacity = "0";
    card.style.transform = "scale(0.8)";
    setTimeout(() => {
      card.remove();
      loadMyMatches(); // Reload to check if empty
    }, 300);
  }

  showToast("Removed from matches", "info");
}

// ---- Clear all matches ----
function clearAllMatches() {
  if (!confirm("Are you sure you want to remove all saved matches?")) return;
  localStorage.removeItem("pawmatch_saved");
  loadMyMatches();
  showToast("All matches cleared", "info");
}

// ---- Initialize ----
document.addEventListener("DOMContentLoaded", function () {
  if (!document.getElementById("matchesContainer")) return;

  loadMyMatches();

  const clearBtn = document.getElementById("clearAllMatches");
  if (clearBtn) clearBtn.addEventListener("click", clearAllMatches);
});
