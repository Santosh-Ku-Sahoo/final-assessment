const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/visitor_db');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    console.log('Ensure MongoDB is installed and running, or provide a MONGODB_URI in backend/.env');
    process.exit(1);
  }
};

module.exports = connectDB;
