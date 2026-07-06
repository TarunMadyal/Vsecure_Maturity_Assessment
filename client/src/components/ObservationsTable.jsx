import { RISK_COLORS } from '../lib/theme';

/**
 * Detailed findings: control area | key observation | risk | numbered
 * remediation steps | duration — mirroring the reference report table.
 */
export default function ObservationsTable({ observations }) {
  if (!observations.length) {
    return <p className="text-sm text-ink-2">No material observations — all control areas scored 4.0 or above.</p>;
  }
  return (
    <div className="space-y-4">
      {observations.map((o) => (
        <div key={o.slug} className="rounded-xl border border-edge bg-card-hover/40 overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-edge">
            <span className="font-semibold text-ink text-sm">{o.area}</span>
            <span
              className="text-[11px] font-bold uppercase tracking-wide px-2.5 py-0.5 rounded"
              style={{ backgroundColor: RISK_COLORS[o.risk], color: '#fff' }}
            >
              {o.risk}
            </span>
            <span className="ml-auto text-xs text-ink-3">Duration: {o.duration}</span>
          </div>
          <div className="px-4 py-3 grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-3 mb-1.5">
                Key observation
              </p>
              <p className="text-sm text-ink-2 leading-relaxed">{o.observation}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-3 mb-1.5">
                Remediation
              </p>
              <ol className="text-sm text-ink-2 space-y-1 list-decimal list-inside">
                {o.remediation.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
