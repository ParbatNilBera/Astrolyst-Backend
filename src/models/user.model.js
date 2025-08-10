const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Basic Info
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    phone: {
      type: String,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },

    dob: {
      type: Date, // Used for Kundli generation
    },

    location: {
      type: String, // Used for Kundli generation
    },

    // Roles
    role: {
      type: String,
      enum: ["user", "astrologer", "admin"],
      default: "user",
    },

    // Moderator for specific communities
    moderatorOf: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Community",
      },
    ],
    isAvailableForCall: {
      type: Boolean,
      default: false,
    },

    // Astrology-Specific
    kundli: {
      type: Object, // JSON returned from Kundli API
      default: {},
    },
    isOnCall: {
      type: Boolean,
      default: false,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    // Astrologer-specific fields
    isApprovedByAdmin: {
      type: Boolean,
      default: false,
    },

    expertise: {
      type: [String], // e.g. ["Vedic", "Numerology"]
      default: [],
    },

    experience: {
      type: Number, // years of experience
      default: 0,
    },

    languages: {
      type: [String], // e.g. ["Hindi", "English"]
      default: [],
    },

    availability: [
      {
        day: String,
        startTime: String,
        endTime: String,
      },
    ],

    pricing: {
      chatPerMin: {
        type: Number,
        default: 0,
      },
      callPerMin: {
        type: Number,
        default: 0,
      },
    },

    // 💰 Wallet for billing system
    wallet: {
      balance: {
        type: Number,
        default: 5000, // Starting balance
      },
      currency: {
        type: String,
        default: "INR",
      },
    },

    // Community Features
    karma: {
      type: Number,
      default: 0,
    },

    joinedCommunities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Community",
      },
    ],

    likedPosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],

    dislikedPosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
