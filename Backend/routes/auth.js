const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// @POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, faculty, year } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already registered." });

    const user = await User.create({ name, email, password, faculty, year });
    const token = generateToken(user._id);
    res.status(201).json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, isSeller: user.isSeller, profilePicture: user.profilePicture }
    });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: "Email already registered." });
    if (err.name === "ValidationError") {
      const msg = Object.values(err.errors).map(e => e.message).join(", ");
      return res.status(400).json({ message: msg });
    }
    console.error("Registration Error:", err);
    res.status(500).json({ message: err.message || "Server error during registration." });
  }
});

// @POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    if (user.status === "suspended") {
      return res.status(403).json({ message: "Your account has been suspended. Contact admin." });
    }
    user.lastSeen = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);
    res.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, isSeller: user.isSeller, profilePicture: user.profilePicture, faculty: user.faculty }
    });
  } catch (err) {
    res.status(500).json({ message: "Server error during login." });
  }
});

// @GET /api/auth/me
router.get("/me", protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ user });
});

// @POST /api/auth/logout (client-side handles token removal, but endpoint for clarity)
router.post("/logout", protect, (req, res) => {
  res.json({ message: "Logged out successfully." });
});

module.exports = router;