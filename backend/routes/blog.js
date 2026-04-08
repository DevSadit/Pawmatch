// =============================================
// Blog Routes - /api/blog
// =============================================
// Serves blog posts from blogs.json
// Frontend uses AJAX to fetch these
// =============================================

const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const blogsFile = path.join(__dirname, "../data/blogs.json");

// ---- GET /api/blog ----
// Return all blog posts
router.get("/", (req, res) => {
  const data = fs.readFileSync(blogsFile, "utf-8");
  const blogs = JSON.parse(data);
  res.json(blogs);
});

// ---- GET /api/blog/:id ----
// Return a single blog post
router.get("/:id", (req, res) => {
  const data = fs.readFileSync(blogsFile, "utf-8");
  const blogs = JSON.parse(data);
  const blog = blogs.find((b) => b.id === parseInt(req.params.id));

  if (!blog) {
    return res.status(404).json({ message: "Blog post not found" });
  }

  res.json(blog);
});

module.exports = router;
