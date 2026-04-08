// =============================================
// PawMatch - Authentication JavaScript
// auth.js
// =============================================
// Handles login form, register form validation
// and sending requests to the backend
// =============================================

// ---- LOGIN PAGE ----
function initLoginPage() {
  const loginForm = document.getElementById("loginForm");
  if (!loginForm) return;

  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const errorDiv = document.getElementById("loginError");
    const submitBtn = loginForm.querySelector('button[type="submit"]');

    // Basic validation
    if (!email || !password) {
      showError(errorDiv, "Please enter your email and password.");
      return;
    }

    // Disable button while loading
    submitBtn.disabled = true;
    submitBtn.textContent = "Logging in...";

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // needed for session cookies
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Save user to localStorage
        setCurrentUser(data.user);
        showToast("Welcome back, " + data.user.name + "!", "success");

        // Redirect to dashboard after 1 second
        setTimeout(() => {
          window.location.href = "./dashboard.html";
        }, 1000);
      } else {
        showError(errorDiv, data.message || "Login failed. Please try again.");
        submitBtn.disabled = false;
        submitBtn.textContent = "Login";
      }
    } catch (err) {
      showError(errorDiv, "Cannot connect to server. Please make sure the backend is running.");
      submitBtn.disabled = false;
      submitBtn.textContent = "Login";
    }
  });
}

// ---- REGISTER PAGE ----
function initRegisterPage() {
  const registerForm = document.getElementById("registerForm");
  if (!registerForm) return;

  registerForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const errorDiv = document.getElementById("registerError");
    const submitBtn = registerForm.querySelector('button[type="submit"]');

    // Validation checks
    if (!name || !email || !password || !confirmPassword) {
      showError(errorDiv, "All fields are required.");
      return;
    }

    if (password.length < 6) {
      showError(errorDiv, "Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      showError(errorDiv, "Passwords do not match.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showError(errorDiv, "Please enter a valid email address.");
      return;
    }

    // Disable button while loading
    submitBtn.disabled = true;
    submitBtn.textContent = "Creating account...";

    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setCurrentUser(data.user);
        showToast("Account created! Welcome to PawMatch!", "success");
        setTimeout(() => {
          window.location.href = "./dashboard.html";
        }, 1000);
      } else {
        showError(errorDiv, data.message || "Registration failed.");
        submitBtn.disabled = false;
        submitBtn.textContent = "Create Account";
      }
    } catch (err) {
      showError(errorDiv, "Cannot connect to server. Please make sure the backend is running.");
      submitBtn.disabled = false;
      submitBtn.textContent = "Create Account";
    }
  });

  // Real-time password strength indicator
  const passwordField = document.getElementById("password");
  if (passwordField) {
    passwordField.addEventListener("input", function () {
      const strength = checkPasswordStrength(this.value);
      const strengthBar = document.getElementById("passwordStrength");
      if (strengthBar) {
        strengthBar.className = "progress-bar " + strength.class;
        strengthBar.style.width = strength.width;
        strengthBar.textContent = strength.label;
      }
    });
  }
}

// Helper: Show error message
function showError(div, message) {
  if (!div) return;
  div.textContent = message;
  div.style.display = "block";
  div.classList.add("alert", "alert-danger", "py-2");
}

// Helper: Check password strength
function checkPasswordStrength(password) {
  if (password.length < 6) return { class: "bg-danger", width: "33%", label: "Weak" };
  if (password.length < 10) return { class: "bg-warning", width: "66%", label: "Medium" };
  return { class: "bg-success", width: "100%", label: "Strong" };
}

// ---- Initialize on page load ----
document.addEventListener("DOMContentLoaded", function () {
  initLoginPage();
  initRegisterPage();
});
