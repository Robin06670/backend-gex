const mongoose = require("mongoose");

const FixedCostSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  name: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  category: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("FixedCost", FixedCostSchema);
