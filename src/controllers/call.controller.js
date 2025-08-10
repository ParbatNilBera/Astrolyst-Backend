// const CallRequest = require("../models/callRequest.model.js");
// const User = require("../models/user.model.js");
// const { response } = require("../utils/responseHandler.js");

// /**
//  * 1. User requests a call with an astrologer
//  */
// const callAstrologer = async (req, res) => {
//   try {
//     const { astrologerId } = req.body;
//     const userId = req.user._id;

//     // Ensure only normal users can request calls
//     if (req.user.role !== "user") {
//       return res.status(403).json({ message: "Only users can request calls" });
//     }

//     // Check astrologer existence
//     const astrologer = await User.findById(astrologerId);
//     if (!astrologer || astrologer.role !== "astrologer") {
//       return res.status(404).json({ message: "Astrologer not found" });
//     }

//     // Check astrologer availability
//     if (!astrologer.isAvailableForCall) {
//       return res
//         .status(400)
//         .json({ message: "Astrologer is not available for calls" });
//     }

//     // Prevent duplicate pending calls
//     const existingPending = await CallRequest.findOne({
//       astrologer: astrologerId,
//       user: userId,
//       status: "pending",
//     });
//     if (existingPending) {
//       return res.status(400).json({
//         message: "You already have a pending call with this astrologer",
//       });
//     }

//     // Create call request
//     const newCall = await CallRequest.create({
//       astrologer: astrologerId,
//       user: userId,
//     });

//     return res
//       .status(201)
//       .json({ message: "Call request created", call: newCall });
//   } catch (error) {
//     console.error("Error in callAstrologer:", error);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

// /**
//  * 2. Astrologer fetches their pending calls
//  */
// const getAstrologerCalls = async (req, res) => {
//   try {
//     if (req.user.role !== "astrologer") {
//       return res
//         .status(403)
//         .json({ message: "Only astrologers can view pending calls" });
//     }

//     const astrologerId = req.user._id;
//     const calls = await CallRequest.find({
//       astrologer: astrologerId,
//       status: "pending",
//     }).populate("user", "name email phone");

//     return res.status(200).json(calls);
//   } catch (error) {
//     console.error("Error in getAstrologerCalls:", error);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

// /**
//  * 3. Astrologer accepts the call
//  */
// const acceptCall = async (req, res) => {
//   try {
//     if (req.user.role !== "astrologer") {
//       return res
//         .status(403)
//         .json({ message: "Only astrologers can accept calls" });
//     }

//     const { callId } = req.params;
//     const astrologerId = req.user._id;

//     const call = await CallRequest.findOne({
//       _id: callId,
//       astrologer: astrologerId,
//       status: "pending",
//     }).populate("user", "name email phone");

//     if (!call) {
//       return res
//         .status(404)
//         .json({ message: "Call request not found or already processed" });
//     }

//     call.status = "accepted";
//     call.acceptedAt = Date.now();
//     await call.save();

//     // Auto-disable astrologer to prevent multiple calls
//     await User.findByIdAndUpdate(astrologerId, { isAvailableForCall: false });

//     return res.status(200).json({ message: "Call accepted", call });
//   } catch (error) {
//     console.error("Error in acceptCall:", error);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

// /**
//  * 4. Astrologer disables availability manually
//  */
// const disableAstrologer = async (req, res) => {
//   try {
//     if (req.user.role !== "astrologer") {
//       return res
//         .status(403)
//         .json({ message: "Only astrologers can change availability" });
//     }

//     await User.findByIdAndUpdate(req.user._id, { isAvailableForCall: false });

//     return res
//       .status(200)
//       .json({ message: "Astrologer availability disabled" });
//   } catch (error) {
//     console.error("Error in disableAstrologer:", error);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

// const enableAstrologer = async (req, res) => {
//   try {
//     if (req.user.role !== "astrologer") {
//       return res
//         .status(403)
//         .json({ message: "Only astrologers can change availability" });
//     }

//     await User.findByIdAndUpdate(req.user._id, { isAvailableForCall: true });

//     return res.status(200).json({ message: "Astrologer availability Enabled" });
//   } catch (error) {
//     console.error("Error in enableAstrologer:", error);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

// const getActiveAstrologers = async (req, res) => {
//   try {
//     const activeAstrologer = await User.find({ isAvailableForCall: true });
//     if (!activeAstrologer) {
//       return response(res, 200, "No Astrologer is Online ");
//     }
//     return response(res, 200, "Astrologer Fetched ", activeAstrologer);
//   } catch (error) {
//     console.error("Error in enableAstrologer:", error);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

// module.exports = {
//   callAstrologer,
//   getAstrologerCalls,
//   acceptCall,
//   disableAstrologer,
//   enableAstrologer,
//   getActiveAstrologers,
// };

