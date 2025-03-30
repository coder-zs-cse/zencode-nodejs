const mongoose = require('mongoose');

const IndexingStatus = {
  NOT_STARTED:'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  ERROR: 'ERROR',
  COMPLETED: 'COMPLETED'
};

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  lastIndexedRepo: {
    type: String,
    default: null
  },
  indexingStatus: {
    type: String,
    enum: Object.values(IndexingStatus),
    default: null
  },
  totalComponents: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = {
  UserSchema: mongoose.model('User', userSchema),
  IndexingStatus
}; 