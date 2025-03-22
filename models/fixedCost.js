const mongoose = require("mongoose");

const FixedCostsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  petitsMateriels: { type: Number, default: 0 },
  energies: { type: Number, default: 0 },
  sousTraitance: { type: Number, default: 0 },
  loyers: { type: Number, default: 0 },
  leasingsMateriels: { type: Number, default: 0 },
  leasingsVehicules: { type: Number, default: 0 },
  entretienReparations: { type: Number, default: 0 },
  logicielsProduction: { type: Number, default: 0 },
  assurances: { type: Number, default: 0 },
  honoraires: { type: Number, default: 0 },
  fraisGeneraux: { type: Number, default: 0 },
  fraisActes: { type: Number, default: 0 },
  telecomFraisPostaux: { type: Number, default: 0 },
  servicesBancaires: { type: Number, default: 0 },
  impotsTaxes: { type: Number, default: 0 },
  amortissements: { type: Number, default: 0 },
  autresFraisFixes: { type: Number, default: 0 },
});

module.exports = mongoose.model("FixedCosts", FixedCostsSchema);
