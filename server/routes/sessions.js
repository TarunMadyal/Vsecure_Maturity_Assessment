const express = require('express');
const crypto = require('crypto');
const pool = require('../db/pool');
const { scoreSession, riskLevel } = require('../services/scoring');
const { sendRegistrationEmails, sendCompletionEmails } = require('../services/email');

const router = express.Router();

const ASSESSMENT_TYPES = ['overall', 'IGA', 'PAM', 'WAM', 'CIAM'];
const COMPANY_SIZES = ['1-50', '51-200', '201-1000', '1000+'];

async function findSessionByToken(token) {
  const [rows] = await pool.execute(
    'SELECT * FROM assessment_sessions WHERE session_token = ?',
    [token]
  );
  return rows[0] || null;
}

// Questions visible to a session: all domains for "overall", otherwise only
// domains whose domain_type matches the chosen assessment type.
async function questionsForType(assessmentType) {
  const domainFilter = assessmentType === 'overall' ? '' : 'WHERE d.domain_type = ?';
  const params = assessmentType === 'overall' ? [] : [assessmentType];
  const [rows] = await pool.execute(
    `SELECT q.id, q.domain_id, q.question_text, q.question_weight,
            q.nist_reference, q.cis_reference, q.csf_function,
            q.level_0_label, q.level_1_label, q.level_2_label, q.level_3_label,
            q.level_4_label, q.level_5_label, q.sort_order,
            d.name AS domain_name, d.slug AS domain_slug, d.description AS domain_description,
            d.domain_weight, d.icon AS domain_icon, d.sort_order AS domain_sort
     FROM questions q
     JOIN domains d ON q.domain_id = d.id
     ${domainFilter}
     ORDER BY d.sort_order, q.sort_order`,
    params
  );
  return rows;
}

function groupByDomain(questionRows) {
  const domains = [];
  const byId = new Map();
  for (const q of questionRows) {
    if (!byId.has(q.domain_id)) {
      const dom = {
        id: q.domain_id,
        name: q.domain_name,
        slug: q.domain_slug,
        description: q.domain_description,
        weight: q.domain_weight,
        icon: q.domain_icon,
        questions: [],
      };
      byId.set(q.domain_id, dom);
      domains.push(dom);
    }
    byId.get(q.domain_id).questions.push({
      id: q.id,
      text: q.question_text,
      weight: q.question_weight,
      nist_reference: q.nist_reference,
      cis_reference: q.cis_reference,
      csf_function: q.csf_function,
      levels: [
        q.level_0_label, q.level_1_label, q.level_2_label,
        q.level_3_label, q.level_4_label, q.level_5_label,
      ],
    });
  }
  return domains;
}

// POST /api/sessions — lead capture: create a session, email the team + user.
router.post('/', async (req, res, next) => {
  try {
    const {
      company_name, contact_name, contact_email, contact_role,
      company_size, industry, assessment_type,
    } = req.body || {};

    if (!company_name || !contact_name || !contact_email) {
      return res.status(400).json({ error: 'company_name, contact_name and contact_email are required' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact_email)) {
      return res.status(400).json({ error: 'contact_email is not a valid email address' });
    }
    const type = ASSESSMENT_TYPES.includes(assessment_type) ? assessment_type : 'overall';
    const size = COMPANY_SIZES.includes(company_size) ? company_size : null;

    const token = crypto.randomUUID();
    await pool.execute(
      `INSERT INTO assessment_sessions
         (company_name, contact_name, contact_email, contact_role, company_size, industry, assessment_type, session_token)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [company_name, contact_name, contact_email, contact_role || null, size, industry || null, type, token]
    );

    const session = await findSessionByToken(token);
    // Fire-and-forget: the lead email must not slow down the redirect.
    sendRegistrationEmails(session).catch((err) =>
      console.error('[email] registration emails failed:', err.message)
    );

    res.status(201).json({ token, assessment_type: type });
  } catch (err) {
    next(err);
  }
});

// GET /api/sessions/:token — session, its question set, and saved answers.
router.get('/:token', async (req, res, next) => {
  try {
    const session = await findSessionByToken(req.params.token);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const questionRows = await questionsForType(session.assessment_type);
    const [answerRows] = await pool.execute(
      'SELECT question_id, level_selected FROM answers WHERE session_id = ?',
      [session.id]
    );
    const answers = {};
    for (const a of answerRows) answers[a.question_id] = a.level_selected;

    res.json({
      session: {
        token: session.session_token,
        company_name: session.company_name,
        contact_name: session.contact_name,
        assessment_type: session.assessment_type,
        completed_at: session.completed_at,
      },
      domains: groupByDomain(questionRows),
      answers,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/sessions/:token/submit — run the scoring engine and store results.
router.post('/:token/submit', async (req, res, next) => {
  try {
    const session = await findSessionByToken(req.params.token);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.completed_at) {
      return res.json({ token: session.session_token, already_completed: true });
    }

    const questionRows = await questionsForType(session.assessment_type);
    const [[{ answered }]] = await pool.execute(
      `SELECT COUNT(*) AS answered FROM answers a
       JOIN questions q ON a.question_id = q.id
       ${session.assessment_type === 'overall' ? '' : 'JOIN domains d ON q.domain_id = d.id AND d.domain_type = ?'}
       WHERE a.session_id = ?`,
      session.assessment_type === 'overall' ? [session.id] : [session.assessment_type, session.id]
    );
    if (Number(answered) < questionRows.length) {
      return res.status(400).json({
        error: `Assessment incomplete: ${answered} of ${questionRows.length} questions answered`,
      });
    }

    const results = await scoreSession(session.id);
    await pool.execute(
      `UPDATE assessment_sessions
       SET completed_at = NOW(), overall_score = ?, domain_scores = ?, critical_gaps = ?
       WHERE id = ?`,
      [
        results.overallScore,
        JSON.stringify(results.domainScores),
        JSON.stringify(results.criticalGaps),
        session.id,
      ]
    );

    sendCompletionEmails(session, results).catch((err) =>
      console.error('[email] completion emails failed:', err.message)
    );

    res.json({
      token: session.session_token,
      overall_score: results.overallScore,
      risk: riskLevel(results.overallScore),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
module.exports.findSessionByToken = findSessionByToken;
module.exports.questionsForType = questionsForType;
