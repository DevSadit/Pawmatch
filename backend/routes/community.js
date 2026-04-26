// =============================================
// Community Routes - /api/community
// =============================================
// Public feed: anyone can read posts, but only logged-in users can
// create posts, like them, or comment on them.
// =============================================

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Post = require("../models/Post");
const User = require("../models/User");

async function getSessionUser(req) {
  if (!req.session.userId) return null;
  return User.findById(req.session.userId).select("name avatar");
}

// ---- GET /api/community ----
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts.map((post) => post.toJSON()));
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ---- POST /api/community ----
router.post("/", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Please login to post" });
  }

  const { content, image } = req.body;
  if (!content) {
    return res.status(400).json({ message: "Post content is required" });
  }

  try {
    const user = await getSessionUser(req);
    if (!user) {
      return res.status(401).json({ message: "Please login to post" });
    }

    const post = await Post.create({
      content: content.trim(),
      authorId: req.session.userId,
      authorName: user.name || "Anonymous",
      image: image || "",
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
  if (!req.session.userId) {
    return res.status(401).json({ message: "Please login to like posts" });
  }

  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Post not found" });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId = req.session.userId.toString();
    post.likedBy = post.likedBy || [];

    const likedIndex = post.likedBy.findIndex((id) => id.toString() === userId);
    if (likedIndex !== -1) {
      post.likedBy.splice(likedIndex, 1);
      post.likes = Math.max(0, post.likes - 1);
    } else {
      post.likedBy.push(req.session.userId);
      post.likes += 1;
    }

    await post.save();
    res.json({ message: "Updated", likes: post.likes, liked: likedIndex === -1 });
  } catch (err) {
    console.error("PUT /community/:id/like error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---- POST /api/community/:id/comments ----
router.post("/:id/comments", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Please login to comment" });
  }

  const { content } = req.body;
  const trimmed = (content || "").trim();

  if (!trimmed) {
    return res.status(400).json({ message: "Comment content is required" });
  }

  if (trimmed.length > 500) {
    return res.status(400).json({ message: "Comment is too long" });
  }

  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Post not found" });
    }

    const [post, user] = await Promise.all([
      Post.findById(req.params.id),
      getSessionUser(req),
    ]);

    if (!post) return res.status(404).json({ message: "Post not found" });
    if (!user) return res.status(401).json({ message: "Please login to comment" });

    post.comments = post.comments || [];
    post.comments.push({
      userId: req.session.userId,
      authorName: user.name || "Anonymous",
      content: trimmed,
    });

    await post.save();

    const savedComment = post.comments[post.comments.length - 1];
    res.status(201).json({
      message: "Comment added",
      comment: savedComment.toJSON ? savedComment.toJSON() : savedComment,
      comments: post.comments.map((comment) => (comment.toJSON ? comment.toJSON() : comment)),
    });
  } catch (err) {
    console.error("POST /community/:id/comments error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
