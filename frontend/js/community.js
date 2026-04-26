// =============================================
// PawMatch - Community Feed JavaScript
// =============================================

function escapeHtml(str) {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(str || ""));
  return div.innerHTML;
}

function renderComment(comment) {
  const name = escapeHtml(comment.authorName || "Anonymous");
  const content = escapeHtml(comment.content || "");
  const time = comment.createdAt ? timeAgo(comment.createdAt) : "";

  return `
    <div class="rounded-xl bg-surface-container-low px-4 py-3">
      <div class="flex items-center justify-between gap-3 mb-1">
        <span class="text-sm font-bold text-on-surface">${name}</span>
        <span class="text-[11px] text-on-surface-variant">${time}</span>
      </div>
      <p class="text-sm text-on-surface-variant leading-relaxed">${content}</p>
    </div>`;
}

function renderPost(post, user) {
  const isOwner = user && (user.id === post.authorId || user._id === post.authorId);
  const comments = Array.isArray(post.comments) ? post.comments : [];
  const canInteract = !!user;

  const div = document.createElement("div");
  div.id = `post-${post.id}`;
  div.className = "bg-surface-container-lowest rounded-2xl shadow-sm p-5";
  div.innerHTML = `
    <div class="flex items-start justify-between gap-4 mb-4">
      <div class="flex items-center gap-3">
        <div class="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center font-headline font-extrabold text-on-primary text-base flex-shrink-0">
          ${escapeHtml((post.authorName || "A").charAt(0).toUpperCase())}
        </div>
        <div>
          <div class="font-bold text-sm text-on-surface">${escapeHtml(post.authorName || "Anonymous")}</div>
          <div class="text-xs text-on-surface-variant">${timeAgo(post.createdAt)}</div>
        </div>
      </div>
      ${isOwner ? `
        <button onclick="deletePost('${post.id}')"
          class="w-9 h-9 rounded-full bg-red-50 text-error flex items-center justify-center hover:bg-red-100 transition-colors"
          title="Delete post">
          <span class="material-symbols-outlined text-base">delete</span>
        </button>` : ""}
    </div>

    <p class="text-sm leading-relaxed text-on-surface mb-4">${escapeHtml(post.content)}</p>

    ${post.image ? `
      <img src="${post.image}" alt="Post image"
        class="w-full max-h-[320px] object-cover rounded-2xl mb-4"
        onerror="this.src='https://placehold.co/800x420/e9e8e4/aaa?text=No+Image'">` : ""}

    <div class="flex flex-wrap items-center gap-3 pt-4 border-t border-surface-container-high">
      ${canInteract ? `
        <button id="like-btn-${post.id}" onclick="likePost('${post.id}')"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-surface-container-high bg-transparent text-sm font-semibold text-on-surface-variant hover:border-primary hover:text-primary transition-colors">
          <span class="material-symbols-outlined text-base">favorite</span>
          <span><span id="like-count-${post.id}">${post.likes || 0}</span> likes</span>
        </button>` : `
        <a href="./login.html?next=community.html"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-surface-container-high bg-transparent text-sm font-semibold text-on-surface-variant hover:border-primary hover:text-primary transition-colors">
          <span class="material-symbols-outlined text-base">login</span>
          Login to like
        </a>`}
      <span id="comment-count-${post.id}" class="text-xs text-on-surface-variant">Comments: ${comments.length}</span>
    </div>

    <div class="mt-4 space-y-3">
      <div id="comment-list-${post.id}" class="space-y-2">
        ${comments.length ? comments.map(renderComment).join("") : `
          <p class="text-sm text-on-surface-variant">No comments yet.</p>`}
      </div>

      ${canInteract ? `
        <div class="pt-2">
          <textarea id="comment-input-${post.id}" rows="2"
            class="w-full rounded-2xl border border-surface-container-high bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/25 resize-none"
            placeholder="Write a comment..."></textarea>
          <div class="flex justify-end mt-2">
            <button onclick="submitComment('${post.id}')"
              class="px-4 py-2 rounded-full bg-gradient-to-br from-primary to-primary-container text-on-primary text-xs font-bold uppercase tracking-widest active:scale-95 transition-transform">
              Comment
            </button>
          </div>
        </div>` : `
        <div class="rounded-2xl bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
          <a href="./login.html?next=community.html" class="font-bold text-primary">Login</a> to like or comment on this post.
        </div>`}
    </div>
  `;

  return div;
}

