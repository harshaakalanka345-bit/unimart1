const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ["cash_on_meetup", "bank_transfer"], required: true },
  status: { type: String, enum: ["Pending", "Reserved", "Completed", "Cancelled"], default: "Pending" },
  cancelReason: { type: String },
  cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  completedAt: { type: Date },
  review: {
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String, maxlength: 500 },
    reviewedAt: { type: Date },
  },
}, { timestamps: true });

module.exports = mongoose.model("Transaction", transactionSchema);