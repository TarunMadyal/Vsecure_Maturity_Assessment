import { scoreColor } from '../lib/theme';

/**
 * One control-area maturity summary bar: name, score /5, maturity label and a
 * red/amber/green coded bar (values always written in text, never colour
 * alone).
 */
export default function DomainScoreBar({ name, score, label, benchmark }) {
  const color = scoreColor(score);
  const pct = (score / 5) * 100;
  const benchPct = benchmark ? (benchmark / 5) * 100 : null;

  return (
    <div className="rounded-xl border border-edge bg-card-hover/40 px-4 py-3">
      <div className="flex items-baseline justify-between gap-3 mb-1">
        <span className="text-sm text-ink truncate">{name}</span>
        <span className="flex-none text-lg font-bold" style={{ color }}>
          {score.toFixed(1)}
        </span>
      </div>
      {label && (
        <div className="text-[11px] italic mb-1.5" style={{ color }}>
          {label}
        </div>
      )}
      <div className="relative h-2.5 rounded-full bg-navy border border-edge overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
        {benchPct !== null && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-ink-2"
            style={{ left: `${benchPct}%` }}
            title={`Industry benchmark ${benchmark.toFixed(1)}`}
          />
        )}
      </div>
    </div>
  );
}
