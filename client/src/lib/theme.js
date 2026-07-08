// Presentation constants only - no assessment content lives here.

// Display names for the four IAM areas that group the control areas.
export const AREA_NAMES = {
  IGA: 'Identity Governance & Administration',
  PAM: 'Privileged Access Management',
  WAM: 'Web Access Management',
  CIAM: 'Customer Identity & Access Management',
};

// Subtle per-domain accent so each IAM area reads as its own colour family
// without shouting. `accent` drives icons/text/borders, `soft` is a low-alpha
// wash for backgrounds, `ring` a slightly stronger border tint. All chosen to
// sit calmly on the near-black navy background.
export const AREA_THEMES = {
  IGA:  { accent: '#5b8bff', soft: 'rgba(91,139,255,0.10)',  ring: 'rgba(91,139,255,0.40)'  },
  PAM:  { accent: '#a78bfa', soft: 'rgba(167,139,250,0.10)', ring: 'rgba(167,139,250,0.40)' },
  WAM:  { accent: '#2dd4bf', soft: 'rgba(45,212,191,0.10)',  ring: 'rgba(45,212,191,0.40)'  },
  CIAM: { accent: '#f2a65a', soft: 'rgba(242,166,90,0.10)',  ring: 'rgba(242,166,90,0.40)'  },
};

// One distinctive glyph per IAM domain, used on the assessment-picker so each
// domain reads as its own thing (rather than repeating a control area's icon).
export const DOMAIN_ICONS = {
  IGA: 'users',
  PAM: 'key',
  WAM: 'globe',
  CIAM: 'user-check',
};

const DEFAULT_AREA_THEME = {
  accent: '#3b6bff',
  soft: 'rgba(59,107,255,0.10)',
  ring: 'rgba(59,107,255,0.40)',
};

// Theme for a control-area type; falls back to the brand blue for anything
// outside the four known IAM areas (e.g. single-domain custom sets).
export function areaTheme(type) {
  return AREA_THEMES[type] || DEFAULT_AREA_THEME;
}

// Groups a list of items carrying an `area_type` field into ordered
// [{ type, name, items }] buckets, preserving item order.
export function groupByAreaType(items, getType = (x) => x.area_type) {
  const groups = [];
  const byType = new Map();
  for (const item of items) {
    const type = getType(item);
    if (!byType.has(type)) {
      const g = { type, name: AREA_NAMES[type] || type, items: [] };
      byType.set(type, g);
      groups.push(g);
    }
    byType.get(type).items.push(item);
  }
  return groups;
}

export const LEVEL_COLORS = {
  0: '#888780',
  1: '#E24B4A',
  2: '#EF9F27',
  3: '#378ADD',
  4: '#1D9E75',
  5: '#0F6E56',
};

// vSecure maturity framework level names.
export const LEVEL_NAMES = {
  0: 'N/A',
  1: 'Initial',
  2: 'Repeatable',
  3: 'Defined',
  4: 'Managed',
  5: 'Optimised',
};

// One-line plain-English meaning per level, shown as an always-visible
// reference so raters never have to guess what a level means.
export const LEVEL_MEANINGS = {
  1: 'Ad-hoc and inconsistent - no formal process',
  2: 'Some processes exist but are not standardised',
  3: 'Documented, standardised and applied across teams',
  4: 'Measured, monitored and actively controlled',
  5: 'Continuously improved and largely automated',
  0: "This control doesn't apply to your organisation",
};

export const RISK_COLORS = {
  Critical: '#E24B4A',
  High: '#EF9F27',
  Medium: '#378ADD',
  Low: '#1D9E75',
};

// Red / amber / green banding for score bars (per the reference report:
// ≥3.5 green, 2–3.4 amber, <2 red).
export function scoreColor(score) {
  if (score < 2) return '#E24B4A';
  if (score < 3.5) return '#EF9F27';
  return '#1D9E75';
}
