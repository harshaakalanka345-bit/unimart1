const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("./models/Product");
const User = require("./models/User");
const Transaction = require("./models/Transaction");

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/unimart";

const seedOrders = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for seeding orders");

    // Clear old transactions if needed
    // await Transaction.deleteMany({});

    // Find the current logged-in user (first one that isn't the dummy seller)
    const activeUser = await User.findOne({ email: { $ne: "seller@sliit.lk" } }).sort({ createdAt: -1 });
    
    if (!activeUser) {
      console.log("No active user found to assign orders to. Please register an account first.");
      process.exit(1);
    }
    console.log(`Assigning sample orders to user: ${activeUser.name || activeUser.email}`);

    // Find the dummy seller
    let seller = await User.findOne({ email: "seller@sliit.lk" });
    if (!seller) {
      console.log("Dummy seller not found. Please run seed_products.js first.");
      process.exit(1);
    }

    // Get 3 sample products to create orders for
    const products = await Product.find({ seller: seller._id }).limit(3);
    
    if (products.length < 3) {
      console.log("Not enough sample products. Please run seed_products.js first.");
      process.exit(1);
    }

    const sampleOrders = [
      {
        buyer: activeUser._id,
        seller: seller._id,
        product: products[0]._id,
        amount: products[0].price,
        paymentMethod: "cash_on_meetup",
        status: "Pending",
      },
      {
        buyer: activeUser._id,
        seller: seller._id,
        product: products[1]._id,
        amount: products[1].price,
        paymentMethod: "bank_transfer",
        status: "Completed",
        completedAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
        review: {
          rating: 5,
          comment: "Great condition and fast transaction on campus!",
          reviewedAt: new Date(Date.now() - 86400000), // 1 day ago
        }
      },
      {
        buyer: activeUser._id,
        seller: seller._id,
        product: products[2]._id,
        amount: products[2].price,
        paymentMethod: "cash_on_meetup",
        status: "Reserved",
      }
    ];

    await Transaction.insertMany(sampleOrders);

    // Update product statuses
    products[0].status = "Reserved";
    products[1].status = "Sold";
    products[2].status = "Reserved";
    await Promise.all([products[0].save(), products[1].save(), products[2].save()]);

    console.log(`Successfully added ${sampleOrders.length} sample orders to 'My Orders'!`);
    process.exit(0);
  } catch (err) {
    console.error("Error seeding orders:", err);
    process.exit(1);
  }
};

seedOrders();
