const express = require("express");
const router = express.Router();

const {
  editAstrologerProfileController,
  manageAvailabilityController,
  viewBookingsController,
  answerQueryController,
  viewUserQueriesController,
  createCommunity,
  promoteToAdmin,
  changeAvailabilityController,
} = require("../controllers/astrologer.controller");

const { protect } = require("../middlewares/auth.middleware");

/**
 * @route   PUT /api/astrologer/profile
 * @desc    Edit astrologer's profile details
 * @access  Private (Only astrologer)
 */
router.put("/profile", protect, editAstrologerProfileController);

/**
 * @route   PUT /api/astrologer/time-availability
 * @desc    Set or update astrologer's availability time slots
 * @access  Private (Only astrologer)
 */
router.put("/time-availability", protect, manageAvailabilityController);

/**
 * @route   PUT /api/astrologer/day-availability
 * @desc    Set or update astrologer's availability Days
 * @access  Private (Only astrologer)
 */
router.put("/day-availability", protect, changeAvailabilityController);

/**
 * @route   GET /api/astrologer/bookings
 * @desc    Get all bookings assigned to the logged-in astrologer
 * @access  Private (Only astrologer)
 */
router.get("/bookings", protect, viewBookingsController);

/**
 * @route   POST /api/astrologer/answer-query
 * @desc    Submit an answer to a user’s query
 * @access  Private (Only astrologer)
 */
router.post("/answer-query", protect, answerQueryController);

/**
 * @route   GET /api/astrologer/user-queries
 * @desc    View all pending or answered user queries
 * @access  Private (Only astrologer)
 */
router.get("/user-queries", protect, viewUserQueriesController);

/**
 * @route   POST /api/astrologer/create-community
 * @desc    Create a new community for discussion/sharing
 * @access  Private (Only astrologer)
 */
router.post("/create-community", protect, createCommunity);

/**
 * @route   POST /api/astrologer/promote-admin
 * @desc    Promote a user to community admin
 * @access  Private (Only astrologer)
 */
router.post("/promote-admin", protect, promoteToAdmin);

module.exports = router;
