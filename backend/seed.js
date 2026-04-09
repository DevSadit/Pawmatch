// =============================================
// PawMatch - Database Seeder
// =============================================
// Imports existing JSON data into MongoDB Atlas.
// Run ONCE after setting up your Atlas cluster:
//
//   node seed.js
//
// =============================================

require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");
const fs       = require("fs");
const path     = require("path");

const User = require("./models/User");
const Pet  = require("./models/Pet");
const Post = require("./models/Post");
const Match = require("./models/Match");

async function seed() {
  console.log("🔗  Connecting to MongoDB Atlas...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅  Connected\n");

  // ---- Clear existing collections ----
  await Promise.all([User.deleteMany(), Pet.deleteMany(), Post.deleteMany(), Match.deleteMany()]);
  console.log("🗑️   Cleared existing collections\n");

  // ---- Seed Users ----
  const usersRaw = JSON.parse(
    fs.readFileSync(path.join(__dirname, "data/users.json"), "utf-8")
  );

  const userIdMap = {}; // old numeric id → new ObjectId string

  for (const u of usersRaw) {
    // Hash password if it's plaintext (no $2b$ prefix)
    const password = u.password.startsWith("$2")
      ? u.password
      : await bcrypt.hash(u.password, 12);

    const created = await User.create({
      name:        u.name,
      email:       u.email,
      password,
      role:        u.role || "user",
      avatar:      u.avatar || "",
      preferences: u.preferences || {},
    });

    userIdMap[u.id] = created._id.toString();
    console.log(`  👤  User: ${u.email}`);
  }

  // ---- Seed Pets ----
  const petsRaw = JSON.parse(
    fs.readFileSync(path.join(__dirname, "data/pets.json"), "utf-8")
  );

  const petIdMap = {};

  for (const p of petsRaw) {
    const ownerId = userIdMap[p.owner] || null;

    const created = await Pet.create({
      name:         p.name,
      type:         p.type,
      breed:        p.breed,
      age:          p.age   || "Unknown",
      gender:       p.gender|| "Unknown",
      location:     p.location || "Unknown",
      status:       p.status,
      price:        p.price || 0,
      vaccinated:   p.vaccinated || false,
      description:  p.description || "",
      image:        p.image || "https://placehold.co/400x300?text=Pet+Photo",
      owner:        ownerId,
      energyLevel:  p.energyLevel || "Medium",
      goodWithKids: p.goodWithKids || false,
      homeType:     p.homeType || "Any",
    });

    petIdMap[p.id] = created._id.toString();
    console.log(`  🐾  Pet: ${p.name}`);
  }

  // ---- Seed Community Posts ----
  const postsRaw = JSON.parse(
    fs.readFileSync(path.join(__dirname, "data/community.json"), "utf-8")
  );

  for (const p of postsRaw) {
    const authorId = userIdMap[p.authorId] || null;
    if (!authorId) continue; // skip orphaned posts

    await Post.create({
      content:    p.content,
      authorId,
      authorName: p.authorName || "Anonymous",
      image:      p.image || "",
      likes:      p.likes  || 0,
      likedBy:    [], // reset likes — old IDs are no longer valid
    });
    console.log(`  💬  Post by ${p.authorName}`);
  }

  console.log("\n✅  Seeding complete!");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("❌  Seeder error:", err.message);
  process.exit(1);
});
