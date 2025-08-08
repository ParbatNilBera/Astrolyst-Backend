const Community = require("../models/comunity.model");
const Post = require("../models/post.model");
const User = require("../models/user.model");
const { response } = require("../utils/responseHandler");

const updateCommunityDetails = async (req, res) => {
  try {
    const { communityId } = req.params;
    const { description, visibility } = req.body;
    const userId = req.user._id;

    const community = await Community.findById(communityId);
    if (!community) return response(res, 404, "Community not found");

    const member = community.members.find(
      (m) => m.user.toString() === userId.toString()
    );

    if (!member || (member.role !== "astrologer" && member.role !== "admin")) {
      return response(res, 403, "Not authorized to update community details");
    }

    if (
      visibility &&
      !["public", "restricted", "private"].includes(visibility)
    ) {
      return response(res, 400, "Invalid visibility type");
    }

    if (description) community.description = description;
    if (visibility) community.visibility = visibility;

    await community.save();
    return response(res, 200, "Community details updated", community);
  } catch (error) {
    console.log(error);
    return response(res, 500, "Server Error");
  }
};

const removeUserFromCommunity = async (req, res) => {
  try {
    const { communityId, targetUserId } = req.params;
    const userId = req.user._id;

    const community = await Community.findById(communityId);
    if (!community) return response(res, 404, "Community not found");

    const requester = community.members.find(
      (m) => m.user.toString() === userId.toString()
    );
    const target = community.members.find(
      (m) => m.user.toString() === targetUserId.toString()
    );

    if (!requester || !target) return response(res, 404, "Member not found");

    // Admins can't remove other admins or astrologers
    if (requester.role === "admin") {
      if (target.role !== "user") {
        return response(res, 403, "Admins can only remove normal users");
      }
    }

    // Astrologers can remove anyone
    if (requester.role === "astrologer") {
      if (target.user.toString() === community.createdBy.toString()) {
        return response(res, 403, "You can't remove yourself (creator)");
      }
    }

    // Prevent unauthorized
    if (requester.role !== "admin" && requester.role !== "astrologer") {
      return response(res, 403, "Not authorized to remove members");
    }

    community.members = community.members.filter(
      (m) => m.user.toString() !== targetUserId
    );
    await community.save();
    return response(res, 200, "User removed from community");
  } catch (error) {
    console.log(error);
    return response(res, 500, "Server Error");
  }
};

const joinCommunity = async (req, res) => {
  const { communityId } = req.body;
  const userId = req.user.userId;
  if (!communityId) {
    return res.status(400).json({ message: "Enter comminty id " });
  }

  const community = await Community.findById(communityId);

  if (!community)
    return res.status(404).json({ message: "Community not found" });

  const isMember = community.members.find((m) => m.user.toString() === userId);
  if (isMember)
    return res.status(400).json({ message: "Already a member or pending" });

  const status = community.visibility === "public" ? "approved" : "pending";

  community.members.push({ user: userId, role: "user", status });
  await community.save();

  res.status(200).json({ message: `Join request ${status}`, communityId });
};

const getAllComunityUser = async (req, res) => {
  const { communityId } = req.params;
  const userId = req.user.userId;
  if (!communityId) return response(res, 400, "Community id is undefined");
  if (!userId) {
    return response(res, 400, "Unable to fetch userid");
  }
  try {
    const community = await Community.findById(communityId).populate(
      "members.user"
    );

    if (!community) {
      return response(res, 404, "No user found");
    }
    return response(
      res,
      200,
      "All User fetched succussfully",
      community.members
    );
  } catch (error) {
    console.error("Unable to fetch community user\n", error);
    return response(res, 500, "Unable to  fetch community user", error);
  }
};

const getAllComunity = async (req, res) => {
  try {
    const comunity = await Community.find();
    if (!comunity) {
      return response(res, 400, "No comunity exist");
    }
    return response(res, 200, "Comunity fetched", comunity);
  } catch (error) {
    console.error("Unable to fetch community \n", error);
    return response(res, 500, "Unable to  fetch community", error);
  }
};

const getCommunityDetailsById = async (req, res) => {
  const { communityId } = req.params;

  if (!communityId) {
    return response(res, 400, "No Community ID Found");
  }

  try {
    // Find community and populate members
    const community = await Community.findById(communityId).lean(); // Convert to plain JS object so we can attach posts

    if (!community) {
      return response(res, 400, "No Community Found");
    }

    // Fetch posts from this specific community only
    const posts = await Post.find({ community: communityId }).sort({
      createdAt: -1,
    }); // Optional: sort latest first

    // Attach posts to the community object
    community.posts = posts;

    return response(res, 200, "Community Details Fetched", community);
  } catch (error) {
    console.error("Unable to fetch community \n", error);
    return response(res, 500, "Unable to fetch community", error);
  }
};

const addCommunityMember = async (req, res) => {
  try {
    const { communityId, targetUserId } = req.body;
    const userId = req.user._id; // person who is adding

    // 1. Check if community exists
    const community = await Community.findById(communityId);
    if (!community) return response(res, 404, "Community not found");

    // 2. Get requester and prevent unauthorized
    const requester = community.members.find(
      (m) => m.user.toString() === userId.toString()
    );
    if (!requester)
      return response(res, 403, "You are not part of this community");

    if (requester.role !== "admin" && requester.role !== "astrologer") {
      return response(res, 403, "Not authorized to add members");
    }

    // 3. Check if target user already in community
    const alreadyMember = community.members.find(
      (m) => m.user.toString() === targetUserId.toString()
    );
    if (alreadyMember) {
      return response(res, 400, "User is already a member");
    }

    // 4. Determine member status based on visibility
    let memberStatus = "approved";
    if (
      community.visibility === "restricted" ||
      community.visibility === "private"
    ) {
      memberStatus = "pending";
    }

    // 5. Add member
    community.members.push({
      user: targetUserId,
      role: "user", // default role
      status: memberStatus,
    });

    await community.save();

    return response(
      res,
      200,
      `User added to community${
        memberStatus === "pending" ? " (awaiting approval)" : ""
      }`
    );
  } catch (error) {
    console.error(error);
    return response(res, 500, "Server Error");
  }
};

module.exports = {
  updateCommunityDetails,
  removeUserFromCommunity,
  joinCommunity,
  getAllComunityUser,
  getAllComunity,
  getCommunityDetailsById,
  addCommunityMember,
};
