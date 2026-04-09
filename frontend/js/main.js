// =============================================
// PawMatch - Main JavaScript (Redesigned UI)
// main.js
// =============================================

const API_BASE = `${window.location.origin}/api`;
const LOCAL_USER_KEY = "pawmatch_user";
const LEGACY_MATCHES_KEY = "pawmatch_saved";

let userSyncPromise = null;

function getCurrentUser() {
  const user = localStorage.getItem(LOCAL_USER_KEY);
  return user ? JSON.parse(user) : null;
}

function setCurrentUser(user) {
  if (!user) {
    clearCurrentUser();
    return;
  }

  localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
}

function clearCurrentUser() {
  localStorage.removeItem(LOCAL_USER_KEY);
}

async function apiFetch(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type") || "";
  let data = null;

  if (contentType.includes("application/json")) {
    data = await response.json().catch(() => null);
  } else {
    data = await response.text().catch(() => "");
  }

  if (!response.ok) {
    const error = new Error(data?.message || response.statusText || "Request failed");
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

function isAuthError(error) {
  return error && (error.status === 401 || error.status === 403);
}

async function syncCurrentUser({ force = false } = {}) {
  if (!force && userSyncPromise) {
    return userSyncPromise;
  }

  userSyncPromise = apiFetch("/auth/me")
    .then((user) => {
      setCurrentUser(user);
      renderAppChrome();
      return user;
    })
    .catch((error) => {
      if (isAuthError(error)) {
        clearCurrentUser();
        renderAppChrome();
        return null;
      }

      throw error;
    })
    .finally(() => {
      userSyncPromise = null;
    });

  return userSyncPromise;
}

function getLocalMatches() {
  return JSON.parse(localStorage.getItem(LEGACY_MATCHES_KEY) || "[]");
}

function setLocalMatches(matches) {
  localStorage.setItem(LEGACY_MATCHES_KEY, JSON.stringify(matches));
}

async function syncLegacyMatchesToServer() {
  const user = await syncCurrentUser();
  if (!user) return false;

  const legacyMatches = getLocalMatches();
  if (!legacyMatches.length) return false;

  for (const match of legacyMatches) {
    if (!match?.id) continue;

    try {
      await apiFetch("/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          petId: match.id,
          action: match.action === "super-liked" ? "super-liked" : "liked",
        }),
      });
    } catch (error) {
      if (!isAuthError(error)) {
        console.error("Could not sync legacy match", error);
      }
    }
  }

  localStorage.removeItem(LEGACY_MATCHES_KEY);
  return true;
}

async function getSavedMatches() {
  const user = await syncCurrentUser().catch(() => getCurrentUser());
  if (!user) {
    return getLocalMatches();
  }

  await syncLegacyMatchesToServer();
  return apiFetch("/matches");
}

async function saveMatch(pet, action = "liked") {
  const user = await syncCurrentUser().catch(() => getCurrentUser());

  if (!user) {
    const matches = getLocalMatches();
    if (matches.find((match) => match.id === pet.id)) {
      return { alreadySaved: true, match: null };
    }

    const stored = {
      ...pet,
      action,
      savedAt: new Date().toISOString(),
    };

    matches.push(stored);
    setLocalMatches(matches);
    return { alreadySaved: false, match: stored };
  }

  await syncLegacyMatchesToServer();

  const existing = await apiFetch("/matches");
  const found = existing.find((entry) => entry.pet?.id === pet.id);
  if (found) {
    return { alreadySaved: true, match: found };
  }

  const data = await apiFetch("/matches", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ petId: pet.id, action }),
  });

  return { alreadySaved: false, match: data.match };
}

async function removeSavedMatch(petId) {
  const user = await syncCurrentUser().catch(() => getCurrentUser());

  if (!user) {
    const filtered = getLocalMatches().filter((match) => match.id !== petId);
    setLocalMatches(filtered);
    return true;
  }

  await apiFetch(`/matches/${petId}`, { method: "DELETE" });
  return true;
}

async function clearSavedMatches() {
  const user = await syncCurrentUser().catch(() => getCurrentUser());

  if (!user) {
    localStorage.removeItem(LEGACY_MATCHES_KEY);
    return true;
  }

  await apiFetch("/matches", { method: "DELETE" });
  return true;
}

function normalizeMatchEntries(entries) {
  return entries.map((entry) => {
    if (entry.pet) {
      return {
        ...entry.pet,
        action: entry.action,
        savedAt: entry.savedAt,
      };
    }

    return entry;
  });
}

