// =============================================
// Admin Routes - /api/admin
// =============================================
// Admin-only moderation endpoints
// Uses MongoDB Atlas via Mongoose
// =============================================

const express  = require("express");
const router   = express.Router();
const mongoose = require("mongoose");
const User     = require("../models/User");
const Pet      = require("../models/Pet");
const Post     = require("../models/Post");

// Middleware: admin only
function requireAdmin(req, res, next) {
  if (!req.session.userId || req.session.userRole !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

// ---- GET /api/admin/stats ----
router.get("/stats", requireAdmin, async (req, res) => {
  try {
    const [totalUsers, totalPets, totalPosts, adoptionPets, salePets, rehomePets] =
      await Promise.all([
        User.countDocuments(),
        Pet.countDocuments(),
        Post.countDocuments(),
        Pet.countDocuments({ status: "Adoption" }),
        Pet.countDocuments({ status: "Sale" }),
        Pet.countDocuments({ status: "Rehome" }),
      ]);

    res.json({ totalUsers, totalPets, totalPosts, adoptionPets, salePets, rehomePets });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ---- GET /api/admin/users ----
router.get("/users", requireAdmin, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users.map((u) => u.toJSON()));
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ---- DELETE /api/admin/users/:id ----
router.delete("/users/:id", requireAdmin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "User not found" });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ---- GET /api/admin/pets ----
router.get("/pets", requireAdmin, async (req, res) => {
  try {
    const pets = await Pet.find().sort({ createdAt: -1 });
    res.json(pets.map((p) => p.toJSON()));
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ---- DELETE /api/admin/pets/:id ----
router.delete("/pets/:id", requireAdmin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Pet not found" });
    }
    await Pet.findByIdAndDelete(req.params.id);
    res.json({ message: "Pet listing removed" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ---- GET /api/admin/posts ----
router.get("/posts", requireAdmin, async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts.map((p) => p.toJSON()));
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ---- DELETE /api/admin/posts/:id ----
router.delete("/posts/:id", requireAdmin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Post not found" });
    }
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
