// =============================================
// PawMatch - Main JavaScript
// main.js
// =============================================
// This file runs on every page.
// It handles:
// - Injecting the shared navbar and footer
// - Checking if user is logged in
// - Back-to-top button
// - Toast notifications
// =============================================

// ---- API Base URL ----
// Change this if your backend runs on a different port
const API_BASE = "http://localhost:5000/api";

// ---- Get current user from localStorage ----
// When a user logs in, we store their info in localStorage
// so we don't have to hit the server for every page load
function getCurrentUser() {
  const user = localStorage.getItem("pawmatch_user");
  return user ? JSON.parse(user) : null;
}

// ---- Save user to localStorage ----
function setCurrentUser(user) {
  localStorage.setItem("pawmatch_user", JSON.stringify(user));
}

// ---- Remove user from localStorage (on logout) ----
function clearCurrentUser() {
  localStorage.removeItem("pawmatch_user");
}

// =============================================
// NAVBAR HTML Template
// =============================================
function getNavbarHTML(user) {
  const isLoggedIn = user !== null;
  const isAdmin = isLoggedIn && user.role === "admin";

  // Determine the base path for links (pages/ vs root)
  const isInPages = window.location.pathname.includes("/pages/");
  const base = isInPages ? "../" : "./";
  const pagesBase = isInPages ? "./" : "./pages/";

  const userMenuHTML = isLoggedIn
    ? `
    <li class="nav-item dropdown">
      <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button"
        data-bs-toggle="dropdown">
        👤 ${user.name.split(" ")[0]}
      </a>
      <ul class="dropdown-menu dropdown-menu-end">
        <li><a class="dropdown-item" href="${pagesBase}dashboard.html">📊 Dashboard</a></li>
        <li><a class="dropdown-item" href="${pagesBase}profile.html">👤 Profile</a></li>
        <li><a class="dropdown-item" href="${pagesBase}my-matches.html">💖 My Matches</a></li>
        <li><a class="dropdown-item" href="${pagesBase}add-pet.html">➕ Add Pet</a></li>
        <li><a class="dropdown-item" href="${pagesBase}manage-listings.html">🐾 Manage Listings</a></li>
        ${isAdmin ? '<li><hr class="dropdown-divider"></li><li><a class="dropdown-item text-danger" href="' + pagesBase + 'admin.html">🔑 Admin Panel</a></li>' : ""}
        <li><hr class="dropdown-divider"></li>
        <li><a class="dropdown-item text-danger" href="#" id="logoutBtn">🚪 Logout</a></li>
      </ul>
    </li>`
    : `
    <li class="nav-item">
      <a class="nav-link btn-nav-login" href="${pagesBase}login.html">Login</a>
    </li>
    <li class="nav-item ms-2">
      <a class="nav-link btn-nav-register" href="${pagesBase}register.html">Register</a>
    </li>`;

  return `
  <nav class="navbar navbar-expand-lg navbar-pawmatch">
    <div class="container">
      <a class="navbar-brand" href="${base}index.html">🐾 Paw<span>Match</span></a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="mainNav">
        <ul class="navbar-nav me-auto">
          <li class="nav-item"><a class="nav-link" href="${base}index.html">Home</a></li>
          <li class="nav-item"><a class="nav-link" href="${pagesBase}about.html">About</a></li>
          <li class="nav-item"><a class="nav-link" href="${pagesBase}pets.html">Browse Pets</a></li>
          <li class="nav-item"><a class="nav-link" href="${pagesBase}trade.html">Trade</a></li>
          <li class="nav-item"><a class="nav-link" href="${pagesBase}match-finder.html">Match Finder</a></li>
          <li class="nav-item">
            <a class="nav-link" href="${pagesBase}pawswipe.html" style="color:#ff6b35 !important; font-weight:700;">🐾 PawSwipe</a>
          </li>
          <li class="nav-item"><a class="nav-link" href="${pagesBase}community.html">Community</a></li>
          <li class="nav-item"><a class="nav-link" href="${pagesBase}blog.html">Blog</a></li>
          <li class="nav-item"><a class="nav-link" href="${pagesBase}notices.html">Notices</a></li>
          <li class="nav-item"><a class="nav-link" href="${pagesBase}faq.html">FAQ</a></li>
          <li class="nav-item"><a class="nav-link" href="${pagesBase}contact.html">Contact</a></li>
        </ul>
        <ul class="navbar-nav align-items-center">
          ${userMenuHTML}
        </ul>
      </div>
    </div>
  </nav>`;
}

