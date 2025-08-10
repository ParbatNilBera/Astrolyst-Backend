const mongoose = require("mongoose");

const querySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // question asked by
      required: true,
    },
    astrologer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // answered by
      required: true,
    },
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String, // will be added by astrologer
      default: "",
    },
    isAnswered: {
      type: Boolean,
      default: false,
    },
    reportUrl: {
      type: String, // URL/path to uploaded report (PDF/image etc.)
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Query", querySchema);
