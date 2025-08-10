const express = require("express");
const router = express.Router();
const {
  getAllAstrologer,
  getUserBookings,
  bookAppointmentController,
  getAllUser,
} = require("../controllers/user.controller");
const { protect } = require("../middlewares/auth.middleware");

/**
 * @route   GET /api/user/users
 * @desc    Get All users
 * @access  Public
 */
router.get("/users", getAllUser);

/**
 * @route   GET /api/user/get-all-astrologers
 * @desc    Get All Astrologers
 * @access  Public
 */
router.get("/get-all-astrologers", getAllAstrologer);

/**
 * @route   GET /api/user/get-my-bookings
 * @desc    Get User Booking
 * @access  Private
 */
router.get("/get-my-bookings", protect, getUserBookings);

/**
 * @route   POST /api/user/book-my-appointment
 * @desc    Book My Appointment
 * @access  Private
 */
router.post("/book-my-appointment", protect, bookAppointmentController);

/**
 * @route   POST /api/user/talk-to-astroger
 * @desc    Call Now
 * @access  Private
 */
router.post("/talk-to-astroger", protect, bookAppointmentController);

module.exports = router;
