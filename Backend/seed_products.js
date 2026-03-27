const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("./models/Product");
const User = require("./models/User");

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/unimart";

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear old sample data (optional, but good for fresh seed)
    // await Product.deleteMany({});
    
    // Create a dummy seller if none exist
    let seller = await User.findOne({ email: "seller@sliit.lk" });
    if (!seller) {
      seller = await User.create({
        name: "Campus Store",
        email: "seller@sliit.lk",
        password: "password123", // hashed automatically by pre-save
        faculty: "Faculty of Business",
        year: 3,
        isSeller: true,
        sellerApprovedAt: new Date(),
        role: "student",
      });
      console.log("Created dummy seller");
    }

    const sampleProducts = [
      {
        title: "Introduction to Algorithms (3rd Edition)",
        description: "Standard textbook for computing students. A few highlights but overall good condition.",
        price: 4500,
        category: "textbooks",
        condition: "Good",
        images: ["https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400"],
        seller: seller._id,
        status: "Available",
        views: 120,
      },
      {
        title: "Logitech MX Master 3 Wireless Mouse",
        description: "Like new, used for one semester. Great for productivity.",
        price: 18000,
        category: "electronics",
        condition: "Like New",
        images: ["https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&q=80&w=400"],
        seller: seller._id,
        status: "Available",
        views: 45,
      },
      {
        title: "Engineering Drawing Tools Set",
        description: "Full set including T-square, compass, and French curves.",
        price: 2500,
        category: "stationery",
        condition: "Good",
        images: ["https://images.unsplash.com/photo-1581452140660-8f921d7b1e8e?auto=format&fit=crop&q=80&w=400"],
        seller: seller._id,
        status: "Available",
        views: 31,
      },
      {
        title: "SLIIT Faculty of Computing T-Shirt",
        description: "Size L. Worn twice. Washed and clean.",
        price: 1500,
        category: "clothing",
        condition: "Good",
        images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=400"],
        seller: seller._id,
        status: "Available",
        views: 15,
      },
      {
        title: "Study Desk Lamp",
        description: "LED desk lamp with adjustable brightness. Perfect for late-night studying.",
        price: 3500,
        category: "furniture",
        condition: "New",
        images: ["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=400"],
        seller: seller._id,
        status: "Available",
        views: 220,
      },
      {
        title: "PlayStation 5 Controller (DualSense)",
        description: "Working perfectly. Minor scratch on the back. Selling because I bought a custom one.",
        price: 14000,
        category: "gaming",
        condition: "Fair",
        images: ["https://images.unsplash.com/photo-1606318801954-d46d46d3360a?auto=format&fit=crop&q=80&w=400"],
        seller: seller._id,
        status: "Available",
        views: 89,
      },
      {
        title: "Waterproof Laptop Backpack",
        description: "Fits up to 15.6 inch laptops. Has many compartments. Selling because I graduated.",
        price: 4000,
        category: "bags",
        condition: "Like New",
        images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=400"],
        seller: seller._id,
        status: "Available",
        views: 56,
      },
      {
        title: "Casio fx-991EX Scientific Calculator",
        description: "Essential for engineering students. Used for two exams.",
        price: 5500,
        category: "electronics",
        condition: "Good",
        images: ["https://images.unsplash.com/photo-1587145820266-a5951ee6f620?auto=format&fit=crop&q=80&w=400"],
        seller: seller._id,
        status: "Available",
        views: 134,
      }
    ];

    await Product.insertMany(sampleProducts);
    console.log(`Successfully added ${sampleProducts.length} sample products!`);
    process.exit(0);
  } catch (err) {
    console.error("Error seeding data:", err);
    process.exit(1);
  }
};

seedData();
