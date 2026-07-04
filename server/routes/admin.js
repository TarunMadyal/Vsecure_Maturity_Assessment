const express = require('express');
const pool = require('../db/pool');
const { findSessionByToken } = require('./sessions');
const { buildResultsPayload } = require('./results');
const { riskLevel } = require('../services/scoring');

const router = express.Router();

// Password protection: HTTP Basic auth against ADMIN_PASSWORD (user "admin").
function requireAdmin(req, res, next) {
  const configured = process.env.ADMIN_PASSWORD;
  if (!configured) {
    return res.status(503).json({ error: 'Admin access disabled: ADMIN_PASSWORD is not set' });
  }
  const header = req.headers.authorization || '';
  const [scheme, encoded] = header.split(' ');
  if (scheme === 'Basic' && encoded) {
    const [, password] = Buffer.from(encoded, 'base64').toString().split(':');
    if (password === configured) return next();
  }
  res.set('WWW-Authenticate', 'Basic realm="vSecure Admin"');
  res.status(401).json({ error: 'Unauthorised' });
}

router.use(requireAdmin);

// GET /api/admin/sessions — all assessments, newest first.
router.get('/sessions', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.session_token, s.company_name, s.contact_name, s.contact_email,
              s.contact_role, s.company_size, s.industry, s.assessment_type,
              s.started_at, s.completed_at, s.overall_score,
              (SELECT COUNT(*) FROM answers a WHERE a.session_id = s.id) AS answers_count
       FROM assessment_sessions s
       ORDER BY s.created_at DESC`
    );
    res.json({
      sessions: rows.map((r) => ({
        ...r,
        overall_score: r.overall_score === null ? null : Number(r.overall_score),
        risk: r.overall_score === null ? null : riskLevel(Number(r.overall_score)),
      })),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/sessions/:token — full report payload for one assessment.
router.get('/sessions/:token', async (req, res, next) => {
  try {
    const session = await findSessionByToken(req.params.token);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (!session.completed_at) {
      return res.status(409).json({ error: 'Assessment not yet completed' });
    }
    res.json({
      ...buildResultsPayload(session),
      contact: {
        email: session.contact_email,
        role: session.contact_role,
        company_size: session.company_size,
        industry: session.industry,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/stats — aggregate intelligence: average domain scores
// across all completed assessments.
router.get('/stats', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT d.name, d.slug,
              ROUND(SUM(a.level_selected * q.question_weight) /
                    SUM(5 * q.question_weight) * 5, 2) AS avg_score,
              COUNT(DISTINCT a.session_id) AS companies
       FROM answers a
       JOIN questions q ON a.question_id = q.id
       JOIN domains d ON q.domain_id = d.id
       JOIN assessment_sessions s ON a.session_id = s.id
       WHERE s.completed_at IS NOT NULL AND a.level_selected > 0
       GROUP BY d.id, d.name, d.slug
       ORDER BY avg_score ASC`
    );
    const [[totals]] = await pool.query(
      `SELECT COUNT(*) AS total,
              SUM(completed_at IS NOT NULL) AS completed,
              ROUND(AVG(overall_score), 2) AS avg_overall
       FROM assessment_sessions`
    );
    res.json({
      domains: rows.map((r) => ({ ...r, avg_score: Number(r.avg_score) })),
      totals: {
        total: Number(totals.total),
        completed: Number(totals.completed || 0),
        avg_overall: totals.avg_overall === null ? null : Number(totals.avg_overall),
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/export — CSV of all assessments.
router.get('/export', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT company_name, contact_name, contact_email, contact_role, company_size,
              industry, assessment_type, started_at, completed_at, overall_score, session_token
       FROM assessment_sessions ORDER BY created_at DESC`
    );
    const header = [
      'Company', 'Contact', 'Email', 'Role', 'Company size', 'Industry',
      'Assessment type', 'Started', 'Completed', 'Overall score', 'Session token',
    ];
    const esc = (v) => {
      if (v === null || v === undefined) return '';
      const s = v instanceof Date ? v.toISOString() : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = [header.join(',')]
      .concat(rows.map((r) => [
        r.company_name, r.contact_name, r.contact_email, r.contact_role, r.company_size,
        r.industry, r.assessment_type, r.started_at, r.completed_at, r.overall_score, r.session_token,
      ].map(esc).join(',')))
      .join('\n');

    res.set('Content-Type', 'text/csv; charset=utf-8');
    res.set('Content-Disposition', 'attachment; filename="vsecure-assessments.csv"');
    res.send(csv);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
