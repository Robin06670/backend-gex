const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Cabinet = require("../models/Cabinet");
const verifyToken = require("../middleware/authMiddleware");

// 🔒 Invite un utilisateur existant à rejoindre le cabinet de l'admin connecté
router.post("/invite", verifyToken, async (req, res) => {
  try {
    const { email, role } = req.body;

    // 🔐 Récupère l'utilisateur qui invite (admin)
    const adminUser = await User.findById(req.user.id).populate("cabinet");

    if (!adminUser || !adminUser.cabinet) {
      return res.status(403).json({ message: "Cabinet introuvable ou non autorisé." });
    }

    // 🔍 Vérifie si l'utilisateur à inviter existe
    const userToInvite = await User.findOne({ email });
    if (!userToInvite) {
      return res.status(404).json({ message: "Utilisateur à inviter introuvable." });
    }

    // 🔄 Met à jour le user invité
    userToInvite.cabinet = adminUser.cabinet._id;
    userToInvite.role = role;
    await userToInvite.save();

    // 🔗 Lier l'utilisateur invité à un collaborateur existant s'il y a correspondance
    if (role === "collaborateur") {
      const Collaborator = require("../models/Collaborator");
      const matchedCollaborator = await Collaborator.findOne({
        firstName: userToInvite.firstName,
        lastName: userToInvite.name,
        cabinet: adminUser.cabinet._id
      });

      if (matchedCollaborator) {
        matchedCollaborator.user = userToInvite._id;
        await matchedCollaborator.save();
        console.log("✅ Collaborateur lié automatiquement à l'utilisateur :", matchedCollaborator._id);
      } else {
        console.log("⚠️ Aucun collaborateur correspondant trouvé pour lier l'utilisateur invité.");
      }
    }

    // 👥 Met à jour la liste des membres du cabinet
    if (!adminUser.cabinet.members.includes(userToInvite._id)) {
      adminUser.cabinet.members.push(userToInvite._id);
    }
    await adminUser.cabinet.save();

    res.status(200).json({ message: "Utilisateur invité avec succès." });
  } catch (err) {
    console.error("❌ Erreur invitation :", err);
    res.status(500).json({ message: "Erreur serveur lors de l'invitation." });
  }
});

module.exports = router;
