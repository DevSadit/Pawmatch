// =============================================
// Auth Routes - /api/auth
// =============================================
// Handles: Register, Login, Logout, Get current user
// Auth is kept very simple: users stored in users.json
// No JWT — just express-session
// =============================================

const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

// Path to users data file
const usersFile = path.join(__dirname, "../data/users.json");

// Helper: Read users from file
function getUsers() {
  const data = fs.readFileSync(usersFile, "utf-8");
  return JSON.parse(data);
}

// Helper: Write users to file
function saveUsers(users) {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

// ---- POST /api/auth/register ----
// Create a new user account
router.post("/register", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const users = getUsers();

  // Check if email already exists
  const existing = users.find((u) => u.email === email);
  if (existing) {
    return res.status(400).json({ message: "Email already registered" });
  }

  // Create new user object
  const newUser = {
    id: Date.now(), // simple unique ID using timestamp
    name,
    email,
    password, // NOTE: In real projects, always hash passwords!
    role: "user", // default role
    avatar: "",
    preferences: {
      petType: "",
      energy: "",
      homeType: "",
    },
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);

  // Start session
  req.session.userId = newUser.id;
  req.session.userRole = newUser.role;

  // Return user without password
  const { password: _, ...userSafe } = newUser;
  res.status(201).json({ message: "Registration successful", user: userSafe });
});

// ---- POST /api/auth/login ----
// Verify credentials and start session
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  const users = getUsers();
  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  // Start session
  req.session.userId = user.id;
  req.session.userRole = user.role;

  // Return user without password
  const { password: _, ...userSafe } = user;
  res.json({ message: "Login successful", user: userSafe });
});

// ---- POST /api/auth/logout ----
// Destroy session
router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out successfully" });
  });
});

// ---- GET /api/auth/me ----
// Get current logged-in user info
router.get("/me", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not logged in" });
  }

  const users = getUsers();
  const user = users.find((u) => u.id === req.session.userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const { password: _, ...userSafe } = user;
  res.json(userSafe);
});

// ---- PUT /api/auth/update ----
// Update user profile (name, preferences)
router.put("/update", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not logged in" });
  }

  const users = getUsers();
  const index = users.findIndex((u) => u.id === req.session.userId);

  if (index === -1) {
    return res.status(404).json({ message: "User not found" });
  }

  const { name, avatar, preferences } = req.body;

  if (name) users[index].name = name;
  if (avatar) users[index].avatar = avatar;
  if (preferences) users[index].preferences = preferences;

  saveUsers(users);

  const { password: _, ...userSafe } = users[index];
  res.json({ message: "Profile updated", user: userSafe });
});

module.exports = router;
