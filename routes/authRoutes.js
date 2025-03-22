const express = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const verifyToken = require("../middleware/authMiddleware");
require("dotenv").config();

const router = express.Router();

// 🔹 Inscription d’un utilisateur avec création de cabinet
router.post("/register", async (req, res) => {
  const { firstName, name, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "Email déjà utilisé" });

    // 🔥 Hacher le mot de passe avant de l'enregistrer
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔹 Création de l'utilisateur avec un cabinet vide par défaut
    user = new User({
      firstName,
      name,
      email,
      password: hashedPassword,
      cabinet: { name: "", address: "", phone: "", email: "", logo: "" }
    });

    await user.save();

    res.status(201).json({ message: "Utilisateur créé avec succès" });
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

    // 🔹 Vérification du mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("🔍 Comparaison du mot de passe :", isMatch);

    if (!isMatch) {
      console.log("❌ Mot de passe incorrect !");
      return res.status(400).json({ message: "Mot de passe incorrect" });
    }

    // 🔹 Générer un token JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    console.log("✅ Connexion réussie, token généré !");
    res.json({ token, user: { id: user._id, firstName: user.firstName, name: user.name, email: user.email, cabinet: user.cabinet } });
  } catch (err) {
    console.error("❌ Erreur lors de la connexion :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 🔹 Récupération des informations de l'utilisateur connecté
router.get("/me", verifyToken, async (req, res) => { // Ajout du middleware verifyToken
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }
    res.json(user);
  } catch (err) {
    console.error("❌ Erreur lors de la récupération de l'utilisateur :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
