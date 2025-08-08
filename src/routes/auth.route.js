const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginByRole,
  getUserProfile,
  applyAstrologer,
  registerAdmin,
} = require("../controllers/auth.controller");

const { protect } = require("../middlewares/auth.middleware");
const {
  registerUserValidate,
  loginUserValidate,
} = require("../middlewares/validate.middleware");

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/register", registerUserValidate, registerUser);

/**
 * @route   POST /api/auth/login-user
 * @desc    Login as a user (with JWT token return)
 * @access  Public
 */
router.post("/login-user", loginUserValidate, (req, res) =>
  loginByRole(req, res, "user")
);

/**
 * @route   POST /api/auth/register-admin
 * @desc    Register a new Admin
 * @access  Public
 */
router.post("/register-admin", registerUserValidate, registerAdmin);

/**
 * @route   POST /api/auth/login-admin
 * @desc    Login as admin
 * @access  Public (assuming no protect)
 */
router.post("/login-admin", (req, res) => loginByRole(req, res, "admin"));

/**
 * @route   POST /api/auth/login-astrologer
 * @desc    Login as astrologer
 * @access  Public (assuming no protect)
 */
router.post("/login-astrologer", (req, res) =>
  loginByRole(req, res, "astrologer")
);

/**
 * @route   GET /api/auth/profile
 * @desc    Get authenticated user profile
 * @access  Private
 */
router.get("/profile", protect, getUserProfile);

/**
 * @route   POST /api/auth/astrologer/apply
 * @desc    Apply for astrologer role
 * @access  Public
 */
router.post("/astrologer/apply", applyAstrologer);

module.exports = router;
