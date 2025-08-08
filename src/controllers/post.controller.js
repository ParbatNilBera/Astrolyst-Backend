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
const likePostController = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) return response(res, 404, "Post not found");

    // Remove user from dislikes if present
    post.dislikes = post.dislikes.filter((id) => id.toString() !== userId);

    // Toggle like
    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    return response(res, 200, "Post like status updated", post);
  } catch (err) {
    return response(res, 500, "Error liking post", err.message);
  }
};

// 3. Dislike Post (cannot like simultaneously)
const dislikePostController = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) return response(res, 404, "Post not found");

    // Remove user from likes if present
    post.likes = post.likes.filter((id) => id.toString() !== userId);

    // Toggle dislike
    if (post.dislikes.includes(userId)) {
      post.dislikes = post.dislikes.filter((id) => id.toString() !== userId);
    } else {
      post.dislikes.push(userId);
    }

    await post.save();
    return response(res, 200, "Post dislike status updated", post);
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

module.exports = {
  uploadPostController,
  likePostController,
  dislikePostController,
  getCommunityPostsController,
};
