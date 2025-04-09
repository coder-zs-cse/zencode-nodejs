const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const parseReactComponent = require("./main");

const app = express();
const PORT = process.env.PORT || 4000;

const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:8000'],
  credentials: true,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));

// Construct MongoDB URI with database name
const MONGODB_URI = process.env.MONGODB_URI

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    console.log('Current database:', mongoose.connection.db.databaseName);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Monitor database connection
mongoose.connection.on('connected', () => {
  console.log(`Mongoose connected to ${process.env.DB_NAME}`);
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

// Import route handlers
const componentsRouter = require('./routes/components');
const githubRouter = require('./routes/github');
const usersRouter = require('./routes/users');
const sessionsRouter = require('./routes/sessions');

// Routes
app.use('/api/components', componentsRouter);
app.use('/api/github', githubRouter);
app.use('/api/users', usersRouter);
app.use('/api/sessions', sessionsRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// API base path
const API_BASE = "/api";

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
        `${API_BASE}/:collection - DELETE: Delete one document`,
      ],
    },
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle application shutdown
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  process.exit(0);
});
