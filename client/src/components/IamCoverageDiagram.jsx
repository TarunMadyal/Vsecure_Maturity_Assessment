import { ICON_PATHS } from './Icon';
import { areaTheme, DOMAIN_ICONS } from '../lib/theme';

/**
 * Hub-and-spoke diagram: a central "Full IAM" hub linked by lines to the four
 * IAM domains (IGA / PAM / WAM / CIAM). It communicates "one assessment covers
 * everything" visually, with almost no words, on the assessment-picker page.
 *
 * Pure SVG so the lines, nodes, icons and labels stay perfectly aligned and
 * scale cleanly. Lines animate in, then the nodes pop - subtle, and disabled
 * for users who prefer reduced motion (handled globally in index.css).
 */
const NODES = [
  { type: 'IGA',  x: 70,  y: 58,  delay: 0.15 },
  { type: 'PAM',  x: 330, y: 58,  delay: 0.30 },
  { type: 'WAM',  x: 70,  y: 202, delay: 0.45 },
  { type: 'CIAM', x: 330, y: 202, delay: 0.60 },
];

const CENTER = { x: 200, y: 130 };

function NodeIcon({ name, cx, cy, color }) {
  // Draw the 24x24 icon path centred on (cx, cy), scaled to ~22px.
  const s = 0.92;
  const off = 12 * s;
  return (
    <path
      d={ICON_PATHS[name] || ICON_PATHS.shield}
      transform={`translate(${cx - off}, ${cy - off}) scale(${s})`}
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

export default function IamCoverageDiagram({ className = '' }) {
  return (
    <svg
      viewBox="0 0 400 260"
      className={`w-full h-auto ${className}`}
      role="img"
      aria-label="A Full IAM assessment covers all four domains: IGA, PAM, WAM and CIAM"
    >
      <defs>
        <linearGradient id="iam-hub" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--accent)" />
          <stop offset="100%" stopColor="var(--accent-to)" />
        </linearGradient>
      </defs>

      {/* Spokes (drawn first, under the nodes) */}
      {NODES.map((n) => {
        const t = areaTheme(n.type);
        return (
          <line
            key={`l-${n.type}`}
            x1={CENTER.x}
            y1={CENTER.y}
            x2={n.x}
            y2={n.y}
            stroke={t.accent}
            strokeWidth="2"
            strokeLinecap="round"
            className="diagram-line"
            style={{ opacity: 0.55 }}
          />
        );
      })}

      {/* Domain nodes */}
      {NODES.map((n) => {
        const t = areaTheme(n.type);
        return (
          <g key={n.type} className="diagram-node" style={{ animationDelay: `${n.delay}s` }}>
            <circle cx={n.x} cy={n.y} r="30" fill="var(--bg-card)" stroke={t.ring} strokeWidth="1.5" />
            <NodeIcon name={DOMAIN_ICONS[n.type]} cx={n.x} cy={n.y - 6} color={t.accent} />
            <text
              x={n.x}
              y={n.y + 17}
              textAnchor="middle"
              fontSize="11"
              fontWeight="700"
              fill={t.accent}
              style={{ letterSpacing: '0.05em' }}
            >
              {n.type}
            </text>
          </g>
        );
      })}

      {/* Central hub (drawn last, on top) */}
      <g className="diagram-node" style={{ animationDelay: '0s' }}>
        <circle cx={CENTER.x} cy={CENTER.y} r="40" fill="url(#iam-hub)" />
        <text x={CENTER.x} y={CENTER.y - 3} textAnchor="middle" fontSize="15" fontWeight="800" fill="#fff">
          Full
        </text>
        <text x={CENTER.x} y={CENTER.y + 14} textAnchor="middle" fontSize="15" fontWeight="800" fill="#fff">
          IAM
        </text>
      </g>
    </svg>
  );
}
