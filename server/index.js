import express from 'express';
import { resolve } from 'node:path';
import { errorHandler } from './middleware/errorHandler.js';
import { getDb } from './db/index.js';

const app = express();
const PORT = process.env.PORT || 3001;

// CORS
app.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// JSON body parsing
app.use(express.json());

// Static serving for built client
app.use(express.static(resolve('client', 'dist')));

// API routes will be mounted here in later tasks

// Error handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  getDb();
  console.log(`Server listening on http://localhost:${PORT}`);
});
