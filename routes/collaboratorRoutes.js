const express = require("express");
const router = express.Router();
const Collaborator = require("../models/Collaborator");
const Client = require("../models/Client");
const auth = require("../middleware/authMiddleware");

// 📌 Récupérer tous les collaborateurs de l'utilisateur connecté
router.get("/", auth, async (req, res) => {
  try {
    const collaborators = await Collaborator.find({ cabinet: req.user.cabinet }).lean();

    const formattedCollaborators = collaborators.map(collab => ({
      ...collab,
      managers: collab.managers.map(manager => manager._id?.toString() || manager.toString())
    }));

    res.json(formattedCollaborators);
  } catch (error) {
    console.error("Erreur API Collaborators :", error);
    res.status(500).json({ error: "Erreur serveur lors de la récupération des collaborateurs" });
  }
});

// 📌 Temps consommé
router.get("/time-data", auth, async (req, res) => {
  try {
    const collaborators = await Collaborator.find({ cabinet: req.user.cabinet });
    const clients = await Client.find({ cabinet: req.user.cabinet });

    const data = collaborators
      .filter(collab => collab.weeklyHours)
      .map(collab => {
        const clientsManaged = clients.filter(
          client => client.collaborator && client.collaborator.equals(collab._id)
        );
        const totalTimeConsumed = clientsManaged.reduce(
          (sum, client) => sum + (client.theoreticalTime || 0),
          0
        );

        return {
          _id: collab._id,
          firstName: collab.firstName,
          lastName: collab.lastName,
          weeklyHours: collab.weeklyHours,
          totalTimeConsumed,
          clients: clientsManaged.map(client => ({
            _id: client._id,
            name: client.name,
            timeConsumed: client.theoreticalTime || 0,
          })),
        };
      });

    res.status(200).json(data);
  } catch (error) {
    console.error("❌ Erreur temps collaborateur :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 📌 Masse salariale totale
router.get("/payroll", auth, async (req, res) => {
  try {
    const mongoose = require("mongoose");
    const userId = new mongoose.Types.ObjectId(req.user.cabinet); // ✅ cast en ObjectId

    const totalPayroll = await Collaborator.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, total: { $sum: "$cost" } } }
    ]);

    const payroll = totalPayroll.length > 0 ? totalPayroll[0].total : 0;
    res.status(200).json({ payroll });
  } catch (error) {
    console.error("❌ Erreur masse salariale :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 📌 Masse salariale par collaborateur
router.get("/payroll-by-collaborator", auth, async (req, res) => {
  try {
    const payrollByCollaborator = await Collaborator.find({ cabinet: req.user.cabinet })
      .select("_id firstName lastName cost");

    res.status(200).json(payrollByCollaborator);
  } catch (error) {
    console.error("❌ Erreur masse salariale par collab :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 📌 Nombre de collaborateurs avec managers
router.get("/count-with-managers", auth, async (req, res) => {
  try {
    const count = await Collaborator.countDocuments({
      cabinet: req.user.cabinet,
      managers: { $exists: true, $not: { $size: 0 } }
    });
    res.status(200).json({ count });
  } catch (error) {
    console.error("❌ Erreur count managers :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 📌 Clients par collaborateur
router.get("/clients-by-collaborator", auth, async (req, res) => {
  try {
    const clients = await Client.find({ cabinet: req.user.cabinet });
    const collaborators = await Collaborator.find({ cabinet: req.user.cabinet });

    const clientsByCollaborator = collaborators.map(collab => {
      const clientsCount = clients.filter(client => client.collaborator.toString() === collab._id.toString()).length;
      return { _id: collab._id, clientsCount };
    });

    res.json(clientsByCollaborator);
  } catch (error) {
    console.error("❌ Erreur clients/collaborateur :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 📌 Récupérer 1 collaborateur (non protégé ici, facultatif)
router.get("/:id", auth, async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "ID du collaborateur invalide." });
    }

    const collaborator = await Collaborator.findOne({ _id: req.params.id, cabinet: req.user.cabinet }).lean();

    if (!collaborator) {
      return res.status(404).json({ error: "Collaborateur introuvable ou non autorisé" });
    }

    collaborator.managers = collaborator.managers.map(manager => manager._id?.toString() || manager.toString());

    res.json(collaborator);
  } catch (error) {
    console.error("Erreur GET /:id collab :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 📌 Ajouter un collaborateur lié à l'utilisateur
router.post("/", auth, async (req, res) => {
  try {
    const newCollab = new Collaborator({
      ...req.body,
      cabinet: req.user.cabinet  // 👈 injecté dynamiquement
    });

    await newCollab.save();
    res.status(201).json(newCollab);
  } catch (error) {
    console.error("Erreur POST collaborateur :", error);
    res.status(400).json({ error: "Impossible d'ajouter le collaborateur" });
  }
});

// 📌 Modifier un collaborateur si appartenant à l'utilisateur
router.put("/:id", auth, async (req, res) => {
  try {
    const updatedCollab = await Collaborator.findOneAndUpdate(
      { _id: req.params.id, cabinet: req.user.cabinet },
      req.body,
      { new: true }
    ).lean();

    if (!updatedCollab) {
      return res.status(404).json({ error: "Collaborateur introuvable ou non autorisé" });
    }

    res.json(updatedCollab);
  } catch (error) {
    console.error("Erreur PUT collaborateur :", error);
    res.status(400).json({ error: "Impossible de modifier le collaborateur" });
  }
});

// 📌 Supprimer un collaborateur si appartenant à l'utilisateur
router.delete("/:id", auth, async (req, res) => {
  try {
    const deletedCollab = await Collaborator.findOneAndDelete({
      _id: req.params.id,
      cabinet: req.user.cabinet
    });

    if (!deletedCollab) {
      return res.status(404).json({ error: "Collaborateur introuvable ou non autorisé" });
    }

    res.json({ message: "Collaborateur supprimé avec succès" });
  } catch (error) {
    console.error("Erreur DELETE collaborateur :", error);
    res.status(400).json({ error: "Impossible de supprimer le collaborateur" });
  }
});

module.exports = router;
