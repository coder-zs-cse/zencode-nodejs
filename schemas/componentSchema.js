const mongoose = require('mongoose');

const componentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    ref: 'User'
  },
  githubUrl: {
    type: String,
    required: true,
  },
  componentName: {
    type: String,
    required: true
  },
  indexingStatus: {
    type: Boolean,
    required: true,
    default: false
  },
  componentPath: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  useCase: {
    type: String,
    default: ''
  },
  codeSamples: [{
    type: String
  }],
  dependencies: [{
    type: String
  }],
  importPath: {
    type: String,
    default: ''
  },
  inputProps: {
    type: String,
    default: ''
  },
  code: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Create a compound index for userId and componentPath to ensure uniqueness
componentSchema.index({ userId: 1, componentPath: 1 }, { unique: true });

module.exports = mongoose.model('Component', componentSchema); 