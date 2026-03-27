const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const Product = require("../models/Product");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

// @POST /api/transactions — create transaction
router.post("/", protect, async (req, res) => {
  try {
    const { productId, paymentMethod } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found." });
    if (product.status !== "Available") return res.status(400).json({ message: "Product is no longer available." });
    if (product.seller.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot buy your own product." });
    }

    const transaction = await Transaction.create({
      buyer: req.user._id,
      seller: product.seller,
      product: productId,
      amount: product.price,
      paymentMethod,
      status: "Pending",
    });

    product.status = "Reserved";
    await product.save();

    await transaction.populate("product", "title images price");
    await transaction.populate("seller", "name profilePicture");
    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ message: "Error creating transaction." });
  }
});

// @GET /api/transactions/my
router.get("/my", protect, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      $or: [{ buyer: req.user._id }, { seller: req.user._id }]
    })
      .sort({ createdAt: -1 })
      .populate("product", "title images price category")
      .populate("buyer", "name profilePicture")
      .populate("seller", "name profilePicture");
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: "Error fetching transactions." });
  }
});

// @PATCH /api/transactions/:id/status
router.patch("/:id/status", protect, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: "Transaction not found." });

    const isBuyer = transaction.buyer.toString() === req.user._id.toString();
    const isSeller = transaction.seller.toString() === req.user._id.toString();
    if (!isBuyer && !isSeller) return res.status(403).json({ message: "Not authorized." });

    const { status, cancelReason } = req.body;
    transaction.status = status;

    if (status === "Completed") {
      transaction.completedAt = new Date();
      await Product.findByIdAndUpdate(transaction.product, { status: "Sold", soldAt: new Date() });
    } else if (status === "Cancelled") {
      transaction.cancelReason = cancelReason;
      transaction.cancelledBy = req.user._id;
      await Product.findByIdAndUpdate(transaction.product, { status: "Available" });
    }

    await transaction.save();
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ message: "Error updating transaction." });
  }
});

// @POST /api/transactions/:id/review
router.post("/:id/review", protect, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: "Transaction not found." });
    if (transaction.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only buyer can leave a review." });
    }
    if (transaction.status !== "Completed") {
      return res.status(400).json({ message: "Can only review completed transactions." });
    }

    transaction.review = { rating: req.body.rating, comment: req.body.comment, reviewedAt: new Date() };
    await transaction.save();

    // Update seller's rating
    const seller = await User.findById(transaction.seller);
    seller.rating = (seller.rating + req.body.rating);
    seller.totalRatings += 1;
    await seller.save();

    res.json(transaction);
  } catch (err) {
    res.status(500).json({ message: "Error submitting review." });
  }
});

module.exports = router;