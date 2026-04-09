// =============================================
// PawMatch - My Matches Page JavaScript
// my-matches.js
// =============================================

async function loadMyMatches() {
  const container = document.getElementById("matchesContainer");
  const emptyState = document.getElementById("matchesEmpty");
  const countEl = document.getElementById("matchesCount");

  if (!container) return;

  try {
    const entries = await getSavedMatches();
    const matches = normalizeMatchEntries(entries);

    if (countEl) countEl.textContent = matches.length;

    if (!matches.length) {
      container.style.display = "none";
      if (emptyState) emptyState.style.display = "block";
      return;
    }

    container.style.display = "";
    if (emptyState) emptyState.style.display = "none";
    container.innerHTML = "";

    matches.forEach((pet) => {
      const card = document.createElement("article");
      card.id = `match-card-${pet.id}`;
      card.className = "overflow-hidden rounded-[1.75rem] bg-surface-container-lowest shadow-sm";

      const savedDate = pet.savedAt ? formatDate(pet.savedAt) : "";
      const actionLabel = pet.action === "super-liked" ? "Super Liked" : "Liked";
      const actionClass = pet.action === "super-liked"
        ? "bg-secondary-container text-on-secondary-container"
        : "bg-tertiary-container/30 text-tertiary";

      card.innerHTML = `
        <img
          src="${pet.image}"
          alt="${pet.name}"
          class="h-60 w-full object-cover"
          onerror="this.src='https://placehold.co/400x300/f0f0f0/aaa?text=No+Image'"
        >
        <div class="space-y-4 p-5">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h2 class="font-headline text-2xl font-extrabold text-on-surface">${pet.name}</h2>
              <p class="mt-1 text-sm text-on-surface-variant">${pet.breed || "Unknown breed"} · ${pet.type}</p>
            </div>
            <span class="rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] ${actionClass}">${actionLabel}</span>
          </div>

          <div class="flex flex-wrap gap-2 text-xs font-bold text-on-surface-variant">
            <span class="rounded-full bg-surface-container-low px-3 py-1">${pet.location || "Unknown location"}</span>
            <span class="rounded-full bg-surface-container-low px-3 py-1">${pet.age || "Unknown age"}</span>
            <span class="rounded-full bg-surface-container-low px-3 py-1">${pet.status}</span>
          </div>

          ${savedDate ? `<p class="text-xs text-on-surface-variant">Saved on ${savedDate}</p>` : ""}

          <div class="flex gap-3">
            <a
              href="./pet-details.html?id=${pet.id}"
              class="flex-1 rounded-full bg-gradient-to-br from-primary to-primary-container px-5 py-3 text-center text-xs font-bold uppercase tracking-[0.18em] text-on-primary"
            >
              View Profile
            </a>
            <button
              onclick="removeMatch('${pet.id}')"
              class="rounded-full bg-red-50 px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-error"
            >
              Remove
            </button>
          </div>
        </div>`;

      container.appendChild(card);
    });
  } catch (error) {
    container.innerHTML = `<div class="col-span-full rounded-3xl bg-red-50 p-8 text-center text-error">${error?.message || "Could not load matches."}</div>`;
  }
}

async function removeMatch(petId) {
  try {
    await removeSavedMatch(petId);

    const card = document.getElementById(`match-card-${petId}`);
    if (card) {
      card.style.transition = "all 0.3s ease";
      card.style.opacity = "0";
      card.style.transform = "scale(0.96)";
      setTimeout(() => {
        card.remove();
        loadMyMatches();
      }, 300);
    } else {
      loadMyMatches();
    }

    showToast("Removed from matches", "info");
  } catch (error) {
    showToast(error?.message || "Could not remove match", "error");
  }
}

async function clearAllMatches() {
  if (!confirm("Are you sure you want to remove all saved matches?")) return;

  try {
    await clearSavedMatches();
    await loadMyMatches();
    showToast("All matches cleared", "info");
  } catch (error) {
    showToast(error?.message || "Could not clear matches", "error");
  }
}

document.addEventListener("DOMContentLoaded", function () {
  if (!document.getElementById("matchesContainer")) return;

  loadMyMatches();

  const clearBtn = document.getElementById("clearAllMatches");
  if (clearBtn) clearBtn.addEventListener("click", clearAllMatches);
});
