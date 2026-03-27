const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: {
    type: String, required: true, unique: true, lowercase: true,
    match: [/^[a-zA-Z0-9._%+-]+@(sliit\.lk|students\.sliit\.lk)$/, "Must use a valid SLIIT university email"],
  },
  password: { type: String, required: true, minlength: 8, select: false },
  role: { type: String, enum: ["student", "admin"], default: "student" },
  faculty: { type: String, default: "" },
  year: { type: Number, min: 1, max: 4 },
  contactInfo: { type: String, default: "" },
  bio: { type: String, maxlength: 300, default: "" },
  profilePicture: { type: String, default: "" },
  status: { type: String, enum: ["active", "suspended"], default: "active" },
  isSeller: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  sellerApprovedAt: { type: Date },
  
  // Advanced Seller Details
  username: { type: String, trim: true },
  sellerDetails: {
    sellerType: { type: String, enum: ["individual", "business"], default: "individual" },
    category: { type: String, default: "" },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    postalCode: { type: String, default: "" },
    country: { type: String, default: "" },
    altPhone: { type: String, default: "" },
  },
  verification: {
    studentIdNumber: { type: String, default: "" },
    studentIdImage: { type: String, default: "" },
    isVerified: { type: Boolean, default: false },
  },
  paymentDetails: {
    bankAccount: { type: String, default: "" },
    mobilePayment: { type: String, default: "" },
    accountHolderName: { type: String, default: "" },
  },
  
  lastSeen: { type: Date, default: Date.now },
}, { timestamps: true });

// Hash password before save
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare password
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Virtual: avg rating
userSchema.virtual("avgRating").get(function () {
  return this.totalRatings > 0 ? (this.rating / this.totalRatings).toFixed(1) : null;
});

module.exports = mongoose.model("User", userSchema);