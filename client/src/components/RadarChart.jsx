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
 * Maturity footprint radar — Current vs Proposed vs Maximum by control area,
 * mirroring the reference report. SVG-only so it renders under Puppeteer.
 */
export default function RadarChart({ footprint, height = 400 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReRadarChart data={footprint} outerRadius="70%">
        <PolarGrid stroke="var(--border)" />
        <PolarAngleAxis
          dataKey="name"
          tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
        />
        <PolarRadiusAxis
          domain={[0, 5]}
          tickCount={6}
          tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
          stroke="var(--border)"
        />
        <Radar
          name="Maximum"
          dataKey="maximum"
          stroke="#475569"
          fill="none"
          fillOpacity={0}
          strokeWidth={1.5}
          dot={false}
        />
        <Radar
          name="Proposed"
          dataKey="proposed"
          stroke="#EF9F27"
          fill="none"
          fillOpacity={0}
          strokeWidth={2}
          strokeDasharray="6 4"
          dot={{ r: 2.5, fill: '#EF9F27' }}
        />
        <Radar
          name="Current"
          dataKey="current"
          stroke="#1D9E75"
          fill="#1D9E75"
          fillOpacity={0.25}
          strokeWidth={2}
          dot={{ r: 3, fill: '#1D9E75' }}
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
        <Legend wrapperStyle={{ color: 'var(--text-secondary)', fontSize: 12 }} iconType="plainline" />
      </ReRadarChart>
    </ResponsiveContainer>
  );
}
