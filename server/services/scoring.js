/**
 * Scoring engine - runs server-side only, never in the browser.
 *
 * Only MATURITY questions are scored:
 *   control_area_score = SUM(level × question_weight) / SUM(5 × question_weight) × 5
 *
 * Level 0 (N/A) answers and information (free-text) answers are EXCLUDED so
 * an organisation is never penalised for questions that do not apply or for
 * discovery detail. A control area answered entirely N/A is omitted.
 *
 * Maturity labels follow the vSecure maturity framework:
 *   1 Initial · 2 Repeatable · 3 Defined · 4 Managed · 5 Optimised
 * Risk tiers follow the report legend: Critical (≤1) · High (≤2) ·
 * Medium (≤3) · Low (>3).
 */
const pool = require('../db/pool');

const SCORING_QUERY = `
  SELECT
    d.id,
    d.name,
    d.slug,
    d.icon,
    d.domain_weight,
    d.domain_type,
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
  WHERE a.session_id = ?
    AND q.question_type = 'maturity'
    AND a.level_selected IS NOT NULL
    AND a.level_selected > 0
  GROUP BY d.id, d.name, d.slug, d.icon, d.domain_weight, d.domain_type, d.vsecure_capability
  ORDER BY domain_score ASC
`;

// Overall score = weighted average of control-area scores (weights default 1,
// giving the simple average used in the reference reports).
function calculateOverallScore(domainScores) {
  if (!domainScores.length) return 0;
  const totalWeight = domainScores.reduce((sum, d) => sum + d.domain_weight, 0);
  const weightedSum = domainScores.reduce(
    (sum, d) => sum + d.domain_score * d.domain_weight,
    0
  );
  return Math.round((weightedSum / totalWeight) * 100) / 100;
}

// Critical gaps = bottom 3 control areas by score.
function getCriticalGaps(domainScores) {
  return [...domainScores]
    .sort((a, b) => a.domain_score - b.domain_score)
    .slice(0, 3);
}

// Risk tier for a 0–5 score: Critical (≤1), High (≤2), Medium (≤3), Low (>3).
function riskLevel(score) {
  if (score <= 1) return 'Critical';
  if (score <= 2) return 'High';
  if (score <= 3) return 'Medium';
  return 'Low';
}

// Risk tier of a single question answer (level 1–5).
function questionRisk(level) {
  if (level <= 1) return 'Critical';
  if (level === 2) return 'High';
  if (level === 3) return 'Medium';
  return 'Low';
}

// Maturity label bands per the vSecure framework / reference report
// (2.5 → Repeatable, 3.0 → Defined, 3.5 → Managed).
function maturityLabel(score) {
  if (score < 2) return 'Initial';
  if (score < 3) return 'Repeatable';
  if (score < 3.5) return 'Defined';
  if (score < 4.5) return 'Managed';
  return 'Optimised';
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
  questionRisk,
  maturityLabel,
};
