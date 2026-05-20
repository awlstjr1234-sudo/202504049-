const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/mealfit";

  if (!mongoUri) {
    console.error("MongoDB connection string is not set. Please configure MONGODB_URI in .env.");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log("MongoDB에 성공적으로 연결되었습니다.");
  } catch (error) {
    console.error("MongoDB 연결 오류:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
