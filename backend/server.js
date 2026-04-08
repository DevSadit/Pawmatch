// =============================================
// PawMatch - Main Express Server
// =============================================
// This is the entry point for the backend.
// It sets up the Express app, middleware,
// and mounts all route files.
// =============================================

const express = require("express");
const cors = require("cors");
const session = require("express-session");
const path = require("path");

const app = express();
const PORT = 5000;

// ---- Middleware ----

// Allow requests from the frontend (for development)
app.use(
  cors({
    origin: "http://localhost:5000",
    credentials: true,
  })
);

// Parse incoming JSON request bodies
app.use(express.json());

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Simple session management (no JWT needed)
// Sessions are stored in memory for academic use
app.use(
  session({
    secret: "pawmatch_secret_key_2024",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // set true only if using HTTPS
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

// Serve the frontend folder as static files
// This means visiting http://localhost:5000 loads the frontend
const frontendPath = path.join(__dirname, "../frontend");
app.use(express.static(frontendPath));

// ---- API Routes ----
// Each route file handles a specific module

const petsRouter = require("./routes/pets");
const authRouter = require("./routes/auth");
const communityRouter = require("./routes/community");
const blogRouter = require("./routes/blog");
const noticesRouter = require("./routes/notices");
const adminRouter = require("./routes/admin");

app.use("/api/pets", petsRouter);
app.use("/api/auth", authRouter);
app.use("/api/community", communityRouter);
app.use("/api/blog", blogRouter);
app.use("/api/notices", noticesRouter);
app.use("/api/admin", adminRouter);

// ---- Catch-all: Serve index.html for unknown routes ----
// This allows deep-linking to HTML pages
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// ---- Start Server ----
app.listen(PORT, () => {
  console.log(`✅ PawMatch server running at http://localhost:${PORT}`);
});
