const express = require("express");
const router = express.Router();

const {
  getAstrologerApplications,
  approveApplication,
  rejectApplication,
} = require("../controllers/admin.controller");

router.get("/get-applications", getAstrologerApplications);
router.put("/approve-astrologer", approveApplication);
router.put("/reject-astrologer", rejectApplication);

module.exports = router;
