import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Icon from '../components/Icon';
import { api } from '../lib/api';

export default function Landing() {
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .meta()
      .then(setMeta)
      .catch(() => setMeta(null))
      .finally(() => setLoading(false));
  }, []);

  const full = meta?.types?.find((t) => t.type === 'overall');

  return (
    <div className="min-h-screen bg-navy flex flex-col">
      <Header />

      <main id="main" className="flex-1 max-w-6xl w-full mx-auto px-4">
        {/* Hero */}
        <section className="py-20 text-center max-w-3xl mx-auto">
          <p className="text-accent font-semibold tracking-wide uppercase text-sm mb-4">
            Free IAM maturity assessment
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-ink leading-tight">
            Discover your IAM maturity in{' '}
            <span className="text-gradient">30 minutes</span>
          </h1>
          <p className="mt-6 text-lg text-ink-2 leading-relaxed">
            Evaluate your organisation's identity and access management practices
            across four specialist areas - IGA, PAM, WAM and CIAM. Rate your
            maturity per control area, capture your current environment, and
            receive a board-ready report with a prioritised 12-month improvement
            roadmap.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register?type=overall"
              className="rounded-xl btn-gradient text-white font-semibold px-8 py-4 hover:opacity-90 transition-opacity"
            >
              Start Full IAM Assessment
            </Link>
            <Link
              to="/start"
              className="rounded-xl border border-edge-accent text-accent font-semibold px-8 py-4 hover:bg-card-hover transition-colors"
            >
              Choose a specific domain
            </Link>
          </div>
          <p className="mt-8 text-sm text-ink-3">
            Based on NIST 800-53, CIS Controls, and CSF 2.0 frameworks · No credit
            card required · Results in minutes
          </p>
        </section>

        {/* What it covers */}
        <section className="pb-24" aria-busy={loading}>
          <h2 className="text-xl font-semibold text-ink text-center mb-2">
            What the assessment covers
          </h2>
          <p className="text-ink-2 text-center mb-8 max-w-2xl mx-auto">
            {full
              ? `${full.question_count} questions across ${full.domains.length} control areas,`
              : 'Questions across every IAM control area,'}{' '}
            each maturity question rated on a five-level scale from Initial to
            Optimised, plus current-environment discovery.
          </p>
          {loading && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="skeleton h-[86px]" aria-hidden="true" />
              ))}
            </div>
          )}
          {/* Control areas clubbed per IAM domain, per the vSecure frameworks */}
          <div className="space-y-8">
            {(meta?.types || [])
              .filter((t) => t.type !== 'overall')
              .map((t) => (
                <div key={t.type}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="flex-none text-[11px] font-bold uppercase tracking-wider text-white btn-gradient rounded-md px-2.5 py-1">
                      {t.type}
                    </span>
                    <h3 className="text-sm font-semibold text-ink">{t.name}</h3>
                    <span className="flex-1 h-px bg-[color:var(--border)]" aria-hidden="true" />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {t.domains.map((d) => (
                      <div
                        key={d.slug}
                        className="card-lift rounded-xl border border-edge bg-card px-4 py-4 flex flex-col items-center gap-2 text-center"
                      >
                        <span className="text-accent">
                          <Icon name={d.icon} size={22} />
                        </span>
                        <span className="text-sm text-ink-2">{d.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </section>

        {/* How it works */}
        <section className="pb-24 grid md:grid-cols-3 gap-4">
          {[
            ['Answer honestly', 'Rate each maturity question 1-5 against your current reality - or N/A if it doesn\'t apply - and describe your environment in the information questions.'],
            ['See your scores', 'Scores per control area with maturity ratings, risk tiers, framework coverage and observations explained in business terms.'],
            ['Act on the roadmap', 'A prioritised 12-month improvement roadmap with detailed remediation actions, plus a board-ready PDF report.'],
          ].map(([title, body], i) => (
            <div key={title} className="card-lift rounded-2xl border border-edge bg-card p-6">
              <span className="w-8 h-8 rounded-full btn-gradient text-white font-bold flex items-center justify-center mb-4">
                {i + 1}
              </span>
              <h3 className="text-ink font-semibold mb-2">{title}</h3>
              <p className="text-sm text-ink-2 leading-relaxed">{body}</p>
            </div>
          ))}
        </section>
      </main>

      <Footer />
    </div>
  );
}
