const mongoose = require("mongoose");

const TimesheetEntrySchema = new mongoose.Schema({
  collaborator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Collaborator",
    required: true,
  },
  date: {
    type: String, // Format: 'YYYY-MM-DD'
    required: true,
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
    default: null,
  },
  task: {
    type: String,
    required: true,
  },
  comment: {
    type: String,
    default: "",
  },
  startTime: {
    type: String, // Format: 'HH:mm'
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  duration: {
    type: Number, // En minutes
    required: true,
  },
  facturable: {
    type: Boolean,
    default: false,
  },
  montant: {
    type: Number,
    default: 0,
  },
  isLocked: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model("TimesheetEntry", TimesheetEntrySchema);
