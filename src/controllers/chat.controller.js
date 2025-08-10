// src/controllers/chat.controller.js
const mongoose = require("mongoose");
const Message = require("../models/message.model");

// GET messages between two users (old -> new)
const getChat = async (req, res) => {
  try {
    const { userId, astrologerId } = req.params;
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: astrologerId },
        { sender: astrologerId, receiver: userId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender", "name role")
      .populate("receiver", "name role");

    return res.json(messages);
  } catch (error) {
    console.error("getChat error:", error);
    return res.status(500).json({ error: "Error fetching messages" });
  }
};

// Get conversation list (last message per other user)
const getConversations = async (req, res) => {
  try {
    const { userId } = req.body; // or req.params.userId
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const conv = await Message.aggregate([
      {
        $match: { $or: [{ sender: userObjectId }, { receiver: userObjectId }] },
      },
      {
        $project: {
          otherUser: {
            $cond: [{ $eq: ["$sender", userObjectId] }, "$receiver", "$sender"],
          },
          text: 1,
          createdAt: 1,
          sender: 1,
          receiver: 1,
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$otherUser",
          lastMessage: { $first: "$$ROOT" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          otherUserId: "$_id",
          user: { _id: "$user._id", name: "$user.name", role: "$user.role" },
          lastMessage: 1,
        },
      },
      { $sort: { "lastMessage.createdAt": -1 } },
    ]);

    return res.json(conv);
  } catch (err) {
    console.error("getConversations error:", err);
    return res.status(500).json({ error: "Error fetching conversations" });
  }
};

// REST fallback to send message (saves + emits if receiver online)
const sendMessageRest = async (req, res) => {
  try {
    const { senderId, receiverId, text } = req.body;
    if (!senderId || !receiverId || !text)
      return res.status(400).json({ error: "Missing fields" });

    const msg = await Message.create({
      sender: senderId,
      receiver: receiverId,
      text,
    });

    // populate before emitting / returning
    const populated = await Message.findById(msg._id)
      .populate("sender", "name")
      .populate("receiver", "name");

    // emit via socket.io if available
    const io = req.app.get("io");
    const onlineUsers = req.app.get("onlineUsers");
    const receiverSocket = onlineUsers.get(String(receiverId));
    if (receiverSocket && io) {
      io.to(receiverSocket).emit("receive_message", populated);
    }

    return res.json(populated);
  } catch (err) {
    console.error("sendMessageRest error:", err);
    return res.status(500).json({ error: "Error sending message" });
  }
};

// Mark messages from otherUser -> user as seen
const markAsRead = async (req, res) => {
  try {
    const { userId, otherUserId } = req.body; // or from req.user if you use auth middleware
    await Message.updateMany(
      { sender: otherUserId, receiver: userId, seen: false },
      { $set: { seen: true } }
    );
    return res.json({ ok: true });
  } catch (err) {
    console.error("markAsRead error:", err);
    return res.status(500).json({ error: "Error marking as read" });
  }
};

const getAstrologerChat = async (req, res) => {
  const { astrologerId } = req.body;

  try {
    // Make sure it's a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(astrologerId)) {
      return res.status(400).json({ error: "Invalid astrologer ID" });
    }
    const chats = await Message.aggregate([
      {
        $match: {
          receiver: new mongoose.Types.ObjectId(astrologerId), // ✅ Correct way
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$sender",
          user: { $first: "$sender" },
          lastMessage: { $first: "$text" }, // ✅ Use correct field name
          lastUpdated: { $first: "$createdAt" },
        },
      },
    ]);
    res.json(chats);
  } catch (err) {
    console.error("getChat error:", err);
    res.status(500).json({ error: "Error fetching messages" });
  }
};

module.exports = {
  getChat,
  getConversations,
  sendMessageRest,
  markAsRead,
  getAstrologerChat,
};
