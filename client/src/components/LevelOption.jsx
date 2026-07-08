import { LEVEL_COLORS, LEVEL_NAMES } from '../lib/theme';

/**
 * One selectable maturity level (0 N/A – 5 Optimising): numbered colour-coded
 * circle, level name and the question-specific label from the database.
 *
 * `accent` tints the selected state to the current control area's colour.
 * `pulse` fires a one-shot confirmation ring right after the user picks it.
 */
export default function LevelOption({ level, label, selected, pulse, accent = 'var(--accent)', onSelect }) {
  const color = LEVEL_COLORS[level];
  return (
    <button
      type="button"
      onClick={() => onSelect(level)}
      aria-pressed={selected}
      style={selected ? { borderColor: accent, boxShadow: `inset 0 0 0 1px ${accent}` } : undefined}
      className={`group w-full flex items-center gap-4 text-left rounded-xl border px-4 py-3 transition-all duration-150
        ${selected
          ? 'bg-card-hover'
          : 'border-edge bg-card hover:bg-card-hover hover:border-edge-accent'}
        ${pulse ? 'animate-answer-pulse' : ''}`}
    >
      <span
        className="flex-none w-9 h-9 rounded-full flex items-center justify-center font-bold text-white transition-transform group-hover:scale-105"
        style={{ backgroundColor: color }}
      >
        {level}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold" style={{ color: selected ? 'var(--text-primary)' : color }}>
          Level {level} - {LEVEL_NAMES[level]}
        </span>
        <span className="block text-sm text-ink-2">{label}</span>
      </span>
      {selected && (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="ml-auto flex-none animate-check-pop">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      )}
    </button>
  );
}
