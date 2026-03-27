const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  profilePicture: { type: String },
  comment: { type: String, required: true }
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, required: true, maxlength: 1000 },
  price: { type: Number, required: true, min: 0 },
  category: {
    type: String, required: true,
    enum: ["textbooks", "electronics", "stationery", "clothing", "furniture", "sports", "gaming", "bags", "other"]
  },
  condition: { type: String, required: true, enum: ["New", "Like New", "Good", "Fair", "Poor"] },
  images: [{ type: String }],
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["Available", "Reserved", "Sold", "Cancelled"], default: "Available" },
  views: { type: Number, default: 0 },
  approvedByAdmin: { type: Boolean, default: true }, // false if admin approval required
  approvedAt: { type: Date },
  soldAt: { type: Date },
  tags: [{ type: String }],
  comments: [commentSchema],
}, { timestamps: true });

// Text index for search
productSchema.index({ title: "text", description: "text", tags: "text" });
productSchema.index({ category: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model("Product", productSchema);