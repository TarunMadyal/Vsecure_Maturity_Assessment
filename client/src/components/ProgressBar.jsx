export default function ProgressBar({ answered, total }) {
  const pct = total ? Math.round((answered / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5 text-sm">
        <span className="text-ink-2">
          {answered} of {total} questions
        </span>
        <span className="font-semibold text-accent">{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-card-hover overflow-hidden border border-edge">
        <div
          className="h-full rounded-full btn-gradient transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
