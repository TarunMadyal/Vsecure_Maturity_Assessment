const COLORS = {
  covered: '#1D9E75',
  partial: '#EF9F27',
  not_covered: '#E24B4A',
};

/**
 * Framework coverage: stat tiles, an overall stacked coverage bar and a
 * per-framework breakdown (covered vs total mapped controls).
 */
export default function CoverageBars({ coverage }) {
  const tiles = [
    { label: 'Total controls', value: coverage.total, color: 'var(--text-primary)' },
    { label: 'Covered (4–5)', value: coverage.covered, color: COLORS.covered },
    { label: 'Partial (2–3)', value: coverage.partial, color: COLORS.partial },
    { label: 'Not covered (1)', value: coverage.not_covered, color: COLORS.not_covered },
  ];
  const pct = (n) => (coverage.total ? (n / coverage.total) * 100 : 0);

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-xl border border-edge bg-card-hover/40 p-4 text-center">
            <div className="text-3xl font-bold" style={{ color: t.color }}>{t.value}</div>
            <div className="text-xs text-ink-2 mt-1">{t.label}</div>
          </div>
        ))}
      </div>

      <p className="text-sm text-ink mb-1.5">
        Overall coverage: <span className="font-semibold">{coverage.pct}%</span>
      </p>
      <div className="flex h-3.5 rounded-full overflow-hidden border border-edge bg-navy">
        {['covered', 'partial', 'not_covered'].map((k) =>
          coverage[k] > 0 ? (
            <div key={k} style={{ width: `${pct(coverage[k])}%`, backgroundColor: COLORS[k] }} />
          ) : null
        )}
      </div>
      <div className="flex gap-4 mt-2 text-xs text-ink-2">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: COLORS.covered }} /> Covered
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: COLORS.partial }} /> Partial
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: COLORS.not_covered }} /> Not covered
        </span>
      </div>

      {coverage.frameworks.length > 0 && (
        <div className="mt-6">
          <p className="text-sm font-semibold text-ink mb-3">Framework breakdown</p>
          <div className="space-y-3">
            {coverage.frameworks.map((f) => (
              <div key={f.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-ink-2">{f.name}</span>
                  <span className="text-ink-3">{f.covered}/{f.total} controls covered</span>
                </div>
                <div className="flex h-2.5 rounded-full overflow-hidden border border-edge bg-navy">
                  <div
                    style={{
                      width: `${f.total ? (f.covered / f.total) * 100 : 0}%`,
                      backgroundColor: COLORS.covered,
                    }}
                  />
                  <div
                    style={{
                      width: `${f.total ? ((f.total - f.covered) / f.total) * 100 : 0}%`,
                      backgroundColor: COLORS.partial,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
