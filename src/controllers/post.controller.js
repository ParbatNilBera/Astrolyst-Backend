const Post = require("../models/post.model");
const Community = require("../models/comunity.model");
const { response } = require("../utils/responseHandler");

// 1. Upload Post
const uploadPostController = async (req, res) => {
  try {
    const { communityId, postTitle, content } = req.body;
    const userId = req.user.userId;

    // Fetch the community and check if it exists
    const community = await Community.findById(communityId);
    if (!community) {
      return response(res, 404, "Community not found");
    }

    // Check if the user is an approved member of the community
    const isMember = community.members.some(
      (member) =>
        member.user.toString() === userId && member.status === "approved"
    );

    if (!isMember) {
      return response(
        res,
        403,
        "You are not an approved member of this community"
      );
    }

    // Create the post
    const post = await Post.create({
      community: communityId,
      author: userId,
      postTitle,
      content,
    });

    return response(res, 201, "Post created successfully", post);
  } catch (err) {
    return response(res, 500, "Error uploading post", err.message);
  }
};

// 2. Like Post (cannot dislike simultaneously)
// Like Post (cannot like twice, and removes dislike if exists)
const likePostController = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) return response(res, 404, "Post not found");

    // Already liked → do nothing
    if (post.likes.includes(userId)) {
      return response(res, 400, "You have already liked this post");
    }

    // Remove from dislikes if exists
    post.dislikes = post.dislikes.filter((id) => id.toString() !== userId);

    // Add like
    post.likes.push(userId);

    await post.save();
    return response(res, 200, "Post liked successfully", post);
  } catch (err) {
    return response(res, 500, "Error liking post", err.message);
  }
};

// Dislike Post (cannot dislike twice, and removes like if exists)
const dislikePostController = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) return response(res, 404, "Post not found");

    // Already disliked → do nothing
    if (post.dislikes.includes(userId)) {
      return response(res, 400, "You have already disliked this post");
    }

    // Remove from likes if exists
    post.likes = post.likes.filter((id) => id.toString() !== userId);

    // Add dislike
    post.dislikes.push(userId);

    await post.save();
    return response(res, 200, "Post disliked successfully", post);
  } catch (err) {
    return response(res, 500, "Error disliking post", err.message);
  }
};

// 4. Get all posts of a specific community
const getCommunityPostsController = async (req, res) => {
  try {
    const { communityId } = req.params;

    const posts = await Post.find({ community: communityId })
      .populate("author", "name email role")
      .populate("likes", "name")
      .populate("dislikes", "name")
      .populate("comments.user", "name")
      .sort({ createdAt: -1 });

    return response(res, 200, "Posts fetched successfully", posts);
  } catch (err) {
    return response(res, 500, "Error fetching posts", err.message);
  }
};

const addCommentController = async (req, res) => {
  try {
    const userId = req.user.userId; // from auth middleware
    const { postId } = req.params;
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "Comment text is required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    // Add comment to array
    post.comments.push({
      user: userId,
      text: text.trim(),
    });

    await post.save();

    // Populate author + comments.user for frontend display
    await post.populate([
      { path: "author", select: "name email" },
      { path: "comments.user", select: "name email" },
    ]);

    return res.status(200).json({
      success: true,
      message: "Comment added successfully",
      post,
    });
  } catch (err) {
    console.error("Error adding comment:", err);
    return res.status(500).json({
      success: false,
      message: "Error adding comment",
      error: err.message,
    });
  }
};

const getCommentsByPostIdController = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId)
      .select("comments") // Only return comments
      .populate("comments.user", "name email"); // Populate comment authors

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    return res.status(200).json({
      success: true,
      comments: post.comments,
    });
  } catch (err) {
    console.error("Error fetching comments:", err);
    return res.status(500).json({
      success: false,
      message: "Error fetching comments",
      error: err.message,
    });
  }
};

const deleteMyCommentController = async (req, res) => {
  try {
    const userId = req.user.userId; // from auth middleware
    const { postId, commentId } = req.params;

    // Find the post
    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    // Find the comment
    const comment = post.comments.find((c) => c._id.toString() === commentId);
    if (!comment) {
      return res
        .status(404)
        .json({ success: false, message: "Comment not found" });
    }

    // Verify ownership
    if (comment.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own comments",
      });
    }

    // Remove comment from array
    post.comments = post.comments.filter((c) => c._id.toString() !== commentId);

    await post.save();

    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
      comments: post.comments, // updated list
    });
  } catch (err) {
    console.error("Error deleting comment:", err);
    return res.status(500).json({
      success: false,
      message: "Error deleting comment",
      error: err.message,
    });
  }
};
module.exports = {
  uploadPostController,
  likePostController,
  dislikePostController,
  getCommunityPostsController,
  addCommentController,
  getCommentsByPostIdController,
  deleteMyCommentController,
};
