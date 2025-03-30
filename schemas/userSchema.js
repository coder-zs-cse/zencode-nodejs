const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
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

module.exports = mongoose.model('User', userSchema); 