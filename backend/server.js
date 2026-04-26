// =============================================
// PawMatch - Main Express Server
// =============================================

const path = require("path");

require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const { connectDB, resolveMongoDbName } = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === "production";
const frontendPath = path.join(__dirname, "../frontend");

async function startServer() {
  const mongoClientPromise = connectDB();
  await mongoClientPromise;
  const mongoDbName = resolveMongoDbName();

  if (isProduction) {
    app.set("trust proxy", 1);
  }

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

  app.use(
    session({
      secret: process.env.SESSION_SECRET || "pawmatch_fallback_secret",
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        clientPromise: mongoClientPromise,
        dbName: mongoDbName,
        collectionName: "sessions",
        ttl: 60 * 60 * 24,
      }),
      cookie: {
        secure: isProduction,
        maxAge: 1000 * 60 * 60 * 24,
      },
    })
  );

  app.get("/pages/pawswipe.html", (req, res, next) => {
    if (!req.session.userId) {
      return res.redirect("/pages/login.html?next=pawswipe.html");
    }

    return next();
  });

  app.use(express.static(frontendPath));

  app.use("/api/pets", require("./routes/pets"));
  app.use("/api/auth", require("./routes/auth"));
  app.use("/api/community", require("./routes/community"));
  app.use("/api/blog", require("./routes/blog"));
  app.use("/api/notices", require("./routes/notices"));
  app.use("/api/matches", require("./routes/matches"));

  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });

  app.listen(PORT, () => {
    console.log(`PawMatch server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err.message);
  process.exit(1);
});
