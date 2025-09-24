const express = require('express');
const app = express();
const PORT = 8080;

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Minimal server is running' });
});

app.listen(PORT, () => {
  console.log(`Minimal server running on http://localhost:${PORT}`);
});
