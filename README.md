# 🐾 PawMatch – Pet Adoption, Trading, Social & Swipe Platform

An academic web project for the Internet Programming Lab (3rd Semester).

---

## 🚀 Quick Start

### Step 1: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 2: Start the Backend Server
```bash
npm start
# OR for auto-restart during development:
npm run dev
```

### Step 3: Open the Website
Go to: **http://localhost:5000**

That's it! The backend serves the frontend automatically.

---

## 🔑 Demo Login Credentials

| Role  | Email                  | Password    |
|-------|------------------------|-------------|
| Admin | admin@pawmatch.com     | admin123    |
| User  | jane@example.com       | password123 |

---

## 📁 Project Structure

```
Pawmatch/
├── frontend/               ← All HTML, CSS, JS files
│   ├── index.html          ← Home page
│   ├── pages/              ← All other pages (21 pages total)
│   ├── css/
│   │   ├── style.css       ← Global styles
│   │   ├── pawswipe.css    ← PawSwipe feature styles
│   │   ├── dashboard.css   ← Dashboard styles
│   │   └── responsive.css  ← Mobile responsive styles
│   ├── js/
│   │   ├── main.js         ← Navbar, footer, utilities
│   │   ├── auth.js         ← Login/register
│   │   ├── pets.js         ← Browse pets + pet details
│   │   ├── pawswipe.js     ← Tinder-style swipe feature
│   │   ├── my-matches.js   ← Saved matches page
│   │   ├── community.js    ← Social feed
│   │   ├── blog.js         ← Blog (AJAX loaded)
│   │   ├── notices.js      ← XML notices
│   │   ├── match.js        ← Match Finder Quiz
│   │   └── crud.js         ← Add/Edit/Delete pet listings
│   └── assets/             ← Images and icons
│
└── backend/                ← Node.js + Express API
    ├── server.js           ← Main server file
    ├── routes/
    │   ├── auth.js         ← Login, register, logout
    │   ├── pets.js         ← CRUD for pet listings
    │   ├── community.js    ← Social posts
    │   ├── blog.js         ← Blog posts
    │   ├── notices.js      ← XML notices
    │   └── admin.js        ← Admin-only routes
    ├── data/
    │   ├── pets.json       ← Pet listings data
    │   ├── users.json      ← User accounts
    │   ├── blogs.json      ← Blog posts
    │   ├── community.json  ← Community posts
    │   ├── notices.xml     ← Notices (XML format!)
    │   └── matches.json    ← Match records
    └── package.json
```

---

## 📄 All Pages (21 Pages)

| # | Page             | Route                         | Purpose                          |
|---|-----------------|-------------------------------|----------------------------------|
| 1 | Home            | /index.html                   | Landing page, featured pets      |
| 2 | About           | /pages/about.html             | Platform story and mission       |
| 3 | Browse Pets     | /pages/pets.html              | Search/filter all pets           |
| 4 | Pet Details     | /pages/pet-details.html?id=X  | Full pet profile                 |
| 5 | Adoption Process| /pages/adoption-process.html  | Steps and rules                  |
| 6 | Trade/Rehome    | /pages/trade.html             | For sale and rehoming listings   |
| 7 | Match Finder    | /pages/match-finder.html      | 5-question quiz                  |
| 8 | PawSwipe        | /pages/pawswipe.html          | Tinder-style swiping!            |
| 9 | My Matches      | /pages/my-matches.html        | Saved liked pets                 |
| 10| Community       | /pages/community.html         | Social feed                      |
| 11| Blog            | /pages/blog.html              | AJAX-loaded blog posts           |
| 12| Notices         | /pages/notices.html           | XML-parsed notices               |
| 13| FAQ             | /pages/faq.html               | Accordion FAQ                    |
| 14| Contact         | /pages/contact.html           | Contact form                     |
| 15| Login           | /pages/login.html             | Authentication                   |
| 16| Register        | /pages/register.html          | New account                      |
| 17| Profile         | /pages/profile.html           | User settings                    |
| 18| Dashboard       | /pages/dashboard.html         | User overview                    |
| 19| Add Pet         | /pages/add-pet.html           | Create listing (CRUD: Create)    |
| 20| Manage Listings | /pages/manage-listings.html   | Edit/delete listings (CRUD)      |
| 21| Admin Panel     | /pages/admin.html             | Admin moderation                 |

---

## ✅ Academic Requirements Checklist

| Requirement             | Where Implemented                                         |
|-------------------------|-----------------------------------------------------------|
| 15+ Pages               | ✅ 21 pages                                              |
| Responsive Design       | ✅ Bootstrap 5 + responsive.css                          |
| Bootstrap               | ✅ Navbar, Cards, Modal, Accordion, Toast, Badge, Form   |
| Custom CSS              | ✅ style.css, pawswipe.css, dashboard.css                |
| JS Feature 1            | ✅ Form validation (login + register)                    |
| JS Feature 2            | ✅ Pet search and filter                                 |
| JS Feature 3            | ✅ PawSwipe swipe cards                                  |
| JS Feature 4            | ✅ localStorage save/remove matches                      |
| JS Feature 5            | ✅ Match Finder Quiz with dynamic results                |
| JS Feature 6            | ✅ Community post add/delete/like                        |
| JS Feature 7            | ✅ CRUD for pet listings (modal edit)                    |
| JS Feature 8            | ✅ XML parsing (DOMParser + xml2js)                      |
| AJAX Call 1             | ✅ Load pets.json → Browse Pets page                    |
| AJAX Call 2             | ✅ Load blogs.json → Blog page                          |
| AJAX Call 3             | ✅ Load pets.json → PawSwipe                            |
| JSON Dynamic Content    | ✅ All pets, blogs, community posts from JSON            |
| CRUD                    | ✅ Full CRUD on Pet Listings                            |
| XML Integration         | ✅ notices.xml parsed server+client side                |

---

## 🏗️ Architecture

```
Browser (Frontend)
     ↓ AJAX (fetch/jQuery)
Express Server (backend/server.js)
     ↓ Routes
  /api/pets      → pets.js    → data/pets.json
  /api/auth      → auth.js    → data/users.json
  /api/community → community.js → data/community.json
  /api/blog      → blog.js    → data/blogs.json
  /api/notices   → notices.js → data/notices.xml
  /api/admin     → admin.js   → all data files
     ↓ Static Files
  frontend/ → served as http://localhost:5000/
```

**Auth**: Simple express-session (no JWT). User stored in `localStorage` as `pawmatch_user`.

**Data**: JSON files stored in `backend/data/`. Written directly using `fs.writeFileSync`.

**PawSwipe**: Drag-to-swipe with mouse/touch events. Liked pets saved to `localStorage` key `pawmatch_saved`.
