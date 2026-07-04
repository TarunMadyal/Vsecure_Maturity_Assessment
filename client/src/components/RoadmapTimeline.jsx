/**
 * Personalised 90-day remediation roadmap: four phases, each with one action
 * per critical-gap domain (assembled server-side).
 */
export default function RoadmapTimeline({ roadmap }) {
  return (
    <ol className="relative border-l border-edge ml-3 space-y-8">
      {roadmap.map((phase, i) => (
        <li key={phase.title} className="ml-6">
          <span className="absolute -left-3 flex w-6 h-6 items-center justify-center rounded-full bg-accent text-white text-xs font-bold">
            {i + 1}
          </span>
          <h4 className="text-ink font-semibold">
            {phase.title}
            <span className="ml-2 text-sm font-normal text-ink-2">{phase.subtitle}</span>
          </h4>
          <ul className="mt-2 space-y-1.5">
            {phase.actions.map((a) => (
              <li key={a.slug} className="text-sm text-ink-2 flex gap-2">
                <span className="text-accent mt-0.5">▸</span>
                <span>
                  <span className="text-ink">{a.domain.replace(/\s*\(.*\)$/, '')}:</span> {a.action}
                </span>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}
