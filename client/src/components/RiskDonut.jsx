import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { RISK_COLORS } from '../lib/theme';

/**
 * Question-level risk distribution donut. Identity is carried by the legend
 * labels and counts (never colour alone).
 */
export default function RiskDonut({ counts, height = 260 }) {
  const data = ['Critical', 'High', 'Medium', 'Low']
    .map((tier) => ({ name: tier, value: counts[tier] || 0 }))
    .filter((d) => d.value > 0);
  const total = data.reduce((n, d) => n + d.value, 0);

  return (
    <div>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="55%"
            outerRadius="85%"
            paddingAngle={2}
            stroke="var(--bg-card)"
            strokeWidth={2}
            isAnimationActive={false}
          >
            {data.map((d) => (
              <Cell key={d.name} fill={RISK_COLORS[d.name]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              color: 'var(--text-primary)',
              fontSize: 12,
            }}
            formatter={(value, name) => [`${value} controls`, name]}
          />
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="central"
            fill="var(--text-primary)"
            style={{ fontSize: 22, fontWeight: 700 }}
          >
            {total}
          </text>
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-1">
        {data.map((d) => (
          <span key={d.name} className="inline-flex items-center gap-1.5 text-xs text-ink-2">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: RISK_COLORS[d.name] }} />
            {d.name} · {d.value}
          </span>
        ))}
      </div>
    </div>
  );
}
