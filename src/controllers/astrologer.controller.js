const User = require("../models/user.model");
const Booking = require("../models/booking.model");
const Query = require("../models/query.model");
const Community = require("../models/comunity.model");
const { response } = require("../utils/responseHandler");

const editAstrologerProfileController = async (req, res) => {
  try {
    const astrologerId = req.user.userId;

    const { expertise, experience, languages, pricing } = req.body;

    const updatedAstrologer = await User.findByIdAndUpdate(
      astrologerId,
      {
        expertise,
        experience,
        languages,
        pricing,
      },
      { new: true }
    );

    return response(res, 200, "Profile updated", updatedAstrologer);
  } catch (err) {
    return response(res, 500, "Something went wrong", err.message);
  }
};

const manageAvailabilityController = async (req, res) => {
  try {
    const astrologerId = req.user.userId;
    const { availability } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      astrologerId,
      { availability },
      { new: true }
    );

    if (!updatedUser) {
      return response(res, 404, "User not found");
    }

    return response(res, 200, "Availability updated", updatedUser.availability);
  } catch (err) {
    return response(res, 500, "Error updating availability", err.message);
  }
};

const changeAvailabilityController = async (req, res) => {
  try {
    const astrologerId = req.user.userId; // Authenticated astrologer's ID
    const { availability } = req.body;

    // Validate input
    if (!availability || !Array.isArray(availability)) {
      return response(
        res,
        400,
        "Invalid availability format. Expected an array."
      );
    }

    const updatedAstrologer = await User.findByIdAndUpdate(
      astrologerId,
      { availability },
      { new: true }
    );

    if (!updatedAstrologer) {
      return response(res, 404, "Astrologer not found");
    }

    return response(
      res,
      200,
      "Availability updated successfully",
      updatedAstrologer.availability
    );
  } catch (err) {
    return response(res, 500, "Error updating availability", err.message);
  }
};

const viewBookingsController = async (req, res) => {
  try {
    const astrologerId = req.user.userId;

    const bookings = await Booking.find({ astrologer: astrologerId }).populate(
      "user"
    );

    return response(res, 200, "Bookings fetched successfully", bookings);
  } catch (err) {
    return response(res, 500, "Error fetching bookings", err.message);
  }
};

const answerQueryController = async (req, res) => {
  try {
    const astrologerId = req.user.userId;
    const { queryId, answer } = req.body;

    const updatedQuery = await Query.findOneAndUpdate(
      { _id: queryId, astrologer: astrologerId },
      { answer, answeredAt: new Date() },
      { new: true }
    );

    return response(res, 200, "Query answered", updatedQuery);
  } catch (err) {
    return response(res, 500, "Error answering query", err.message);
  }
};

const viewUserQueriesController = async (req, res) => {
  try {
    const userId = req.user.userId; // Get the logged-in user's ID

    // Optional: use query params for filtering answered/unanswered queries
    const { answered } = req.query;

    const filter = { user: userId };

    if (answered === "true") {
      filter.answer = { $ne: null };
    } else if (answered === "false") {
      filter.answer = null;
    }

    const userQueries = await Query.find(filter)
      .populate("astrologer", "name email") // Optional: show astrologer name/email
      .sort({ createdAt: -1 });

    return response(res, 200, "User queries fetched successfully", userQueries);
  } catch (err) {
    return response(res, 500, "Error fetching user queries", err.message);
  }
};

const createCommunity = async (req, res) => {
  try {
    const { name, description, visibility } = req.body;
    const createdBy = req.user.userId;

    if (!name || !description || !visibility) {
      return response(res, 400, "Enter required Field");
    }

    const isNameExist = await Community.findOne({ name });
    if (isNameExist) {
      return response(res, 400, "Already Name exist");
    }

    const community = await Community.create({
      name,
      description,
      visibility,
      createdBy,
      members: [
        {
          user: createdBy,
          role: "astrologer",
          status: "approved",
          isModerator: true,
        },
      ],
    });

    // Also add to User's moderatorOf list
    await User.findByIdAndUpdate(createdBy, {
      $addToSet: { moderatorOf: community._id },
    });

    res.status(201).json({ message: "Community created", community });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating community", error: err.message });
  }
};

const promoteToAdmin = async (req, res) => {
  const { communityId, targetUserId } = req.body;
  const userId = req.user.userId;

  const community = await Community.findById(communityId);

  const creator = community.members.find(
    (m) => m.user.toString() === userId && m.role === "astrologer"
  );
  if (!creator)
    return res.status(403).json({ message: "Only creator can promote" });

  const target = community.members.find(
    (m) => m.user.toString() === targetUserId
  );
  if (!target)
    return res.status(404).json({ message: "User not found in community" });

  target.role = "admin";
  await community.save();

  res.status(200).json({ message: "User promoted to admin" });
};

module.exports = {
  editAstrologerProfileController,
  manageAvailabilityController,
  viewBookingsController,
  answerQueryController,
  viewUserQueriesController,
  createCommunity,
  promoteToAdmin,
  changeAvailabilityController,
};
