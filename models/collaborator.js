const mongoose = require("mongoose");

const CollaboratorSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: String,
  gender: { type: String, enum: ["Homme", "Femme"], default: "Homme" },
  salary: Number,
  cost: Number,
  weeklyHours: Number,
  managers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Collaborator" }],

  // ✅ Association au user connecté
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
});

// 📌 Correction pour éviter OverwriteModelError (utile en dev)
module.exports = mongoose.models.Collaborator || mongoose.model("Collaborator", CollaboratorSchema);
