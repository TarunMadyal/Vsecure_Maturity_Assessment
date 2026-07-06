import { useState } from 'react';
import Logo from './Logo';

const SITE = 'https://vsecure.ai';

// All footer navigation resolves to the vSecure site, opened safely.
const COLUMNS = [
  {
    heading: 'Advisory & Consulting',
    links: ['IAM Strategy & Roadmap', 'IAM Health Assessments', 'Zero-Trust Advisory'],
  },
  {
    heading: 'Professional Services',
    links: ['Platform Implementation', 'Application Onboarding', 'Hands-on IAM Training'],
  },
  {
    heading: 'Managed Services',
    links: ['24×7 Managed IAM', 'Access Governance Ops', 'Monitoring & ITDR'],
  },
];

const LEGAL_LINKS = ['Privacy Statement', 'Terms of Service', 'Sitemap Directory'];

const ExternalLink = ({ children, className = '' }) => (
  <a
    href={SITE}
    target="_blank"
    rel="noopener noreferrer"
    className={`transition-colors hover:text-ink focus-visible:text-ink ${className}`}
  >
    {children}
  </a>
);

export default function Footer() {
  const [email, setEmail] = useState('');

  function subscribe(e) {
    e.preventDefault();
    // Subscriptions are handled on the vSecure site.
    window.open(SITE, '_blank', 'noopener,noreferrer');
  }

  return (
    <footer className="border-t border-edge bg-card/40 no-print" aria-label="vSecure">
      <div className="max-w-6xl mx-auto px-4 pt-14 pb-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.3fr] md:grid-cols-2">
          {/* Brand */}
          <div>
            <ExternalLink className="inline-block rounded-md">
              <Logo className="h-16" />
            </ExternalLink>
            <p className="mt-4 text-sm text-ink-2 leading-relaxed max-w-xs">
              vSECURE helps organizations secure, manage, and empower their teams
              through end-to-end Identity & Access Management - AI-driven advisory,
              implementation, managed services, and tailored hands-on IAM training.
            </p>
            <div className="flex gap-2.5 mt-5">
              <a
                href={SITE}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="vSecure on LinkedIn"
                className="w-9 h-9 rounded-full bg-card-hover border border-edge flex items-center justify-center text-ink-2 hover:text-ink hover:border-edge-accent transition-colors"
              >
                <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
                  <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
                </svg>
              </a>
              <a
                href={SITE}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="vSecure on YouTube"
                className="w-9 h-9 rounded-full bg-card-hover border border-edge flex items-center justify-center text-ink-2 hover:text-ink hover:border-edge-accent transition-colors"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                  <path d="M23.5 6.2a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.51A3.02 3.02 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3.02 3.02 0 0 0 2.12 2.14c1.88.51 9.38.51 9.38.51s7.5 0 9.38-.51a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8zM9.55 15.57V8.43L15.82 12l-6.27 3.57z" />
                </svg>
              </a>
            </div>
            <div className="flex flex-wrap gap-2 mt-5">
              {['Compliance Ready', 'Security Focused'].map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-ink-2 border border-edge rounded-md px-2.5 py-1.5"
                >
                  <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  {badge}
                </span>
              ))}
            </div>
          </div>

          {/* Service columns */}
          {COLUMNS.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink mb-4">
                {col.heading}
              </h3>
              <ul className="space-y-3">
                {col.links.map((label) => (
                  <li key={label}>
                    <ExternalLink className="text-sm text-ink-2 inline-flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-accent flex-none" aria-hidden="true" />
                      {label}
                    </ExternalLink>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          {/* Cyber advisories */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink mb-4">
              Cyber Advisories
            </h3>
            <p className="text-sm text-ink-2 leading-relaxed">
              Get practical IAM strategy, identity security, and AI-driven advisory
              updates from the vSECURE team.
            </p>
            <form onSubmit={subscribe} className="mt-4 flex rounded-xl border border-edge bg-card-hover focus-within:border-edge-accent transition-colors overflow-hidden">
              <label htmlFor="footer-email" className="sr-only">
                Enterprise email
              </label>
              <input
                id="footer-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enterprise Email"
                className="flex-1 min-w-0 bg-transparent px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-3 focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Subscribe to vSecure cyber advisories"
                className="btn-gradient flex-none w-11 flex items-center justify-center text-white hover:opacity-90 transition-opacity"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-edge flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
          <p className="text-xs text-ink-3 leading-relaxed">
            vSECURE.ai is a UK registered company - Company Number{' '}
            <span className="text-ink-2 font-semibold">17205139</span>, registered
            with Companies House, England and Wales.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink-3">
            <span>© {new Date().getFullYear()} vSECURE.ai. All rights reserved.</span>
            {LEGAL_LINKS.map((label) => (
              <ExternalLink key={label} className="underline-offset-4 hover:underline">
                {label}
              </ExternalLink>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
