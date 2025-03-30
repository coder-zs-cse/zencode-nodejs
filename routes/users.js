const express = require('express');
const router = express.Router();
const User = require('../schemas/userSchema');

// POST /api/users - Insert one user
router.post('/', async (req, res) => {
  try {
    const user = new User(req.body);
    const result = await user.save();
    console.log(result);
    res.status(201).json({ insertedId: result._id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/users/insertMany - Insert many users
router.post('/insertMany', async (req, res) => {
  try {
    const { documents } = req.body;
    const result = await User.insertMany(documents);
    res.status(201).json({ insertedCount: result.length });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/users/findOne - Find one user
router.get('/findOne', async (req, res) => {
  try {
    const query = JSON.parse(req.query.query || '{}');
    const result = await User.findOne(query);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/users/find - Find many users
router.get('/find', async (req, res) => {
  try {
    const query = JSON.parse(req.query.query || '{}');
    const result = await User.find(query);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PATCH /api/users - Update one user
router.patch('/', async (req, res) => {
  try {
    const { query, update } = req.body;
    const result = await User.updateOne(query, update);
    res.json({ modifiedCount: result.modifiedCount });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PATCH /api/users/updateMany - Update many users
router.patch('/updateMany', async (req, res) => {
  try {
    const { updates } = req.body;
    let modifiedCount = 0;
    
    for (const update of updates) {
      const result = await User.updateOne(
        update.filter,
        update.update,
        { upsert: true }
      );
      modifiedCount += result.modifiedCount;
    }
    
    res.json({ modifiedCount });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/users - Delete one user
router.delete('/', async (req, res) => {
  try {
    const query = JSON.parse(req.query.query || '{}');
    const result = await User.deleteOne(query);
    res.json({ deletedCount: result.deletedCount });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router; 