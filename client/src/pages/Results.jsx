import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Logo from '../components/Logo';
import RadarChart from '../components/RadarChart';
import DomainScoreBar from '../components/DomainScoreBar';
import CriticalGapCard from '../components/CriticalGapCard';
import RoadmapTimeline from '../components/RoadmapTimeline';
import { RISK_COLORS } from '../lib/theme';
import { api } from '../lib/api';

export default function Results() {
  const { token } = useParams();
  const [params] = useSearchParams();
  const pdfMode = params.get('pdf') === '1';

  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.results(token).then(setReport).catch((e) => setError(e.message));
  }, [token]);

  if (error) {
    return (
      <div className="min-h-screen bg-navy">
        <Header />
        <div className="text-center py-20">
          <p className="text-[color:var(--risk-critical)]">{error}</p>
          <Link to="/" className="text-accent text-sm mt-4 inline-block">← Back to home</Link>
        </div>
      </div>
    );
  }
  if (!report) {
    return (
      <div className="min-h-screen bg-navy">
        {!pdfMode && <Header />}
        <p className="text-center text-ink-3 py-20">Preparing your report…</p>
      </div>
    );
  }

  const riskColor = RISK_COLORS[report.risk];
  const completed = report.session.completed_at
    ? new Date(report.session.completed_at).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : '';

  return (
    <div className="min-h-screen bg-navy" data-report-ready="true">
      {!pdfMode && <Header cta={false} />}

      <main className="max-w-4xl mx-auto px-4 py-10 space-y-10">
        {/* Branded report header */}
        <section className="rounded-2xl border border-edge bg-card p-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <Logo size={40} />
              <h1 className="text-2xl font-bold text-ink mt-4">
                IAM Maturity Assessment Report
              </h1>
              <p className="text-ink-2 mt-1">
                {report.session.company_name} · {report.session.assessment_type === 'overall'
                  ? 'Full IAM assessment'
                  : `${report.session.assessment_type} assessment`} · {completed}
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-ink">
                {report.overall_score.toFixed(1)}
                <span className="text-xl text-ink-3 font-normal"> / 5</span>
              </div>
              <div className="text-sm text-ink-2 mt-1">{report.maturity_label} maturity</div>
              <span
                className="inline-block mt-2 text-sm font-semibold px-4 py-1.5 rounded-full"
                style={{ color: riskColor, border: `1.5px solid ${riskColor}` }}
              >
                {report.risk} risk
              </span>
            </div>
          </div>

          {!pdfMode && (
            <div className="flex flex-wrap gap-3 mt-8 no-print">
              <a
                href="mailto:vijay@vsecure.ai?subject=vSecure%20demo%20request"
                className="rounded-xl bg-accent text-white font-semibold px-6 py-3 hover:opacity-90 transition-opacity"
              >
                Book a demo
              </a>
              <a
                href={`/results/${token}/pdf`}
                className="rounded-xl border border-edge-accent text-accent font-semibold px-6 py-3 hover:bg-card-hover transition-colors"
              >
                Download PDF report
              </a>
            </div>
          )}
        </section>

        {/* Radar chart */}
        <section className="rounded-2xl border border-edge bg-card p-6">
          <h2 className="text-lg font-semibold text-ink mb-1">Maturity by domain</h2>
          <p className="text-sm text-ink-2 mb-4">
            Your scores against the industry benchmark (dashed line).
          </p>
          <RadarChart domainScores={report.domain_scores} height={pdfMode ? 340 : 400} />
        </section>

        {/* Domain breakdown */}
        <section className="rounded-2xl border border-edge bg-card p-6">
          <h2 className="text-lg font-semibold text-ink mb-1">Domain score breakdown</h2>
          <p className="text-sm text-ink-2 mb-5">
            Bars are colour coded red / amber / green; the light tick marks the industry benchmark.
          </p>
          <div className="space-y-5">
            {[...report.domain_scores]
              .sort((a, b) => a.domain_score - b.domain_score)
              .map((d) => (
                <DomainScoreBar key={d.slug} domain={d} />
              ))}
          </div>
        </section>

        {/* Critical gaps */}
        <section>
          <h2 className="text-lg font-semibold text-ink mb-1">Your top 3 critical gaps</h2>
          <p className="text-sm text-ink-2 mb-5">
            The domains putting your organisation at greatest risk, and what that means in business terms.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {report.critical_gaps.map((gap, i) => (
              <CriticalGapCard key={gap.slug} gap={gap} rank={i + 1} />
            ))}
          </div>
        </section>

        {/* 90-day roadmap */}
        <section className="rounded-2xl border border-edge bg-card p-6">
          <h2 className="text-lg font-semibold text-ink mb-1">Your 90-day remediation roadmap</h2>
          <p className="text-sm text-ink-2 mb-6">
            A phased plan focused on your three biggest gaps.
          </p>
          <RoadmapTimeline roadmap={report.roadmap} />
        </section>

        {/* Closing CTA */}
        <section className="rounded-2xl border border-edge-accent bg-card p-8 text-center">
          <h2 className="text-xl font-bold text-ink">
            Ready to close these gaps?
          </h2>
          <p className="text-ink-2 mt-2 max-w-xl mx-auto">
            vSecure's AI-native identity security platform maps directly to the gaps
            in this report. Talk to us about a tailored remediation plan.
          </p>
          {!pdfMode ? (
            <a
              href="mailto:vijay@vsecure.ai?subject=vSecure%20demo%20request"
              className="inline-block mt-6 rounded-xl bg-accent text-white font-semibold px-8 py-3.5 hover:opacity-90 transition-opacity no-print"
            >
              Book a demo
            </a>
          ) : (
            <p className="mt-4 text-accent font-semibold">vijay@vsecure.ai · assess.vsecure.ai</p>
          )}
        </section>

        <p className="text-center text-xs text-ink-3 pb-6">
          Assessment based on NIST 800-53, CIS Controls and NIST CSF 2.0 · Generated by vSecure
        </p>
      </main>
    </div>
  );
}
