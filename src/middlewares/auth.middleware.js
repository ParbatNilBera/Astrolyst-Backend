const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const { response } = require("../utils/responseHandler");

// Middleware to Protect Routes
const protect = async (req, res, next) => {
  try {
    let token = req.headers.authorization;

    if (token && token.startsWith("Bearer")) {
      token = token.split(" ")[1]; // Extract token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        return response(res, 404, "User not found");
      }

      // Attach full user and also set userId directly
      req.user = {
        ...user.toObject(), // Convert Mongoose doc to plain object
        userId: user._id.toString(),
      };

      next();
    } else {
      return response(res, 401, "Not Authorized, no token");
    }
  } catch (error) {
    console.error("Token Failed\n", error);
    return response(res, 401, "Token Failed", error.message);
  }
};

module.exports = { protect };
