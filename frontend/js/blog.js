// =============================================
// PawMatch - Blog JavaScript
// blog.js
// =============================================
// Loads blog posts via AJAX from the backend.
// This is AJAX Call #2 as required by the PRD.
// Shows posts in cards with a preview modal.
// =============================================

let allBlogs = [];

// ---- Load blog posts via AJAX ----
// This demonstrates AJAX + JSON requirement
async function loadBlogPosts() {
  const container = document.getElementById("blogContainer");
  const loadingDiv = document.getElementById("blogLoading");

  if (!container) return;

  if (loadingDiv) loadingDiv.style.display = "flex";

  try {
    // AJAX call to get blog posts
    const response = await fetch(`${API_BASE}/blog`);
    allBlogs = await response.json();

    if (loadingDiv) loadingDiv.style.display = "none";

    renderBlogs(allBlogs);
  } catch (err) {
    if (loadingDiv) loadingDiv.style.display = "none";
    container.innerHTML = `<div class="col-12"><div class="alert alert-danger">Could not load blog posts. Is the server running?</div></div>`;
    console.error("Error loading blogs:", err);
  }
}

// ---- Render blog post cards ----
function renderBlogs(blogs) {
  const container = document.getElementById("blogContainer");
  container.innerHTML = "";

  if (blogs.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center py-5">
        <div style="font-size:3rem">📝</div>
        <h5 class="mt-3">No posts found for this category</h5>
      </div>`;
    return;
  }

  blogs.forEach((blog) => {
    const col = document.createElement("div");
    col.className = "col-md-4 mb-4";
    col.innerHTML = `
      <div class="blog-card card h-100 shadow-sm" style="border-radius:16px; overflow:hidden; border:1px solid #e8e8e8; transition:transform 0.3s;">
        <img src="${blog.image}" alt="${blog.title}" class="card-img-top"
          style="height:200px; object-fit:cover;"
          onerror="this.src='https://placehold.co/800x400/f5f5f5/aaa?text=Blog+Post'">
        <div class="card-body d-flex flex-column">
          <div class="d-flex gap-2 mb-2">
            <span class="badge bg-primary bg-opacity-10 text-primary" style="font-size:0.75rem">${blog.category}</span>
            <span class="text-muted" style="font-size:0.75rem">⏱ ${blog.readTime}</span>
          </div>
          <h5 class="card-title fw-bold" style="font-size:1rem">${blog.title}</h5>
          <p class="card-text text-muted flex-fill" style="font-size:0.85rem">${blog.summary}</p>
          <div class="d-flex justify-content-between align-items-center mt-3">
            <small class="text-muted">✍️ ${blog.author} · ${formatDate(blog.date)}</small>
            <button class="btn btn-sm btn-primary-pawmatch" onclick="openBlogModal(${blog.id})">
              Read →
            </button>
          </div>
        </div>
      </div>`;

    // Hover effect
    const card = col.querySelector(".blog-card");
    card.addEventListener("mouseenter", () => { card.style.transform = "translateY(-5px)"; });
    card.addEventListener("mouseleave", () => { card.style.transform = ""; });

    container.appendChild(col);
  });
}

// ---- Open Blog Post Modal ----
function openBlogModal(blogId) {
  const blog = allBlogs.find((b) => b.id === blogId);
  if (!blog) return;

  document.getElementById("modalBlogTitle").textContent = blog.title;
  document.getElementById("modalBlogMeta").innerHTML = `
    <span class="badge bg-primary bg-opacity-10 text-primary me-2">${blog.category}</span>
    ✍️ ${blog.author} &nbsp;·&nbsp; 📅 ${formatDate(blog.date)} &nbsp;·&nbsp; ⏱ ${blog.readTime}`;
  document.getElementById("modalBlogImage").src = blog.image;
  document.getElementById("modalBlogImage").alt = blog.title;
  document.getElementById("modalBlogContent").innerHTML = blog.content
    .split("\n")
    .map((para) => para.trim() ? `<p>${para}</p>` : "")
    .join("");

  // Show the Bootstrap modal
  const modal = new bootstrap.Modal(document.getElementById("blogModal"));
  modal.show();
}

// ---- Filter blogs by category ----
function filterByCategory(category) {
  // Update active button
  document.querySelectorAll(".category-filter-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  event.target.classList.add("active");

  if (category === "All") {
    renderBlogs(allBlogs);
  } else {
    const filtered = allBlogs.filter((b) => b.category === category);
    renderBlogs(filtered);
  }
}

// ---- Initialize ----
document.addEventListener("DOMContentLoaded", function () {
  if (!document.getElementById("blogContainer")) return;
  loadBlogPosts();
});
