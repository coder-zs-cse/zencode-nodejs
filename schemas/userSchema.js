const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  githubUsername: {
    type: String
  },
  preferences: {
    type: Map,
    of: String,
    default: new Map()
  }
}, {
  timestamps: true
});

// Add method to drop all indexes
userSchema.statics.dropAllIndexes = async function() {
  try {
    await this.collection.dropIndexes();
    console.log('All indexes dropped successfully');
  } catch (error) {
    console.error('Error dropping indexes:', error);
  }
};

module.exports = mongoose.model('User', userSchema); 