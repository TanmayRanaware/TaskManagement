const express = require('express');
const app = express();
const PORT = 8080;

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Task Management API', 
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      api: '/api/v1'
    }
  });
});

// Health endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Basic server is running' });
});

// API v1 endpoint
app.get('/api/v1', (req, res) => {
  res.json({ 
    message: 'Task Management API v1',
    version: '1.0.0',
    status: 'active',
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      projects: '/api/v1/projects',
      tasks: '/api/v1/tasks',
      comments: '/api/v1/comments'
    }
  });
});

app.listen(PORT, () => {
  console.log(`Basic server running on http://localhost:${PORT}`);
  console.log(`Available endpoints:`);
  console.log(`  - http://localhost:${PORT}/`);
  console.log(`  - http://localhost:${PORT}/health`);
  console.log(`  - http://localhost:${PORT}/api/v1`);
});
