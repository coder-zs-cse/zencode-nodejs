const express = require('express');
const router = express.Router();
const User = require('../schemas/userSchema');

// // Validation middleware
// const validateUserData = (req, res, next) => {
//   const { username, email } = req.body;
//   const errors = [];

//   if (!username) errors.push('Username is required');
//   if (!email) errors.push('Email is required');
//   if (email && !email.includes('@')) errors.push('Invalid email format');

//   if (errors.length > 0) {
//     return res.status(400).json({ errors });
//   }
//   next();
// };

// POST /api/users - Insert one user
router.post('/', async (req, res) => {
  try {
    const user = new User(req.body);
    const result = await user.save();
    console.log('User created:', result);
    res.status(201).json({ insertedId: result._id });
  } catch (error) {
    console.error('Error creating user:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    if (error.code === 11000) {
      return res.status(409).json({ error: 'User already exists' });
    }
    res.status(500).json({ error: 'Internal server error while creating user' });
  }
});

// POST /api/users/insertMany - Insert many users
router.post('/insertMany', async (req, res) => {
  try {
    const { documents } = req.body;
    if (!Array.isArray(documents)) {
      return res.status(400).json({ error: 'Documents must be an array' });
    }
    if (documents.length === 0) {
      return res.status(400).json({ error: 'Documents array cannot be empty' });
    }

    const result = await User.insertMany(documents, { ordered: false });
    res.status(201).json({ insertedCount: result.length });
  } catch (error) {
    console.error('Error inserting multiple users:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    if (error.writeErrors) {
      return res.status(400).json({ 
        error: 'Some documents failed to insert',
        failedCount: error.writeErrors.length,
        details: error.writeErrors.map(e => e.errmsg)
      });
    }
    res.status(500).json({ error: 'Internal server error while inserting users' });
  }
});

// GET /api/users/findOne - Find one user
router.get('/findOne', async (req, res) => {
  try {
    let query;
    try {
      query = JSON.parse(req.query.query || '{}');
    } catch (parseError) {
      return res.status(400).json({ error: 'Invalid query format' });
    }

    const result = await User.findOne(query);
    if (!result) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result);
  } catch (error) {
    console.error('Error finding user:', error);
    res.status(500).json({ error: 'Internal server error while finding user' });
  }
});

// GET /api/users/find - Find many users
router.get('/find', async (req, res) => {
  try {
    let query;
    try {
      query = JSON.parse(req.query.query || '{}');
    } catch (parseError) {
      return res.status(400).json({ error: 'Invalid query format' });
    }

    const result = await User.find(query);
    res.json(result);
  } catch (error) {
    console.error('Error finding users:', error);
    res.status(500).json({ error: 'Internal server error while finding users' });
  }
});

// PATCH /api/users - Update one user
router.patch('/', async (req, res) => {
  try {
    const { query, update } = req.body;
    if (!query || !update) {
      return res.status(400).json({ error: 'Both query and update objects are required' });
    }

    const result = await User.updateOne(query, update, { runValidators: true });
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'No user found matching the query' });
    }
    res.json({ 
      modifiedCount: result.modifiedCount,
      matched: result.matchedCount 
    });
  } catch (error) {
    console.error('Error updating user:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: 'Internal server error while updating user' });
  }
});

// PATCH /api/users/updateMany - Update many users
router.patch('/updateMany', async (req, res) => {
  try {
    const { updates } = req.body;
    if (!Array.isArray(updates)) {
      return res.status(400).json({ error: 'Updates must be an array' });
    }
    if (updates.length === 0) {
      return res.status(400).json({ error: 'Updates array cannot be empty' });
    }

    let modifiedCount = 0;
    const errors = [];
    
    for (const [index, update] of updates.entries()) {
      try {
        if (!update.filter || !update.update) {
          errors.push({ index, error: 'Both filter and update objects are required' });
          continue;
        }

        const result = await User.updateOne(
          update.filter,
          update.update,
          { upsert: true, runValidators: true }
        );
        modifiedCount += result.modifiedCount;
      } catch (updateError) {
        errors.push({ index, error: updateError.message });
      }
    }
    
    const response = { modifiedCount };
    if (errors.length > 0) {
      response.errors = errors;
    }
    res.json(response);
  } catch (error) {
    console.error('Error updating multiple users:', error);
    res.status(500).json({ error: 'Internal server error while updating users' });
  }
});

// DELETE /api/users - Delete one user
router.delete('/', async (req, res) => {
  try {
    let query;
    try {
      query = JSON.parse(req.query.query || '{}');
    } catch (parseError) {
      return res.status(400).json({ error: 'Invalid query format' });
    }

    if (Object.keys(query).length === 0) {
      return res.status(400).json({ error: 'Query cannot be empty' });
    }

    const result = await User.deleteOne(query);
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'No user found matching the query' });
    }
    res.json({ deletedCount: result.deletedCount });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error while deleting user' });
  }
});

module.exports = router; 