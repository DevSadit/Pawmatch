---
name: PawMatch Project
description: PawMatch is the user's 3rd Semester IP lab project — a full-stack pet platform built with HTML/CSS/JS/Bootstrap frontend and Node.js/Express backend
type: project
---

PawMatch is located at `v:/3RD_SEM/IP/Pawmatch/`. It's an academic Internet Programming Lab project.

**Why:** Required for 3rd Semester IP lab. Must demonstrate: 15+ pages, Bootstrap, custom CSS, 8+ JS features, AJAX+JSON, CRUD, XML integration.

**How to apply:** When user asks about PawMatch, remember: backend is Express (no JWT, uses express-session), frontend is plain HTML/CSS/JS with Bootstrap 5, data stored in JSON files in `backend/data/`.

**Structure:**
- `frontend/` — all HTML (21 pages), CSS (4 files), JS (10 files)
- `backend/` — Express server, 6 route files, data/ folder with JSON+XML

**Run:** `cd backend && npm start` → opens at http://localhost:5000

**Demo logins:** admin@pawmatch.com/admin123, jane@example.com/password123

**Key feature:** PawSwipe (Tinder-style) — drag/swipe pet cards, saves to localStorage under key `pawmatch_saved`
