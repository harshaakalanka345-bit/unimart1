const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Product = require("../models/Product");
const Transaction = require("../models/Transaction");
const Conversation = require("../models/Conversation");
const { protect, adminOnly } = require("../middleware/auth");

// All admin routes require auth + admin role
router.use(protect, adminOnly);

// @GET /api/admin/stats
router.get("/stats", async (req, res) => {
  try {
    const [users, products, transactions, reports] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments({ status: "Available" }),
      Transaction.countDocuments({ status: "Completed" }),
      Conversation.countDocuments({ reportedBy: { $exists: true, $not: { $size: 0 } } }),
    ]);
    const revenue = await Transaction.aggregate([
      { $match: { status: "Completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    res.json({ users, activeListings: products, completedDeals: transactions, reportedConversations: reports, totalRevenue: revenue[0]?.total || 0 });
  } catch { res.status(500).json({ message: "Error." }); }
});

// @GET /api/admin/products — pending approval
router.get("/products/pending", async (req, res) => {
  try {
    const products = await Product.find({ approvedByAdmin: false }).populate("seller", "name email").sort({ createdAt: -1 });
    res.json(products);
  } catch { res.status(500).json({ message: "Error." }); }
});

// @PATCH /api/admin/products/:id/approve
router.patch("/products/:id/approve", async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { approvedByAdmin: true, approvedAt: new Date() }, { new: true });
    res.json(product);
  } catch { res.status(500).json({ message: "Error." }); }
});

// @GET /api/admin/reports
router.get("/reports", async (req, res) => {
  try {
    const reported = await Conversation.find({ reportedBy: { $exists: true, $not: { $size: 0 } } })
      .populate("participants", "name email").populate("product", "title");
    res.json(reported);
  } catch { res.status(500).json({ message: "Error." }); }
});

module.exports = router;