// src/middleware/errorHandler.js
const { response } = require("../utils/responseHandler");

const errorHandler = (err, req, res, next) => {
  console.error("💥 Error Handler:", err.stack || err.message);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Optional: Detailed error in development only
  const errorDetails = process.env.NODE_ENV === "development" ? err : {};

  return response(res, statusCode, message, errorDetails);
};

module.exports = errorHandler;
