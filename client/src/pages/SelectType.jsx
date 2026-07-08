import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Icon from '../components/Icon';
import IamCoverageDiagram from '../components/IamCoverageDiagram';
import { api } from '../lib/api';
import { areaTheme, AREA_NAMES, DOMAIN_ICONS } from '../lib/theme';

export default function SelectType() {
  const [meta, setMeta] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .meta()
      .then(setMeta)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const types = meta?.types || [];
  const overall = types.find((t) => t.type === 'overall');
  const domains = types.filter((t) => t.type !== 'overall');

  return (
    <div className="min-h-screen bg-navy flex flex-col">
      <Header />
      <main id="main" className="flex-1 max-w-5xl w-full mx-auto px-4 py-14">
        <h1 className="text-3xl md:text-4xl font-bold text-ink text-center">
          How much do you want to assess?
        </h1>
        <p className="text-ink-2 text-center mt-3 mb-10 max-w-2xl mx-auto">
          Cover all of identity and access in one go, or focus on the single
          domain that matters most right now.
        </p>

        {error && (
          <p role="alert" className="text-center text-[color:var(--risk-critical)] mb-6">
            {error}
          </p>
        )}

        {loading ? (
          <div className="space-y-8" aria-hidden="true">
            <div className="skeleton h-72" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton h-40" />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Option 1 - Full IAM: the diagram does the explaining. */}
            {overall && (
              <Link
                to="/register?type=overall"
                className="card-lift group block rounded-3xl border border-edge-accent bg-card p-6 md:p-8 overflow-hidden"
              >
                <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-center">
                  <div className="order-2 md:order-1">
                    <span className="inline-block text-xs font-semibold text-white btn-gradient rounded-full px-3 py-1">
                      Recommended
                    </span>
                    <h2 className="text-2xl font-bold text-ink mt-3">Full IAM Assessment</h2>
                    <p className="text-ink-2 mt-2 leading-relaxed">
                      One assessment across every IAM domain - for a complete
                      maturity picture and a board-ready roadmap.
                    </p>
                    <div className="flex items-center gap-4 mt-4 text-sm text-ink-3">
                      <span className="inline-flex items-center gap-1.5">
                        <Icon name="clipboard-check" size={15} />
                        {overall.question_count} questions
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>~{overall.minutes} min</span>
                    </div>
                    <span className="mt-6 inline-flex items-center gap-2 rounded-xl btn-gradient text-white font-semibold px-6 py-3 group-hover:opacity-90 transition-opacity">
                      Start Full IAM Assessment
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </span>
                  </div>
                  <div className="order-1 md:order-2">
                    <IamCoverageDiagram />
                  </div>
                </div>
              </Link>
            )}

            {/* Divider */}
            <div className="flex items-center gap-4 my-10">
              <span className="flex-1 h-px bg-[color:var(--border)]" aria-hidden="true" />
              <span className="text-sm font-medium text-ink-3 uppercase tracking-wider">
                Or focus on one domain
              </span>
              <span className="flex-1 h-px bg-[color:var(--border)]" aria-hidden="true" />
            </div>

            {/* Option 2 - single domain tiles, each in its own colour. */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {domains.map((t) => {
                const theme = areaTheme(t.type);
                return (
                  <Link
                    key={t.type}
                    to={`/register?type=${t.type}`}
                    className="card-lift group rounded-2xl border border-edge bg-card p-5 flex flex-col"
                    style={{ borderTopColor: theme.accent, borderTopWidth: '3px' }}
                  >
                    <span
                      className="w-11 h-11 rounded-xl flex items-center justify-center border"
                      style={{ backgroundColor: theme.soft, borderColor: theme.ring, color: theme.accent }}
                    >
                      <Icon name={DOMAIN_ICONS[t.type] || 'shield'} size={22} />
                    </span>
                    <span
                      className="mt-4 text-[11px] font-bold uppercase tracking-wider"
                      style={{ color: theme.accent }}
                    >
                      {t.type}
                    </span>
                    <h3 className="text-base font-semibold text-ink leading-snug mt-0.5">
                      {AREA_NAMES[t.type] || t.name}
                    </h3>
                    <p className="text-xs text-ink-3 mt-2 flex items-center gap-2">
                      <span>{t.question_count} questions</span>
                      <span aria-hidden="true">·</span>
                      <span>~{t.minutes} min</span>
                    </p>
                    <span
                      className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold group-hover:gap-2.5 transition-all"
                      style={{ color: theme.accent }}
                    >
                      Assess {t.type}
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </span>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
