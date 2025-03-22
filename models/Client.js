const mongoose = require("mongoose");

const ClientSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Lien vers l'utilisateur propriétaire
    required: true
  },
  name: {
    type: String,
    required: true
  },
  activity: {
    type: String
  },
  fees: {
    type: Number
  },
  charges: {
    type: Number
  },
  collaborator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Collaborator" // Lien vers le collaborateur
  },
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.Client || mongoose.model("Client", ClientSchema);

