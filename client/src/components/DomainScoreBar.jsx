import { scoreColor, RISK_COLORS } from '../lib/theme';

/**
 * One horizontal domain score bar, red/amber/green coded, with a tick marking
 * the industry benchmark. Values are written in text — never colour alone.
 */
export default function DomainScoreBar({ domain }) {
  const color = scoreColor(domain.domain_score);
  const pct = (domain.domain_score / 5) * 100;
  const benchPct = domain.benchmark ? (domain.benchmark / 5) * 100 : null;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 mb-1">
        <span className="text-sm text-ink truncate">{domain.name}</span>
        <span className="flex-none text-sm font-semibold text-ink">
          {domain.domain_score.toFixed(1)}
          <span className="text-ink-3 font-normal"> / 5</span>
          <span
            className="ml-2 text-[11px] font-semibold px-2 py-0.5 rounded-full"
            style={{ color: RISK_COLORS[domain.risk], border: `1px solid ${RISK_COLORS[domain.risk]}` }}
          >
            {domain.risk} risk
          </span>
        </span>
      </div>
      <div className="relative h-3 rounded-full bg-card-hover border border-edge overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
        {benchPct !== null && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-ink-2"
            style={{ left: `${benchPct}%` }}
            title={`Industry benchmark ${domain.benchmark.toFixed(1)}`}
          />
        )}
      </div>
    </div>
  );
}
