const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  }
}, {
  timestamps: true
});

module.exports = {
  UserSchema: mongoose.model('User', userSchema),
  IndexingStatus
}; 