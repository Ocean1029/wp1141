// Import required modules
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Diary Reflection API Server',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api',
      diaries: '/api/diaries (coming soon)',
      themes: '/api/themes (coming soon)',
      segments: '/api/segments (coming soon)'
    }
  });
});

// Basic health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend server is running' });
});

// API routes will be added here
app.get('/api', (req, res) => {
  res.json({ message: 'Diary Reflection API' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});

