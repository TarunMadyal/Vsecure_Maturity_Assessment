// Presentation constants only - no assessment content lives here.

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
