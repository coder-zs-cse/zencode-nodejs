const express = require('express');
const router = express.Router();
const Github = require('../schemas/githubSchema');

// // Validation middleware
// const validateGithubData = (req, res, next) => {
//   const { name, url, description } = req.body;
//   const errors = [];

//   if (!name) errors.push('Repository name is required');
//   if (!url) errors.push('Repository URL is required');
//   if (description && typeof description !== 'string') errors.push('Description must be a string');

//   if (errors.length > 0) {
//     return res.status(400).json({ errors });
//   }
//   next();
// };

// POST /api/github - Insert one GitHub repo
router.post('/', async (req, res) => {
  try {
    const github = new Github(req.body);
    const result = await github.save();
    console.log("result in post github route", result)
    res.status(201).json({ insertedId: result._id });
  } catch (error) {
    console.error('Error creating GitHub repo:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Repository already exists' });
    }
    res.status(500).json({ error: 'Internal server error while creating repository' });
  }
});

// POST /api/github/insertMany - Insert many GitHub repos
router.post('/insertMany', async (req, res) => {
  try {
    const { documents } = req.body;
    if (!Array.isArray(documents)) {
      return res.status(400).json({ error: 'Documents must be an array' });
    }
    if (documents.length === 0) {
      return res.status(400).json({ error: 'Documents array cannot be empty' });
    }

    const result = await Github.insertMany(documents, { ordered: false });
    res.status(201).json({ insertedCount: result.length });
  } catch (error) {
    console.error('Error inserting multiple GitHub repos:', error);
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
    res.status(500).json({ error: 'Internal server error while inserting repositories' });
  }
});

// GET /api/github/findOne - Find one GitHub repo
router.get('/findOne', async (req, res) => {
  try {
    let query;
    try {
      query = JSON.parse(req.query.query || '{}');
    } catch (parseError) {
      return res.status(400).json({ error: 'Invalid query format' });
    }

    const result = await Github.findOne(query);
    if (!result) {
      return res.status(200).json({ success: false,message: 'Repository not found' });
    }
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error finding GitHub repo:', error);
    res.status(500).json({ error: 'Internal server error while finding repository' });
  }
});

// GET /api/github/find - Find many GitHub repos
router.get('/find', async (req, res) => {
  try {
    let query;
    try {
      query = JSON.parse(req.query.query || '{}');
    } catch (parseError) {
      return res.status(400).json({ error: 'Invalid query format' });
    }

    const result = await Github.find(query);
    res.json(result);
  } catch (error) {
    console.error('Error finding GitHub repos:', error);
    res.status(500).json({ error: 'Internal server error while finding repositories' });
  }
});

// PATCH /api/github - Update one GitHub repo
router.patch('/', async (req, res) => {
  try {
    const { query, update } = req.body;
    if (!query || !update) {
      return res.status(400).json({ error: 'Both query and update objects are required' });
    }

    const result = await Github.updateOne(query, update, { runValidators: true });
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'No repository found matching the query' });
    }
    res.json({ 
      modifiedCount: result.modifiedCount,
      matched: result.matchedCount 
    });
  } catch (error) {
    console.error('Error updating GitHub repo:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: 'Internal server error while updating repository' });
  }
});

// PATCH /api/github/updateMany - Update many GitHub repos
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

        const result = await Github.updateOne(
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
    console.error('Error updating multiple GitHub repos:', error);
    res.status(500).json({ error: 'Internal server error while updating repositories' });
  }
});

// DELETE /api/github - Delete one GitHub repo
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

    const result = await Github.deleteOne(query);
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'No repository found matching the query' });
    }
    res.json({ deletedCount: result.deletedCount });
  } catch (error) {
    console.error('Error deleting GitHub repo:', error);
    res.status(500).json({ error: 'Internal server error while deleting repository' });
  }
});

module.exports = router; 