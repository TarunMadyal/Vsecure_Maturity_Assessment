import { useEffect, useState } from 'react';
import Icon from './Icon';
import { groupByAreaType, areaTheme } from '../lib/theme';

const isAnswered = (q, answers) => {
  const a = answers[q.id];
  if (!a) return false;
  return q.type === 'maturity' ? a.level !== undefined : Boolean(a.text && a.text.trim());
};

function Chevron({ open }) {
  return (
    <svg
      viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      className="flex-none transition-transform duration-200"
      style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

/**
 * Control-area navigation. Renders as a left sidebar on desktop and a
 * horizontal scroller above the question card on smaller screens.
 *
 * For multi-domain assessments (Full IAM), each IAM domain (IGA / PAM / WAM /
 * CIAM) collapses to a single clickable heading - its control areas only
 * appear once that heading is expanded, so the sidebar never dumps all ~27
 * areas on screen at once. The domain containing the question currently
 * being answered auto-expands as you move through the assessment; clicking
 * another heading opens that domain instead. Single-domain assessments have
 * only one group, so there's nothing to collapse and they stay flat.
 */
export default function ControlAreaNav({ areas, answers, currentAreaId, onSelect }) {
  const progress = (area) => {
    const maturity = area.questions.filter((q) => q.type === 'maturity');
    const done = maturity.filter((q) => isAnswered(q, answers)).length;
    return { done, total: maturity.length, complete: done === maturity.length && maturity.length > 0 };
  };

  const groupProgress = (group) =>
    group.items.reduce(
      (acc, area) => {
        const p = progress(area);
        return { done: acc.done + p.done, total: acc.total + p.total };
      },
      { done: 0, total: 0 }
    );

  const groups = groupByAreaType(areas);
  const multiDomain = groups.length > 1;

  const [openType, setOpenType] = useState(
    () => groups.find((g) => g.items.some((a) => a.id === currentAreaId))?.type ?? null
  );

  // Follow the question actually being answered: expand its domain whenever
  // Next/Previous or a sidebar click moves the current question elsewhere.
  useEffect(() => {
    const g = groups.find((g) => g.items.some((a) => a.id === currentAreaId));
    if (g) setOpenType(g.type);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAreaId]);

  function toggle(type) {
    setOpenType((cur) => (cur === type ? null : type));
  }

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden lg:block w-72 flex-none no-print" aria-label="Control areas">
        <div className="sticky top-20 rounded-2xl border border-edge bg-card p-3 max-h-[calc(100vh-6rem)] overflow-y-auto">
          {groups.map((group, gi) => {
            const t = areaTheme(group.type);
            const gp = groupProgress(group);
            const isOpen = !multiDomain || openType === group.type;
            return (
              <div key={group.type} className={gi > 0 ? 'mt-2 pt-2 border-t border-edge' : ''}>
                {multiDomain ? (
                  <button
                    type="button"
                    onClick={() => toggle(group.type)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between gap-2 rounded-lg px-2 py-2 hover:bg-card-hover transition-colors"
                  >
                    <span className="min-w-0 text-left">
                      <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider" style={{ color: t.accent }}>
                        <span className="w-2 h-2 rounded-full flex-none" style={{ backgroundColor: t.accent }} aria-hidden="true" />
                        {group.type}
                      </span>
                      <span className="block mt-0.5 text-[11px] font-medium text-ink-3 truncate">
                        {group.name}
                      </span>
                    </span>
                    <span className="flex-none flex items-center gap-2">
                      <span
                        className="text-[11px] whitespace-nowrap"
                        style={{ color: gp.total > 0 && gp.done === gp.total ? t.accent : 'var(--text-muted)' }}
                      >
                        {gp.done}/{gp.total}
                      </span>
                      <span style={{ color: t.accent }}>
                        <Chevron open={isOpen} />
                      </span>
                    </span>
                  </button>
                ) : (
                  <p className="px-2 pb-2 text-[11px] font-bold uppercase tracking-wider text-accent">
                    Control areas
                  </p>
                )}

                {isOpen && (
                  <ul className={multiDomain ? 'space-y-1 mt-1 animate-fade-up' : 'space-y-1'}>
                    {group.items.map((area) => {
                      const p = progress(area);
                      const active = area.id === currentAreaId;
                      return (
                        <li key={area.id}>
                          <button
                            type="button"
                            onClick={() => onSelect(area.id)}
                            aria-current={active ? 'true' : undefined}
                            style={active ? { borderColor: t.ring, backgroundColor: t.soft } : undefined}
                            className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left border transition-colors
                              ${active ? 'text-ink' : 'border-transparent text-ink-2 hover:bg-card-hover'}`}
                          >
                            <span style={{ color: p.complete || active ? t.accent : undefined }}
                              className={p.complete || active ? '' : 'text-ink-3'}>
                              <Icon name={area.icon} size={17} />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-[13px] leading-snug">{area.name}</span>
                              <span className="text-[11px]" style={{ color: p.complete ? t.accent : 'var(--text-muted)' }}>
                                {p.done}/{p.total} rated
                              </span>
                            </span>
                            {p.complete && (
                              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke={t.accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 6L9 17l-5-5" />
                              </svg>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Mobile horizontal scroller - already a single compact row, so there's
          nothing to collapse here; left as-is. */}
      <nav className="lg:hidden -mx-4 px-4 pb-4 overflow-x-auto no-print" aria-label="Control areas">
        <div className="flex items-center gap-1.5 w-max">
          {groups.map((group) => {
            const t = areaTheme(group.type);
            return (
              <div key={group.type} className="flex items-center gap-1.5">
                {multiDomain && (
                  <span
                    className="flex-none text-[10px] font-bold uppercase tracking-wider rounded-md px-2 py-1"
                    style={{ color: t.accent, backgroundColor: t.soft, border: `1px solid ${t.ring}` }}
                    aria-hidden="true"
                  >
                    {group.type}
                  </span>
                )}
                {group.items.map((area) => {
                  const p = progress(area);
                  const active = area.id === currentAreaId;
                  return (
                    <button
                      key={area.id}
                      type="button"
                      onClick={() => onSelect(area.id)}
                      aria-current={active ? 'true' : undefined}
                      style={active ? { borderColor: t.ring, backgroundColor: t.soft } : undefined}
                      className={`flex-none flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors
                        ${active ? 'text-ink' : 'border-edge text-ink-2'}`}
                    >
                      <span style={active ? { color: t.accent } : undefined}>
                        <Icon name={area.icon} size={13} />
                      </span>
                      <span className="max-w-[140px] truncate">{area.name}</span>
                      <span style={{ color: p.complete ? t.accent : 'var(--text-muted)' }}
                        className={p.complete ? 'font-semibold' : ''}>
                        {p.done}/{p.total}
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </nav>
    </>
  );
}
