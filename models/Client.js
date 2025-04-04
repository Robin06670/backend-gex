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
  phone: {
    type: String
  },
  email: {
    type: String
  },
  address: {
    type: String
  },
  activity: {
    type: String
  },
  company: {                  // ✅ AJOUTÉ
    type: String
  },
  siren: {
    type: String
  },
  employees: {
    type: Number
  },
  employeeRate: {
    type: Number
  },
  feesAccounting: {
    type: Number
  },
  feesSocial: {
    type: Number
  },
  feesLegal: {
    type: Number
  },  
  cost: {                     // ✅ AJOUTÉ
    type: Number
  },
  margin: {                   // ✅ AJOUTÉ
    type: Number
  },
  collaborator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Collaborator"
  },
  theoreticalTime: {
    type: Number,
    default: 0
  },
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.Client || mongoose.model("Client", ClientSchema);
