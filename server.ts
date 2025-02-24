import { Server } from "socket.io";
import mongoose from "mongoose";
import http from "http";
import dotenv from "dotenv";

dotenv.config();

const connectToDatabase = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/chat-app",
      {
        dbName: "ChatAppDB",
      }
    );
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
  }
};

connectToDatabase();

const MessageSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    sender: { type: String, required: true },
    role: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { collection: "ChatMessages" }
);

const Message =
  mongoose.models.Message || mongoose.model("Message", MessageSchema);

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  const { username, role } = socket.handshake.query;
  console.log(`🔗 ${username} (${role}) connected`);

  socket.on("load-messages", async () => {
    try {
      const messages = await Message.find().sort({ timestamp: -1 }).limit(50);
      socket.emit("previous-messages", messages.reverse());
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  });

  socket.on("send-message", async (messageData) => {
    try {
      const message = new Message({
        content: messageData.content,
        sender: messageData.sender,
        role: messageData.role,
      });
      await message.save();
      io.emit("new-message", message);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log(`🔌 ${username} disconnected`);
  });
});

server.listen(3001, () => {
  console.log("🚀 Server running on port 3001");
});
// import { Server } from "socket.io";
// import mongoose from "mongoose";
// import http from "http";
// import jwt from "jsonwebtoken";
// import dotenv from "dotenv";

// dotenv.config();

// // MongoDB connection
// mongoose.connect(
//   process.env.MONGODB_URI || "mongodb://localhost:27017/chat-app"
// );

// // User Schema
// const UserSchema = new mongoose.Schema({
//   username: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
// });

// const User = mongoose.models.User || mongoose.model("User", UserSchema);

// // Message Schema
// const MessageSchema = new mongoose.Schema({
//   content: { type: String, required: true },
//   sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   receiver: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true,
//   },
//   timestamp: { type: Date, default: Date.now },
// });

// const Message =
//   mongoose.models.Message || mongoose.model("Message", MessageSchema);

// // Server setup
// const server = http.createServer();
// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:3000",
//     methods: ["GET", "POST"],
//     credentials: true,
//   },
// });

// // Store online users
// const onlineUsers = new Map();

// // Authentication middleware
// io.use(async (socket, next) => {
//   const token = socket.handshake.auth.token;
//   if (!token) {
//     return next(new Error("Authentication error"));
//   }

//   const decoded = jwt.verify(token, process.env.JWT_SECRET!);
//   if (typeof decoded === "object" && "userId" in decoded) {
//     socket.data.userId = (decoded as { userId: string }).userId;
//     next();
//   } else {
//     next(new Error("Invalid token payload"));
//   }
// });

// io.on("connection", async (socket) => {
//   const userId = socket.data.userId;
//   onlineUsers.set(userId, socket.id);

//   // Notify others that user is online
//   socket.broadcast.emit("user-connected", userId);

//   // Handle get users request
//   socket.on("get-users", async () => {
//     const users = await User.find({}, { password: 0 });
//     const usersWithStatus = users.map((user) => ({
//       ...user.toJSON(),
//       isOnline: onlineUsers.has(user._id.toString()),
//     }));
//     socket.emit("users-list", usersWithStatus);
//   });

//   // Handle load messages
//   socket.on("load-messages", async ({ userId }) => {
//     const messages = await Message.find({
//       $or: [{ sender: userId }, { receiver: userId }],
//     })
//       .sort({ timestamp: -1 })
//       .limit(50);
//     socket.emit("previous-messages", messages);
//   });

//   // Handle private messages
//   socket.on("send-private-message", async (messageData) => {
//     try {
//       const message = new Message({
//         content: messageData.content,
//         sender: messageData.sender,
//         receiver: messageData.receiver,
//       });
//       await message.save();

//       // Send to receiver if online
//       const receiverSocketId = onlineUsers.get(messageData.receiver);
//       if (receiverSocketId) {
//         io.to(receiverSocketId).emit("private-message", message);
//       }

//       // Send back to sender
//       socket.emit("private-message", message);
//     } catch (error) {
//       console.error("Error sending message:", error);
//     }
//   });

//   socket.on("disconnect", () => {
//     onlineUsers.delete(userId);
//     io.emit("user-disconnected", userId);
//   });
// });

// // Authentication endpoints
// server.listen(3001, () => {
//   console.log("🚀 Server running on port 3001");
// });
