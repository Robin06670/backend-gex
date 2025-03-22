const mongoose = require("mongoose");

const ClientSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String },
  company: { type: String },
  fees: { type: Number, default: 0 },  
  cost: { type: Number, default: 0 },  
  margin: { type: Number, default: 0 }, 
  activity: { type: String },
  theoreticalTime: { type: Number },

  // ✅ Ajout du lien entre Client et User (propriétaire)
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },

  collaborator: { type: mongoose.Schema.Types.ObjectId, ref: "Collaborator" },
});

// 🔹 Middleware Mongoose : Calcul automatique de la marge avant la sauvegarde
ClientSchema.pre("save", function (next) {
  if (this.fees !== undefined && this.cost !== undefined) {
    this.margin = this.fees - this.cost; 
  } else {
    this.margin = 0;
  }
  next();
});

// 🔹 Middleware Mongoose : Calcul automatique de la marge avant mise à jour
ClientSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (update.fees !== undefined && update.cost !== undefined) {
    update.margin = update.fees - update.cost; 
  }
  next();
});

module.exports = mongoose.models.Client || mongoose.model("Client", ClientSchema);
