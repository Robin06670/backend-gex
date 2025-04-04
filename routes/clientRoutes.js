const express = require("express");
const router = express.Router();
const Client = require("../models/Client");
const Collaborator = require("../models/Collaborator");
const auth = require("../middleware/authMiddleware");

// 📌 Route pour récupérer le nombre total de clients (de l'utilisateur)
router.get("/count", auth, async (req, res) => {
  try {
    const count = await Client.countDocuments({ cabinet: req.user.cabinet }    );
    console.log(`📊 Nombre total de clients (user ${req.user.id}) : ${count}`);
    res.status(200).json({ count });
  } catch (error) {
    console.error("❌ Erreur lors du comptage des clients :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 📌 Chiffre d'affaires total (de l'utilisateur)
router.get("/revenue", auth, async (req, res) => {
  try {
    const mongoose = require("mongoose");
    const filter = { cabinet: new mongoose.Types.ObjectId(req.user.cabinet) };

    console.log("Filter for revenue:", filter);

    const revenue = await Client.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: "$fees" } } }
    ]);

    console.log("Revenue Aggregation Result:", revenue);

    res.status(200).json({ revenue: revenue.length > 0 ? revenue[0].total : 0 });
  } catch (error) {
    console.error("Erreur récupération CA :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 📌 Chiffre d'affaires par collaborateur (de l'utilisateur)
router.get("/revenue-by-collaborator", auth, async (req, res) => {
  try {
    const mongoose = require("mongoose");
    const filter = { cabinet: new mongoose.Types.ObjectId(req.user.cabinet) };

    console.log("Filter for revenue by collaborator:", filter);

    const revenueByCollaborator = await Client.aggregate([
      { $match: filter }, // ✅ Utilise ObjectId ici aussi
      {
        $group: {
          _id: "$collaborator",
          totalRevenue: { $sum: "$fees" }
        }
      },
      {
        $lookup: {
          from: "collaborators",
          localField: "_id",
          foreignField: "_id",
          as: "collaborator"
        }
      },
      { $unwind: "$collaborator" },
      {
        $project: {
          _id: "$collaborator._id",
          firstName: "$collaborator.firstName",
          lastName: "$collaborator.lastName",
          revenue: "$totalRevenue"
        }
      }
    ]);

    console.log("Revenue by Collaborator Aggregation Result:", revenueByCollaborator);

    res.status(200).json(revenueByCollaborator);
  } catch (error) {
    console.error("Erreur récupération CA par collaborateur :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 📌 Marge brute globale
router.get("/gross-margin", auth, async (req, res) => {
  try {
    const totalRevenue = await Client.aggregate([
      { $match: { cabinet: new mongoose.Types.ObjectId(req.user.cabinet) } },
      { $group: { _id: null, total: { $sum: "$fees" } } }
    ]);

    const totalPayroll = await Collaborator.aggregate([
      { $match: { cabinet: new mongoose.Types.ObjectId(req.user.cabinet) } },
      { $group: { _id: null, totalCost: { $sum: "$cost" } } }
    ]);

    const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;
    const payroll = totalPayroll.length > 0 ? totalPayroll[0].totalCost : 0;
    const grossMargin = revenue - payroll;

    res.status(200).json({ margin: grossMargin });
  } catch (error) {
    console.error("❌ Erreur marge brute :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 📌 Marge par collaborateur
router.get("/gross-margin-by-collaborator", auth, async (req, res) => {
  try {
    const marginByCollaborator = await Client.aggregate([
      { $match: { cabinet: new mongoose.Types.ObjectId(req.user.cabinet) } },
      { $group: { _id: "$collaborator", revenue: { $sum: "$fees" } } },
      {
        $lookup: {
          from: "collaborators",
          localField: "_id",
          foreignField: "_id",
          as: "collaboratorInfo"
        }
      },
      { $unwind: "$collaboratorInfo" },
      {
        $project: {
          _id: 1,
          firstName: "$collaboratorInfo.firstName",
          lastName: "$collaboratorInfo.lastName",
          revenue: 1,
          cost: "$collaboratorInfo.cost",
          margin: { $subtract: ["$revenue", "$collaboratorInfo.cost"] }
        }
      }
    ]);

    res.status(200).json(marginByCollaborator);
  } catch (error) {
    console.error("❌ Erreur marge/collaborateur :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// 📌 Fonction : calculer marge selon coût collaborateur
const calculateMargin = async (fees, collaboratorId, theoreticalTime) => {
  if (!fees || !theoreticalTime) return 0;

  const collaborator = await Collaborator.findById(collaboratorId);
  if (!collaborator || !collaborator.weeklyHours || !collaborator.cost) return 0;

  const cost = (collaborator.cost / (collaborator.weeklyHours * 52)) * Number(theoreticalTime);
  return Number(fees) - cost;
};

// 📌 Récupérer tous les clients de l'utilisateur connecté
router.get("/", auth, async (req, res) => {
  try {
    let filter = { cabinet: req.user.cabinet }; // 👈 ajout ici

    if (req.query.collaborator) {
      filter.collaborator = req.query.collaborator;
    }

    const clients = await Client.find(filter).populate("collaborator", "firstName lastName email");
    res.status(200).json(clients);
  } catch (error) {
    console.error("❌ Erreur GET /clients :", error.message);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// 📌 Récupérer un client par ID (vérif user non encore ajoutée ici)
router.get("/:id", auth, async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "ID du client invalide." });
    }

    const client = await Client.findById(req.params.id).populate("collaborator", "firstName lastName email");
    if (!client) {
      return res.status(404).json({ message: "Client non trouvé." });
    }

    res.status(200).json(client);
  } catch (error) {
    console.error("❌ Erreur GET /:id :", error.message);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// 📌 Ajouter un client lié au user
router.post("/", auth, async (req, res) => {
  try {
    const {
      company, activity, siren,
      employees, employeeRate,
      feesAccounting, feesSocial, feesLegal,
      email, phone, address,
      theoreticalTime, collaborator,
    } = req.body;    

    const collabExists = await Collaborator.findById(collaborator);
    if (!collabExists) {
      return res.status(400).json({ message: "Le collaborateur spécifié n'existe pas." });
    }

    const totalFees = Number(feesAccounting) + Number(feesSocial) + Number(feesLegal);
    const margin = await calculateMargin(totalFees, collaborator, theoreticalTime);

    const newClient = new Client({
      company,
      activity,
      siren,
      employees,
      employeeRate,
      feesAccounting,
      feesSocial,
      feesLegal,
      email,
      phone,
      address,
      theoreticalTime: Number(theoreticalTime),
      collaborator,
      user: req.user.id,
      cabinet: req.user.cabinet
    });    

    await newClient.save();
    res.status(201).json(newClient);
  } catch (error) {
    console.error("❌ Erreur POST /clients :", error.message);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// 📌 Modifier un client (propriété vérifiée)
router.put("/:id", auth, async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "ID du client invalide." });
    }

    const clientExists = await Client.findOne({ _id: req.params.id, user: req.user.id });
    if (!clientExists) {
      return res.status(404).json({ message: "Client non trouvé ou non autorisé." });
    }

    const {
      company, activity, siren,
      employees, employeeRate,
      feesAccounting, feesSocial, feesLegal,
      email, phone, address,
      theoreticalTime, collaborator
    } = req.body;    

    if (collaborator) {
      const collabExists = await Collaborator.findById(collaborator);
      if (!collabExists) {
        return res.status(400).json({ message: "Le collaborateur spécifié n'existe pas." });
      }
    }

    const totalFees = Number(feesAccounting) + Number(feesSocial) + Number(feesLegal);
    const updatedMargin = await calculateMargin(totalFees, collaborator || clientExists.collaborator, theoreticalTime);

    const updatedClient = await Client.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      {
        company,
        activity,
        siren,
        employees,
        employeeRate,
        feesAccounting,
        feesSocial,
        feesLegal,
        email,
        phone,
        address,
        theoreticalTime: Number(theoreticalTime),
        collaborator,
        margin: updatedMargin,
        user: req.user.id
      },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedClient);
  } catch (error) {
    console.error("❌ Erreur PUT /clients/:id :", error.message);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// 📌 Supprimer un client (propriété non encore vérifiée ici)
router.delete("/:id", auth, async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "ID du client invalide." });
    }

    const client = await Client.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!client) {
      return res.status(404).json({ message: "Client non trouvé ou non autorisé." });
    }

    res.status(200).json({ message: "Client supprimé avec succès." });
  } catch (error) {
    console.error("❌ Erreur DELETE /clients/:id :", error.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
