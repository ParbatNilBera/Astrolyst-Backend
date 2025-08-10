const mongoose = require("mongoose");

const communitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true, // Unique community name
    },
    description: {
      type: String,
    },
    visibility: {
      type: String,
      enum: ["public", "restricted", "private"],
      default: "public",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Only astrologers can create
      required: true,
    },
    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role: {
          type: String,
          enum: ["user", "admin", "astrologer"],
          default: "user",
        },
        status: {
          type: String,
          enum: ["pending", "approved"],
          default: "approved", // In restricted/private, approval is needed
        },
        isModerator: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Community", communitySchema);
