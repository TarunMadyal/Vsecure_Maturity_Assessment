import { RISK_COLORS } from '../lib/theme';

const P2_COLOR = '#378ADD';

/**
 * Improvement roadmap grouped into the six reference-report phases
 * (Month 1 … Month 10–12). P1 actions are risk-coloured; P2 actions are the
 * strategic follow-ons.
 */
export default function RoadmapTimeline({ roadmap }) {
  const { phases, items } = roadmap;

  const byPhase = phases.map((phase, pi) => ({
    ...phase,
    entries: [
      ...items
        .filter((it) => it.p1.phase === pi)
        .map((it) => ({ ...it, priority: 'P1', action: it.p1.action, color: RISK_COLORS[it.risk] })),
      ...items
        .filter((it) => it.p2.phase === pi)
        .map((it) => ({ ...it, priority: 'P2', action: it.p2.action, color: P2_COLOR })),
    ],
  }));

  return (
    <div>
      <ol className="relative border-l border-edge ml-3 space-y-7">
        {byPhase.map((phase, i) =>
          phase.entries.length === 0 ? null : (
            <li key={phase.title} className="ml-6">
              <span className="absolute -left-3 flex w-6 h-6 items-center justify-center rounded-full bg-accent text-white text-xs font-bold">
                {i + 1}
              </span>
              <h4 className="text-ink font-semibold">
                {phase.title}
                <span className="ml-2 text-sm font-normal text-ink-2">{phase.subtitle}</span>
              </h4>
              <ul className="mt-2.5 space-y-2">
                {phase.entries.map((e, j) => (
                  <li key={`${e.slug}-${e.priority}-${j}`} className="flex items-start gap-2.5">
                    <span
                      className="flex-none mt-0.5 text-[10px] font-bold text-white rounded px-1.5 py-0.5"
                      style={{ backgroundColor: e.color }}
                      title={e.priority === 'P1' ? `${e.risk} risk priority` : 'Strategic'}
                    >
                      {e.priority}
                    </span>
                    <span className="text-sm text-ink-2">
                      <span className="text-ink font-medium">{e.area}:</span> {e.action}
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          )
        )}
      </ol>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-6 text-xs text-ink-3">
        {Object.entries(RISK_COLORS).map(([tier, color]) => (
          <span key={tier} className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color }} />
            {tier} risk (P1)
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: P2_COLOR }} />
          Strategic (P2)
        </span>
        <span className="ml-auto italic">Timeline is indicative.</span>
      </div>
    </div>
  );
}
