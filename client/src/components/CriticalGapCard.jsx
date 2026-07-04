import { RISK_COLORS } from '../lib/theme';
import Icon from './Icon';

/**
 * One of the top-3 critical gaps: score, plain-English business risk, and the
 * mapping to the vSecure capability that closes it.
 */
export default function CriticalGapCard({ gap, rank }) {
  const riskColor = RISK_COLORS[gap.risk];
  return (
    <div className="rounded-2xl border border-edge bg-card p-5 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span
          className="flex-none w-8 h-8 rounded-full flex items-center justify-center font-bold text-white"
          style={{ backgroundColor: riskColor }}
        >
          {rank}
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-ink font-semibold">
            <Icon name={gap.icon} size={16} className="text-ink-2" />
            <span className="truncate">{gap.name}</span>
          </div>
          <div className="text-sm text-ink-2">
            Score {gap.domain_score.toFixed(1)} / 5 ·{' '}
            <span style={{ color: riskColor }} className="font-semibold">
              {gap.risk} risk
            </span>
          </div>
        </div>
      </div>
      <p className="text-sm text-ink-2 leading-relaxed">{gap.explanation}</p>
      {gap.vsecure_capability && (
        <div className="mt-auto rounded-lg border border-edge-accent/40 bg-[color:var(--bg-card-hover)] px-3 py-2 text-sm">
          <span className="text-ink-2">Your gap in {gap.name.replace(/\s*\(.*\)$/, '')} → </span>
          <span className="text-accent font-semibold">{gap.vsecure_capability}</span>
        </div>
      )}
    </div>
  );
}
