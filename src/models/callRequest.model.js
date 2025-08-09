const mongoose = require("mongoose");

const callRequestSchema = new mongoose.Schema({
  astrologer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "completed"],
    default: "pending",
  },
  requestedAt: {
    type: Date,
    default: Date.now,
  },
  acceptedAt: Date,
});

module.exports = mongoose.model("CallRequest", callRequestSchema);
