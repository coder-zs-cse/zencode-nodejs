const express = require('express');
const router = express.Router();
const Github = require('../schemas/githubSchema');

// POST /api/github - Insert one GitHub repo
router.post('/', async (req, res) => {
  try {
    const github = new Github(req.body);
    const result = await github.save();
    res.status(201).json({ insertedId: result._id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/github/insertMany - Insert many GitHub repos
router.post('/insertMany', async (req, res) => {
  try {
    const { documents } = req.body;
    const result = await Github.insertMany(documents);
    res.status(201).json({ insertedCount: result.length });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/github/findOne - Find one GitHub repo
router.get('/findOne', async (req, res) => {
  try {
    const query = JSON.parse(req.query.query || '{}');
    const result = await Github.findOne(query);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/github/find - Find many GitHub repos
router.get('/find', async (req, res) => {
  try {
    const query = JSON.parse(req.query.query || '{}');
    const result = await Github.find(query);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PATCH /api/github - Update one GitHub repo
router.patch('/', async (req, res) => {
  try {
    const { query, update } = req.body;
    const result = await Github.updateOne(query, update);
    res.json({ modifiedCount: result.modifiedCount });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PATCH /api/github/updateMany - Update many GitHub repos
router.patch('/updateMany', async (req, res) => {
  try {
    const { updates } = req.body;
    let modifiedCount = 0;
    
    for (const update of updates) {
      const result = await Github.updateOne(
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

// DELETE /api/github - Delete one GitHub repo
router.delete('/', async (req, res) => {
  try {
    const query = JSON.parse(req.query.query || '{}');
    const result = await Github.deleteOne(query);
    res.json({ deletedCount: result.deletedCount });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router; 