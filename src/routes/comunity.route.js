const express = require("express");
const router = express.Router();

const {
  updateCommunityDetails,
  removeUserFromCommunity,
  joinCommunity,
  getAllComunityUser,
  getAllComunity,
  getCommunityDetailsById,
  demoteModerator,
  promoteToModerator,
  addCommunityMember,
} = require("../controllers/comunity.controller");

const { protect } = require("../middlewares/auth.middleware");

/**
 * @route   POSt /api/comunity/add-member
 * @desc    Update community description and visibility
 * @access  Private (Admin and Astrologer only)
 */
router.post("/add-member", protect, addCommunityMember);

/**
 * @route   PUT /api/comunity/:communityId/update
 * @desc    Update community description and visibility
 * @access  Private (Admin and Astrologer only)
 */
router.put("/:communityId/update", protect, updateCommunityDetails);

/**
 * @route   DELETE /api/comunity/:communityId/remove/:targetUserId
 * @desc    Remove a user from the community
 * @access  Private
 *          - Admin can remove user
 *          - Astrologer can remove both user and admin
 */
router.delete(
  "/:communityId/remove/:targetUserId",
  protect,
  removeUserFromCommunity
);

/**
 * @route   POST /api/comunity/join-comunity
 * @desc    Join a community (for normal users)
 * @access  Private (User)
 */
router.post("/join-comunity", protect, joinCommunity);

/**
 * @route   GET /api/comunity/get-all-user/:communityId
 * @desc    Get all users of a particular community
 * @access  Private (Admin or Astrologer)
 */
router.get("/get-all-user/:communityId", protect, getAllComunityUser);
/**
 * @route   GET /api/comunity/get-communities
 * @desc    Get all communities
 * @access  Public
 */
router.get("/get-communities", protect, getAllComunity);

/**
 * @route   GET /api/comunity/get-community/:communityId
 * @desc    Get Community by id
 * @access  Public
 */

router.get("/get-community/:communityId", getCommunityDetailsById);

router.put("/community/:communityId/:userId", promoteToModerator);
router.delete("/community/:communityId/:userId", demoteModerator);

module.exports = router;
