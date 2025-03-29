const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const Timesheet = require("../models/Timesheet");

router.use(verifyToken);

// ➕ Ajouter une ligne dans la feuille de temps du jour
router.post("/", async (req, res) => {
  try {
    const {
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

    const collaboratorId = req.user.collaborator; // injecté par le middleware

    if (!collaboratorId) {
      return res.status(400).json({ message: "Collaborateur non lié à cet utilisateur." });
    }

    const entry = {
      client,
      task,
      comment,
      startTime,
      endTime,
      duration,
      facturable,
      montant,
    };

    let timesheet = await Timesheet.findOne({ collaborator: collaboratorId, date });

    if (!timesheet) {
      // Créer la feuille si elle n'existe pas
      timesheet = new Timesheet({
        collaborator: collaboratorId,
        date,
        entries: [entry],
      });
    } else {
      if (timesheet.isLocked) {
        return res.status(403).json({ message: "Feuille verrouillée." });
      }
      timesheet.entries.push(entry);
    }

    await timesheet.save();
    res.status(201).json(timesheet);
  } catch (err) {
    console.error("Erreur ajout ligne :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 📥 Charger les entrées du jour
router.get("/:date", async (req, res) => {
  try {
    const { date } = req.params;
    const collaboratorId = req.user.collaborator;

    if (!collaboratorId) {
      return res.status(400).json({ message: "Collaborateur non lié à cet utilisateur." });
    }

    const timesheet = await Timesheet.findOne({ collaborator: collaboratorId, date }).populate("entries.client");

    if (!timesheet) {
      return res.status(200).json({ entries: [], isLocked: false });
    }

    res.status(200).json({
      entries: timesheet.entries,
      isLocked: timesheet.isLocked,
    });
  } catch (err) {
    console.error("Erreur chargement timesheet:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
