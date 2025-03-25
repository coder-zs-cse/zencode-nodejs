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
const collectionName = process.env.USERS_COLLECTION_NAME;
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

// Insert a new user
app.post("/users", async (req, res) => {
  try {
    const db = client.db(dbName);
    const users = db.collection(collectionName);
    const result = await users.insertOne(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users
app.get("/users", async (req, res) => {
  try {
    const db = client.db(dbName);
    const users = db.collection(collectionName);
    const result = await users.find({}).toArray();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user by ID
app.get("/users/:id", async (req, res) => {
  try {
    const db = client.db(dbName);
    const users = db.collection(collectionName);
    const result = await users.findOne({ _id: new ObjectId(req.params.id) });

    if (!result) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user
app.put("/users/:id", async (req, res) => {
  try {
    const db = client.db(dbName);
    const users = db.collection(collectionName);
    const result = await users.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user
app.delete("/users/:id", async (req, res) => {
  try {
    const db = client.db(dbName);
    const users = db.collection(collectionName);
    const result = await users.deleteOne({ _id: new ObjectId(req.params.id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to check DB connection
app.get("/check-db-connection", async (req, res) => {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const count = await collection.countDocuments();
    console.log("Number of documents:", count);

    // Send success response
    res
      .status(200)
      .json({
        status: "success",
        message: "Database is connected",
        documentCount: count,
      });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    // Send error response
    res
      .status(500)
      .json({
        status: "error",
        message: "Failed to connect to the database",
        error: error.message,
      });
  }
});

// API endpoint for parsing React components
app.post("/api/parse", (req, res) => {
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
    message: "React Component Parser API",
    usage: {
      endpoint: "/api/parse",
      method: "POST",
      body: {
        code: "Your React component code as a string",
      },
    },
  });
});

// Start the server
connectToMongo().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Parse API available at http://localhost:${PORT}/api/parse`);
    console.log(`Check DB connection at http://localhost:${PORT}/check-db-connection`)
  });
});

// Handle application shutdown
process.on("SIGINT", async () => {
  await client.close();
  process.exit(0);
});
