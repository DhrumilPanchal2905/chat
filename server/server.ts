import { Server } from "socket.io";
import mongoose from "mongoose";
import http from "http";
import dotenv from "dotenv";

dotenv.config();

// 🔗 MongoDB connection
const connectToDatabase = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/chat-app",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: "Dhrumil_Portfolio",
      }
    );
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
  }
};

connectToDatabase();

// 📝 Message Schema
const MessageSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    sender: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { collection: "ChatMessages" }
);

const Message =
  mongoose.models.Message || mongoose.model("Message", MessageSchema);

// 🔌 Start HTTP server
const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// ⚡ Socket.io Events
io.on("connection", (socket) => {
  console.log("🔗 A user connected");

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
      });

      await message.save();
      io.emit("new-message", message);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("🔌 User disconnected");
  });
});

// 🚀 Run server on port 3001
server.listen(3001, () => {
  console.log("🚀 Socket.io server running on port 3001");
});
