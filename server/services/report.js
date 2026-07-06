/**
 * Report builder - assembles the full assessment report payload, mirroring
 * the vSecure reference report structure:
 *   title/score → executive summary → scope & current state → maturity
 *   footprint (current vs proposed vs maximum) → risk distribution →
 *   observations & remediations → framework coverage → improvement roadmap →
 *   detailed remediation actions → current environment understanding.
 *
 * Runs server-side only. All narrative content comes from
 * services/recommendations.js keyed by control-area slug.
 */
const pool = require('../db/pool');
const { riskLevel, questionRisk, maturityLabel } = require('./scoring');
const { contentFor, reasonFor, benchmark, goalsFor, typeName } = require('./recommendations');

const parseJson = (v) => (typeof v === 'string' ? JSON.parse(v) : v || []);
const round1 = (n) => Math.round(n * 10) / 10;
const stripParen = (s) => s.replace(/\s*\(.*\)$/, '');

const ROADMAP_PHASES = [
  { title: 'Month 1', subtitle: 'Quick Wins' },
  { title: 'Month 2', subtitle: 'Early Actions' },
  { title: 'Month 3', subtitle: 'Mid-Term' },
  { title: 'Month 4–6', subtitle: 'Medium Term' },
  { title: 'Month 7–9', subtitle: 'Extended' },
  { title: 'Month 10–12', subtitle: 'Strategic' },
];

async function answerDetail(sessionId) {
  const [rows] = await pool.execute(
    `SELECT q.id, q.question_text, q.question_type, q.sub_category,
            q.nist_reference, q.cis_reference,
            a.level_selected, a.answer_text,
            d.id AS domain_id, d.name AS domain_name, d.slug AS domain_slug
     FROM answers a
     JOIN questions q ON a.question_id = q.id
     JOIN domains d ON q.domain_id = d.id
     WHERE a.session_id = ?
     ORDER BY d.sort_order, q.sort_order`,
    [sessionId]
  );
  return rows;
}

function buildRiskDistribution(maturityAnswers, areas) {
  const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  const tierAreas = { Critical: new Set(), High: new Set(), Medium: new Set(), Low: new Set() };
  for (const a of maturityAnswers) {
    const tier = questionRisk(a.level_selected);
    counts[tier] += 1;
    tierAreas[tier].add(a.domain_name);
  }
  // Keep tier area lists in report order.
  const order = areas.map((d) => d.name);
  const sortByOrder = (set) => [...set].sort((x, y) => order.indexOf(x) - order.indexOf(y));
  return {
    counts,
    tiers: {
      Critical: sortByOrder(tierAreas.Critical),
      High: sortByOrder(tierAreas.High),
      Medium: sortByOrder(tierAreas.Medium),
      Low: sortByOrder(tierAreas.Low),
    },
  };
}

function buildCoverage(maturityAnswers) {
  const band = (lvl) => (lvl >= 4 ? 'covered' : lvl >= 2 ? 'partial' : 'not_covered');
  const total = maturityAnswers.length;
  const tally = { covered: 0, partial: 0, not_covered: 0 };
  const frameworks = {
    'NIST SP 800-53': { covered: 0, total: 0 },
    'CIS Controls v8': { covered: 0, total: 0 },
  };
  for (const a of maturityAnswers) {
    tally[band(a.level_selected)] += 1;
    if (a.nist_reference) {
      frameworks['NIST SP 800-53'].total += 1;
      if (a.level_selected >= 4) frameworks['NIST SP 800-53'].covered += 1;
    }
    if (a.cis_reference) {
      frameworks['CIS Controls v8'].total += 1;
      if (a.level_selected >= 4) frameworks['CIS Controls v8'].covered += 1;
    }
  }
  return {
    total,
    ...tally,
    pct: total ? Math.round((tally.covered / total) * 100) : 0,
    frameworks: Object.entries(frameworks)
      .filter(([, v]) => v.total > 0)
      .map(([name, v]) => ({ name, ...v })),
  };
}

function buildRoadmap(areas) {
  // P1 (risk-driven) lands in Month 1–2; P2 (strategic) in Month 3–6.
  const items = areas.map((area, i) => {
    const c = contentFor(area.slug, area.name);
    const p1Phase = area.risk === 'Critical' || area.risk === 'High' ? 1 : 0;
    const p2Phase = i % 2 === 0 ? 2 : 3;
    return {
      area: area.name,
      slug: area.slug,
      risk: area.risk,
      p1: { action: c.quick_win, phase: p1Phase },
      p2: { action: c.strategic, phase: p2Phase },
    };
  });
  return { phases: ROADMAP_PHASES, items };
}

function buildDetailedActions(areas) {
  const worstFirst = [...areas].sort((a, b) => a.score - b.score);
  const below4 = worstFirst.filter((a) => a.score < 4);
  return {
    quick_wins: below4.slice(0, 5).map((a) => ({
      area: a.name,
      action: contentFor(a.slug, a.name).quick_win,
    })),
    medium_term: below4.slice(0, 5).map((a) => ({
      area: a.name,
      action: contentFor(a.slug, a.name).remediation[1] || contentFor(a.slug, a.name).strategic,
    })),
    strategic: worstFirst.slice(0, 4).map((a) => ({
      area: a.name,
      action: contentFor(a.slug, a.name).strategic,
    })),
  };
}

