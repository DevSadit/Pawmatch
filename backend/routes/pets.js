// =============================================
// Pets Routes - /api/pets
// =============================================
// Full CRUD for pet listings via MongoDB Atlas
// =============================================

const express = require("express");
const router  = express.Router();
const mongoose = require("mongoose");
const Pet     = require("../models/Pet");

// ---- GET /api/pets ----
router.get("/", async (req, res) => {
  try {
    const query = {};

    if (req.query.type)   query.type   = { $regex: new RegExp(`^${req.query.type}$`, "i") };
    if (req.query.status) query.status = { $regex: new RegExp(`^${req.query.status}$`, "i") };
    if (req.query.location) query.location = { $regex: req.query.location, $options: "i" };
    if (req.query.search) {
      const s = req.query.search;
      query.$or = [
        { name:  { $regex: s, $options: "i" } },
        { breed: { $regex: s, $options: "i" } },
      ];
    }

    const pets = await Pet.find(query).sort({ createdAt: -1 });
    res.json(pets.map((p) => p.toJSON()));
  } catch (err) {
    console.error("GET /pets error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---- GET /api/pets/featured ----
// Must be defined BEFORE /:id to avoid conflict
router.get("/featured", async (req, res) => {
  try {
    const pets = await Pet.find().sort({ createdAt: -1 }).limit(6);
    res.json(pets.map((p) => p.toJSON()));
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ---- GET /api/pets/:id ----
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Pet not found" });
    }
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ message: "Pet not found" });
    res.json(pet.toJSON());
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ---- POST /api/pets ----
router.post("/", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Please login to add a pet" });
  }

  const {
    name, type, breed, age, gender, location, status, price,
    vaccinated, description, image, energyLevel, goodWithKids, homeType,
  } = req.body;

  if (!name || !type || !breed || !status) {
    return res.status(400).json({ message: "Name, type, breed, and status are required" });
  }

  try {
    const pet = await Pet.create({
      name, type, breed,
      age:         age         || "Unknown",
      gender:      gender      || "Unknown",
      location:    location    || "Unknown",
      status,
      price:       price       || 0,
      vaccinated:  vaccinated  || false,
      description: description || "",
      image:       image       || "https://placehold.co/400x300?text=Pet+Photo",
      owner:       req.session.userId,
      energyLevel: energyLevel || "Medium",
      goodWithKids:goodWithKids|| false,
      homeType:    homeType    || "Any",
    });

    res.status(201).json({ message: "Pet listing created", pet: pet.toJSON() });
  } catch (err) {
    console.error("POST /pets error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---- PUT /api/pets/:id ----
router.put("/:id", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Please login" });
  }

  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Pet not found" });
    }

    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ message: "Pet not found" });

    if (pet.owner.toString() !== req.session.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Prevent overwriting immutable fields
    const { _id, id, owner, createdAt, ...updates } = req.body;
    Object.assign(pet, updates);
    await pet.save();

    res.json({ message: "Pet updated", pet: pet.toJSON() });
  } catch (err) {
    console.error("PUT /pets/:id error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---- DELETE /api/pets/:id ----
router.delete("/:id", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Please login" });
  }

  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Pet not found" });
    }

    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ message: "Pet not found" });

    if (pet.owner.toString() !== req.session.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await pet.deleteOne();
    res.json({ message: "Pet deleted" });
  } catch (err) {
    console.error("DELETE /pets/:id error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
