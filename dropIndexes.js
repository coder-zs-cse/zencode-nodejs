const mongoose = require('mongoose');
const User = require('./schemas/userSchema');
const githubRouter = require('./schemas/userSchema');
// Replace with your MongoDB connection string
const MONGODB_URI = 'mongodb+srv://admin:admin@zencode.lqwq8.mongodb.net/?retryWrites=true&w=majority&appName=zencode'

async function dropIndexes() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    await githubRouter.dropAllIndexes();
    
    console.log('Operation completed');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

dropIndexes(); 