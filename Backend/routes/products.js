const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Product = require("../models/Product");
const { protect, sellerOnly, adminOnly } = require("../middleware/auth");

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/products";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files allowed"), false);
  },
});

// @GET /api/products — search, filter, sort, paginate
router.get("/", async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, condition, sort, page = 1, limit = 12 } = req.query;
    const query = { status: "Available", approvedByAdmin: true };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } }
      ];
    }
    if (category) query.category = category;
    if (condition) query.condition = condition;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      price_low: { price: 1 },
      price_high: { price: -1 },
      most_viewed: { views: -1 },
    };
    const sortOption = sortMap[sort] || { createdAt: -1 };

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate("seller", "name profilePicture rating totalRatings");

    res.json({ products, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: "Error fetching products." });
  }
});

// @GET /api/products/featured
router.get("/featured", async (req, res) => {
  try {
    const products = await Product.find({ status: "Available", approvedByAdmin: true })
      .sort({ views: -1 })
      .limit(6)
      .populate("seller", "name profilePicture rating totalRatings");
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Error fetching featured." });
  }
});

// @GET /api/products/:id
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("seller", "name profilePicture rating totalRatings faculty createdAt");
    if (!product) return res.status(404).json({ message: "Product not found." });
    product.views += 1;
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Error fetching product." });
  }
});

// @POST /api/products
router.post("/", protect, sellerOnly, upload.array("images", 6), async (req, res) => {
  try {
    const { title, description, price, category, condition, tags } = req.body;
    const images = req.files?.map(f => `/uploads/products/${f.filename}`) || [];
    const product = await Product.create({
      title, description, price: Number(price), category, condition,
      images, seller: req.user._id,
      tags: tags ? JSON.parse(tags) : [],
    });
    await product.populate("seller", "name profilePicture");
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @PUT /api/products/:id
router.put("/:id", protect, upload.array("images", 6), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found." });
    if (product.seller.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized." });
    }
    const newImages = req.files?.map(f => `/uploads/products/${f.filename}`) || [];
    const updatedImages = [...(product.images || []), ...newImages];

    Object.assign(product, { ...req.body, images: updatedImages });
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @DELETE /api/products/:id
router.delete("/:id", protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found." });
    if (product.seller.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized." });
    }
    product.status = "Cancelled";
    await product.save();
    res.json({ message: "Product cancelled successfully." });
  } catch (err) {
    res.status(500).json({ message: "Error deleting product." });
  }
});

// @PATCH /api/products/:id/status
router.patch("/:id/status", protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found." });
    if (product.seller.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized." });
    }
    product.status = req.body.status;
    if (req.body.status === "Sold") product.soldAt = new Date();
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @GET /api/products/seller/:userId
router.get("/seller/:userId", async (req, res) => {
  try {
    const products = await Product.find({ seller: req.params.userId })
      .sort({ createdAt: -1 }).populate("seller", "name profilePicture");
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Error fetching seller products." });
  }
});

// @POST /api/products/:id/comments
router.post("/:id/comments", protect, async (req, res) => {
  try {
    const { comment } = req.body;
    if (!comment || comment.trim() === "") {
      return res.status(400).json({ message: "Comment text is required." });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    const newComment = {
      user: req.user._id,
      name: req.user.name,
      profilePicture: req.user.profilePicture || "",
      comment,
    };

    product.comments.push(newComment);
    await product.save();

    res.status(201).json({ message: "Comment added successfully.", comments: product.comments });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to add comment." });
  }
});

module.exports = router;