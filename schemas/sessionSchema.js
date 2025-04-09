// import mongoose, { Schema } from 'mongoose';
const mongoose = require('mongoose');
const { Schema } = mongoose;
// enum StepType {
//   CreateFile = 0,
//   CreateFolder = 1,
//   EditFile = 2,
//   DeleteFile = 3,
//   TextDisplay = 4
// }

const fileStepSchema = new Schema({
  id: {
    type: Number,
    required: true,
    description: "Unique identifier for the file step."
  },
  title: {
    type: String,
    required: true,
    description: "Title of the file step. Example Creating File src/App.tsx"
  },
  type: {
    type: Number,
    required: true,
    enum: [0, 1, 2, 3, 4], // Maps to StepType enum
    description: "Type of the step"
  },
  content: {
    type: String,
    required: true,
    description: "Code associated with the file."
  },
  path: {
    type: String,
    required: true,
    description: "Full file path"
  }
});

// const reactResponseSchema = new Schema({
//   steps: [fileStepSchema],
//   description: "List of file steps involved in the response."
// });

const messageSchema = new Schema({
  role: {
    type: String,
    required: true,
    enum: ['user', 'assistant']
  },
  content: {
    type: Schema.Types.Mixed, // Can be string for user or object for assistant
    required: true
  }
});

const fileNodeSchema = new Schema({
  fileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileContent: {
    type: String,
    required: true
  }
});

const sessionSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    ref: 'User'
  },
  messages: [messageSchema],
  codebase: [fileNodeSchema],
  internalComponents: [{
    type: String
  }],
  npmPackages: [{
    type: String
  }]
}, {
  timestamps: true // This will add createdAt and updatedAt fields
});

sessionSchema.statics.dropAllIndexes = async function() {
  try {
    await this.collection.dropIndexes();
    console.log('All indexes dropped successfully');
  } catch (error) {
    console.error('Error dropping indexes:', error);
  }
};

// Export the model
module.exports = mongoose.model('Session', sessionSchema); 