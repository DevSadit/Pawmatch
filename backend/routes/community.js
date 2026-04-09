// =============================================
// Community Routes - /api/community
// =============================================
// Social feed posts: create, read, delete, like
// Uses MongoDB Atlas via Mongoose
// =============================================

const express  = require("express");
const router   = express.Router();
const mongoose = require("mongoose");
const Post     = require("../models/Post");

// ---- GET /api/community ----
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts.map((p) => p.toJSON()));
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ---- POST /api/community ----
router.post("/", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Please login to post" });
  }

  const { content, authorName, image } = req.body;
  if (!content) {
    return res.status(400).json({ message: "Post content is required" });
  }

  try {
    const post = await Post.create({
      content,
      authorId:   req.session.userId,
      authorName: authorName || "Anonymous",
      image:      image || "",
    });
    res.status(201).json({ message: "Post created", post: post.toJSON() });
  } catch (err) {
    console.error("POST /community error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---- DELETE /api/community/:id ----
router.delete("/:id", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Please login" });
  }

  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Post not found" });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.authorId.toString() !== req.session.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await post.deleteOne();
    res.json({ message: "Post deleted" });
  } catch (err) {
    console.error("DELETE /community/:id error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---- PUT /api/community/:id/like ----
router.put("/:id/like", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Post not found" });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Accept logged-in user ID or a guest identifier from body
    const userId = req.session.userId || req.body.guestId;
    if (!userId) return res.status(400).json({ message: "User id required" });

    const idStr      = userId.toString();
    const likedIndex = post.likedBy.findIndex((id) => id.toString() === idStr);

    if (likedIndex !== -1) {
      post.likedBy.splice(likedIndex, 1);
      post.likes = Math.max(0, post.likes - 1);
    } else {
      // Only push a valid ObjectId (skip guest strings)
      if (mongoose.Types.ObjectId.isValid(userId)) {
        post.likedBy.push(userId);
      }
      post.likes += 1;
    }

    await post.save();
    res.json({ message: "Updated", likes: post.likes });
  } catch (err) {
    console.error("PUT /community/:id/like error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
