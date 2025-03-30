const mongoose = require('mongoose');

const githubSchema = new mongoose.Schema({
  githubUrl: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true,
    unique: true
  },
  indexingStatus: {
    type: String,
    enum: ['IN_PROGRESS', 'ERROR', 'COMPLETED'],
    default: null
  },
  packageJson: {
    type: String,
    default: null
  },
  cssFiles: {
    type: String,
    default: null
  },
  designConfigFiles: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Github', githubSchema);
