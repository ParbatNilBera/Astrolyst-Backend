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
  const userId = req.user?.userId;

  if (!communityId) {
    return response(res, 400, "Community id is undefined");
  }
  if (!userId) {
    return response(res, 400, "Unable to fetch userid");
  }

  try {
    const community = await Community.findById(communityId)
      .populate({
        path: "members.user",
        select: "name email role", // only these fields from User model
      })
      .select("members");

    if (!community) {
      return response(res, 404, "No community found");
    }

    const trimmedMembers = community.members.map((member) => ({
      _id: member._id,
      role: member.role,
      status: member.status,
      isModerator: !!member.isModerator, // ✅ add moderator flag
      user: member.user
        ? {
            _id: member.user._id,
            name: member.user.name,
            email: member.user.email,
            role: member.user.role, // global user role
          }
        : null,
    }));

    return response(res, 200, "All User fetched successfully", trimmedMembers);
  } catch (error) {
    console.error("Unable to fetch community user\n", error);
    return response(res, 500, "Unable to fetch community user", error);
  }
};

const getAllComunity = async (req, res) => {
  try {
    const userId = req.user._id; // assuming your auth middleware sets req.user

    // Fetch communities excluding restricted ones unless user is a member
    const communities = await Community.find({
      $or: [
        { visibility: { $ne: "restricted" } },
        {
          visibility: "restricted",
          members: { $elemMatch: { user: userId } },
        },
      ],
    }).lean(); // lean() so we can easily modify data

    if (!communities || communities.length === 0) {
      return response(res, 400, "No community exists");
    }

    // Add isMember flag
    const result = communities.map((community) => ({
      ...community,
      isMember: community.members.some(
        (m) => m.user.toString() === userId.toString()
      ),
    }));

    return response(res, 200, "Community fetched", result);
  } catch (error) {
    console.error("Unable to fetch community \n", error);
    return response(res, 500, "Unable to fetch community", error);
  }
};

// const getAllComunity = async (req, res) => {
//   try {
//     // Exclude communities where visibility is "restricted"
//     const comunity = await Community.find({
//       visibility: { $ne: "restricted" },
//     });

//     if (!comunity || comunity.length === 0) {
//       return response(res, 400, "No community exists");
//     }

//     return response(res, 200, "Community fetched", comunity);
//   } catch (error) {
//     console.error("Unable to fetch community \n", error);
//     return response(res, 500, "Unable to fetch community", error);
//   }
// };

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

const promoteToModerator = async (req, res) => {
  const { communityId, userId } = req.params;

  try {
    const community = await Community.findById(communityId);
    if (!community) return response(res, 404, "Community not found");

    const member = community.members.find((m) => m.user.toString() === userId);
    if (!member) return response(res, 404, "User not found in community");

    if (member.isModerator)
      return response(res, 400, "User is already a moderator");

    member.isModerator = true;
    await community.save();

    await User.findByIdAndUpdate(userId, {
      $addToSet: { moderatorOf: communityId },
    });

    return response(res, 200, "User promoted to moderator", member);
  } catch (err) {
    console.error(err);
    return response(res, 500, "Failed to promote user", err);
  }
};

const demoteModerator = async (req, res) => {
  const { communityId, userId } = req.params;

  try {
    const community = await Community.findById(communityId);
    if (!community) return response(res, 404, "Community not found");

    const member = community.members.find((m) => m.user.toString() === userId);
    if (!member) return response(res, 404, "User not found in community");

    if (!member.isModerator)
      return response(res, 400, "User is not a moderator");

    member.isModerator = false;
    await community.save();

    await User.findByIdAndUpdate(userId, {
      $pull: { moderatorOf: communityId },
    });

    return response(res, 200, "Moderator demoted to user", member);
  } catch (err) {
    console.error(err);
    return response(res, 500, "Failed to demote moderator", err);
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
  demoteModerator,
  promoteToModerator,
};
