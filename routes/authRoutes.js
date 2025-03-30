const express = require("express");
const User = require("../models/User");
const Cabinet = require("../models/Cabinet");
const Collaborator = require("../models/Collaborator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const verifyToken = require("../middleware/authMiddleware");
require("dotenv").config();

const router = express.Router();

// 🔹 Inscription d’un utilisateur avec création automatique de cabinet
router.post("/register", async (req, res) => {
  const { firstName, name, email, password, role } = req.body;

  try {
    let existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email déjà utilisé" });

    // 🔐 Création de l'utilisateur (le mot de passe est hashé via le hook mongoose)
    const user = new User({
      firstName,
      name,
      email,
      password,
      role: "admin" // 👈 Forcé, pas modifiable
    });

    await user.save();

    // 🏢 Création du cabinet personnel
    const newCabinet = new Cabinet({
      user: user._id,
      cabinetName: `${firstName}'s Cabinet`,
      address: "À compléter",
      phone: "À compléter",
      email: email,
      logo: "",
      members: [user._id]
    });

    await newCabinet.save();

    // 🔄 Lier le cabinet à l'utilisateur et re-sauvegarder
    user.cabinet = newCabinet._id;
    await user.save();

    // 🎫 Génération du token JWT
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(201).json({
      message: "Utilisateur et cabinet créés avec succès",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        name: user.name,
        email: user.email,
        role: user.role,
        cabinet: user.cabinet
      }
    });
  } catch (err) {
    console.error("❌ Erreur lors de l'inscription :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 🔹 Connexion d’un utilisateur
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    console.log("🔹 Tentative de connexion avec :", email);

    const user = await User.findOne({ email });
    if (!user) {
      console.log("⚠️ Utilisateur introuvable !");
      return res.status(400).json({ message: "Utilisateur introuvable" });
    }

    console.log("✅ Utilisateur trouvé :", user);
    console.log("Mot de passe hashé en base :", user.password);
    console.log("Mot de passe saisi :", password);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("🔍 Comparaison du mot de passe :", isMatch);

    let collaborator = null;

    if (user.role === "collaborateur") {
      collaborator = await Collaborator.findOne({
        firstName: user.firstName,
        lastName: user.name,
        cabinet: user.cabinet
      });
      
      if (!collaborator && user.role === "collaborateur") {
        console.warn("⚠️ Aucun collaborateur correspondant trouvé !");
      }      
    }

    if (!isMatch) {
      console.log("❌ Mot de passe incorrect !");
      return res.status(400).json({ message: "Mot de passe incorrect" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        cabinet: user.cabinet // 👈 ajoute cette ligne !
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );    

    console.log("✅ Connexion réussie, token généré !");
    res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        name: user.name,
        email: user.email,
        role: user.role,
        cabinet: user.cabinet,
        collaboratorId: collaborator ? collaborator._id : null // 👈 AJOUT ICI
      }
    });
  } catch (err) {
    console.error("❌ Erreur lors de la connexion :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 🔹 Récupération des informations de l'utilisateur connecté
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    let collaboratorId = null;

    if (user.role === "collaborateur") {
      const matchedCollaborator = await Collaborator.findOne({
        user: user._id,
      });

      if (matchedCollaborator) {
        collaboratorId = matchedCollaborator._id;
      }
    }

    res.json({
      id: user._id,
      firstName: user.firstName,
      name: user.name,
      email: user.email,
      role: user.role,
      cabinet: user.cabinet,
      collaboratorId, // 👈 ici !
    });
  } catch (err) {
    console.error("❌ Erreur lors de la récupération de l'utilisateur :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
