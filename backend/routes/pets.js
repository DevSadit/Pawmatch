// =============================================
// Pets Routes - /api/pets
// =============================================
// Full CRUD for pet listings
// Create, Read, Update, Delete pets
// =============================================

const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const petsFile = path.join(__dirname, "../data/pets.json");

// Helper: Read pets
function getPets() {
  const data = fs.readFileSync(petsFile, "utf-8");
  return JSON.parse(data);
}

// Helper: Save pets
function savePets(pets) {
  fs.writeFileSync(petsFile, JSON.stringify(pets, null, 2));
}

// ---- GET /api/pets ----
// Get all pets with optional filters
router.get("/", (req, res) => {
  let pets = getPets();

  // Filter by type (dog, cat, etc.)
  if (req.query.type) {
    pets = pets.filter(
      (p) => p.type.toLowerCase() === req.query.type.toLowerCase()
    );
  }

  // Filter by status (Adoption, Sale, Rehome)
  if (req.query.status) {
    pets = pets.filter(
      (p) => p.status.toLowerCase() === req.query.status.toLowerCase()
    );
  }

  // Filter by location
  if (req.query.location) {
    pets = pets.filter((p) =>
      p.location.toLowerCase().includes(req.query.location.toLowerCase())
    );
  }

  // Search by name or breed
  if (req.query.search) {
    const search = req.query.search.toLowerCase();
    pets = pets.filter(
      (p) =>
        p.name.toLowerCase().includes(search) ||
        p.breed.toLowerCase().includes(search)
    );
  }

  res.json(pets);
});

// ---- GET /api/pets/featured ----
// Get featured pets for homepage
router.get("/featured", (req, res) => {
  const pets = getPets();
  // Return first 6 pets as featured
  const featured = pets.slice(0, 6);
  res.json(featured);
});

// ---- GET /api/pets/:id ----
// Get a single pet by ID
router.get("/:id", (req, res) => {
  const pets = getPets();
  const pet = pets.find((p) => p.id === parseInt(req.params.id));

  if (!pet) {
    return res.status(404).json({ message: "Pet not found" });
  }

  res.json(pet);
});

// ---- POST /api/pets ----
// Create a new pet listing
router.post("/", (req, res) => {
  // Simple auth check: user must be logged in
  if (!req.session.userId) {
    return res.status(401).json({ message: "Please login to add a pet" });
  }

  const {
    name,
    type,
    breed,
    age,
    gender,
    location,
    status,
    price,
    vaccinated,
    description,
    image,
    energyLevel,
    goodWithKids,
    homeType,
  } = req.body;

  if (!name || !type || !breed || !status) {
    return res.status(400).json({ message: "Name, type, breed, and status are required" });
  }

  const pets = getPets();

  const newPet = {
    id: Date.now(),
    name,
    type,
    breed,
    age: age || "Unknown",
    gender: gender || "Unknown",
    location: location || "Unknown",
    status,
    price: price || 0,
    vaccinated: vaccinated || false,
    description: description || "",
    image: image || "https://placehold.co/400x300?text=Pet+Photo",
    owner: req.session.userId,
    energyLevel: energyLevel || "Medium",
    goodWithKids: goodWithKids || false,
    homeType: homeType || "Any",
    createdAt: new Date().toISOString(),
  };

  pets.push(newPet);
  savePets(pets);

  res.status(201).json({ message: "Pet listing created", pet: newPet });
});

// ---- PUT /api/pets/:id ----
// Update an existing pet listing
router.put("/:id", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Please login" });
  }

  const pets = getPets();
  const index = pets.findIndex((p) => p.id === parseInt(req.params.id));

  if (index === -1) {
    return res.status(404).json({ message: "Pet not found" });
  }

  // Only owner or admin can edit
  if (
    pets[index].owner !== req.session.userId &&
    req.session.userRole !== "admin"
  ) {
    return res.status(403).json({ message: "Not authorized" });
  }

  // Merge updated fields
  pets[index] = { ...pets[index], ...req.body, id: pets[index].id };
  savePets(pets);

  res.json({ message: "Pet updated", pet: pets[index] });
});

// ---- DELETE /api/pets/:id ----
// Delete a pet listing
router.delete("/:id", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Please login" });
  }

  const pets = getPets();
  const index = pets.findIndex((p) => p.id === parseInt(req.params.id));

  if (index === -1) {
    return res.status(404).json({ message: "Pet not found" });
  }

  // Only owner or admin can delete
  if (
    pets[index].owner !== req.session.userId &&
    req.session.userRole !== "admin"
  ) {
    return res.status(403).json({ message: "Not authorized" });
  }

  pets.splice(index, 1);
  savePets(pets);

  res.json({ message: "Pet deleted" });
});

module.exports = router;
