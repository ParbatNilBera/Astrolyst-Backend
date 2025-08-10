const express = require("express");
const {
  callAstrologer,
  getAstrologerCalls,
  acceptCall,
  disableAstrologer,
  enableAstrologer,
  getActiveAstrologers,
} = require("../controllers/call.controller.js");

const { protect } = require("../middlewares/auth.middleware.js");

const router = express.Router();

router.post("/call", protect, callAstrologer);
router.get("/calls", protect, getAstrologerCalls);
router.put("/accept/:callId", protect, acceptCall);
router.put("/disable", protect, disableAstrologer);
router.put("/enable", protect, enableAstrologer);
router.get("/get-active-astrologers", getActiveAstrologers);
module.exports = router;
