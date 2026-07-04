/**
 * Scoring engine — runs server-side only, never in the browser.
 *
 * Domain score = weighted average of answered levels, normalised to /5:
 *   SUM(level * question_weight) / SUM(5 * question_weight) * 5
 *
 * Level 0 (N/A — not applicable) answers are EXCLUDED from scoring so an
 * organisation is never penalised for questions that do not apply to it.
 * A domain where every answer is N/A is left out of the results entirely.
 */
const pool = require('../db/pool');

const SCORING_QUERY = `
  SELECT
    d.id,
    d.name,
    d.slug,
    d.icon,
    d.domain_weight,
    d.vsecure_capability,
    ROUND(
      SUM(a.level_selected * q.question_weight) /
      SUM(5 * q.question_weight) * 5, 2
    ) AS domain_score,
    SUM(a.level_selected * q.question_weight) AS earned,
    SUM(5 * q.question_weight) AS max_possible
  FROM answers a
  JOIN questions q ON a.question_id = q.id
  JOIN domains d ON q.domain_id = d.id
  WHERE a.session_id = ? AND a.level_selected > 0
  GROUP BY d.id, d.name, d.slug, d.icon, d.domain_weight, d.vsecure_capability
  ORDER BY domain_score ASC
`;

// Overall score = weighted average of domain scores.
function calculateOverallScore(domainScores) {
  if (!domainScores.length) return 0;
  const totalWeight = domainScores.reduce((sum, d) => sum + d.domain_weight, 0);
  const weightedSum = domainScores.reduce(
    (sum, d) => sum + d.domain_score * d.domain_weight,
    0
  );
  return Math.round((weightedSum / totalWeight) * 100) / 100;
}

// Critical gaps = bottom 3 domains by score.
function getCriticalGaps(domainScores) {
  return [...domainScores]
    .sort((a, b) => a.domain_score - b.domain_score)
    .slice(0, 3);
}

function riskLevel(score) {
  if (score < 1.5) return 'Critical';
  if (score < 2.5) return 'High';
  if (score < 3.5) return 'Medium';
  return 'Low';
}

function maturityLabel(score) {
  if (score < 1.5) return 'Initial';
  if (score < 2.5) return 'Managed';
  if (score < 3.5) return 'Defined';
  if (score < 4.5) return 'Quantified';
  return 'Optimising';
}

async function scoreSession(sessionId) {
  const [rows] = await pool.execute(SCORING_QUERY, [sessionId]);
  const domainScores = rows.map((r) => ({
    ...r,
    domain_score: Number(r.domain_score),
    earned: Number(r.earned),
    max_possible: Number(r.max_possible),
  }));
  const overallScore = calculateOverallScore(domainScores);
  const criticalGaps = getCriticalGaps(domainScores);
  return { domainScores, overallScore, criticalGaps };
}

module.exports = {
  scoreSession,
  calculateOverallScore,
  getCriticalGaps,
  riskLevel,
  maturityLabel,
};
