import Icon from './Icon';

const isAnswered = (q, answers) => {
  const a = answers[q.id];
  if (!a) return false;
  return q.type === 'maturity' ? a.level !== undefined : Boolean(a.text && a.text.trim());
};

/**
 * Control-area navigation. Renders as a left sidebar on desktop and a
 * horizontal scroller above the question card on smaller screens. Shows
 * per-area progress over maturity questions (information questions are
 * optional discovery detail).
 */
export default function ControlAreaNav({ areas, answers, currentAreaId, onSelect }) {
  const progress = (area) => {
    const maturity = area.questions.filter((q) => q.type === 'maturity');
    const done = maturity.filter((q) => isAnswered(q, answers)).length;
    return { done, total: maturity.length, complete: done === maturity.length && maturity.length > 0 };
  };

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden lg:block w-72 flex-none no-print" aria-label="Control areas">
        <div className="sticky top-20 rounded-2xl border border-edge bg-card p-3 max-h-[calc(100vh-6rem)] overflow-y-auto">
          <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-3">
            Control areas
          </p>
          <ul className="space-y-1">
            {areas.map((area) => {
              const p = progress(area);
              const active = area.id === currentAreaId;
              return (
                <li key={area.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(area.id)}
                    aria-current={active ? 'true' : undefined}
                    className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left border transition-colors
                      ${active
                        ? 'border-edge-accent bg-card-hover text-ink'
                        : 'border-transparent text-ink-2 hover:bg-card-hover'}`}
                  >
                    <span className={p.complete ? 'text-accent' : active ? 'text-ink' : 'text-ink-3'}>
                      <Icon name={area.icon} size={17} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] leading-snug">{area.name}</span>
                      <span className={`text-[11px] ${p.complete ? 'text-accent' : 'text-ink-3'}`}>
                        {p.done}/{p.total} rated
                      </span>
                    </span>
                    {p.complete && (
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Mobile horizontal scroller */}
      <nav className="lg:hidden -mx-4 px-4 pb-4 overflow-x-auto no-print" aria-label="Control areas">
        <div className="flex gap-1.5 w-max">
          {areas.map((area) => {
            const p = progress(area);
            const active = area.id === currentAreaId;
            return (
              <button
                key={area.id}
                type="button"
                onClick={() => onSelect(area.id)}
                aria-current={active ? 'true' : undefined}
                className={`flex-none flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors
                  ${active ? 'border-edge-accent bg-card-hover text-ink' : 'border-edge text-ink-2'}`}
              >
                <Icon name={area.icon} size={13} />
                <span className="max-w-[140px] truncate">{area.name}</span>
                <span className={p.complete ? 'text-accent font-semibold' : 'text-ink-3'}>
                  {p.done}/{p.total}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
