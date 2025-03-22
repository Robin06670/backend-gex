const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');

// 📌 Route pour récupérer les infos du profil utilisateur connecté
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("firstName name email cabinet");

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("❌ Erreur lors de la récupération du profil :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 📌 Route pour mettre à jour le profil utilisateur connecté
router.put('/profile', auth, async (req, res) => {
  const { firstName, name, email } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    user.firstName = firstName || user.firstName;
    user.name = name || user.name;
    user.email = email || user.email;

    await user.save();

    res.status(200).json({ message: 'Profil mis à jour avec succès' });
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du profil :', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du profil' });
  }
});

module.exports = router;
