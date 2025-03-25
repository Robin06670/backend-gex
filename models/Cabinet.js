const mongoose = require("mongoose");

const CabinetSchema = new mongoose.Schema({
  user: { // Admin
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  cabinetName: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  logo: { type: String },
  collaborators: { type: Number, default: 0 },
  members: [{ // 👈 La vraie liste de membres du cabinet
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }]
});

module.exports = mongoose.model("Cabinet", CabinetSchema);
