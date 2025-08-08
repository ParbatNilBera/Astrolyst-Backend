const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // person who booked
      required: true,
    },
    astrologer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // astrologer who is booked
      required: true,
    },
    bookingType: {
      type: String,
      enum: ["chat", "call"],
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    timeSlot: {
      startTime: { type: String, required: true }, // e.g., "10:00 AM"
      endTime: { type: String, required: true }, // e.g., "10:30 AM"
    },
    durationMinutes: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "pending",
    },
    userFeedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
