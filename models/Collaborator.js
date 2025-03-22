const mongoose = require("mongoose");

const CollaboratorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  name: {
    type: String,
    required: true
  },
  role: {
    type: String
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Collaborator"
  },
  salary: {
    type: Number
  },
  email: {
    type: String
  },
  phone: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.Collaborator || mongoose.model("Collaborator", CollaboratorSchema);

