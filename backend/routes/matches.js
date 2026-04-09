// =============================================
// Match Routes - /api/matches
// =============================================

const express = require("express");
const mongoose = require("mongoose");
const Match = require("../models/Match");
const Pet = require("../models/Pet");

const router = express.Router();

function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Please login first" });
  }

  next();
}

router.get("/", requireLogin, async (req, res) => {
  try {
    const matches = await Match.find({ user: req.session.userId })
      .sort({ updatedAt: -1 })
      .populate("pet");

    const payload = matches
      .filter((match) => match.pet)
      .map((match) => ({
        id: match.id,
        action: match.action,
        savedAt: match.updatedAt,
        pet: typeof match.pet.toJSON === "function" ? match.pet.toJSON() : match.pet,
      }));

    res.json(payload);
  } catch (err) {
    console.error("GET /matches error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/", requireLogin, async (req, res) => {
  const { petId, action } = req.body;

  if (!petId || !mongoose.Types.ObjectId.isValid(petId)) {
    return res.status(400).json({ message: "A valid pet id is required" });
  }

  try {
    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    const match = await Match.findOneAndUpdate(
      { user: req.session.userId, pet: petId },
      {
        $set: {
          action: action === "super-liked" ? "super-liked" : "liked",
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    ).populate("pet");

    res.status(201).json({
      message: "Match saved",
      match: {
        id: match.id,
        action: match.action,
        savedAt: match.updatedAt,
        pet: match.pet.toJSON(),
      },
    });
  } catch (err) {
    console.error("POST /matches error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:petId", requireLogin, async (req, res) => {
  const { petId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(petId)) {
    return res.status(404).json({ message: "Match not found" });
  }

  try {
    const deleted = await Match.findOneAndDelete({
      user: req.session.userId,
      pet: petId,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Match not found" });
    }

    res.json({ message: "Match removed" });
  } catch (err) {
    console.error("DELETE /matches/:petId error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/", requireLogin, async (req, res) => {
  try {
    await Match.deleteMany({ user: req.session.userId });
    res.json({ message: "All matches cleared" });
  } catch (err) {
    console.error("DELETE /matches error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
