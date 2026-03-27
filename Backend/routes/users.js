const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth");
const User = require("../models/User");

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/users";
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

router.get("/", (req, res) => {
  res.json({ message: "Users route stub" });
});

router.patch("/become-seller", protect, upload.fields([{ name: "profilePicture", maxCount: 1 }, { name: "studentIdImage", maxCount: 1 }]), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Handle files if uploaded
    if (req.files?.profilePicture) {
      user.profilePicture = `/uploads/users/${req.files.profilePicture[0].filename}`;
    }
    if (req.files?.studentIdImage) {
      if (!user.verification) user.verification = {};
      user.verification.studentIdImage = `/uploads/users/${req.files.studentIdImage[0].filename}`;
    }

    // Extract basic fields
    const { contactInfo, bio, username, sellerType, category, address, city, postalCode, country, altPhone, studentIdNumber, bankAccount, mobilePayment, accountHolderName } = req.body;

    user.isSeller = true;
    if (contactInfo) user.contactInfo = contactInfo;
    if (bio) user.bio = bio;
    if (username) user.username = username;

    user.sellerDetails = {
      sellerType: sellerType || user.sellerDetails?.sellerType || "individual",
      category: category || user.sellerDetails?.category || "",
      address: address || user.sellerDetails?.address || "",
      city: city || user.sellerDetails?.city || "",
      postalCode: postalCode || user.sellerDetails?.postalCode || "",
      country: country || user.sellerDetails?.country || "",
      altPhone: altPhone || user.sellerDetails?.altPhone || "",
    };

    if (studentIdNumber) {
      if (!user.verification) user.verification = {};
      user.verification.studentIdNumber = studentIdNumber;
    }

    user.paymentDetails = {
      bankAccount: bankAccount || user.paymentDetails?.bankAccount || "",
      mobilePayment: mobilePayment || user.paymentDetails?.mobilePayment || "",
      accountHolderName: accountHolderName || user.paymentDetails?.accountHolderName || "",
    };

    user.sellerApprovedAt = new Date();
    await user.save();

    res.json({ user, message: "Successfully activated professional seller profile." });
  } catch (err) {
    console.error("Seller activation error:", err);
    res.status(500).json({ message: "Server error updating seller status." });
  }
});

module.exports = router;
