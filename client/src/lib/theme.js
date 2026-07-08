// Presentation constants only - no assessment content lives here.

// Display names for the four IAM areas that group the control areas.
export const AREA_NAMES = {
  IGA: 'Identity Governance & Administration',
  PAM: 'Privileged Access Management',
  WAM: 'Web Access Management',
  CIAM: 'Customer Identity & Access Management',
};

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
