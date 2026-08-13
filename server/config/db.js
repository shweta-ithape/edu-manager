const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (mongoUri && mongoUri.trim() !== '') {
      try {
        const conn = await mongoose.connect(mongoUri, {
          serverSelectionTimeoutMS: 3000
        });
        console.log(`[MongoDB] Connected via URI: ${conn.connection.host}`);
        return;
      } catch (err) {
        console.warn(`[MongoDB] Connection to process.env.MONGODB_URI failed. Falling back to MongoDB Memory Server. (${err.message})`);
      }
    }

    // In-memory MongoDB fallback for local testing & instant out-of-the-box execution
    console.log('[MongoDB] Starting MongoDB Memory Server fallback...');
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    const conn = await mongoose.connect(uri);
    console.log(`[MongoDB Memory Server] Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB Error] ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
