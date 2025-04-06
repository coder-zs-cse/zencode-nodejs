const express = require('express');
const router = express.Router();
const Session = require('../schemas/sessionSchema');

// Validation middleware
// const validateSessionData = (req, res, next) => {
//   const { title } = req.body;
//   const errors = [];

//   if (!title) errors.push('Session title is required');

//   if (errors.length > 0) {
//     return res.status(400).json({ errors });
//   }
//   next();
// };

// POST /api/sessions - Insert one session
router.post('/', async (req, res) => {
  try {
    const session = new Session(req.body);
    const result = await session.save();
    res.status(201).json({ insertedId: result._id });
  } catch (error) {
    console.error('Error creating session:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: 'Internal server error while creating session' });
  }
});

// POST /api/sessions/insertMany - Insert many sessions
router.post('/insertMany', async (req, res) => {
  try {
    const { documents } = req.body;
    if (!Array.isArray(documents)) {
      return res.status(400).json({ error: 'Documents must be an array' });
    }
    if (documents.length === 0) {
      return res.status(400).json({ error: 'Documents array cannot be empty' });
    }

    const result = await Session.insertMany(documents, { ordered: false });
    res.status(201).json({ insertedCount: result.length });
  } catch (error) {
    console.error('Error inserting multiple sessions:', error);
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
    res.status(500).json({ error: 'Internal server error while inserting sessions' });
  }
});

// GET /api/sessions/findOne - Find one session
router.get('/findOne', async (req, res) => {
  try {
    let query;
    try {
      query = JSON.parse(req.query.query || '{}');
    } catch (parseError) {
      return res.status(400).json({ error: 'Invalid query format' });
    }

    const result = await Session.findOne(query);
    if (!result) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json(result);
  } catch (error) {
    console.error('Error finding session:', error);
    res.status(500).json({ error: 'Internal server error while finding session' });
  }
});

// GET /api/sessions/find - Find many sessions
router.get('/find', async (req, res) => {
  try {
    let query;
    try {
      const cleanQuery = req.query.query ? req.query.query.replace(/'/g, '"') : '{}';
      query = JSON.parse(cleanQuery);
    } catch (parseError) {
      return res.status(400).json({ error: 'Invalid query format' });
    }
    const result = await Session.find(query).sort({ updatedAt: -1 }); // Most recent first
    res.json(result);
  } catch (error) {
    console.error('Error finding sessions:', error);
    res.status(500).json({ error: 'Internal server error while finding sessions' });
  }
});

// PATCH /api/sessions - Update one session
router.patch('/', async (req, res) => {
  try {
    const { query, update } = req.body;
    if (!query || !update) {
      return res.status(400).json({ error: 'Both query and update objects are required' });
    }

    const result = await Session.updateOne(query, update, { 
      new: true, 
      runValidators: true 
    });
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'No session found matching the query' });
    }
    res.json({ 
      modifiedCount: result.modifiedCount,
      matched: result.matchedCount 
    });
  } catch (error) {
    console.error('Error updating session:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: 'Internal server error while updating session' });
  }
});

// PATCH /api/sessions/updateMany - Update many sessions
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

        const result = await Session.updateOne(
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
    console.error('Error updating multiple sessions:', error);
    res.status(500).json({ error: 'Internal server error while updating sessions' });
  }
});

// DELETE /api/sessions - Delete one session
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

    const result = await Session.deleteOne(query);
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'No session found matching the query' });
    }
    res.json({ deletedCount: result.deletedCount });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ error: 'Internal server error while deleting session' });
  }
});

// POST /api/sessions/messages - Add a message to a session
router.post('/messages', async (req, res) => {
  try {
    const { sessionId, role, content } = req.body;
    if (!sessionId || !role || !content) {
      return res.status(400).json({ error: 'sessionId, role, and content are required' });
    }
    
    const result = await Session.findByIdAndUpdate(
      sessionId,
      { 
        $push: { messages: { role, content } }
      },
      { new: true, runValidators: true }
    );
    
    if (!result) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error adding message to session:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: 'Internal server error while adding message' });
  }
});

module.exports = router;
