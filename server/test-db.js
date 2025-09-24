const mongoose = require('mongoose');

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    await mongoose.connect('mongodb://localhost:27017/taskmanagement');
    console.log('✅ MongoDB connected successfully');
    
    console.log('Testing Redis connection...');
    const { createClient } = require('redis');
    const redis = createClient({ url: 'redis://localhost:6379' });
    await redis.connect();
    console.log('✅ Redis connected successfully');
    
    console.log('All connections successful!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error);
    process.exit(1);
  }
}

testConnection();
