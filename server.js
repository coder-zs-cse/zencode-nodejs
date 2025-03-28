const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();
const parseReactComponent = require("./main");

const app = express();
const PORT = process.env.PORT || 4000;

//MongoDB credentials
const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;
const client = new MongoClient(uri);

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Connect to MongoDB
async function connectToMongo() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
}

// API base path
const API_BASE = "/api";

// Health check endpoint
app.get(`${API_BASE}/health`, async (req, res) => {
  try {
    await client.db(dbName).command({ ping: 1 });
    res.status(200).json({ status: "ok", message: "Connection successful" });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Insert one document
app.post(`${API_BASE}/:collection`, async (req, res) => {
  try {
    const { collection } = req.params;
    const db = client.db(dbName);
    const coll = db.collection(collection);
    const result = await coll.insertOne(req.body);
    res.status(201).json({ 
      insertedId: result.insertedId.toString(),
      acknowledged: result.acknowledged
    });
  } catch (error) {
    console.error(`Error in insertOne:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Insert many documents
app.post(`${API_BASE}/:collection/insertMany`, async (req, res) => {
  try {
    const { collection } = req.params;
    const { documents } = req.body;
    
    if (!Array.isArray(documents)) {
      return res.status(400).json({ error: "documents must be an array" });
    }
    
    const db = client.db(dbName);
    const coll = db.collection(collection);
    const result = await coll.insertMany(documents);
    
    res.status(201).json({ 
      insertedCount: result.insertedCount,
      insertedIds: result.insertedIds
    });
  } catch (error) {
    console.error(`Error in insertMany:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Find one document
app.get(`${API_BASE}/:collection/findOne`, async (req, res) => {
  try {
    const { collection } = req.params;
    let query = req.query.query;
    
    // Parse the query string into an object if it's a string
    if (typeof query === 'string') {
      try {
        query = JSON.parse(query);
      } catch (e) {
        return res.status(400).json({ error: "Invalid query format" });
      }
    }
    
    // Convert string _id to ObjectId if present
    if (query && query._id) {
      try {
        query._id = new ObjectId(query._id);
      } catch (e) {
        // Ignore if not a valid ObjectId
      }
    }
    
    const db = client.db(dbName);
    const coll = db.collection(collection);
    const result = await coll.findOne(query || {});
    
    if (!result) {
      return res.status(404).json({ message: "Document not found" });
    }
    
    res.json(result);
  } catch (error) {
    console.error(`Error in findOne:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Find many documents
app.get(`${API_BASE}/:collection/find`, async (req, res) => {
  try {
    const { collection } = req.params;
    let query = req.query.query;
    
    // Parse the query string into an object if it's a string
    if (typeof query === 'string') {
      try {
        query = JSON.parse(query);
      } catch (e) {
        return res.status(400).json({ error: "Invalid query format" });
      }
    }
    
    // Convert string _id to ObjectId if present
    if (query && query._id) {
      try {
        query._id = new ObjectId(query._id);
      } catch (e) {
        // Ignore if not a valid ObjectId
      }
    }
    
    const db = client.db(dbName);
    const coll = db.collection(collection);
    const result = await coll.find(query || {}).toArray();
    
    res.json(result);
  } catch (error) {
    console.error(`Error in find:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Update one document
app.patch(`${API_BASE}/:collection`, async (req, res) => {
  try {
    const { collection } = req.params;
    const { query, update } = req.body;
    
    if (!query || !update) {
      return res.status(400).json({ error: "Query and update objects are required" });
    }
    
    // Convert string _id to ObjectId if present
    if (query && query._id) {
      try {
        query._id = new ObjectId(query._id);
      } catch (e) {
        // Ignore if not a valid ObjectId
      }
    }
    
    const db = client.db(dbName);
    const coll = db.collection(collection);
    
    const result = await coll.updateOne(query, { $set: update });
    
    res.json({
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      acknowledged: result.acknowledged
    });
  } catch (error) {
    console.error(`Error in updateOne:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Update many documents
app.patch(`${API_BASE}/:collection/updateMany`, async (req, res) => {
  try {
    const { collection } = req.params;
    const { query, update } = req.body;
    
    if (!query || !update) {
      return res.status(400).json({ error: "Query and update objects are required" });
    }
    
    // Convert string _id to ObjectId if present
    if (query && query._id) {
      try {
        query._id = new ObjectId(query._id);
      } catch (e) {
        // Ignore if not a valid ObjectId
      }
    }
    
    const db = client.db(dbName);
    const coll = db.collection(collection);
    
    const result = await coll.updateMany(query, { $set: update });
    
    res.json({
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      acknowledged: result.acknowledged
    });
  } catch (error) {
    console.error(`Error in updateMany:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Delete one document
app.delete(`${API_BASE}/:collection`, async (req, res) => {
  try {
    const { collection } = req.params;
    let query = req.query.query;
    
    // Parse the query string into an object if it's a string
    if (typeof query === 'string') {
      try {
        query = JSON.parse(query);
      } catch (e) {
        return res.status(400).json({ error: "Invalid query format" });
      }
    }
    
    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }
    
    // Convert string _id to ObjectId if present
    if (query && query._id) {
      try {
        query._id = new ObjectId(query._id);
      } catch (e) {
        // Ignore if not a valid ObjectId
      }
    }
    
    const db = client.db(dbName);
    const coll = db.collection(collection);
    
    const result = await coll.deleteOne(query);
    
    res.json({
      deletedCount: result.deletedCount,
      acknowledged: result.acknowledged
    });
  } catch (error) {
    console.error(`Error in deleteOne:`, error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint for parsing React components
app.post(`${API_BASE}/parse`, (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        error: "Missing required parameter: code",
      });
    }

    const result = parseReactComponent(code);

    if (!result) {
      return res.status(400).json({
        error: "Failed to parse the React component",
      });
    }

    return res.json(result);
  } catch (error) {
    console.error("Error parsing component:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
});

// Basic root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "MongoDB API Server",
    documentation: {
      endpoints: [
        `${API_BASE}/health - Health check`,
        `${API_BASE}/:collection - POST: Insert one document`,
        `${API_BASE}/:collection/insertMany - POST: Insert many documents`,
        `${API_BASE}/:collection/findOne - GET: Find one document`,
        `${API_BASE}/:collection/find - GET: Find many documents`,
        `${API_BASE}/:collection - PATCH: Update one document`,
        `${API_BASE}/:collection/updateMany - PATCH: Update many documents`,
        `${API_BASE}/:collection - DELETE: Delete one document`,
      ]
    },
  });
});

// Start the server
connectToMongo().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}${API_BASE}`);
  });
});

// Handle application shutdown
process.on("SIGINT", async () => {
  await client.close();
  process.exit(0);
});
