// Presentation constants only — no question or domain content lives here.

export const LEVEL_COLORS = {
  0: '#888780',
  1: '#E24B4A',
  2: '#EF9F27',
  3: '#378ADD',
  4: '#1D9E75',
  5: '#0F6E56',
};

export const LEVEL_NAMES = {
  0: 'N/A',
  1: 'Initial',
  2: 'Managed',
  3: 'Defined',
  4: 'Quantified',
  5: 'Optimising',
};

export const RISK_COLORS = {
  Critical: '#E24B4A',
  High: '#EF9F27',
  Medium: '#378ADD',
  Low: '#1D9E75',
};

// Red / amber / green banding for score bars.
export function scoreColor(score) {
  if (score < 2.5) return '#E24B4A';
  if (score < 3.5) return '#EF9F27';
  return '#1D9E75';
}