// controllers/call.controller.js
const CallRequest = require("../models/callRequest.model.js");
const User = require("../models/user.model.js");
const { response } = require("../utils/responseHandler.js");
// 1. User applies for call
const callAstrologer = async (req, res) => {
  try {
    const { astrologerId } = req.body;
    const userId = req.user._id;

    if (req.user.role !== "user")
      return res.status(403).json({ message: "Only users can request calls" });

    const astrologer = await User.findById(astrologerId);
    if (!astrologer || astrologer.role !== "astrologer")
      return res.status(404).json({ message: "Astrologer not found" });

    if (!astrologer.isAvailableForCall)
      return res.status(400).json({ message: "Astrologer not available" });

    const existingPending = await CallRequest.findOne({
      astrologer: astrologerId,
      user: userId,
      status: "pending",
    });
    if (existingPending)
      return res.status(400).json({
        message: "You already have a pending call with this astrologer",
      });

    // create call
    const newCall = await CallRequest.create({
      astrologer: astrologerId,
      user: userId,
    });

    // generate channelName and save
    newCall.channelName = `call_${newCall._id}`;
    await newCall.save();

    // notify astrologer via socket (if online)
    const io = req.app.get("io");
    const onlineUsers = req.app.get("onlineUsers");
    const calleeSocketId = onlineUsers.get(String(astrologerId));
    if (calleeSocketId) {
      io.to(calleeSocketId).emit("incoming_call", {
        callId: newCall._id,
        user: req.user,
        channelName: newCall.channelName,
      });
    }

    return res
      .status(201)
      .json({ message: "Call request created", call: newCall });
  } catch (error) {
    console.error("callAstrologer error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// 2. Astrologer fetches their pending calls
const getAstrologerCalls = async (req, res) => {
  try {
    if (req.user.role !== "astrologer")
      return res
        .status(403)
        .json({ message: "Only astrologers can view calls" });

    const astrologerId = req.user._id;
    const calls = await CallRequest.find({
      astrologer: astrologerId,
      status: "pending",
    }).populate("user", "name email phone");

    return res.status(200).json(calls);
  } catch (error) {
    console.error("getAstrologerCalls error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// 3. Astrologer accepts the call
const acceptCall = async (req, res) => {
  try {
    if (req.user.role !== "astrologer")
      return res
        .status(403)
        .json({ message: "Only astrologers can accept calls" });

    const { callId } = req.params;
    const astrologerId = req.user._id;

    const call = await CallRequest.findOne({
      _id: callId,
      astrologer: astrologerId,
      status: "pending",
    }).populate("user", "name email phone");

    if (!call)
      return res
        .status(404)
        .json({ message: "Call request not found or already processed" });

    call.status = "accepted";
    call.acceptedAt = Date.now();
    await call.save();

    // auto-disable astrologer
    await User.findByIdAndUpdate(astrologerId, { isAvailableForCall: false });

    // notify the caller via socket
    const io = req.app.get("io");
    const onlineUsers = req.app.get("onlineUsers");
    const callerSocketId = onlineUsers.get(String(call.user._id));
    // if (callerSocketId) {
    //   io.to(callerSocketId).emit("call_accepted", {
    //     callId: call._id,
    //     channelName: call.channelName,
    //     astrologer: {
    //       id: astrologerId,
    //       name: req.user.name,
    //     },
    //   });
    // }

    const callerSocketIds = onlineUsers.get(String(call.user._id)); // This is a Set

    if (callerSocketIds && callerSocketIds.size > 0) {
      for (const socketId of callerSocketIds) {
        io.to(socketId).emit("call_accepted", {
          callId: call._id,
          channelName: call.channelName,
          astrologer: {
            id: astrologerId,
            name: req.user.name,
          },
        });
      }
    }

    // also respond to astrologer with channelName so astrologer can navigate immediately
    return res.status(200).json({ message: "Call accepted", call });
  } catch (error) {
    console.error("acceptCall error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// 4. Disable astrologer availability
const disableAstrologer = async (req, res) => {
  try {
    if (req.user.role !== "astrologer")
      return res
        .status(403)
        .json({ message: "Only astrologers can change availability" });

    await User.findByIdAndUpdate(req.user._id, { isAvailableForCall: false });
    return res.status(200).json({ message: "Availability disabled" });
  } catch (error) {
    console.error("disableAstrologer error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const enableAstrologer = async (req, res) => {
  try {
    if (req.user.role !== "astrologer") {
      return res
        .status(403)
        .json({ message: "Only astrologers can change availability" });
    }

    await User.findByIdAndUpdate(req.user._id, { isAvailableForCall: true });

    return res.status(200).json({ message: "Astrologer availability Enabled" });
  } catch (error) {
    console.error("Error in enableAstrologer:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const getActiveAstrologers = async (req, res) => {
  try {
    const activeAstrologer = await User.find({ isAvailableForCall: true });
    if (!activeAstrologer) {
      return response(res, 200, "No Astrologer is Online ");
    }
    return response(res, 200, "Astrologer Fetched ", activeAstrologer);
  } catch (error) {
    console.error("Error in enableAstrologer:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  callAstrologer,
  getAstrologerCalls,
  acceptCall,
  disableAstrologer,
  enableAstrologer,
  getActiveAstrologers,
};
