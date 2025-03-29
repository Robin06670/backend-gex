const mongoose = require("mongoose");

const EntrySchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: "Client", default: null },
  task: { type: String, required: true },
  comment: { type: String, default: "" },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  duration: { type: Number, required: true },
  facturable: { type: Boolean, default: false },
  montant: { type: Number, default: 0 },
});

const TimesheetSchema = new mongoose.Schema({
  collaborator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Collaborator",
    required: true,
  },
  date: {
    type: String, // format YYYY-MM-DD
    required: true,
  },
  entries: [EntrySchema],
  isLocked: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

TimesheetSchema.index({ collaborator: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Timesheet", TimesheetSchema);
