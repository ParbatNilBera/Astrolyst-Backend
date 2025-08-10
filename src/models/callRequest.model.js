// const mongoose = require("mongoose");

// const callRequestSchema = new mongoose.Schema({
//   astrologer: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true,
//   },
//   user: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true,
//   },
//   status: {
//     type: String,
//     enum: ["pending", "accepted", "rejected", "completed"],
//     default: "pending",
//   },
//   requestedAt: {
//     type: Date,
//     default: Date.now,
//   },
//   acceptedAt: Date,
// });

// module.exports = mongoose.model("CallRequest", callRequestSchema);

// models/callRequest.model.js
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
  channelName: {
    type: String,
    default: null,
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
  acceptedAt: {
    type: Date,
  },
});

module.exports = mongoose.model("CallRequest", callRequestSchema);
