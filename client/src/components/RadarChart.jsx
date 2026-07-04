import {
  Radar,
  RadarChart as ReRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

/**
 * Radar/spider chart of all domain scores with the industry benchmark as a
 * recessive dashed reference series. SVG-only, so it renders fine under
 * Puppeteer for the PDF report.
 */
export default function RadarChart({ domainScores, height = 380 }) {
  const data = domainScores.map((d) => ({
    domain: d.name.replace(/\s*\(.*\)$/, ''),
    score: d.domain_score,
    benchmark: d.benchmark,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReRadarChart data={data} outerRadius="72%">
        <PolarGrid stroke="var(--border)" />
        <PolarAngleAxis
          dataKey="domain"
          tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
        />
        <PolarRadiusAxis
          domain={[0, 5]}
          tickCount={6}
          tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
          stroke="var(--border)"
        />
        <Radar
          name="Your score"
          dataKey="score"
          stroke="#1D9E75"
          fill="#1D9E75"
          fillOpacity={0.28}
          strokeWidth={2}
          dot={{ r: 3, fill: '#1D9E75' }}
        />
        <Radar
          name="Industry benchmark"
          dataKey="benchmark"
          stroke="#94a3b8"
          fill="none"
          fillOpacity={0}
          strokeWidth={2}
          strokeDasharray="6 4"
          dot={false}
        />
        <Tooltip
          contentStyle={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            color: 'var(--text-primary)',
            fontSize: 12,
          }}
          formatter={(value) => Number(value).toFixed(1)}
        />
        <Legend
          wrapperStyle={{ color: 'var(--text-secondary)', fontSize: 12 }}
          iconType="plainline"
        />
      </ReRadarChart>
    </ResponsiveContainer>
  );
}
