const express = require("express");
const Cabinet = require("../models/Cabinet");
const verifyToken = require("../middleware/authMiddleware");

const router = express.Router();

// 🔹 Récupérer UNIQUEMENT les paramètres de l'utilisateur connecté
router.get("/", verifyToken, async (req, res) => {
  try {
    const cabinet = await Cabinet.findOne({ user: req.user.id });

    if (!cabinet) {
      console.log(`⚠️ Aucun cabinet trouvé pour l'utilisateur ${req.user.id}`);
      return res.status(404).json({ message: "Aucun cabinet trouvé pour cet utilisateur." });
    }

    console.log(`✅ Paramètres du cabinet récupérés pour l'utilisateur ${req.user.id}`);
    res.json(cabinet);
  } catch (err) {
    console.error("❌ Erreur lors de la récupération des paramètres :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 🔹 Enregistrer ou mettre à jour les paramètres de l'utilisateur connecté
router.post("/", verifyToken, async (req, res) => {
  try {
    const { cabinetName, address, collaborators, phone, email, logo } = req.body;
    const userId = req.user.id;

    let cabinet = await Cabinet.findOne({ user: userId });

    if (cabinet) {
      // ✅ Mise à jour des paramètres existants
      cabinet.cabinetName = cabinetName;
      cabinet.address = address;
      cabinet.collaborators = collaborators;
      cabinet.phone = phone;
      cabinet.email = email;
      cabinet.logo = logo;
    } else {
      // ✅ Création d'un nouveau cabinet pour l'utilisateur
      cabinet = new Cabinet({
        user: userId,
        cabinetName,
        address,
        collaborators,
        phone,
        email,
        logo
      });
    }

    await cabinet.save();
    console.log(`✅ Cabinet mis à jour pour l'utilisateur ${userId} :`, cabinet);

    res.json({ message: "Paramètres enregistrés avec succès", cabinet });
  } catch (err) {
    console.error("❌ Erreur lors de l'enregistrement des paramètres :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
