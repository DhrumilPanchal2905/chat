const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");

// MongoDB Connection
const connectToDatabase = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/chat-app",
      {
        dbName: "NewChatAppDB", // New DB name
      }
    );
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
  }
};
connectToDatabase(); // Initialize DB connection

// Define MongoDB Message Schema
const messageSchema = new mongoose.Schema({
  sender: String,
  content: String,
  fileUrl: String,
  fileName: String,
  fileType: String,
  timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model("ChatMessages", messageSchema); // New Collection Name

// Express App Setup
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://chat-frontend-dun-seven.vercel.app/"],
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// Ensure 'uploads' folder exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// File Upload Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${uuidv4()}${path.extname(
      file.originalname
    )}`;
    cb(null, uniqueSuffix);
  },
});

const upload = multer({ storage });

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// File Upload Endpoint - Directly Save to DB
app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const fileUrl = `http://localhost:3001/uploads/${req.file.filename}`;
  const newFileMessage = new Message({
    sender: req.body.sender || "Anonymous",
    content: req.body.content || "",
    fileUrl: fileUrl,
    fileName: req.file.originalname,
    fileType: req.file.mimetype,
  });

  try {
    const savedFile = await newFileMessage.save();
    io.emit("new-message", savedFile); // Notify clients
    res.json({ success: true, message: savedFile });
  } catch (error) {
    console.error("❌ Error saving file message:", error);
    res.status(500).json({ error: "File saving failed" });
  }
});

// Socket.io Connections
io.on("connection", async (socket) => {
  console.log("🟢 User connected:", socket.id);

  // Send previous messages from MongoDB
  try {
    const previousMessages = await Message.find().sort({ timestamp: 1 });
    socket.emit("previous-messages", previousMessages);
  } catch (error) {
    console.error("❌ Error fetching messages from DB:", error);
  }

  // Handle new message
  socket.on("send-message", async (msg) => {
    try {
      const newMessage = new Message({
        sender: msg.sender,
        content: msg.content,
        fileUrl: msg.fileUrl || "",
        fileName: msg.fileName || "",
        fileType: msg.fileType || "",
      });
      await newMessage.save(); // Save message to MongoDB
      io.emit("new-message", newMessage); // Broadcast to all clients
    } catch (error) {
      console.error("❌ Error saving message:", error);
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});

// Start Server
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
