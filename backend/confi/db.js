const mongoose = require("mongoose");

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.log("MONGO_URI is not set. Using local JSON storage.");
    return false;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");
    return true;
  } catch (error) {
    console.error("MongoDB connection failed", error.message);
    return false;
  }
};

module.exports = connectDB;
