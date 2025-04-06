const express = require('express');
const router = express.Router();
const Component = require('../schemas/componentSchema');

// Validation middleware
const validateComponentData = (req, res, next) => {
  const { name, type, content } = req.body;
  const errors = [];

  if (!name) errors.push('Component name is required');
  if (!type) errors.push('Component type is required');
  if (!content) errors.push('Component content is required');

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  next();
};

// POST /api/components - Insert one component
router.post('/', async (req, res) => {
  try {
    const component = new Component(req.body);
    const result = await component.save();
    res.status(201).json({ insertedId: result._id });
  } catch (error) {
    console.error('Error creating component:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Component already exists' });
    }
    res.status(500).json({ error: 'Internal server error while creating component' });
  }
});

// POST /api/components/insertMany - Insert many components
router.post('/insertMany', async (req, res) => {
  try {
    const { documents } = req.body;
    if (!Array.isArray(documents)) {
      return res.status(400).json({ error: 'Documents must be an array' });
    }
    if (documents.length === 0) {
      return res.status(400).json({ error: 'Documents array cannot be empty' });
    }

    const result = await Component.insertMany(documents, { ordered: false });
    res.status(201).json({ insertedCount: result.length });
  } catch (error) {
    console.error('Error inserting multiple components:', error);
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
    res.status(500).json({ error: 'Internal server error while inserting components' });
  }
});

// GET /api/components/findOne - Find one component
router.get('/findOne', async (req, res) => {
  try {
    let query;
    try {
      query = JSON.parse(req.query.query || '{}');
    } catch (parseError) {
      return res.status(400).json({ error: 'Invalid query format' });
    }

    const result = await Component.findOne(query);
    if (!result) {
      return res.status(404).json({ error: 'Component not found' });
    }
    res.json(result);
  } catch (error) {
    console.error('Error finding component:', error);
    res.status(500).json({ error: 'Internal server error while finding component' });
  }
});

// GET /api/components/find - Find many components
router.get('/find', async (req, res) => {
  try {
    let query;
    console.log("query in find", req.query.query);
    try {
      // Clean up the query string by replacing single quotes with double quotes
      const cleanQuery = req.query.query ? req.query.query.replace(/'/g, '"') : '{}';
      console.log("clearnquery", cleanQuery);
      query = JSON.parse(cleanQuery);
    } catch (parseError) {
      return res.status(400).json({ error: 'Invalid query format' });
    }
    const result = await Component.find(query);
    console.log("result in find", result);
    res.json(result);
  } catch (error) {
    console.error('Error finding components:', error);
    res.status(500).json({ error: 'Internal server error while finding components' });
  }
});

// PATCH /api/components - Update one component
router.patch('/update_one', async (req, res) => {
  try {
    const { query, update } = req.body;
    if (!query || !update) {
      return res.status(400).json({ error: 'Both query and update objects are required' });
    }

    const result = await Component.updateOne(query, update, { runValidators: true });
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'No component found matching the query' });
    }
    res.json({ 
      modifiedCount: result.modifiedCount,
      matched: result.matchedCount 
    });
  } catch (error) {
    console.error('Error updating component:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: 'Internal server error while updating component' });
  }
});

// PATCH /api/components/updateMany - Update many components
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

        const result = await Component.updateOne(
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
    console.error('Error updating multiple components:', error);
    res.status(500).json({ error: 'Internal server error while updating components' });
  }
});

// DELETE /api/components - Delete one component
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

    const result = await Component.deleteOne(query);
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'No component found matching the query' });
    }
    res.json({ deletedCount: result.deletedCount });
  } catch (error) {
    console.error('Error deleting component:', error);
    res.status(500).json({ error: 'Internal server error while deleting component' });
  }
});

module.exports = router; 