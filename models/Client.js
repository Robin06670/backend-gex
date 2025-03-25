const mongoose = require("mongoose");

const ClientSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  cabinet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cabinet",
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
    ref: "Collaborator"
  },
  theoreticalTime: {
    type: Number,
    default: 0 // Optionnel : permet de forcer 0 si jamais rien n’est défini
  },
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.Client || mongoose.model("Client", ClientSchema);
