const mongoose = require("mongoose");

const dbConfig = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Yuhu!🥳🥳🥳🥳💃 MongoDB is connected successfully!");
  } catch (err) {
    console.error("Oops 😔! Error connecting to MongoDB:", err.message);
    process.exit(1);
  }
};

module.exports = dbConfig;
