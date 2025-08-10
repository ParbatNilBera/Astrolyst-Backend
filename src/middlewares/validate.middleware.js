const { check, validationResult } = require("express-validator");
const { response } = require("../utils/responseHandler");

const registerUserValidate = [
  //Name Validation
  check("name")
    .trim()
    //For Empty Check
    .notEmpty()
    .withMessage("Name is Required")
    //Name Must be string
    .isString()
    .withMessage("Name Must be Valid String")
    //minimum length 3
    .isLength({ min: 3 })
    .withMessage("Name must be atleast 3 Charecter long")
    //Maximum Length 25
    .isLength({ max: 25 })
    .withMessage("Name must be atmost 25 charecter long")
    //Name must not contain any number or special charecter
    .matches(/^[A-Za-z\s]+$/)
    .withMessage("Name must not contain numbers or special characters"),

  //Email Validation
  check("email")
    .trim()
    .isEmail()
    .withMessage("Invalid Gmail Address")
    .matches(/@gmail\.com$/)
    .withMessage("Only Gmail addresses are allowed"),
  check("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .isLength({ max: 25 })
    .withMessage("Password must be at most 25 characters long")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number")
    .matches(/[^A-Za-z0-9]/)
    .withMessage("Password must contain at least one special character"),
  // Phone Number Validation
  check("phone")
    .trim()
    .isLength({ min: 10, max: 10 })
    .withMessage("Phone number must be exactly 10 digits")
    .matches(/^[0-9]{10}$/)
    .withMessage("Phone number must contain only digits 0-9")
    .custom((value) => {
      if (/^(\d)\1{9}$/.test(value)) {
        throw new Error("Phone number cannot have all digits the same");
      }
      return true;
    }),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return response(res, 400, "Registration Error", errors.array());
    }
    next();
  },
];

const loginUserValidate = [
  // Email Validation
  check("email")
    .trim()
    .isEmail()
    .withMessage("Invalid Gmail Address")
    .matches(/@gmail\.com$/)
    .withMessage("Only Gmail addresses are allowed"),

  // Password must not be empty
  check("password").trim().notEmpty().withMessage("Password is required"),

  // Final Error Handler
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return response(res, 400, "Login Error", errors.array());
    }
    next();
  },
];

module.exports = { registerUserValidate, loginUserValidate };
