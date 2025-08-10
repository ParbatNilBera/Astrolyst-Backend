const express = require("express");
const router = express.Router();
const {
  getChat,
  getConversations,
  sendMessageRest,
  markAsRead,
  getAstrologerChat,
} = require("../controllers/chat.controller");

// Get messages between two users
router.get("/:userId/:astrologerId", getChat);

// Get conversation list for a user (for top-right chat icon)
router.post("/conversations", getConversations);

// REST send (fallback)
router.post("/send", sendMessageRest);

// mark messages as read
router.post("/mark-read", markAsRead);

router.post("/astrologer", getAstrologerChat);

module.exports = router;
