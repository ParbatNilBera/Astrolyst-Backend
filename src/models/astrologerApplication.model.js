const mongoose = require("mongoose");

const astrologerApplicationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },

    location: {
      type: String,
    },

    expertise: {
      type: [String], // e.g. ["Vedic", "Tarot"]
      required: true,
    },

    experience: {
      type: Number,
      required: true,
    },

    languages: {
      type: [String],
      required: true,
    },

    chatPerMin: {
      type: Number,
      default: 0,
    },

    callPerMin: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "AstrologerApplication",
  astrologerApplicationSchema
);
