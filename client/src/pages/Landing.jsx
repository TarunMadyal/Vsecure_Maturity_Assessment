import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Icon from '../components/Icon';
import { api } from '../lib/api';

export default function Landing() {
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    api.meta().then(setMeta).catch(() => setMeta(null));
  }, []);

  const full = meta?.types?.find((t) => t.type === 'overall');

  return (
    <div className="min-h-screen bg-navy">
      <Header />

      <main className="max-w-6xl mx-auto px-4">
        {/* Hero */}
        <section className="py-20 text-center max-w-3xl mx-auto">
          <p className="text-accent font-semibold tracking-wide uppercase text-sm mb-4">
            Free IAM maturity assessment
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-ink leading-tight">
            Discover your IAM maturity in{' '}
            <span className="text-accent">30 minutes</span>
          </h1>
          <p className="mt-6 text-lg text-ink-2 leading-relaxed">
            Evaluate your organisation's identity and access management practices
            across {meta ? meta.types.length - 1 : 'four'} specialist domains — from
            identity governance and privileged access to customer identity. Get
            scored against industry benchmarks and receive a personalised 90-day
            remediation roadmap.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register?type=overall"
              className="rounded-xl bg-accent text-white font-semibold px-8 py-4 hover:opacity-90 transition-opacity"
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
        <section className="pb-24">
          <h2 className="text-xl font-semibold text-ink text-center mb-2">
            What the assessment covers
          </h2>
          <p className="text-ink-2 text-center mb-8 max-w-2xl mx-auto">
            {full
              ? `${full.question_count} questions across ${full.domains.length} IAM domains,`
              : 'Questions across every IAM domain,'}{' '}
            each rated on a five-level maturity scale from Initial to Optimising.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {(full?.domains || []).map((d) => (
              <div
                key={d.slug}
                className="rounded-xl border border-edge bg-card px-4 py-4 flex flex-col items-center gap-2 text-center"
              >
                <span className="text-accent">
                  <Icon name={d.icon} size={22} />
                </span>
                <span className="text-sm text-ink-2">{d.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="pb-24 grid md:grid-cols-3 gap-4">
          {[
            ['Answer honestly', 'Pick the maturity level (1–5) that best describes your current reality for each question — or N/A if it doesn\'t apply.'],
            ['See your scores', 'Weighted scores per domain, benchmarked against industry averages, with your top three critical gaps explained in business terms.'],
            ['Act on the roadmap', 'A personalised 90-day remediation plan mapped to vSecure capabilities, plus a board-ready PDF report.'],
          ].map(([title, body], i) => (
            <div key={title} className="rounded-2xl border border-edge bg-card p-6">
              <span className="w-8 h-8 rounded-full bg-accent text-white font-bold flex items-center justify-center mb-4">
                {i + 1}
              </span>
              <h3 className="text-ink font-semibold mb-2">{title}</h3>
              <p className="text-sm text-ink-2 leading-relaxed">{body}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-edge py-8 text-center text-sm text-ink-3">
        vSecure — AI-native identity security · assess.vsecure.ai
      </footer>
    </div>
  );
}