// =============================================
// FOOTER HTML Template
// =============================================
function getFooterHTML() {
  const isInPages = window.location.pathname.includes("/pages/");
  const base = isInPages ? "../" : "./";
  const pagesBase = isInPages ? "./" : "./pages/";

  return `
  <footer class="footer-pawmatch">
    <div class="container">
      <div class="row">
        <div class="col-md-4 mb-4 mb-md-0">
          <h5>🐾 PawMatch</h5>
          <p style="color:rgba(255,255,255,0.65); font-size:0.9rem; max-width:280px;">
            Your one-stop platform for pet adoption, trading, social connection, and the fun PawSwipe experience.
          </p>
        </div>
        <div class="col-md-2 mb-3 mb-md-0">
          <h5>Discover</h5>
          <a href="${pagesBase}pets.html">Browse Pets</a>
          <a href="${pagesBase}pawswipe.html">PawSwipe</a>
          <a href="${pagesBase}match-finder.html">Match Finder</a>
          <a href="${pagesBase}trade.html">Trade</a>
        </div>
        <div class="col-md-2 mb-3 mb-md-0">
          <h5>Community</h5>
          <a href="${pagesBase}community.html">Social Feed</a>
          <a href="${pagesBase}blog.html">Blog</a>
          <a href="${pagesBase}notices.html">Notices</a>
          <a href="${pagesBase}faq.html">FAQ</a>
        </div>
        <div class="col-md-2 mb-3 mb-md-0">
          <h5>Platform</h5>
          <a href="${pagesBase}about.html">About Us</a>
          <a href="${pagesBase}contact.html">Contact</a>
          <a href="${pagesBase}adoption-process.html">Adoption Info</a>
        </div>
        <div class="col-md-2">
          <h5>Account</h5>
          <a href="${pagesBase}register.html">Register</a>
          <a href="${pagesBase}login.html">Login</a>
          <a href="${pagesBase}dashboard.html">Dashboard</a>
          <a href="${pagesBase}my-matches.html">My Matches</a>
        </div>
      </div>
      <div class="footer-bottom text-center">
        <p>© 2026 PawMatch. Built with ❤️ for pets everywhere. Academic Project.</p>
      </div>
    </div>
  </footer>

  <!-- Back to Top Button -->
  <button id="backToTop" title="Back to top">↑</button>`;
}

// =============================================
// INJECT NAVBAR AND FOOTER
// =============================================
function injectNavbar() {
  const user = getCurrentUser();
  const navbarHTML = getNavbarHTML(user);

  // Create a div and insert navbar at the start of body
  const navContainer = document.createElement("div");
  navContainer.id = "navbar-container";
  navContainer.innerHTML = navbarHTML;
  document.body.insertBefore(navContainer, document.body.firstChild);

  // Highlight active nav link based on current page
  const currentPage = window.location.pathname.split("/").pop();
  document.querySelectorAll(".navbar-nav .nav-link").forEach((link) => {
    const href = link.getAttribute("href");
    if (href && href.includes(currentPage) && currentPage !== "") {
      link.classList.add("active");
    }
  });

  // Handle logout button click
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        await fetch(`${API_BASE}/auth/logout`, { method: "POST", credentials: "include" });
      } catch (err) {
        // Even if server fails, clear local storage
      }
      clearCurrentUser();
      showToast("Logged out successfully", "success");
      setTimeout(() => {
        const isInPages = window.location.pathname.includes("/pages/");
        window.location.href = isInPages ? "../index.html" : "./index.html";
      }, 800);
    });
  }
}

function injectFooter() {
  const footerHTML = getFooterHTML();
  document.body.insertAdjacentHTML("beforeend", footerHTML);

  // Back to top functionality
  const backToTopBtn = document.getElementById("backToTop");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 400) {
      backToTopBtn.style.display = "block";
    } else {
      backToTopBtn.style.display = "none";
    }
  });

  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// =============================================
// TOAST NOTIFICATION
// =============================================
function showToast(message, type = "info") {
  // Create toast container if it doesn't exist
  let toastContainer = document.querySelector(".toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.className = "toast-container position-fixed top-0 end-0 p-3";
    toastContainer.style.zIndex = "9999";
    document.body.appendChild(toastContainer);
  }

  const bgClass = {
    success: "bg-success",
    error: "bg-danger",
    warning: "bg-warning text-dark",
    info: "bg-info text-dark",
  }[type] || "bg-secondary";

  const toastId = "toast_" + Date.now();
  const toastHTML = `
    <div id="${toastId}" class="toast align-items-center text-white ${bgClass} border-0 mb-2" role="alert">
      <div class="d-flex">
        <div class="toast-body fw-semibold">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    </div>`;

  toastContainer.insertAdjacentHTML("beforeend", toastHTML);

  const toastEl = document.getElementById(toastId);
  const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
  toast.show();

  // Remove from DOM after hiding
  toastEl.addEventListener("hidden.bs.toast", () => toastEl.remove());
}

// =============================================
// UTILITY FUNCTIONS (Used across pages)
// =============================================

// Format a date string nicely
function formatDate(dateString) {
  if (!dateString) return "";
  const d = new Date(dateString);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// Format time ago (e.g., "2 hours ago")
function timeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diff = now - date;

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

// Capitalize first letter
function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Get badge color class based on pet status
function getStatusBadgeClass(status) {
  const map = {
    Adoption: "success",
    Sale: "warning",
    Rehome: "info",
  };
  return map[status] || "secondary";
}

// =============================================
// INITIALIZE ON PAGE LOAD
// =============================================
document.addEventListener("DOMContentLoaded", function () {
  injectNavbar();
  injectFooter();
});
