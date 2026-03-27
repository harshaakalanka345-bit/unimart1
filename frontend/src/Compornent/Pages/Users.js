const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const User = require("../models/User");
const { protect, adminOnly } = require("../middleware/auth");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/avatars";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, `${Date.now()}-${req.user._id}${path.extname(file.originalname)}`),
});
const upload = multer({ storage, limits: { fileSize: 3 * 1024 * 1024 }, fileFilter: (req, file, cb) => { if (file.mimetype.startsWith("image/")) cb(null, true); else cb(new Error("Images only")); } });

// @GET /api/users/profile
router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user);
  } catch { res.status(500).json({ message: "Error." }); }
});

// @PUT /api/users/profile
router.put("/profile", protect, async (req, res) => {
  try {
    const { name, faculty, year, contactInfo, bio } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, faculty, year, contactInfo, bio }, { new: true, runValidators: true });
    res.json(user);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// @POST /api/users/profile/picture
router.post("/profile/picture", protect, upload.single("profilePicture"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded." });
    const url = `/uploads/avatars/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(req.user._id, { profilePicture: url }, { new: true });
    res.json({ profilePicture: user.profilePicture });
  } catch { res.status(500).json({ message: "Upload failed." }); }
});

// @PATCH /api/users/become-seller
router.patch("/become-seller", protect, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, { isSeller: true, sellerApprovedAt: new Date() }, { new: true });
    res.json({ message: "Seller account activated!", user });
  } catch { res.status(500).json({ message: "Error." }); }
});

// @GET /api/users/:id — public profile
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password -email");
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json(user);
  } catch { res.status(500).json({ message: "Error." }); }
});

// Admin: @GET /api/users — list all
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, role } = req.query;
    const query = {};
    if (status) query.status = status;
    if (role) query.role = role;
    const users = await User.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
    const total = await User.countDocuments(query);
    res.json({ users, total });
  } catch { res.status(500).json({ message: "Error." }); }
});

// Admin: suspend/activate
router.patch("/:id/status", protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(user);
  } catch { res.status(500).json({ message: "Error." }); }
});

module.exports = router;