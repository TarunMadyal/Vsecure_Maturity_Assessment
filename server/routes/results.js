const express = require('express');
const { findSessionByToken } = require('./sessions');
const { buildResultsPayload } = require('../services/report');

const router = express.Router();

// GET /api/results/:token — full report payload for the results page and PDF.
router.get('/:token', async (req, res, next) => {
  try {
    const session = await findSessionByToken(req.params.token);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (!session.completed_at) {
      return res.status(409).json({ error: 'Assessment not yet submitted' });
    }
    res.json(await buildResultsPayload(session));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
