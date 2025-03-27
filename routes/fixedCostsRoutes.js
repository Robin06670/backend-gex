const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const FixedCost = require("../models/FixedCost");
const mongoose = require("mongoose");

// 📌 Créer ou mettre à jour les frais fixes du cabinet
router.post("/", auth, async (req, res) => {
  try {
    const { costs } = req.body;
    const cabinetId = new mongoose.Types.ObjectId(req.user.cabinet);

    let existing = await FixedCost.findOne({ cabinet: cabinetId });

    if (existing) {
      Object.assign(existing, costs);
      await existing.save();
      return res.status(200).json({ message: "Frais fixes mis à jour avec succès", data: existing });
    } else {
      const fixedCost = new FixedCost({
        ...costs,
        cabinet: cabinetId
      });
      await fixedCost.save();
      return res.status(201).json({ message: "Frais fixes enregistrés avec succès", data: fixedCost });
    }
  } catch (error) {
    console.error("❌ Erreur POST frais fixes :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 📌 Mettre à jour un champ spécifique des frais fixes du cabinet
router.put("/:field", auth, async (req, res) => {
  try {
    const { field } = req.params;
    const { value } = req.body;
    const cabinetId = new mongoose.Types.ObjectId(req.user.cabinet);

    const updatedFixedCost = await FixedCost.findOneAndUpdate(
      { cabinet: cabinetId },
      { [field]: value },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(200).json(updatedFixedCost);
  } catch (error) {
    console.error("❌ Erreur PUT frais fixes :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 📌 Récupérer les frais fixes du cabinet
router.get("/", auth, async (req, res) => {
  try {
    const cabinetId = new mongoose.Types.ObjectId(req.user.cabinet);
    const fixedCosts = await FixedCost.findOne({ cabinet: cabinetId });

    res.status(200).json(fixedCosts);
  } catch (error) {
    console.error("❌ Erreur GET frais fixes :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
