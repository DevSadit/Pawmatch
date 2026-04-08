// =============================================
// PawMatch - Notices JavaScript
// notices.js
// =============================================
// Fetches and displays XML-based notices.
// The backend reads notices.xml and returns
// parsed data as JSON via /api/notices.
// The frontend also demonstrates raw XML
// parsing using the browser's DOMParser.
// =============================================

// ---- Load notices from backend (JSON format, parsed from XML) ----
async function loadNotices() {
  const container = document.getElementById("noticesContainer");
  const loadingDiv = document.getElementById("noticesLoading");

  if (!container) return;

  if (loadingDiv) loadingDiv.style.display = "flex";

  try {
    // Fetch XML parsed as JSON from backend
    const response = await fetch(`${API_BASE}/notices`);
    const notices = await response.json();

    if (loadingDiv) loadingDiv.style.display = "none";

    renderNotices(notices);
  } catch (err) {
    if (loadingDiv) loadingDiv.style.display = "none";
    container.innerHTML = `<div class="alert alert-danger">Could not load notices.</div>`;
    console.error("Error loading notices:", err);
  }
}

// ---- Also demonstrate direct XML parsing in browser ----
async function loadRawXML() {
  const xmlDisplay = document.getElementById("xmlSourceDisplay");
  if (!xmlDisplay) return;

  try {
    const response = await fetch(`${API_BASE}/notices/raw`);
    const xmlText = await response.text();

    // Show raw XML source
    xmlDisplay.textContent = xmlText;

    // Also parse it with DOMParser (browser-side XML parsing demo)
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "application/xml");
    const notices = xmlDoc.querySelectorAll("notice");

    const xmlParsedCount = document.getElementById("xmlParsedCount");
    if (xmlParsedCount) {
      xmlParsedCount.textContent = `Browser parsed ${notices.length} notices from XML using DOMParser.`;
    }
  } catch (err) {
    console.error("Could not load raw XML:", err);
  }
}

// ---- Render notices as cards ----
function renderNotices(notices) {
  const container = document.getElementById("noticesContainer");
  container.innerHTML = "";

  const priorityConfig = {
    high: { color: "danger", icon: "🔴", label: "High Priority" },
    medium: { color: "warning", icon: "🟡", label: "Medium" },
    low: { color: "info", icon: "🔵", label: "Info" },
  };

  const categoryIcons = {
    Health: "💉",
    Safety: "🛡️",
    Update: "📢",
    Alert: "🚨",
    Campaign: "🎉",
    System: "⚙️",
  };

  notices.forEach((notice) => {
    const priority = notice.priority || "low";
    const config = priorityConfig[priority] || priorityConfig.low;
    const catIcon = categoryIcons[notice.category] || "📌";

    const card = document.createElement("div");
    card.className = "notice-card card mb-3 shadow-sm";
    card.style.borderRadius = "14px";
    card.style.borderLeft = `4px solid var(--bs-${config.color})`;

    card.innerHTML = `
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <div>
            <span class="me-2">${catIcon}</span>
            <span class="badge bg-${config.color} bg-opacity-15 text-${config.color} me-2"
              style="font-size:0.75rem">${notice.category}</span>
            <span class="badge bg-secondary bg-opacity-10 text-secondary"
              style="font-size:0.75rem">${config.icon} ${config.label}</span>
          </div>
          <small class="text-muted">📅 ${formatDate(notice.date)}</small>
        </div>
        <h5 class="fw-bold mb-2" style="font-size:1rem">${notice.title}</h5>
        <p class="text-muted mb-0" style="font-size:0.9rem">${notice.message}</p>
      </div>`;

    container.appendChild(card);
  });

  // Update count
  const countEl = document.getElementById("noticesCount");
  if (countEl) countEl.textContent = notices.length;
}

// ---- Filter notices by category ----
function filterNotices(category) {
  const cards = document.querySelectorAll(".notice-card");
  cards.forEach((card) => {
    if (category === "All" || card.innerHTML.includes(category)) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });

  // Update active filter button
  document.querySelectorAll(".notice-filter-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  event.target.classList.add("active");
}

// ---- Initialize ----
document.addEventListener("DOMContentLoaded", function () {
  if (!document.getElementById("noticesContainer")) return;
  loadNotices();
  loadRawXML();
});
