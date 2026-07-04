import { LEVEL_COLORS, LEVEL_NAMES } from '../lib/theme';

/**
 * One selectable maturity level (0 N/A – 5 Optimising): numbered colour-coded
 * circle, level name and the question-specific label from the database.
 */
export default function LevelOption({ level, label, selected, onSelect }) {
  const color = LEVEL_COLORS[level];
  return (
    <button
      type="button"
      onClick={() => onSelect(level)}
      aria-pressed={selected}
      className={`w-full flex items-center gap-4 text-left rounded-xl border px-4 py-3 transition-colors
        ${selected
          ? 'border-edge-accent bg-card-hover ring-1 ring-[var(--accent)]'
          : 'border-edge bg-card hover:bg-card-hover'}`}
    >
      <span
        className="flex-none w-9 h-9 rounded-full flex items-center justify-center font-bold text-white"
        style={{ backgroundColor: color }}
      >
        {level}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold" style={{ color: selected ? 'var(--text-primary)' : color }}>
          Level {level} — {LEVEL_NAMES[level]}
        </span>
        <span className="block text-sm text-ink-2">{label}</span>
      </span>
      {selected && (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="ml-auto flex-none">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      )}
    </button>
  );
}