async function loadCommunityPosts(userOverride = null) {
  const container = document.getElementById("postsContainer");
  if (!container) return;

  container.innerHTML = `
    <div class="flex justify-center py-10">
      <div class="w-10 h-10 border-4 border-primary-container border-t-primary rounded-full animate-spin"></div>
    </div>`;

  try {
    const res = await fetch(`${API_BASE}/community`, { credentials: "include" });
    const posts = await res.json();
    const user = userOverride || getCurrentUser();

    container.innerHTML = "";

    if (posts.length === 0) {
      container.innerHTML = `
        <div class="text-center py-16 bg-surface-container-lowest rounded-2xl shadow-sm">
          <div class="text-5xl mb-3">💬</div>
          <h5 class="font-headline font-extrabold text-xl">No posts yet</h5>
          <p class="text-on-surface-variant mt-2">Be the first to share something.</p>
        </div>`;
      return;
    }

    posts.forEach((post) => container.appendChild(renderPost(post, user)));
  } catch (err) {
    container.innerHTML = `
      <div class="text-center py-10 bg-red-50 rounded-2xl">
        <p class="text-error font-semibold">Could not load posts. Is the server running?</p>
      </div>`;
  }
}

async function createPost() {
  const user = await syncCurrentUser().catch(() => getCurrentUser());
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
    const data = await apiFetch("/community", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    if (contentInput) contentInput.value = "";
    const container = document.getElementById("postsContainer");
    if (container) container.insertBefore(renderPost(data.post, user), container.firstChild);
    showToast("Post shared!", "success");
    updateCharCount();
  } catch (error) {
    showToast(error?.message || "Failed to post", "error");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Post";
    }
  }
}

async function deletePost(postId) {
  if (!confirm("Delete this post?")) return;

  try {
    const res = await apiFetch(`/community/${postId}`, { method: "DELETE" });
    if (res) {
      const el = document.getElementById(`post-${postId}`);
      if (el) {
        el.style.transition = "all 0.3s ease";
        el.style.opacity = "0";
        setTimeout(() => el.remove(), 300);
      }
      showToast("Post deleted", "success");
    }
  } catch (error) {
    showToast(error?.message || "Could not delete post", "error");
  }
}

async function likePost(postId) {
  const user = await syncCurrentUser().catch(() => getCurrentUser());
  if (!user) {
    showToast("Please login to like posts", "warning");
    return;
  }

  try {
    const data = await apiFetch(`/community/${postId}/like`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const countEl = document.getElementById(`like-count-${postId}`);
    if (countEl) countEl.textContent = data.likes;
  } catch (error) {
    showToast(error?.message || "Could not update like", "error");
  }
}

async function submitComment(postId) {
  const user = await syncCurrentUser().catch(() => getCurrentUser());
  if (!user) {
    showToast("Please login to comment", "warning");
    return;
  }

  const input = document.getElementById(`comment-input-${postId}`);
  const content = input?.value.trim();

  if (!content) {
    showToast("Write a comment first", "warning");
    return;
  }

  try {
    const data = await apiFetch(`/community/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    if (input) input.value = "";

    const list = document.getElementById(`comment-list-${postId}`);
    if (list && data.comment) {
      const emptyState = list.querySelector("p");
      if (emptyState) emptyState.remove();
      list.insertAdjacentHTML("beforeend", renderComment(data.comment));
    }

    const commentCount = document.getElementById(`comment-count-${postId}`);
    if (commentCount) commentCount.textContent = `Comments: ${data.comments?.length ?? 0}`;

    showToast("Comment added", "success");
  } catch (error) {
    showToast(error?.message || "Could not add comment", "error");
  }
}

function updateCharCount() {
  const content = document.getElementById("postContent");
  const counter = document.getElementById("charCount");
  if (!content || !counter) return;

  const remaining = 500 - content.value.length;
  counter.textContent = remaining;
  counter.style.color = remaining < 50 ? "#b02500" : "#5b5c59";
}

document.addEventListener("DOMContentLoaded", async function () {
  const container = document.getElementById("postsContainer");
  if (!container) return;

  const user = await syncCurrentUser().catch(() => getCurrentUser());
  loadCommunityPosts(user);

  const submitBtn = document.getElementById("submitPostBtn");
  if (submitBtn) submitBtn.addEventListener("click", createPost);

  const content = document.getElementById("postContent");
  if (content) {
    content.addEventListener("input", updateCharCount);
    content.addEventListener("keydown", function (e) {
      if (e.ctrlKey && e.key === "Enter") createPost();
    });
  }

  const currentUser = getCurrentUser();
  const postForm = document.getElementById("postFormWrapper");
  const loginPrompt = document.getElementById("loginPrompt");
  if (currentUser) {
    if (postForm) postForm.style.display = "block";
    if (loginPrompt) loginPrompt.style.display = "none";
  } else {
    if (postForm) postForm.style.display = "none";
    if (loginPrompt) loginPrompt.style.display = "block";
  }
});
