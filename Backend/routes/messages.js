const express = require("express");
const router = express.Router();
const Conversation = require("../models/Conversation");
const Product = require("../models/Product");
const { protect } = require("../middleware/auth");

// @GET /api/messages — get all conversations for user
router.get("/", protect, async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .populate("participants", "name profilePicture")
      .populate("product", "title images price status")
      .sort({ lastMessageAt: -1 });
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: "Error fetching conversations." });
  }
});

// @POST /api/messages/start — start or get conversation
router.post("/start", protect, async (req, res) => {
  try {
    const { productId, sellerId } = req.body;
    if (req.user._id.toString() === sellerId) {
      return res.status(400).json({ message: "You cannot message yourself." });
    }
    let conversation = await Conversation.findOne({
      product: productId,
      participants: { $all: [req.user._id, sellerId] },
    });
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, sellerId],
        product: productId,
        messages: [],
      });
    }
    await conversation.populate("participants", "name profilePicture");
    await conversation.populate("product", "title images price status");
    res.json(conversation);
  } catch (err) {
    res.status(500).json({ message: "Error starting conversation." });
  }
});

// @GET /api/messages/:conversationId
router.get("/:conversationId", protect, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId)
      .populate("participants", "name profilePicture")
      .populate("product", "title images price status");
    if (!conversation) return res.status(404).json({ message: "Conversation not found." });
    if (!conversation.participants.some(p => p._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: "Not authorized." });
    }
    // Mark messages as read
    conversation.messages.forEach(msg => {
      if (!msg.readBy.includes(req.user._id)) msg.readBy.push(req.user._id);
    });
    await conversation.save();
    res.json(conversation);
  } catch (err) {
    res.status(500).json({ message: "Error fetching messages." });
  }
});

// @POST /api/messages/:conversationId — send message
router.post("/:conversationId", protect, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) return res.status(404).json({ message: "Conversation not found." });
    if (!conversation.isActive) return res.status(400).json({ message: "This conversation is closed." });
    if (!conversation.participants.some(p => p.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: "Not authorized." });
    }
    const newMessage = {
      content: req.body.content,
      sender: req.user._id,
      messageType: req.body.messageType || "text",
      fileUrl: req.body.fileUrl,
      readBy: [req.user._id],
    };
    conversation.messages.push(newMessage);
    conversation.lastMessage = req.body.content?.slice(0, 50);
    conversation.lastMessageAt = new Date();
    await conversation.save();
    res.status(201).json(conversation.messages[conversation.messages.length - 1]);
  } catch (err) {
    res.status(500).json({ message: "Error sending message." });
  }
});

// @POST /api/messages/:conversationId/report
router.post("/:conversationId/report", protect, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) return res.status(404).json({ message: "Conversation not found." });
    if (!conversation.reportedBy.includes(req.user._id)) {
      conversation.reportedBy.push(req.user._id);
      conversation.reportReason = req.body.reason;
      await conversation.save();
    }
    res.json({ message: "Conversation reported." });
  } catch (err) {
    res.status(500).json({ message: "Error reporting." });
  }
});

// @GET /api/messages/unread/count
router.get("/unread/count", protect, async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id });
    let count = 0;
    conversations.forEach(c => {
      c.messages.forEach(m => {
        if (m.sender.toString() !== req.user._id.toString() && !m.readBy.includes(req.user._id)) count++;
      });
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: "Error." });
  }
});

module.exports = router;