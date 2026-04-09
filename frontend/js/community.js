// =============================================
// PawMatch - Community Feed JavaScript
// community.js
// =============================================

// ---- Load all community posts ----
async function loadCommunityPosts() {
  const container = document.getElementById("postsContainer");
  if (!container) return;

  container.innerHTML = `
    <div style="display:flex;justify-content:center;padding:40px 0;">
      <div style="width:40px;height:40px;border:4px solid #f9873e;border-top-color:#964300;border-radius:50%;animation:spin 0.8s linear infinite;"></div>
    </div>
    <style>@keyframes spin{to{transform:rotate(360deg)}}</style>`;

  try {
    const res   = await fetch(`${API_BASE}/community`);
    const posts = await res.json();

    container.innerHTML = "";

    if (posts.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:60px 16px;">
          <div style="font-size:3rem">💬</div>
          <h5 style="font-family:'Plus Jakarta Sans',sans-serif;font-weight:800;margin-top:12px;">No posts yet</h5>
          <p style="color:#5b5c59;">Be the first to share something!</p>
        </div>`;
      return;
    }

    posts.forEach((post) => container.appendChild(renderPost(post)));
  } catch (err) {
    container.innerHTML = `
      <div style="text-align:center;padding:40px 16px;background:#fee2e2;border-radius:16px;">
        <p style="color:#b02500;font-weight:600;">Could not load posts. Is the server running?</p>
      </div>`;
  }
}

// ---- Render a single post element ----
function renderPost(post) {
  const user     = getCurrentUser();
  const isOwner  = user && (user.id === post.authorId || user._id === post.authorId);
  const canDelete= isOwner;

  const div = document.createElement("div");
  div.id    = `post-${post.id}`;
  div.style.cssText = "background:#ffffff;border-radius:1.25rem;padding:20px;box-shadow:0 2px 12px rgba(0,0,0,0.06);margin-bottom:16px;";

  div.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px;">
      <div style="display:flex;align-items:center;gap:10px;">
        <div style="width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,#964300,#f9873e);display:flex;align-items:center;justify-content:center;font-family:'Plus Jakarta Sans',sans-serif;font-weight:800;font-size:1rem;color:#fff0e9;flex-shrink:0;">
          ${post.authorName.charAt(0).toUpperCase()}
        </div>
        <div>
          <div style="font-weight:700;font-size:0.9rem;color:#2e2f2d;">${post.authorName}</div>
          <div style="font-size:0.78rem;color:#5b5c59;">${timeAgo(post.createdAt)}</div>
        </div>
      </div>
      ${canDelete ? `
      <button onclick="deletePost('${post.id}')"
        style="width:34px;height:34px;border-radius:50%;border:none;background:#fee2e2;color:#b02500;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:0.85rem;flex-shrink:0;"
        title="Delete post">🗑️</button>` : ""}
    </div>

    <p style="font-size:0.95rem;line-height:1.65;color:#2e2f2d;margin-bottom:12px;">${escapeHtml(post.content)}</p>

    ${post.image ? `<img src="${post.image}" alt="Post image" style="width:100%;max-height:300px;object-fit:cover;border-radius:12px;margin-bottom:12px;">` : ""}

    <div style="display:flex;align-items:center;gap:12px;padding-top:12px;border-top:1px solid #e9e8e4;">
      <button id="like-btn-${post.id}" onclick="likePost('${post.id}')"
        style="display:flex;align-items:center;gap:6px;padding:5px 14px;border-radius:999px;border:1px solid #e3e2de;background:transparent;cursor:pointer;font-family:'Be Vietnam Pro',sans-serif;font-size:0.85rem;font-weight:600;color:#5b5c59;transition:all 0.2s;"
        onmouseover="this.style.borderColor='#aa2c32';this.style.color='#aa2c32'"
        onmouseout="this.style.borderColor='#e3e2de';this.style.color='#5b5c59'">
        ❤️ <span id="like-count-${post.id}">${post.likes}</span>
      </button>
      <span style="font-size:0.8rem;color:#5b5c59;">
        ${new Date(post.createdAt).toLocaleDateString("en-GB", { day:"numeric", month:"short" })}
      </span>
    </div>`;

  return div;
}

// ---- Create a new post ----
async function createPost() {
  const user = getCurrentUser();
  if (!user) { showToast("Please login to post", "warning"); return; }

  const contentInput = document.getElementById("postContent");
  const content = contentInput?.value.trim();

  if (!content)          { showToast("Please write something before posting", "warning"); return; }
  if (content.length > 500) { showToast("Post is too long (max 500 characters)", "warning"); return; }

  const submitBtn = document.getElementById("submitPostBtn");
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Posting…"; }

  try {
    const res  = await fetch(`${API_BASE}/community`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ content, authorName: user.name }),
    });
    const data = await res.json();

    if (res.ok) {
      if (contentInput) contentInput.value = "";
      const container = document.getElementById("postsContainer");
      if (container) container.insertBefore(renderPost(data.post), container.firstChild);
      showToast("Post shared!", "success");
      updateCharCount();
    } else {
      showToast(data.message || "Failed to post", "error");
    }
  } catch { showToast("Server error. Please try again.", "error"); }
  finally {
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Post"; }
  }
}

// ---- Delete a post ----
async function deletePost(postId) {
  if (!confirm("Delete this post?")) return;
  try {
    const res = await fetch(`${API_BASE}/community/${postId}`, {
      method: "DELETE", credentials: "include",
    });
    if (res.ok) {
      const el = document.getElementById(`post-${postId}`);
      if (el) {
        el.style.transition = "all 0.3s ease";
        el.style.opacity = "0";
        setTimeout(() => el.remove(), 300);
      }
      showToast("Post deleted", "success");
    } else {
      showToast("Could not delete post", "error");
    }
  } catch { showToast("Server error", "error"); }
}

// ---- Like / Unlike a post ----
async function likePost(postId) {
  const guestId = "guest_" + (localStorage.getItem("guest_id") || Math.random().toString(36).substr(2, 9));
  localStorage.setItem("guest_id", guestId.replace("guest_", ""));

  try {
    const res = await fetch(`${API_BASE}/community/${postId}/like`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ guestId }),
    });
    if (res.ok) {
      const data = await res.json();
      const countEl = document.getElementById(`like-count-${postId}`);
      if (countEl) countEl.textContent = data.likes;
    }
  } catch { /* silently fail */ }
}

// ---- Update character counter ----
function updateCharCount() {
  const content = document.getElementById("postContent");
  const counter = document.getElementById("charCount");
  if (!content || !counter) return;
  const remaining = 500 - content.value.length;
  counter.textContent = remaining;
  counter.style.color = remaining < 50 ? "#b02500" : "#5b5c59";
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

  const submitBtn = document.getElementById("submitPostBtn");
  if (submitBtn) submitBtn.addEventListener("click", createPost);

  const content = document.getElementById("postContent");
  if (content) {
    content.addEventListener("input", updateCharCount);
    content.addEventListener("keydown", function (e) {
      if (e.ctrlKey && e.key === "Enter") createPost();
    });
  }

  const user = getCurrentUser();
  const postForm    = document.getElementById("postFormWrapper");
  const loginPrompt = document.getElementById("loginPrompt");
  if (user) {
    if (postForm)    postForm.style.display    = "block";
    if (loginPrompt) loginPrompt.style.display = "none";
  } else {
    if (postForm)    postForm.style.display    = "none";
    if (loginPrompt) loginPrompt.style.display = "block";
  }
});
