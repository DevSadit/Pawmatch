// =============================================
// Community Routes - /api/community
// =============================================
// Handles social feed posts: create, read, delete, like
// =============================================

const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const communityFile = path.join(__dirname, "../data/community.json");

function getPosts() {
  const data = fs.readFileSync(communityFile, "utf-8");
  return JSON.parse(data);
}

function savePosts(posts) {
  fs.writeFileSync(communityFile, JSON.stringify(posts, null, 2));
}

// ---- GET /api/community ----
// Get all community posts (newest first)
router.get("/", (req, res) => {
  const posts = getPosts();
  // Sort by date descending (newest first)
  posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(posts);
});

// ---- POST /api/community ----
// Create a new post
router.post("/", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Please login to post" });
  }

  const { content, authorName, image } = req.body;

  if (!content) {
    return res.status(400).json({ message: "Post content is required" });
  }

  const posts = getPosts();

  const newPost = {
    id: Date.now(),
    content,
    authorId: req.session.userId,
    authorName: authorName || "Anonymous",
    image: image || "",
    likes: 0,
    likedBy: [], // track who liked
    createdAt: new Date().toISOString(),
  };

  posts.push(newPost);
  savePosts(posts);

  res.status(201).json({ message: "Post created", post: newPost });
});

// ---- DELETE /api/community/:id ----
// Delete a post (owner or admin only)
router.delete("/:id", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Please login" });
  }

  const posts = getPosts();
  const index = posts.findIndex((p) => p.id === parseInt(req.params.id));

  if (index === -1) {
    return res.status(404).json({ message: "Post not found" });
  }

  if (
    posts[index].authorId !== req.session.userId &&
    req.session.userRole !== "admin"
  ) {
    return res.status(403).json({ message: "Not authorized" });
  }

  posts.splice(index, 1);
  savePosts(posts);

  res.json({ message: "Post deleted" });
});

// ---- PUT /api/community/:id/like ----
// Like or unlike a post (toggle)
router.put("/:id/like", (req, res) => {
  const posts = getPosts();
  const post = posts.find((p) => p.id === parseInt(req.params.id));

  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  const userId = req.session.userId || req.body.guestId;

  if (!post.likedBy) post.likedBy = [];

  const alreadyLiked = post.likedBy.includes(userId);

  if (alreadyLiked) {
    // Unlike
    post.likedBy = post.likedBy.filter((id) => id !== userId);
    post.likes = Math.max(0, post.likes - 1);
  } else {
    // Like
    post.likedBy.push(userId);
    post.likes += 1;
  }

  savePosts(posts);
  res.json({ message: "Updated", likes: post.likes });
});

module.exports = router;
