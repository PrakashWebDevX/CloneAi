const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// Pure in-memory store — no MongoDB needed
let inMemoryStore = {};

// GET /api/personalities?sessionId=xxx
router.get('/', (req, res) => {
  const { sessionId } = req.query;
  if (!sessionId) return res.status(400).json({ error: 'sessionId required' });
  const list = Object.values(inMemoryStore).filter(p => p.sessionId === sessionId);
  res.json({ personalities: list });
});

// POST /api/personalities
router.post('/', (req, res) => {
  const { sessionId, personality } = req.body;
  if (!sessionId || !personality?.name) {
    return res.status(400).json({ error: 'sessionId and personality.name required' });
  }
  const doc = { ...personality, id: uuidv4(), sessionId, createdAt: new Date().toISOString() };
  inMemoryStore[doc.id] = doc;
  res.json({ personality: doc });
});

// DELETE /api/personalities/:id
router.delete('/:id', (req, res) => {
  delete inMemoryStore[req.params.id];
  res.json({ success: true });
});

// PUT /api/personalities/:id
router.put('/:id', (req, res) => {
  const { id } = req.params;
  if (!inMemoryStore[id]) return res.status(404).json({ error: 'Not found' });
  inMemoryStore[id] = { ...inMemoryStore[id], ...req.body };
  res.json({ personality: inMemoryStore[id] });
});

module.exports = router;