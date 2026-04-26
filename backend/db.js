// =============================================
// PawMatch - MongoDB Atlas Connection
// db.js
// =============================================

const mongoose = require("mongoose");

let listenersRegistered = false;
let connectPromise = null;

function resolveMongoDbName(uri = process.env.MONGODB_URI) {
  const fallbackDbName = process.env.MONGODB_DB_NAME || "test";

  if (!uri) {
    return fallbackDbName;
  }

  try {
    const normalizedUri = uri.replace(/^mongodb(\+srv)?:\/\//, "http://");
    const parsed = new URL(normalizedUri);
    const pathname = parsed.pathname.replace(/^\/+/, "");
    const dbName = pathname.split("/")[0];

    return dbName || fallbackDbName;
  } catch {
    return fallbackDbName;
  }
}

function registerMongoListeners(dbName) {
  if (listenersRegistered) {
    return;
  }

  listenersRegistered = true;

  mongoose.connection.on("connected", () => {
    console.log(`Connected to MongoDB Atlas (${dbName})`);
  });

  mongoose.connection.on("reconnected", () => {
    console.log("MongoDB reconnected");
  });

  mongoose.connection.on("error", (err) => {
    console.error("MongoDB error:", err.message);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected");
  });
}

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.includes("<username>")) {
    throw new Error(
      "MONGODB_URI is not set in .env - please add your Atlas connection string."
    );
  }

  if (connectPromise) {
    return connectPromise;
  }

  const dbName = resolveMongoDbName(uri);

  registerMongoListeners(dbName);
  mongoose.set("bufferCommands", false);

  connectPromise = mongoose
    .connect(uri, {
      dbName,
    })
    .then(() => mongoose.connection.getClient())
    .catch((err) => {
      connectPromise = null;
      throw new Error(`MongoDB connection error: ${err.message}`);
    });

  return connectPromise;
}

module.exports = {
  connectDB,
  resolveMongoDbName,
};
