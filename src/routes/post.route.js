const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth.middleware");

const {
  uploadPostController,
  likePostController,
  dislikePostController,
  getCommunityPostsController,
  addCommentController,
  getCommentsByPostIdController,
  deleteMyCommentController,
} = require("../controllers/post.controller");

/**
 * @route   POST /api/post/upload
 * @desc    Upload a new post (image, video, text) in a community
 * @access  Private (Community Members)
 */
router.post("/upload", protect, uploadPostController);

/**
 * @route   PUT /api/post/like/:postId
 * @desc    Like a post
 * @access  Private (Community Members)
 */
router.put("/like/:postId", protect, likePostController);

/**
 * @route   PUT /api/post/dislike/:postId
 * @desc    Dislike or remove like from a post
 * @access  Private (Community Members)
 */
router.put("/dislike/:postId", protect, dislikePostController);

/**
 * @route   GET /api/post/community/:communityId
 * @desc    Get all posts in a community
 * @access  Private (Community Members)
 */
router.get("/community/:communityId", protect, getCommunityPostsController);

/**
 * @route   POST /api/post/:postId/comment
 * @desc    Add a comment to a post (own or others')
 * @access  Private (Community Members)
 */

router.get("/comments/:postId", protect, getCommentsByPostIdController);
router.post("/:postId/comment", protect, addCommentController);
router.delete("/:postId/:commentId", protect, deleteMyCommentController);
module.exports = router;
