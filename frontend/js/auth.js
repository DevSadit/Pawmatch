// =============================================
// PawMatch - Authentication JavaScript
// auth.js
// =============================================

function initLoginPage() {
  const loginForm = document.getElementById("loginForm");
  if (!loginForm) return;

  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const errorDiv = document.getElementById("loginError");
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const normalizedEmail = email.toLowerCase();

    if (!normalizedEmail || !password) {
      showError(errorDiv, "Please enter your email and password.");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Logging in...";

    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, password }),
      });

      setCurrentUser(data.user);
      await syncLegacyMatchesToServer();
      showToast(`Welcome back, ${data.user.name}!`, "success");
      setTimeout(() => {
        window.location.href = getPostAuthRedirect() || "./dashboard.html";
      }, 1000);
    } catch (error) {
      showError(errorDiv, error?.message || "Cannot connect to server. Make sure the backend is running.");
      submitBtn.disabled = false;
      submitBtn.textContent = "Login";
    }
  });
}

function initRegisterPage() {
  const registerForm = document.getElementById("registerForm");
  if (!registerForm) return;

  registerForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const agreeTerms = document.getElementById("agreeTerms")?.checked;
    const errorDiv = document.getElementById("registerError");
    const submitBtn = registerForm.querySelector('button[type="submit"]');

    const normalizedEmail = email.toLowerCase();

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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      showError(errorDiv, "Please enter a valid email address.");
      return;
    }
    if (!agreeTerms) {
      showError(errorDiv, "Please agree to the terms and community guidelines.");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Creating account...";

    try {
      const data = await apiFetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: normalizedEmail,
          password,
          preferences: {
            petType: document.getElementById("preferredPet")?.value || "",
          },
        }),
      });

      setCurrentUser(data.user);
      await syncLegacyMatchesToServer();
      showToast("Account created! Welcome to PawMatch!", "success");
      setTimeout(() => {
        window.location.href = getPostAuthRedirect() || "./dashboard.html";
      }, 1000);
    } catch (error) {
      showError(errorDiv, error?.message || "Cannot connect to server. Make sure the backend is running.");
      submitBtn.disabled = false;
      submitBtn.textContent = "Create Account";
    }
  });

  const passwordField = document.getElementById("password");
  if (passwordField) {
    passwordField.addEventListener("input", function () {
      const bar = document.getElementById("passwordStrength");
      if (!bar) return;

      const length = this.value.length;
      if (length === 0) {
        bar.style.width = "0%";
        bar.style.background = "#e3e2de";
      } else if (length < 6) {
        bar.style.width = "33%";
        bar.style.background = "#b02500";
      } else if (length < 10) {
        bar.style.width = "66%";
        bar.style.background = "#f9873e";
      } else {
        bar.style.width = "100%";
        bar.style.background = "#22c55e";
      }
    });
  }
}

function showError(div, message) {
  if (!div) return;
  div.textContent = message;
  div.style.display = "block";
}

function getPostAuthRedirect() {
  const params = new URLSearchParams(window.location.search);
  const next = params.get("next") || params.get("redirect");

  if (!next) return "";

  if (next.includes("://") || next.startsWith("//")) {
    return "";
  }

  return next;
}

document.addEventListener("DOMContentLoaded", function () {
  initLoginPage();
  initRegisterPage();
});
