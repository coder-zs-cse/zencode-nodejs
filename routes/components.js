const express = require('express');
const router = express.Router();
const Component = require('../schemas/componentSchema');

// POST /api/components - Insert one component
router.post('/', async (req, res) => {
  try {
    const component = new Component(req.body);
    const result = await component.save();
    res.status(201).json({ insertedId: result._id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/components/insertMany - Insert many components
router.post('/insertMany', async (req, res) => {
  try {
    const { documents } = req.body;
    const result = await Component.insertMany(documents);
    res.status(201).json({ insertedCount: result.length });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/components/findOne - Find one component
router.get('/findOne', async (req, res) => {
  try {
    const query = JSON.parse(req.query.query || '{}');
    const result = await Component.findOne(query);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/components/find - Find many components
router.get('/find', async (req, res) => {
  try {
    const query = JSON.parse(req.query.query || '{}');
    const result = await Component.find(query);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PATCH /api/components - Update one component
router.patch('/', async (req, res) => {
  try {
    const { query, update } = req.body;
    const result = await Component.updateOne(query, update);
    res.json({ modifiedCount: result.modifiedCount });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PATCH /api/components/updateMany - Update many components
router.patch('/updateMany', async (req, res) => {
  try {
    const { updates } = req.body;
    let modifiedCount = 0;
    
    for (const update of updates) {
      const result = await Component.updateOne(
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

// DELETE /api/components - Delete one component
router.delete('/', async (req, res) => {
  try {
    const query = JSON.parse(req.query.query || '{}');
    const result = await Component.deleteOne(query);
    res.json({ deletedCount: result.deletedCount });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router; 