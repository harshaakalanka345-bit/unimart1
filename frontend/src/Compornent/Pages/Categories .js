const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

router.get("/", async (req, res) => {
  try {
    const categories = await Product.aggregate([
      { $match: { status: "Available", approvedByAdmin: true } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    res.json(categories);
  } catch { res.status(500).json({ message: "Error." }); }
});

module.exports = router;