const express = require('express');
const { findSessionByToken } = require('./sessions');
const { riskLevel, maturityLabel } = require('../services/scoring');
const { gapExplanation, benchmark, buildRoadmap } = require('../services/recommendations');

const router = express.Router();

const parseJson = (v) => (typeof v === 'string' ? JSON.parse(v) : v || []);

// Assembles the full report payload from the scores stored at submit time.
function buildResultsPayload(session) {
  const domainScores = parseJson(session.domain_scores).map((d) => ({
    ...d,
    benchmark: benchmark(d.slug),
    risk: riskLevel(d.domain_score),
  }));
  const criticalGaps = parseJson(session.critical_gaps).map((g) => ({
    ...g,
    risk: riskLevel(g.domain_score),
    explanation: gapExplanation(g.slug),
    vsecure_capability: g.vsecure_capability,
  }));
  const overall = Number(session.overall_score);

  return {
    session: {
      token: session.session_token,
      company_name: session.company_name,
      contact_name: session.contact_name,
      assessment_type: session.assessment_type,
      completed_at: session.completed_at,
    },
    overall_score: overall,
    risk: riskLevel(overall),
    maturity_label: maturityLabel(overall),
    domain_scores: domainScores,
    critical_gaps: criticalGaps,
    roadmap: buildRoadmap(criticalGaps),
  };
}

// GET /api/results/:token — full scored results for the report page.
router.get('/:token', async (req, res, next) => {
  try {
    const session = await findSessionByToken(req.params.token);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (!session.completed_at) {
      return res.status(409).json({ error: 'Assessment not yet submitted' });
    }
    res.json(buildResultsPayload(session));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
module.exports.buildResultsPayload = buildResultsPayload;