// =============================================
// NAV CSS - injected once into <head>
// =============================================
const NAV_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,700;0,800;1,800&family=Be+Vietnam+Pro:wght@400;500;700&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

  .pm-top-bar {
    position: fixed; top: 0; width: 100%; z-index: 50;
    background: rgba(248,246,242,0.85);
    backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
    border-bottom: none; box-shadow: 0 1px 12px rgba(0,0,0,0.06);
  }
  .pm-top-bar-inner {
    display: flex; justify-content: space-between; align-items: center;
    padding: 14px 24px; max-width: 1280px; margin: 0 auto;
  }
  .pm-logo {
    display: flex; align-items: center; gap: 8px;
    text-decoration: none; transition: transform 0.2s;
  }
  .pm-logo:active { transform: scale(0.93); }
  .pm-logo-icon {
    font-family: 'Material Symbols Outlined', sans-serif;
    font-size: 26px; color: #c2410c;
    font-variation-settings: 'FILL' 1, 'wght' 600, 'GRAD' 0, 'opsz' 24;
  }
  .pm-logo-text {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 900; font-style: italic; font-size: 1.45rem;
    color: #b45309; letter-spacing: -0.02em;
  }
  .pm-avatar {
    width: 40px; height: 40px; border-radius: 50%;
    overflow: hidden; border: 2px solid #f9873e;
    display: flex; align-items: center; justify-content: center;
    background: #e9e8e4; text-decoration: none; cursor: pointer;
  }
  .pm-avatar img { width: 100%; height: 100%; object-fit: cover; }
  .pm-avatar-initials {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 800; font-size: 0.95rem; color: #964300;
  }
  .pm-avatar-login {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.7rem; font-weight: 700; color: #964300;
    text-align: center; line-height: 1.2;
    text-decoration: none;
  }

  .pm-top-nav {
    display: none;
    align-items: center;
    gap: 2px;
  }
  .pm-top-nav-link {
    font-family: 'Be Vietnam Pro', sans-serif;
    font-size: 0.875rem; font-weight: 600;
    color: #5b5c59; text-decoration: none;
    padding: 7px 14px; border-radius: 9999px;
    transition: all 0.2s; white-space: nowrap;
  }
  .pm-top-nav-link:hover { color: #2e2f2d; background: rgba(0,0,0,0.05); }
  .pm-top-nav-link.pm-active {
    color: #964300; background: rgba(254,215,170,0.65);
    font-weight: 700;
  }

  .pm-bottom-nav {
    position: fixed; bottom: 0; left: 0; width: 100%;
    display: flex; justify-content: space-around; align-items: center;
    padding: 10px 16px 24px;
    background: rgba(248,246,242,0.92);
    backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
    border-radius: 48px 48px 0 0; z-index: 50;
    box-shadow: 0 -4px 24px rgba(0,0,0,0.06);
  }
  .pm-nav-tab {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; text-decoration: none;
    color: #78716c; border-radius: 9999px; padding: 8px 12px;
    transition: all 0.25s; gap: 2px;
  }
  .pm-nav-tab:hover { color: #9a3412; }
  .pm-nav-tab.pm-active {
    background: rgba(254,215,170,0.7); color: #9a3412;
    padding: 8px 20px;
  }
  .pm-nav-icon {
    font-family: 'Material Symbols Outlined', sans-serif; font-size: 24px;
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    display: block;
  }
  .pm-nav-tab.pm-active .pm-nav-icon {
    font-variation-settings: 'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24;
  }
  .pm-nav-label {
    font-family: 'Be Vietnam Pro', sans-serif; font-size: 9px;
    text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700;
  }

  .pm-toast-container {
    position: fixed; top: 76px; right: 16px; z-index: 9999;
    display: flex; flex-direction: column; gap: 8px; pointer-events: none;
  }
  .pm-toast {
    display: flex; align-items: center; gap: 10px;
    padding: 12px 18px; border-radius: 16px; min-width: 240px;
    font-family: 'Be Vietnam Pro', sans-serif; font-size: 0.88rem;
    font-weight: 600; color: #2e2f2d; pointer-events: all;
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    animation: pm-toast-in 0.3s ease; backdrop-filter: blur(12px);
  }
  .pm-toast.pm-toast-out { animation: pm-toast-out 0.3s ease forwards; }
  .pm-toast-success { background: rgba(220,252,231,0.95); border-left: 4px solid #22c55e; }
  .pm-toast-error   { background: rgba(254,226,226,0.95); border-left: 4px solid #ef4444; }
  .pm-toast-info    { background: rgba(224,242,254,0.95); border-left: 4px solid #3b82f6; }
  .pm-toast-warning { background: rgba(254,249,195,0.95); border-left: 4px solid #eab308; }
  @keyframes pm-toast-in  { from { opacity:0; transform:translateX(40px); } to { opacity:1; transform:translateX(0); } }
  @keyframes pm-toast-out { to   { opacity:0; transform:translateX(40px); } }

  @media (min-width: 1024px) {
    .pm-top-nav { display: flex; }
    .pm-top-bar-inner { padding: 16px 40px; }
    .pm-logo-text { font-size: 1.6rem; }
    .pm-avatar { width: 44px; height: 44px; }
    .pm-bottom-nav { display: none !important; }
    body { padding-bottom: 0 !important; }
  }
`;

function injectNavStyles() {
  if (document.getElementById("pm-nav-style")) return;

  const style = document.createElement("style");
  style.id = "pm-nav-style";
  style.textContent = NAV_CSS;
  document.head.appendChild(style);

  if (!document.querySelector('link[href*="Material+Symbols"]')) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap";
    document.head.appendChild(link);
  }
}

function getTopBarHTML(user) {
  const isInPages = window.location.pathname.includes("/pages/");
  const base = isInPages ? "../" : "./";
  const pagesBase = isInPages ? "./" : "./pages/";
  const dashLink = user ? `${pagesBase}dashboard.html` : `${pagesBase}login.html`;
  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  const navTabs = [
    { label: "Home", href: `${base}index.html`, active: ["index.html", ""] },
    { label: "Browse", href: `${pagesBase}pets.html`, active: ["pets.html", "pet-details.html"] },
    { label: "PawSwipe", href: `${pagesBase}pawswipe.html`, active: ["pawswipe.html", "my-matches.html", "match-finder.html"] },
    { label: "Forum", href: `${pagesBase}community.html`, active: ["community.html", "blog.html", "notices.html"] },
    { label: "Account", href: dashLink, active: ["dashboard.html", "profile.html", "login.html", "register.html", "admin.html"] },
  ];

  const navLinksHTML = navTabs
    .map((tab) => {
      const isActive = tab.active.includes(currentPage);
      return `<a href="${tab.href}" class="pm-top-nav-link${isActive ? " pm-active" : ""}">${tab.label}</a>`;
    })
    .join("");

  const avatarHTML = user
    ? `<a href="${dashLink}" class="pm-avatar" title="${user.name}">
         <span class="pm-avatar-initials">${user.name.charAt(0).toUpperCase()}</span>
       </a>`
    : `<a href="${dashLink}" class="pm-avatar pm-avatar-login">Login</a>`;

  return `
  <header class="pm-top-bar">
    <div class="pm-top-bar-inner">
      <a href="${base}index.html" class="pm-logo">
        <span class="pm-logo-icon">pets</span>
        <span class="pm-logo-text">PawMatch</span>
      </a>
      <nav class="pm-top-nav" aria-label="Main navigation">
        ${navLinksHTML}
      </nav>
      ${avatarHTML}
    </div>
  </header>`;
}

function getBottomNavHTML() {
  const isInPages = window.location.pathname.includes("/pages/");
  const base = isInPages ? "../" : "./";
  const pagesBase = isInPages ? "./" : "./pages/";
  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  const tabs = [
    { icon: "home", label: "Home", href: `${base}index.html`, active: ["index.html", ""] },
    { icon: "search", label: "Browse", href: `${pagesBase}pets.html`, active: ["pets.html", "pet-details.html"] },
    { icon: "style", label: "Swipe", href: `${pagesBase}pawswipe.html`, active: ["pawswipe.html", "my-matches.html", "match-finder.html"] },
    { icon: "groups", label: "Forum", href: `${pagesBase}community.html`, active: ["community.html", "blog.html", "notices.html"] },
    { icon: "person", label: "Account", href: `${pagesBase}dashboard.html`, active: ["dashboard.html", "profile.html", "admin.html"] },
  ];

  const tabsHTML = tabs
    .map((tab) => {
      const isActive = tab.active.includes(currentPage);
      return `<a href="${tab.href}" class="pm-nav-tab${isActive ? " pm-active" : ""}">
        <span class="pm-nav-icon">${tab.icon}</span>
        <span class="pm-nav-label">${tab.label}</span>
      </a>`;
    })
    .join("");

  return `<nav class="pm-bottom-nav">${tabsHTML}</nav>`;
}

function renderAppChrome() {
  injectNavStyles();
  const user = getCurrentUser();

  let topBarContainer = document.getElementById("pm-top-bar-container");
  if (!topBarContainer) {
    topBarContainer = document.createElement("div");
    topBarContainer.id = "pm-top-bar-container";
    document.body.insertBefore(topBarContainer, document.body.firstChild);
  }
  topBarContainer.innerHTML = getTopBarHTML(user);

  let bottomNavContainer = document.getElementById("pm-bottom-nav-container");
  if (!bottomNavContainer) {
    bottomNavContainer = document.createElement("div");
    bottomNavContainer.id = "pm-bottom-nav-container";
    document.body.appendChild(bottomNavContainer);
  }
  bottomNavContainer.innerHTML = getBottomNavHTML();
}

function showToast(message, type = "info") {
  let container = document.querySelector(".pm-toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "pm-toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `pm-toast pm-toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("pm-toast-out");
    setTimeout(() => toast.remove(), 320);
  }, 3000);
}

function initLogout() {
  document.addEventListener("click", async (event) => {
    if (!event.target.closest("#pm-logout-btn")) return;

    event.preventDefault();

    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } catch {}

    clearCurrentUser();
    renderAppChrome();
    showToast("Logged out successfully", "success");

    setTimeout(() => {
      const isInPages = window.location.pathname.includes("/pages/");
      window.location.href = isInPages ? "../index.html" : "./index.html";
    }, 800);
  });
}

function formatDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function timeAgo(dateString) {
  const diff = Date.now() - new Date(dateString);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(dateString);
}

function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getStatusBadgeClass(status) {
  return { Adoption: "success", Sale: "warning", Rehome: "info" }[status] || "secondary";
}

document.addEventListener("DOMContentLoaded", function () {
  renderAppChrome();
  initLogout();
  syncCurrentUser().catch(() => {});
});
