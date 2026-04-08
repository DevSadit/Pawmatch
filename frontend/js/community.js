// =============================================
// PawMatch - Community Feed JavaScript
// community.js
// =============================================
// Handles social posts: load, create, delete, like
// This is a CRUD module (create/read/delete)
// =============================================

// ---- Load all community posts ----
async function loadCommunityPosts() {
  const container = document.getElementById("postsContainer");
  if (!container) return;

  container.innerHTML = `
    <div class="loading-spinner">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>`;

  try {
    const response = await fetch(`${API_BASE}/community`);
    const posts = await response.json();

    container.innerHTML = "";

    if (posts.length === 0) {
      container.innerHTML = `
        <div class="text-center py-5">
          <div style="font-size:3rem">💬</div>
          <h5 class="mt-3">No posts yet</h5>
          <p class="text-muted">Be the first to share something!</p>
        </div>`;
      return;
    }

    posts.forEach((post) => {
      container.appendChild(renderPost(post));
    });
  } catch (err) {
    container.innerHTML = `<div class="alert alert-danger">Could not load posts. Is the server running?</div>`;
  }
}

// ---- Render a single post element ----
function renderPost(post) {
  const user = getCurrentUser();
  const isOwner = user && user.id === post.authorId;
  const isAdmin = user && user.role === "admin";
  const canDelete = isOwner || isAdmin;

  const div = document.createElement("div");
  div.className = "community-post-card card mb-3 shadow-sm";
  div.id = `post-${post.id}`;

  div.innerHTML = `
    <div class="card-body">
      <!-- Author & Time -->
      <div class="d-flex justify-content-between align-items-start mb-3">
        <div class="d-flex align-items-center gap-2">
          <div class="post-avatar">${post.authorName.charAt(0).toUpperCase()}</div>
          <div>
            <div class="fw-bold" style="font-size:0.9rem">${post.authorName}</div>
            <div class="text-muted" style="font-size:0.78rem">${timeAgo(post.createdAt)}</div>
          </div>
        </div>
        ${canDelete ? `
        <button class="btn btn-sm btn-outline-danger" onclick="deletePost(${post.id})" title="Delete post">
          🗑️
        </button>` : ""}
      </div>

      <!-- Post Content -->
      <p class="mb-2" style="font-size:0.95rem; line-height:1.6">${escapeHtml(post.content)}</p>

      ${post.image ? `<img src="${post.image}" alt="Post image" class="img-fluid rounded mb-2" style="max-height:300px; width:100%; object-fit:cover;">` : ""}

      <!-- Like Button -->
      <div class="d-flex align-items-center gap-3 mt-2 pt-2 border-top">
        <button class="btn btn-sm btn-light like-btn" id="like-btn-${post.id}" onclick="likePost(${post.id})">
          ❤️ <span id="like-count-${post.id}">${post.likes}</span>
        </button>
        <span class="text-muted" style="font-size:0.8rem">
          ${new Date(post.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
        </span>
      </div>
    </div>`;

  return div;
}

// ---- Create a new post ----
async function createPost() {
  const user = getCurrentUser();
  if (!user) {
    showToast("Please login to post", "warning");
    return;
  }

  const contentInput = document.getElementById("postContent");
  const content = contentInput?.value.trim();

  if (!content) {
    showToast("Please write something before posting", "warning");
    return;
  }

  if (content.length > 500) {
    showToast("Post is too long (max 500 characters)", "warning");
    return;
  }

  const submitBtn = document.getElementById("submitPostBtn");
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Posting...";
  }

  try {
    const response = await fetch(`${API_BASE}/community`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        content,
        authorName: user.name,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      // Clear the input
      if (contentInput) contentInput.value = "";

      // Add the new post to the top of the feed
      const container = document.getElementById("postsContainer");
      if (container) {
        const newPostEl = renderPost(data.post);
        container.insertBefore(newPostEl, container.firstChild);
      }

      showToast("Post shared!", "success");

      // Update character counter
      updateCharCount();
    } else {
      showToast(data.message || "Failed to post", "error");
    }
  } catch (err) {
    showToast("Server error. Please try again.", "error");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Post";
    }
  }
}

// ---- Delete a post ----
async function deletePost(postId) {
  if (!confirm("Delete this post?")) return;

  try {
    const response = await fetch(`${API_BASE}/community/${postId}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (response.ok) {
      // Remove from DOM
      const postEl = document.getElementById(`post-${postId}`);
      if (postEl) {
        postEl.style.transition = "all 0.3s ease";
        postEl.style.opacity = "0";
        setTimeout(() => postEl.remove(), 300);
      }
      showToast("Post deleted", "success");
    } else {
      showToast("Could not delete post", "error");
    }
  } catch (err) {
    showToast("Server error", "error");
  }
}

// ---- Like / Unlike a post ----
async function likePost(postId) {
  const user = getCurrentUser();
  const guestId = "guest_" + (localStorage.getItem("guest_id") || Math.random().toString(36).substr(2, 9));
  localStorage.setItem("guest_id", guestId.replace("guest_", ""));

  try {
    const response = await fetch(`${API_BASE}/community/${postId}/like`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ guestId }),
    });

    if (response.ok) {
      const data = await response.json();
      const countEl = document.getElementById(`like-count-${postId}`);
      if (countEl) countEl.textContent = data.likes;
    }
  } catch (err) {
    // Silently fail for like
  }
}

// ---- Update character counter ----
function updateCharCount() {
  const content = document.getElementById("postContent");
  const counter = document.getElementById("charCount");
  if (!content || !counter) return;

  const remaining = 500 - content.value.length;
  counter.textContent = remaining;
  counter.style.color = remaining < 50 ? "#dc3545" : "#6c757d";
}

// ---- Escape HTML to prevent XSS ----
function escapeHtml(str) {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

// ---- Initialize ----
document.addEventListener("DOMContentLoaded", function () {
  if (!document.getElementById("postsContainer")) return;

  loadCommunityPosts();

  // Post submission
  const submitBtn = document.getElementById("submitPostBtn");
  if (submitBtn) submitBtn.addEventListener("click", createPost);

  // Character counter
  const content = document.getElementById("postContent");
  if (content) {
    content.addEventListener("input", updateCharCount);

    // Ctrl+Enter to submit
    content.addEventListener("keydown", function (e) {
      if (e.ctrlKey && e.key === "Enter") createPost();
    });
  }

  // Check login status and show/hide post form
  const postForm = document.getElementById("postFormWrapper");
  const loginPrompt = document.getElementById("loginPrompt");
  const user = getCurrentUser();

  if (user) {
    if (postForm) postForm.style.display = "block";
    if (loginPrompt) loginPrompt.style.display = "none";
  } else {
    if (postForm) postForm.style.display = "none";
    if (loginPrompt) loginPrompt.style.display = "block";
  }
});
