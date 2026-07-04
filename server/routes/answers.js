const express = require('express');
const pool = require('../db/pool');
const { findSessionByToken } = require('./sessions');

const router = express.Router();

// POST /api/answers — auto-save a single answer the moment a level is picked.
// Upserts, so changing an answer overwrites the previous level.
router.post('/', async (req, res, next) => {
  try {
    const { token, question_id, level } = req.body || {};
    const levelNum = Number(level);

    if (!token || !question_id || !Number.isInteger(levelNum) || levelNum < 0 || levelNum > 5) {
      return res.status(400).json({ error: 'token, question_id and level (0–5) are required' });
    }

    const session = await findSessionByToken(token);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.completed_at) {
      return res.status(409).json({ error: 'Assessment already submitted' });
    }

    // The question must exist and belong to this session's assessment type.
    const [qRows] = await pool.execute(
      `SELECT q.id FROM questions q JOIN domains d ON q.domain_id = d.id
       WHERE q.id = ? ${session.assessment_type === 'overall' ? '' : 'AND d.domain_type = ?'}`,
      session.assessment_type === 'overall'
        ? [question_id]
        : [question_id, session.assessment_type]
    );
    if (!qRows.length) {
      return res.status(400).json({ error: 'Question not part of this assessment' });
    }

    await pool.execute(
      `INSERT INTO answers (session_id, question_id, level_selected)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE level_selected = VALUES(level_selected), answered_at = NOW()`,
      [session.id, question_id, levelNum]
    );

    res.json({ saved: true, question_id, level: levelNum });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
