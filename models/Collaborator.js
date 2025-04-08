const mongoose = require("mongoose");

const CollaboratorSchema = new mongoose.Schema({
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
  position: {
    type: Object,
    default: null
  },  
  clients: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
    },
  ],
  firstName: { type: String },
  lastName: { type: String },
  role: { type: String },
  gender: { type: String },
  salary: { type: Number },
  cost: { type: Number },
  weeklyHours: { type: Number },
  managers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Collaborator" }],
  email: { type: String },
  phone: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.models.Collaborator || mongoose.model("Collaborator", CollaboratorSchema);
