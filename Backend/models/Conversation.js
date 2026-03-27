const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  content: { type: String, maxlength: 2000 },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  messageType: { type: String, enum: ["text", "image", "file"], default: "text" },
  fileUrl: { type: String },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  messages: [messageSchema],
  lastMessage: { type: String },
  lastMessageAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  reportedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  reportReason: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Conversation", conversationSchema);