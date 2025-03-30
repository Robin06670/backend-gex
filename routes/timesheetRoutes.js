const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const Timesheet = require("../models/Timesheet");
const requireAuth = require("../middleware/authMiddleware");

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
      client: client === "none" || client === "" ? null : client,
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

    const timesheet = await Timesheet.findOne({ collaborator: collaboratorId, date }).populate({
      path: "entries.client",
      select: "company", // ou "nom" selon ton schéma Client
    });    

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

// 🔒 Valider (verrouiller ou déverrouiller) une feuille de temps
router.patch("/:date/lock", async (req, res) => {
  try {
    const { date } = req.params;
    const { lock } = req.body; // true ou false
    const collaboratorId = req.user.collaborator;

    if (!collaboratorId) {
      return res.status(400).json({ message: "Collaborateur non trouvé." });
    }

    const timesheet = await Timesheet.findOne({ collaborator: collaboratorId, date });

    if (!timesheet) {
      return res.status(404).json({ message: "Feuille non trouvée." });
    }

    timesheet.isLocked = lock;
    await timesheet.save();

    res.status(200).json({ message: `Feuille ${lock ? "verrouillée" : "déverrouillée"}` });
  } catch (err) {
    console.error("Erreur lock :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 🔁 Modifier une ligne dans la feuille
router.put("/:date/entry/:index", async (req, res) => {
  try {
    const { date, index } = req.params;
    const collaboratorId = req.user.collaborator;
    const newEntry = {
      ...req.body,
      client: req.body.client === "none" || req.body.client === "" ? null : req.body.client
    };    

    const timesheet = await Timesheet.findOne({ collaborator: collaboratorId, date });

    if (!timesheet) {
      return res.status(404).json({ message: "Feuille non trouvée." });
    }

    if (timesheet.isLocked) {
      return res.status(403).json({ message: "Feuille verrouillée." });
    }

    if (index < 0 || index >= timesheet.entries.length) {
      return res.status(400).json({ message: "Index invalide." });
    }

    timesheet.entries[index] = newEntry;
    await timesheet.save();

    res.status(200).json({ message: "Entrée modifiée avec succès.", timesheet });
  } catch (err) {
    console.error("Erreur modification ligne :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ❌ Supprimer une ligne dans la feuille
router.delete("/:date/entry/:index", async (req, res) => {
  try {
    const { date, index } = req.params;
    const collaboratorId = req.user.collaborator;

    const timesheet = await Timesheet.findOne({ collaborator: collaboratorId, date });

    if (!timesheet) {
      return res.status(404).json({ message: "Feuille non trouvée." });
    }

    if (timesheet.isLocked) {
      return res.status(403).json({ message: "Feuille verrouillée." });
    }

    const idx = parseInt(index);
    if (idx < 0 || idx >= timesheet.entries.length) {
      return res.status(400).json({ message: "Index invalide." });
    }

    timesheet.entries.splice(idx, 1);
    await timesheet.save();

    res.status(200).json({ message: "Entrée supprimée avec succès.", timesheet });
  } catch (err) {
    console.error("Erreur suppression ligne :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});
// 📅 Récupérer toutes les feuilles de temps d'un collaborateur
router.get("/collaborator/:id", requireAuth, async (req, res) => {
  try {
    const collaboratorId = req.params.id;

    const timesheets = await Timesheet.find({ collaborator: collaboratorId })
      .populate({
        path: "entries.client",
        select: "company", // ou "nom" selon ton modèle Client
      });

    const allEntries = timesheets.flatMap(ts =>
      ts.entries.map(entry => ({
        date: ts.date,
        clientName: entry.client?.company || "Non affectable",
        task: entry.task,
        comment: entry.comment,
        start: entry.startTime,
        end: entry.endTime,
        duration: entry.duration,
        billable: entry.facturable,
        billableAmount: entry.montant,
      }))
    );

    res.json(allEntries);
  } catch (err) {
    console.error("Erreur récupération timesheet du collaborateur :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET /api/timesheets/stats/:collaboratorId
router.get("/stats/:id", requireAuth, async (req, res) => {
  const { from, to, clientId } = req.query;
  const collaboratorId = req.params.id;

  try {
    const match = {
      collaborator: new mongoose.Types.ObjectId(collaboratorId),
      date: { $gte: from, $lte: to }
    };

    const pipeline = [
      { $match: match },
      { $unwind: "$entries" },
    ];

    if (clientId) {
      pipeline.push({
        $match: {
          "entries.client": new mongoose.Types.ObjectId(clientId),
        },
      });
    }

    pipeline.push({
      $group: {
        _id: {
          task: "$entries.task",
          facturable: "$entries.facturable",
        },
        duration: { $sum: "$entries.duration" },
      },
    });

    pipeline.push({
      $project: {
        _id: 0,
        task: "$_id.task",
        facturable: "$_id.facturable",
        duration: 1,
      },
    });

    const stats = await Timesheet.aggregate(pipeline);
    res.json(stats);
  } catch (error) {
    console.error("Erreur récupération stats collab :", error);
    res.status(500).json({ error: "Échec récupération des statistiques" });
  }
});


module.exports = router;
