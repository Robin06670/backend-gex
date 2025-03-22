const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const FixedCost = require("../models/fixedCost");

// 📌 Créer ou mettre à jour les frais fixes de l'utilisateur
router.post("/", auth, async (req, res) => {
  try {
    const { costs } = req.body;

    // Cherche s'il existe déjà un doc pour ce user
    let existing = await FixedCost.findOne({ user: req.user.id });

    if (existing) {
      // Mise à jour si déjà existant
      Object.assign(existing, costs);
      await existing.save();
      return res.status(200).json({ message: "Frais fixes mis à jour avec succès", data: existing });
    } else {
      // Création sinon
      const fixedCost = new FixedCost({
        ...costs,
        user: req.user.id
      });
      await fixedCost.save();
      return res.status(201).json({ message: "Frais fixes enregistrés avec succès", data: fixedCost });
    }
  } catch (error) {
    console.error("❌ Erreur POST frais fixes :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 📌 Mettre à jour un champ spécifique
router.put("/:field", auth, async (req, res) => {
  try {
    const { field } = req.params;
    const { value } = req.body;

    const updatedFixedCost = await FixedCost.findOneAndUpdate(
      { user: req.user.id },
      { [field]: value },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(200).json(updatedFixedCost);
  } catch (error) {
    console.error("❌ Erreur PUT frais fixes :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 📌 Récupérer les frais fixes de l'utilisateur
router.get("/", auth, async (req, res) => {
  try {
    const fixedCosts = await FixedCost.findOne({ user: req.user.id });
    res.status(200).json(fixedCosts);
  } catch (error) {
    console.error("❌ Erreur GET frais fixes :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
