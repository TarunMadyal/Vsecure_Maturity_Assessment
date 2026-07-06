const express = require('express');
const pool = require('../db/pool');
const { findSessionByToken } = require('./sessions');

const router = express.Router();

// POST /api/answers — auto-save a single answer the moment it is given.
// Maturity questions send { token, question_id, level: 0–5 }.
// Information questions send { token, question_id, text: "…" }.
// Upserts, so changing an answer overwrites the previous one.
router.post('/', async (req, res, next) => {
  try {
    const { token, question_id, level, text } = req.body || {};
    if (!token || !question_id) {
      return res.status(400).json({ error: 'token and question_id are required' });
    }

    const session = await findSessionByToken(token);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.completed_at) {
      return res.status(409).json({ error: 'Assessment already submitted' });
    }

    // The question must exist and belong to this session's assessment area.
    const [qRows] = await pool.execute(
      `SELECT q.id, q.question_type FROM questions q JOIN domains d ON q.domain_id = d.id
       WHERE q.id = ? ${session.assessment_type === 'overall' ? '' : 'AND d.domain_type = ?'}`,
      session.assessment_type === 'overall'
        ? [question_id]
        : [question_id, session.assessment_type]
    );
    if (!qRows.length) {
      return res.status(400).json({ error: 'Question not part of this assessment' });
    }
    const question = qRows[0];

    if (question.question_type === 'maturity') {
      const levelNum = Number(level);
      if (!Number.isInteger(levelNum) || levelNum < 0 || levelNum > 5) {
        return res.status(400).json({ error: 'level (0–5) is required for maturity questions' });
      }
      await pool.execute(
        `INSERT INTO answers (session_id, question_id, level_selected, answer_text)
         VALUES (?, ?, ?, NULL)
         ON DUPLICATE KEY UPDATE level_selected = VALUES(level_selected),
                                 answer_text = NULL, answered_at = NOW()`,
        [session.id, question_id, levelNum]
      );
      return res.json({ saved: true, question_id, level: levelNum });
    }

    // Information question: free text (empty text clears the answer).
    if (typeof text !== 'string') {
      return res.status(400).json({ error: 'text is required for information questions' });
    }
    const trimmed = text.trim().slice(0, 10000);
    if (!trimmed) {
      await pool.execute(
        'DELETE FROM answers WHERE session_id = ? AND question_id = ?',
        [session.id, question_id]
      );
      return res.json({ saved: true, question_id, cleared: true });
    }
    await pool.execute(
      `INSERT INTO answers (session_id, question_id, level_selected, answer_text)
       VALUES (?, ?, NULL, ?)
       ON DUPLICATE KEY UPDATE answer_text = VALUES(answer_text),
                               level_selected = NULL, answered_at = NOW()`,
      [session.id, question_id, trimmed]
    );
    res.json({ saved: true, question_id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
