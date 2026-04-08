// =============================================
// Admin Routes - /api/admin
// =============================================
// Admin-only endpoints for moderation
// =============================================

const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const usersFile = path.join(__dirname, "../data/users.json");
const petsFile = path.join(__dirname, "../data/pets.json");
const communityFile = path.join(__dirname, "../data/community.json");

// Middleware: Check if user is admin
function requireAdmin(req, res, next) {
  if (!req.session.userId || req.session.userRole !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

// ---- GET /api/admin/stats ----
// Dashboard stats
router.get("/stats", requireAdmin, (req, res) => {
  const users = JSON.parse(fs.readFileSync(usersFile, "utf-8"));
  const pets = JSON.parse(fs.readFileSync(petsFile, "utf-8"));
  const posts = JSON.parse(fs.readFileSync(communityFile, "utf-8"));

  res.json({
    totalUsers: users.length,
    totalPets: pets.length,
    totalPosts: posts.length,
    adoptionPets: pets.filter((p) => p.status === "Adoption").length,
    salePets: pets.filter((p) => p.status === "Sale").length,
    rehomePets: pets.filter((p) => p.status === "Rehome").length,
  });
});

// ---- GET /api/admin/users ----
// Get all users
router.get("/users", requireAdmin, (req, res) => {
  const users = JSON.parse(fs.readFileSync(usersFile, "utf-8"));
  // Remove passwords before sending
  const safeUsers = users.map(({ password, ...u }) => u);
  res.json(safeUsers);
});

// ---- DELETE /api/admin/users/:id ----
// Delete a user
router.delete("/users/:id", requireAdmin, (req, res) => {
  const users = JSON.parse(fs.readFileSync(usersFile, "utf-8"));
  const filtered = users.filter((u) => u.id !== parseInt(req.params.id));
  fs.writeFileSync(usersFile, JSON.stringify(filtered, null, 2));
  res.json({ message: "User deleted" });
});

// ---- GET /api/admin/pets ----
// Get all pets (admin view)
router.get("/pets", requireAdmin, (req, res) => {
  const pets = JSON.parse(fs.readFileSync(petsFile, "utf-8"));
  res.json(pets);
});

// ---- DELETE /api/admin/pets/:id ----
// Force delete any pet listing
router.delete("/pets/:id", requireAdmin, (req, res) => {
  const pets = JSON.parse(fs.readFileSync(petsFile, "utf-8"));
  const filtered = pets.filter((p) => p.id !== parseInt(req.params.id));
  fs.writeFileSync(petsFile, JSON.stringify(filtered, null, 2));
  res.json({ message: "Pet listing removed" });
});

// ---- GET /api/admin/posts ----
// Get all community posts
router.get("/posts", requireAdmin, (req, res) => {
  const posts = JSON.parse(fs.readFileSync(communityFile, "utf-8"));
  res.json(posts);
});

// ---- DELETE /api/admin/posts/:id ----
// Delete any community post
router.delete("/posts/:id", requireAdmin, (req, res) => {
  const posts = JSON.parse(fs.readFileSync(communityFile, "utf-8"));
  const filtered = posts.filter((p) => p.id !== parseInt(req.params.id));
  fs.writeFileSync(communityFile, JSON.stringify(filtered, null, 2));
  res.json({ message: "Post deleted" });
});

module.exports = router;
