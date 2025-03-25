const express = require("express");
const Cabinet = require("../models/Cabinet");
const User = require("../models/User");
const verifyToken = require("../middleware/authMiddleware");
const mongoose = require("mongoose");
const router = express.Router();

// 🔹 Obtenir les paramètres du cabinet pour l'utilisateur connecté
router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    console.log("🔍 Cabinet recherché pour l'utilisateur :", req.user.id);

    const cabinet = await Cabinet.findOne({
      $or: [
        { user: new mongoose.Types.ObjectId(req.user.id) },
        { members: new mongoose.Types.ObjectId(req.user.id) }
      ]
    });    

    console.log("📦 Cabinet trouvé :", cabinet);
    
    if (!cabinet) {
      return res.status(404).json({ message: "Cabinet non trouvé." });
    }

    res.status(200).json(cabinet);
  } catch (error) {
    console.error("Erreur lors de la récupération du cabinet :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// 🔹 Enregistrer ou mettre à jour les paramètres du cabinet
router.post("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    let cabinet = await Cabinet.findOne({
      $or: [{ user: userId }, { members: userId }],
    });

    const {
      cabinetName,
      address,
      collaborators,
      phone,
      email,
      logo,
    } = req.body;

    if (cabinet) {
      // ✅ Mise à jour du cabinet existant
      cabinet.cabinetName = cabinetName;
      cabinet.address = address;
      cabinet.collaborators = collaborators;
      cabinet.phone = phone;
      cabinet.email = email;
      cabinet.logo = logo;

      await cabinet.save();
      res.status(200).json({ message: "Cabinet mis à jour." });
    } else {
      // ❌ Si aucun cabinet trouvé ET que l'utilisateur n'est pas admin → Interdit
      if (req.user.role !== "admin") {
        return res
          .status(403)
          .json({ message: "Seul un administrateur peut créer un cabinet." });
      }

      // ✅ Création d’un nouveau cabinet (cas très spécifique)
      const newCabinet = new Cabinet({
        user: userId,
        members: [userId],
        cabinetName,
        address,
        collaborators,
        phone,
        email,
        logo,
      });

      await newCabinet.save();

      // Mise à jour de l'utilisateur pour lier le cabinet
      await User.findByIdAndUpdate(userId, { cabinet: newCabinet._id });

      res.status(201).json({ message: "Cabinet créé avec succès." });
    }
  } catch (error) {
    console.error("Erreur lors de l'enregistrement du cabinet :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

module.exports = router;
