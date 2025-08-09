// index.js (full file)
const express = require("express");
const http = require("http");
const dotenv = require("dotenv");
const cors = require("cors");
const dbConfig = require("./src/config/db.config");
const Message = require("./src/models/message.model");
const errorHandler = require("./src/middlewares/error.middleware");
// Routes
const authRoutes = require("./src/routes/auth.route");
const adminRoutes = require("./src/routes/admin.route");
const astrologerRoutes = require("./src/routes/astrologer.route");
const comunityRoutes = require("./src/routes/comunity.route");
const postRoutes = require("./src/routes/post.route");
const userRoutes = require("./src/routes/user.route");
const callRoutes = require("./src/routes/call.routes");
const chatRoutes = require("./src/routes/chat.routes");
const { RtcTokenBuilder, RtcRole } = require("agora-access-token");

dotenv.config();
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 6000;

// Simple CORS for express
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
dbConfig();

app.get("/", (req, res) => res.send("Welcome to Astrolyst"));

// --- Socket.IO setup ---
const { Server } = require("socket.io");
// in-memory map userId -> socketId
const onlineUsers = new Map();

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  socket.on("register", (userId) => {
    if (!userId) return;

    // Store socketId in a set for this user
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    // Join a room with the user's ID (so we can use io.to(userId))
    socket.join(userId);
    console.log(`👤 User ${userId} registered with socket ${socket.id}`);
  });

  socket.on("send_message", async (payload, ack) => {
    const { senderId, receiverId, text } = payload || {};
    if (!senderId || !receiverId || !text) {
      if (typeof ack === "function")
        ack({ status: "error", message: "Missing fields" });
      return;
    }

    try {
      const msg = await Message.create({
        sender: senderId,
        receiver: receiverId,
        text,
      });

      const populated = await Message.findById(msg._id)
        .populate("sender", "name")
        .populate("receiver", "name");

      // Send to sender (confirmation)
      io.to(senderId).emit("message_sent", populated);

      // Send to receiver (if online)
      io.to(receiverId).emit("receive_message", populated);

      if (typeof ack === "function") {
        ack({ status: "ok", message: populated });
      }
    } catch (err) {
      console.error("❌ socket send_message error:", err);
      if (typeof ack === "function") {
        ack({ status: "error", message: "Server error" });
      }
    }
  });

  socket.on("disconnect", () => {
    // Remove this socket from any user mapping
    for (const [userId, sockets] of onlineUsers.entries()) {
      if (sockets.has(socket.id)) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          onlineUsers.delete(userId);
        }
        console.log(`🔴 Socket ${socket.id} removed from user ${userId}`);
        break;
      }
    }
  });
});

app.set("io", io);
app.set("onlineUsers", onlineUsers);

// expose io & onlineUsers to controllers via app
app.set("io", io);
app.set("onlineUsers", onlineUsers);

// Agora token route (unchanged)
const APP_ID = process.env.AGORA_APP_ID;
const APP_CERT = process.env.AGORA_APP_CERT;

app.get("/rtc-token", (req, res) => {
  const channelName = req.query.channel;
  const uid = req.query.uid ? Number(req.query.uid) : 0;
  const expireSeconds = 3600;
  const currentTs = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTs + expireSeconds;
  const role = RtcRole.PUBLISHER;

  try {
    const token = RtcTokenBuilder.buildTokenWithUid(
      APP_ID,
      APP_CERT,
      channelName,
      uid,
      role,
      privilegeExpiredTs
    );
    res.json({ rtcToken: token });
  } catch (err) {
    console.error("RTC token error:", err);
    res.status(500).json({ error: "token error" });
  }
});

// mount routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/astrologer", astrologerRoutes);
app.use("/api/comunity", comunityRoutes);
app.use("/api/post", postRoutes);
app.use("/api/user", userRoutes);
app.use("/api/call", callRoutes);
app.use("/api/chat", chatRoutes);

// 404 & error handler
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});
app.use(errorHandler);

// start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
