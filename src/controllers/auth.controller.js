const User = require("../models/user.model");
const { response } = require("../utils/responseHandler");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/token");
const AstrologerApplication = require("../models/astrologerApplication.model");

//@desc  Register a new user
//@route POST /api/auth/register
//@access public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    //Check if all fields are entered
    if (!name || !email || !password || !phone) {
      return response(res, 400, "Enter all Required fields");
    }
    //Check if user is already exist
    const userExists = await User.findOne({ email });
    if (userExists) {
      return response(res, 400, "User already exist");
    }

    //Hashpassword
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //Create new user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: "user",
    });

    //Return user data with JWT

    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id),
    };
    return response(res, 201, "User Created Successfully", userData);
  } catch (error) {
    console.error("Server Error, Unable to register user\n", error);
    return response(res, 500, "Unable to register user", error);
  }
};
const getUserProfile = async (req, res) => {
  try {
    const userid = req.user.userId;
    const user = await User.findById(userid);

    if (!user) {
      return response(res, 404, "User not found");
    }

    const userdetails = {
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      wallet: user.wallet,
    };
    return response(res, 200, "User Retrived", userdetails);
  } catch (error) {
    console.error("Error Fetching user Details\n", error);
    return response(res, 500, "Error Fetching User Details", error);
  }
};

const applyAstrologer = async (req, res) => {
  const {
    name,
    email,
    phone,
    gender,
    location,
    expertise,
    experience,
    languages,
    chatPerMin,
    callPerMin,
  } = req.body;
  if (
    !name ||
    !email ||
    !phone ||
    !gender ||
    !location ||
    !expertise ||
    !experience ||
    !languages ||
    !chatPerMin ||
    !callPerMin
  ) {
    return response(res, 400, "Enter required fields");
  }
  try {
    const isUserexist = await User.findOne({ email });
    if (isUserexist) {
      return response(res, 400, "Email Already exist");
    }

    const isExistingApplication = await AstrologerApplication.findOne({
      email,
    });
    if (isExistingApplication) {
      return response(
        res,
        400,
        "You already applied for this role you cannot apply again"
      );
    }
    // Create application
    const application = await AstrologerApplication.create({
      name,
      email,
      phone,
      gender,
      location,
      expertise,
      experience,
      languages,
      chatPerMin,
      callPerMin,
    });

    return response(
      res,
      200,
      "Application submitted successfully!",
      application
    );
  } catch (error) {
    console.error("Error Applying for Astrologer", error);
    return response(res, 500, "Error Applying for Astrologer", error);
  }
};

const registerAdmin = async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password || !phone) {
    return response(res, 400, "Enter all required fields");
  }
  try {
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      return response(res, 400, "Admin already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: "admin",
    });

    const data = {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      role: admin.role,
      token: generateToken(admin._id),
    };

    return response(res, 201, "Admin registered successfully", data);
  } catch (error) {
    console.error("Error Register Admin\n", error);
    return response(res, 500, "Error Register Admin", error);
  }
};

const loginByRole = async (req, res, role) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return response(res, 400, "Enter required fields");
  }

  try {
    const user = await User.findOne({ email });
    if (!user || user.role !== role) {
      return response(res, 404, `${role} not found`);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return response(res, 401, "Invalid credentials");
    const data = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      wallet: user.wallet,
      token: generateToken(user._id),
    };

    return response(res, 200, `${role} login successful`, data);
  } catch (error) {
    console.error(`Error logging in ${role}`, error);
    return response(res, 500, `${role} login failed`, error);
  }
};

module.exports = {
  registerUser,
  getUserProfile,
  applyAstrologer,
  registerAdmin,
  loginByRole,
};
