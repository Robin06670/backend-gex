const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const TimesheetEntry = require("../models/TimesheetEntry");
const Collaborator = require("../models/Collaborator");

router.use(verifyToken); // 🔐 Sécurise toutes les routes

// ✅ POST - Ajouter une ligne de feuille de temps
router.post("/", async (req, res) => {
  try {
    const {
      collaborator, // obligatoire (ObjectId)
      date,
      client,
      task,
      comment,
      startTime,
      endTime,
      duration,
      facturable,
      montant,
    } = req.body;

    // Vérifier que le collaborateur appartient au même cabinet que l'utilisateur connecté
    const collab = await Collaborator.findById(collaborator);

    if (!collab) {
      return res.status(404).json({ error: "Collaborateur introuvable." });
    }

    if (String(collab.cabinet) !== String(req.user.cabinet)) {
      return res.status(403).json({ error: "Accès non autorisé à ce collaborateur." });
    }

    const entry = await TimesheetEntry.create({
      collaborator,
      date,
      client: client || null,
      task,
      comment,
      startTime,
      endTime,
      duration,
      facturable,
      montant,
    });

    res.status(201).json(entry);
  } catch (err) {
    console.error("Erreur création timesheet :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
