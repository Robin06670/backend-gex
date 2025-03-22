const mongoose = require("mongoose");

const CabinetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // 🔹 Lien avec l'utilisateur
    required: true
  },
  cabinetName: { type: String, required: true },
  address: { type: String, required: true },
  collaborators: { type: Number, default: 0 },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  logo: { type: String } // 🔹 Stocke l'image sous forme de base64
});

module.exports = mongoose.model("Cabinet", CabinetSchema);
