// =============================================
// Auth Routes - /api/auth
// =============================================
// Register, Login, Logout, Get/Update current user
// Uses MongoDB Atlas via Mongoose + bcryptjs
// =============================================

const express  = require("express");
const router   = express.Router();
const bcrypt   = require("bcryptjs");
const User     = require("../models/User");

// ---- POST /api/auth/register ----
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashed  = await bcrypt.hash(password, 12);
    const newUser = await User.create({ name, email, password: hashed });

    req.session.userId   = newUser._id.toString();
    req.session.userRole = newUser.role;

    res.status(201).json({ message: "Registration successful", user: newUser.toJSON() });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---- POST /api/auth/login ----
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  try {
    // select("+password") not needed here since we excluded password in toJSON transform only
    const user = await User.findOne({ email }).select("+password");

    // Re-attach password field for comparison (schema hides it in toJSON but not in model)
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Get raw password from document (bypass toJSON transform)
    const rawDoc  = user.toObject();
    const isMatch = await bcrypt.compare(password, rawDoc.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    req.session.userId   = user._id.toString();
    req.session.userRole = user.role;

    res.json({ message: "Login successful", user: user.toJSON() });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---- POST /api/auth/logout ----
router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out successfully" });
  });
});

// ---- GET /api/auth/me ----
router.get("/me", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not logged in" });
  }

  try {
    const user = await User.findById(req.session.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.toJSON());
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ---- PUT /api/auth/update ----
router.put("/update", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not logged in" });
  }

  const { name, avatar, preferences } = req.body;
  const updates = {};
  if (name)        updates.name        = name;
  if (avatar)      updates.avatar      = avatar;
  if (preferences) updates.preferences = preferences;

  try {
    const user = await User.findByIdAndUpdate(
      req.session.userId,
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "Profile updated", user: user.toJSON() });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
