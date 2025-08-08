const AstrologerApplication = require("../models/astrologerApplication.model");
const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const {
  sendAstrologerApprovalMail,
  sendAstrologerRejectionMail,
} = require("../services/mail/mail.service");
const { response } = require("../utils/responseHandler");
const getAstrologerApplications = async (req, res) => {
  try {
    const astrologerApplications = await AstrologerApplication.find({
      status: "pending",
    });
    if (!astrologerApplications || astrologerApplications.length === 0) {
      return response(res, 400, "No Application Found ");
    }
    return response(
      res,
      200,
      "Astrologer Applications fetched successsfully",
      astrologerApplications
    );
  } catch (error) {
    console.error("Error getting Astrologer Applications\n", error);
    return response(res, 500, "Error getting Astrologer Applications", error);
  }
};

const approveApplication = async (req, res) => {
  const { email, password } = req.body;

  let userPassword = `Data@1234567890`;
  if (password) {
    userPassword = password;
  }

  if (!email) {
    return response(res, 400, "Email is required");
  }

  try {
    const astrologer = await AstrologerApplication.findOne({ email });

    if (!astrologer) {
      return response(res, 404, "No application found for this email");
    }

    astrologer.status = "approved";
    const hashedPassword = await bcrypt.hash(userPassword, 10);
    await sendAstrologerApprovalMail(email, astrologer.name, userPassword);

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    console.log(existingUser);
    if (existingUser) {
      return response(res, 400, "User with this email already exists");
    }

    // Create new user from application
    const newUser = new User({
      name: astrologer.name,
      email: astrologer.email,
      phone: astrologer.phone,
      gender: astrologer.gender,
      location: astrologer.location,
      password: hashedPassword,
      role: "astrologer",
      isApproved: true,
      astrologerProfile: {
        expertise: astrologer.expertise,
        experience: astrologer.experience,
        languages: astrologer.languages,
        chatPerMin: astrologer.chatPerMin,
        callPerMin: astrologer.callPerMin,
      },
    });

    await newUser.save();
    await astrologer.save();
    // Optional: Delete the application or mark as approved
    await AstrologerApplication.findByIdAndDelete(astrologer._id);

    return response(res, 201, "Astrologer approved and user created", newUser);
  } catch (error) {
    console.error("Error approving astrologer application:\n", error);
    return response(
      res,
      500,
      "Server error while approving application",
      error
    );
  }
};

const rejectApplication = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return response(res, 400, "Email is required");
  }
  try {
    const astrologer = await AstrologerApplication.findOne({ email });

    if (!astrologer) {
      return response(res, 404, "No application found for this email");
    }
    astrologer.status = "rejected";
    sendAstrologerRejectionMail(email, astrologer.name);
    await astrologer.save();
    return response(res, 200, `${astrologer.name} is not approved`);
  } catch (error) {
    console.error("Error Rejecting astrologer application:\n", error);
    return response(
      res,
      500,
      "Server error while rejecting application",
      error
    );
  }
};

module.exports = {
  getAstrologerApplications,
  approveApplication,
  rejectApplication,
};
