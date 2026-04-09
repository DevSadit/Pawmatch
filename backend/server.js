// =============================================
// PawMatch - Main Express Server
// =============================================

const path = require("path");

require("dotenv").config({ path: path.join(__dirname, ".env") });

const express      = require("express");
const cors         = require("cors");
const session      = require("express-session");
const MongoStore   = require("connect-mongo");
const connectDB    = require("./db");

const app  = express();
const PORT = process.env.PORT || 5000;

// ---- Connect to MongoDB Atlas ----
connectDB();

// ---- Middleware ----
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || !process.env.CLIENT_ORIGIN || origin === process.env.CLIENT_ORIGIN) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sessions backed by MongoDB Atlas (survive server restarts)
app.use(session({
  secret:            process.env.SESSION_SECRET || "pawmatch_fallback_secret",
  resave:            false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl:    process.env.MONGODB_URI,
    collectionName: "sessions",
    ttl:         60 * 60 * 24, // 1 day in seconds
  }),
  cookie: {
    secure:  false,          // set true when using HTTPS in production
    maxAge:  1000 * 60 * 60 * 24, // 1 day in ms
  },
}));

// ---- Static Frontend ----
const frontendPath = path.join(__dirname, "../frontend");
app.use(express.static(frontendPath));

// ---- API Routes ----
app.use("/api/pets",      require("./routes/pets"));
app.use("/api/auth",      require("./routes/auth"));
app.use("/api/community", require("./routes/community"));
app.use("/api/blog",      require("./routes/blog"));
app.use("/api/notices",   require("./routes/notices"));
app.use("/api/admin",     require("./routes/admin"));
app.use("/api/matches",   require("./routes/matches"));

// ---- Catch-all: serve index.html ----
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// ---- Start Server ----
app.listen(PORT, () => {
  console.log(`✅  PawMatch server running at http://localhost:${PORT}`);
});
