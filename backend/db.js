// =============================================
// PawMatch - MongoDB Atlas Connection
// db.js
// =============================================

const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.includes("<username>")) {
    console.error("❌  MONGODB_URI is not set in .env — please add your Atlas connection string.");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log("✅  Connected to MongoDB Atlas");
  } catch (err) {
    console.error("❌  MongoDB connection error:", err.message);
    process.exit(1);
  }

  mongoose.connection.on("disconnected", () => {
    console.warn("⚠️   MongoDB disconnected");
  });
}

module.exports = connectDB;