function buildExecutiveSummary(session, areas, overall, targetScore) {
  const positives = areas
    .filter((a) => a.score >= 3.5)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((a) => contentFor(a.slug, a.name).positive);

  const weak = areas.filter((a) => a.score < 3.5).sort((a, b) => a.score - b.score);
  const observations = weak.slice(0, 6).map((a) => contentFor(a.slug, a.name).observation);
  const impacts = weak.slice(0, 6).map((a) => contentFor(a.slug, a.name).impact);

  const industry = session.industry || 'industry';
  const position = overall >= 3.2 ? 'Above average' : overall >= 2.8 ? 'In line with average' : 'Below average';
  const benchmark_statement = `${position} (${overall.toFixed(2)}) ${session.assessment_type === 'overall' ? 'IAM' : session.assessment_type} maturity amongst ${industry} organisations`;

  return {
    goals: goalsFor(session.assessment_type),
    key_positives: positives,
    key_observations: observations,
    business_impact: impacts,
    benchmark_statement,
    quick_wins: weak.slice(0, 4).map((a) => contentFor(a.slug, a.name).quick_win),
    strategic_improvements: weak.slice(0, 3).map((a) => contentFor(a.slug, a.name).strategic),
    business_benefits: [
      `Advances the organisation from ${overall.toFixed(2)} '${maturityLabel(overall)}' to ${targetScore.toFixed(1)} '${maturityLabel(targetScore)}' posture.`,
      'Reduces credential-based breach probability through layered identity controls.',
      'Strengthens compliance evidence for UK GDPR and sector regulations.',
      'Lowers operational cost by consolidating fragmented identity tooling.',
    ],
  };
}

async function buildResultsPayload(session) {
  const stored = parseJson(session.domain_scores);
  const answers = await answerDetail(session.id);
  const maturityAnswers = answers.filter(
    (a) => a.question_type === 'maturity' && a.level_selected !== null && a.level_selected > 0
  );
  const infoAnswers = answers.filter(
    (a) => a.question_type === 'information' && a.answer_text && a.answer_text.trim()
  );

  const overall = Number(session.overall_score);
  const targetScore = Math.min(5, round1(overall + 1));

  const areas = stored.map((d) => {
    const score = Number(d.domain_score);
    return {
      id: d.id,
      name: d.name,
      short_name: stripParen(d.name),
      slug: d.slug,
      icon: d.icon,
      area_type: d.domain_type,
      capability: d.vsecure_capability,
      score,
      label: maturityLabel(score),
      risk: riskLevel(score),
      benchmark: benchmark(d.slug),
      reason: reasonFor(d.slug, d.name, score),
    };
  });
  // Report order: keep seed order (stored is sorted by score asc from the engine).
  areas.sort((a, b) => a.id - b.id);

  const weakFirst = [...areas].sort((a, b) => a.score - b.score);
  const observations = weakFirst
    .filter((a) => a.score < 4)
    .map((a) => {
      const c = contentFor(a.slug, a.name);
      return {
        area: a.name,
        slug: a.slug,
        risk: a.risk,
        observation: c.observation,
        remediation: c.remediation,
        duration: c.duration || '6 months',
      };
    });

  const environment = [];
  for (const a of areas) {
    const items = infoAnswers
      .filter((ia) => ia.domain_slug === a.slug)
      .map((ia) => ({
        sub_category: ia.sub_category,
        question: ia.question_text,
        answer: ia.answer_text,
      }));
    if (items.length) environment.push({ area: a.name, slug: a.slug, items });
  }

  return {
    session: {
      token: session.session_token,
      company_name: session.company_name,
      contact_name: session.contact_name,
      assessment_type: session.assessment_type,
      assessment_type_name: typeName(session.assessment_type),
      industry: session.industry,
      region: session.region,
      completed_at: session.completed_at,
    },
    overall_score: overall,
    maturity_label: maturityLabel(overall),
    risk: riskLevel(overall),
    target_score: targetScore,
    engagement: {
      sections_assessed: areas.length,
      questions_answered: maturityAnswers.length,
      text_responses: infoAnswers.length,
    },
    control_areas: areas,
    executive_summary: buildExecutiveSummary(session, areas, overall, targetScore),
    footprint: areas.map((a) => ({
      name: a.short_name,
      current: a.score,
      proposed: Math.min(5, round1(a.score + 1)),
      maximum: 5,
    })),
    risk_distribution: buildRiskDistribution(maturityAnswers, areas),
    observations,
    coverage: buildCoverage(maturityAnswers),
    roadmap: buildRoadmap(areas),
    detailed_actions: buildDetailedActions(areas),
    environment,
    critical_gaps: parseJson(session.critical_gaps).map((g) => ({
      name: g.name,
      slug: g.slug,
      score: Number(g.domain_score),
      risk: riskLevel(Number(g.domain_score)),
      capability: g.vsecure_capability,
    })),
  };
}

module.exports = { buildResultsPayload };
