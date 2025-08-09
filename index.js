// const express = require("express");
// const dotenv = require("dotenv");
// const cors = require("cors");
// const dbConfig = require("./src/config/db.config");
// const errorHandler = require("./src/middlewares/error.middleware");
// // Routes
// const authRoutes = require("./src/routes/auth.route");
// const adminRoutes = require("./src/routes/admin.route");
// const astrologerRoutes = require("./src/routes/astrologer.route");
// const comunityRoutes = require("./src/routes/comunity.route");
// const postRoutes = require("./src/routes/post.route");
// const userRoutes = require("./src/routes/user.route");
// const callRoutes = require("./src/routes/call.routes");
// const { RtcTokenBuilder, RtcRole } = require("agora-access-token");

// // Load env variables early
// dotenv.config();

// const app = express();

// // CORS middleware
// app.use(
//   cors({
//     origin: "*",
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );

// // Connect to DB
// dbConfig();

// // Body parser
// app.use(express.json());

// // Test route
// app.get("/", (req, res) => {
//   res.send("Welcome to Astrolyst");
// });

// const APP_ID = process.env.AGORA_APP_ID;
// const APP_CERT = process.env.AGORA_APP_CERT;

// //_____________________________AGORA IMPLEMENTATION
// // GET /rtc-token?channel=room1&uid=123
// app.get("/rtc-token", (req, res) => {
//   const channelName = req.query.channel;
//   const uid = req.query.uid ? Number(req.query.uid) : 0; // 0 lets Agora assign
//   const expireSeconds = 3600; // 1 hour token
//   const currentTs = Math.floor(Date.now() / 1000);
//   const privilegeExpiredTs = currentTs + expireSeconds;

//   // role: PUBLISHER if sending audio, SUBSCRIBER if only listening
//   const role = RtcRole.PUBLISHER;

//   const token = RtcTokenBuilder.buildTokenWithUid(
//     APP_ID,
//     APP_CERT,
//     channelName,
//     uid,
//     role,
//     privilegeExpiredTs
//   );
//   res.json({ rtcToken: token });
// });
// // _____________________________________;
// // Mount routes
// app.use("/api/auth", authRoutes);
// app.use("/api/admin", adminRoutes);
// app.use("/api/astrologer", astrologerRoutes);
// app.use("/api/comunity", comunityRoutes);
// app.use("/api/post", postRoutes);
// app.use("/api/user", userRoutes);
// app.use("/api/call", callRoutes);

// //404 handler — only after all routes
// app.use((req, res, next) => {
//   const error = new Error(`Not Found - ${req.originalUrl}`);
//   error.statusCode = 404;
//   next(error);
// });

// app.use(errorHandler);

// const PORT = process.env.PORT || 6000;
// app.listen(PORT, "0.0.0.0", () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// // // Start server
// // app.listen(PORT, () => {
// //   console.log(`Server started on http://localhost:${PORT}`);
// // });

// index.js (full file)
const express = require("express");
const http = require("http");
const dotenv = require("dotenv");
const cors = require("cors");
const dbConfig = require("./src/config/db.config");
const errorHandler = require("./src/middlewares/error.middleware");
// Routes
const authRoutes = require("./src/routes/auth.route");
const adminRoutes = require("./src/routes/admin.route");
const astrologerRoutes = require("./src/routes/astrologer.route");
const comunityRoutes = require("./src/routes/comunity.route");
const postRoutes = require("./src/routes/post.route");
const userRoutes = require("./src/routes/user.route");
const callRoutes = require("./src/routes/call.routes");
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
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

// in-memory map userId -> socketId
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // register socket with userId
  socket.on("register", (userId) => {
    if (userId) {
      onlineUsers.set(String(userId), socket.id);
      console.log("Registered", userId, "->", socket.id);
    }
  });

  socket.on("disconnect", () => {
    // remove user mapping when socket disconnects
    for (const [userId, sockId] of onlineUsers.entries()) {
      if (sockId === socket.id) {
        onlineUsers.delete(userId);
        console.log("Socket disconnected, removed", userId);
        break;
      }
    }
  });
});

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
