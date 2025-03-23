const express = require('express');
const cors = require('cors');
const parseReactComponent = require('./main');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// API endpoint for parsing React components
app.post('/api/parse', (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ 
        error: 'Missing required parameter: code' 
      });
    }

    const result = parseReactComponent(code);
    
    if (!result) {
      return res.status(400).json({ 
        error: 'Failed to parse the React component' 
      });
    }

    return res.json(result);
  } catch (error) {
    console.error('Error parsing component:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
});

// Basic root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'React Component Parser API',
    usage: {
      endpoint: '/api/parse',
      method: 'POST',
      body: {
        code: 'Your React component code as a string'
      }
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/parse`);
}); 