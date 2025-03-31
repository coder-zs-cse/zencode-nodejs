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
  },
  indexingStatus: {
    type: String,
    enum: ['IN_PROGRESS', 'ERROR', 'COMPLETED'],
    default: null
  },
  componentList: {
    type: [String],
    default: []
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

githubSchema.statics.dropAllIndexes = async function() {
  try {
    await this.collection.dropIndexes();
    console.log('All indexes dropped successfully');
  } catch (error) {
    console.error('Error dropping indexes:', error);
  }
};

module.exports = mongoose.model('GithubCollection', githubSchema);
