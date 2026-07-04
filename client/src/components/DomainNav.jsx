import Icon from './Icon';

/**
 * Bottom navigation bar listing every domain in the assessment with its icon
 * and per-domain progress. Clicking a domain jumps to its first question.
 */
export default function DomainNav({ domains, answers, currentDomainId, onSelect }) {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-20 bg-card/95 backdrop-blur border-t border-edge no-print">
      <div className="max-w-6xl mx-auto px-2 py-2 flex gap-1 overflow-x-auto">
        {domains.map((d) => {
          const done = d.questions.filter((q) => answers[q.id] !== undefined).length;
          const complete = done === d.questions.length;
          const active = d.id === currentDomainId;
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => onSelect(d.id)}
              title={d.name}
              className={`flex-none flex flex-col items-center gap-1 rounded-lg px-3 py-2 min-w-[84px] border transition-colors
                ${active
                  ? 'border-edge-accent bg-card-hover text-ink'
                  : 'border-transparent text-ink-2 hover:bg-card-hover'}`}
            >
              <span className={complete ? 'text-accent' : active ? 'text-ink' : 'text-ink-2'}>
                <Icon name={d.icon} size={18} />
              </span>
              <span className="text-[10px] leading-tight text-center whitespace-nowrap overflow-hidden text-ellipsis max-w-[92px]">
                {d.name.replace(/\s*\(.*\)$/, '')}
              </span>
              <span className={`text-[10px] font-semibold ${complete ? 'text-accent' : 'text-ink-3'}`}>
                {done}/{d.questions.length}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
