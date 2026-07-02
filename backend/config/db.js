const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error("❌ MONGODB_URI is not set in .env — cannot connect to the database.");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    console.error(
      "   Check that MongoDB is running locally, or that your Atlas connection string / IP allowlist is correct."
    );
    process.exit(1);
  }
}

module.exports = connectDB;
