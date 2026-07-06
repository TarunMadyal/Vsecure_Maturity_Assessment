import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Logo from '../components/Logo';
import RadarChart from '../components/RadarChart';
import DomainScoreBar from '../components/DomainScoreBar';
import RiskDonut from '../components/RiskDonut';
import CoverageBars from '../components/CoverageBars';
import ObservationsTable from '../components/ObservationsTable';
import RoadmapTimeline from '../components/RoadmapTimeline';
import { RISK_COLORS, scoreColor } from '../lib/theme';
import { api } from '../lib/api';

const Section = ({ title, subtitle, children }) => (
  <section className="rounded-2xl border border-edge bg-card p-6">
    <h2 className="text-lg font-semibold text-ink">{title}</h2>
    {subtitle && <p className="text-sm text-ink-2 mt-0.5 mb-5">{subtitle}</p>}
    {!subtitle && <div className="mb-5" />}
    {children}
  </section>
);

const Bullets = ({ items, marker = '▸', markerClass = 'text-accent' }) => (
  <ul className="space-y-1.5">
    {items.map((it, i) => (
      <li key={i} className="flex gap-2 text-sm text-ink-2 leading-relaxed">
        <span className={`${markerClass} flex-none mt-0.5`}>{marker}</span>
        <span>{it}</span>
      </li>
    ))}
  </ul>
);

export default function Results() {
  const { token } = useParams();
  const [params] = useSearchParams();
  const pdfMode = params.get('pdf') === '1';

  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [pdfState, setPdfState] = useState('idle'); // idle | loading | error

  useEffect(() => {
    api.results(token).then(setReport).catch((e) => setError(e.message));
  }, [token]);

  // Fetch the PDF through /api (so the Vite dev proxy reaches Express) and
  // trigger a download, with a visible loading state while Puppeteer renders.
  async function downloadPdf() {
    if (pdfState === 'loading') return;
    setPdfState('loading');
    try {
      const res = await fetch(`/api/results/${token}/pdf`);
      if (!res.ok) throw new Error(`PDF request failed (${res.status})`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const company = (report?.session.company_name || 'report').replace(/[^\w-]+/g, '-');
      const a = document.createElement('a');
      a.href = url;
      a.download = `vsecure-iam-assessment-${company}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setPdfState('idle');
    } catch (err) {
      setPdfState('error');
    }
  }

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
      <div className="min-h-screen bg-navy" aria-busy="true">
        {!pdfMode && <Header />}
        <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
          <p className="text-center text-ink-3">Preparing your report…</p>
          <div className="skeleton h-64" aria-hidden="true" />
          <div className="skeleton h-96" aria-hidden="true" />
          <div className="skeleton h-72" aria-hidden="true" />
        </div>
      </div>
    );
  }

  const riskColor = RISK_COLORS[report.risk];
  const es = report.executive_summary;
  const completed = report.session.completed_at
    ? new Date(report.session.completed_at).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : '';
  const contextLine = [report.session.industry, report.session.region]
    .filter(Boolean)
    .map((v, i) => `${i === 0 ? 'Industry' : 'Region'}: ${v}`)
    .join('  |  ');

  return (
    <div className="min-h-screen bg-navy" data-report-ready="true">
      {!pdfMode && <Header cta={false} />}

      <main id="main" className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        {/* ---- Title ---- */}
        <section className="rounded-2xl border border-edge bg-card p-8">
          <div className="flex flex-wrap items-start justify-between gap-8">
            <div className="flex-1 min-w-[260px]">
              <Logo className="h-12" />
              <h1 className="text-2xl md:text-3xl font-bold text-ink mt-5 leading-tight uppercase">
                {report.session.assessment_type === 'overall'
                  ? 'IAM Maturity'
                  : `${report.session.assessment_type} Maturity`}{' '}
                <span className="text-accent">Assessment Report</span>
              </h1>
              <p className="text-lg text-ink mt-3">{report.session.company_name}</p>
              <p className="text-sm text-ink-2 mt-1">{report.session.assessment_type_name}</p>
              {contextLine && <p className="text-sm text-ink-3 mt-2">{contextLine}</p>}
              <p className="text-xs text-ink-3 mt-4">Prepared: {completed}</p>
            </div>
            <div className="rounded-2xl border border-edge-accent/50 bg-card-hover px-8 py-6 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-2">
                Overall maturity score
              </p>
              <div className="text-6xl font-bold text-ink mt-2">
                {report.overall_score.toFixed(2)}
              </div>
              <div className="text-sm text-ink-3 mt-1">/ 5.00</div>
              <span
                className="inline-block mt-3 text-xs font-bold uppercase tracking-wide px-5 py-1.5 rounded-lg text-white"
                style={{ backgroundColor: riskColor }}
              >
                {report.maturity_label}
              </span>
            </div>
          </div>

          {/* Control-area breakdown mini bars */}
          <div className="mt-8">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-2 mb-3">
              Control area breakdown
            </p>
            <div className="space-y-2.5">
              {report.control_areas.map((a) => (
                <div key={a.slug} className="flex items-center gap-3">
                  <span className="w-56 flex-none text-xs text-ink-2 truncate">{a.short_name}</span>
                  <div className="flex-1 h-2.5 rounded-full bg-navy border border-edge overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(a.score / 5) * 100}%`, backgroundColor: scoreColor(a.score) }}
                    />
                  </div>
                  <span className="w-8 flex-none text-right text-xs font-semibold" style={{ color: scoreColor(a.score) }}>
                    {a.score.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {!pdfMode && (
            <div className="flex flex-wrap gap-3 mt-8 no-print">
              <a
                href="mailto:vijay@vsecure.ai?subject=vSecure%20demo%20request"
                className="rounded-xl btn-gradient text-white font-semibold px-6 py-3 hover:opacity-90 transition-opacity"
              >
                Book a demo
              </a>
              <button
                type="button"
                onClick={downloadPdf}
                disabled={pdfState === 'loading'}
                className="rounded-xl border border-edge-accent text-accent font-semibold px-6 py-3 hover:bg-card-hover transition-colors disabled:opacity-60 inline-flex items-center gap-2"
              >
                {pdfState === 'loading' && (
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
                    strokeWidth="3" strokeLinecap="round" className="animate-spin" aria-hidden="true">
                    <path d="M12 2a10 10 0 0 1 10 10" />
                  </svg>
                )}
                {pdfState === 'loading' ? 'Preparing PDF…' : 'Download PDF report'}
              </button>
            </div>
          )}
          {pdfState === 'error' && !pdfMode && (
            <p role="alert" className="mt-3 text-sm text-[color:var(--risk-critical)] no-print">
              Could not generate the PDF. Please try again in a moment.
            </p>
          )}
        </section>

        {/* ---- Executive Summary ---- */}
        <Section title="Executive Summary">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-edge bg-card-hover/40 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-accent mb-2">Goals</p>
              <Bullets items={es.goals} marker="•" />
            </div>
            <div className="rounded-xl border border-edge bg-card-hover/40 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-accent mb-2">Key positives</p>
              {es.key_positives.length ? (
                <Bullets items={es.key_positives} marker="✓" />
              ) : (
                <p className="text-sm text-ink-3">No control areas reached a managed level yet.</p>
              )}
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-edge-accent/50 bg-card-hover px-5 py-4 text-center">
            <p className="text-ink font-semibold">{es.benchmark_statement}</p>
          </div>

          {es.key_observations.length > 0 && (
            <div className="mt-4 grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-3 mb-2">Key observations</p>
                <Bullets items={es.key_observations} marker="▸" markerClass="text-[color:var(--risk-high)]" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-3 mb-2">Business impact</p>
                <Bullets items={es.business_impact} marker="▸" markerClass="text-[color:var(--risk-critical)]" />
              </div>
            </div>
          )}

          <p className="text-center text-sm font-semibold text-ink mt-6 mb-3">
            How do we improve the maturity and gain automation?
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-edge bg-card-hover/40 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink mb-2">Quick wins (0–3 months)</p>
              <Bullets items={es.quick_wins} marker="•" />
            </div>
            <div className="rounded-xl border border-edge bg-card-hover/40 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink mb-2">Strategic improvements</p>
              <Bullets items={es.strategic_improvements} marker="•" />
            </div>
            <div className="rounded-xl border border-edge bg-card-hover/40 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink mb-2">Business benefits</p>
              <Bullets items={es.business_benefits} marker="•" />
            </div>
          </div>
        </Section>

        {/* ---- Scope & Current State ---- */}
        <Section title="Scope & Current State">
          <div className="grid lg:grid-cols-[260px_1fr] gap-6">
            <div className="rounded-xl border border-edge bg-card-hover/40 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-accent mb-4">
                Engagement context
              </p>
              {[
                ['Organisation', report.session.company_name],
                ['Assessment type', report.session.assessment_type_name],
                ['Industry', report.session.industry || '-'],
                ['Region', report.session.region || '-'],
                ['Sections assessed', report.engagement.sections_assessed],
                ['Questions answered', report.engagement.questions_answered],
                ['Text responses', report.engagement.text_responses],
              ].map(([k, v]) => (
                <div key={k} className="mb-3">
                  <p className="text-[11px] text-ink-3">{k}</p>
                  <p className="text-sm font-semibold text-ink">{v}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-2 mb-3">
                Control area maturity summary
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {report.control_areas.map((a) => (
                  <DomainScoreBar
                    key={a.slug}
                    name={a.short_name}
                    score={a.score}
                    label={a.label}
                    benchmark={a.benchmark}
                  />
                ))}
              </div>
              <div className="mt-4 rounded-xl bg-card-hover border border-edge px-5 py-3 flex items-center justify-between">
                <span className="text-sm text-ink-2">Overall Maturity Index:</span>
                <span className="text-lg font-bold text-ink">
                  {report.overall_score.toFixed(2)} - {report.maturity_label}
                </span>
              </div>
            </div>
          </div>
        </Section>

        {/* ---- Maturity Footprint ---- */}
        <Section
          title="Maturity Footprint"
          subtitle="Current vs proposed (12-month roadmap target) vs maximum, by control area."
        >
          <RadarChart footprint={report.footprint} height={pdfMode ? 360 : 420} />
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-ink-3 border-b border-edge">
                  <th className="py-2 pr-4 font-medium">Control area</th>
                  <th className="py-2 pr-4 font-medium">Rating</th>
                  <th className="py-2 font-medium">Reason for current rating</th>
                </tr>
              </thead>
              <tbody>
                {report.control_areas.map((a) => (
                  <tr key={a.slug} className="border-b border-edge last:border-0 align-top">
                    <td className="py-2.5 pr-4 text-ink">{a.short_name}</td>
                    <td className="py-2.5 pr-4">
                      <span
                        className="inline-block text-xs font-bold text-white rounded px-2.5 py-1"
                        style={{ backgroundColor: scoreColor(a.score) }}
                      >
                        {a.score.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-2.5 text-ink-2">{a.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* ---- Risk Distribution ---- */}
        <Section
          title="Risk Distribution & Domain Summary"
          subtitle="Question-level risk across all assessed controls."
        >
          <div className="grid md:grid-cols-2 gap-6 items-start">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-2 text-center mb-2">
                Risk distribution (all controls)
              </p>
              <RiskDonut counts={report.risk_distribution.counts} />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-2 mb-3">
                Control areas by risk tier
              </p>
              <div className="space-y-3">
                {['Critical', 'High', 'Medium', 'Low'].map((tier) => {
                  const areas = report.risk_distribution.tiers[tier];
                  return (
                    <div key={tier}>
                      <div
                        className="rounded-md px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white"
                        style={{ backgroundColor: RISK_COLORS[tier] }}
                      >
                        {tier} · {areas.length} {areas.length === 1 ? 'area' : 'areas'}
                      </div>
                      {areas.length ? (
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {areas.map((name) => (
                            <span key={name} className="text-xs text-ink-2 border border-edge rounded-md px-2 py-1">
                              {name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs italic text-ink-3 mt-1.5 ml-1">None</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Section>

        {/* ---- Observations & Remediations ---- */}
        <Section title="Observations & Remediations" subtitle="Detailed findings with remediation steps and indicative durations.">
          <ObservationsTable observations={report.observations} />
        </Section>

        {/* ---- Framework coverage ---- */}
        <Section title="Framework Coverage" subtitle="How assessed controls map to recognised security frameworks.">
          <CoverageBars coverage={report.coverage} />
        </Section>

        {/* ---- Improvement roadmap ---- */}
        <Section title="Improvement Roadmap" subtitle="Prioritised P1 actions and strategic P2 follow-ons across a 12-month horizon.">
          <RoadmapTimeline roadmap={report.roadmap} />
        </Section>

        {/* ---- Detailed remediation actions ---- */}
        <Section title="Detailed Remediation Actions" subtitle="By timeline phase.">
          <div className="grid md:grid-cols-3 gap-4">
            {[
              ['Quick Wins (0–30 days)', report.detailed_actions.quick_wins, 'var(--accent)'],
              ['Medium-Term (30–90 days)', report.detailed_actions.medium_term, 'var(--level-3)'],
              ['Strategic (6–12 months)', report.detailed_actions.strategic, 'var(--text-secondary)'],
            ].map(([title, items, color]) => (
              <div key={title} className="rounded-xl border border-edge bg-card-hover/40 overflow-hidden">
                <p
                  className="text-xs font-bold uppercase tracking-wide text-white px-4 py-2.5"
                  style={{ backgroundColor: color }}
                >
                  {title}
                </p>
                <ul className="p-4 space-y-3">
                  {items.map((it, i) => (
                    <li key={i} className="text-sm text-ink-2 leading-relaxed">
                      <span className="text-ink font-medium">{it.area}: </span>
                      {it.action}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        {/* ---- Current environment understanding ---- */}
        {report.environment.length > 0 && (
          <Section
            title="Current Environment Understanding"
            subtitle="Information responses captured during the assessment, grouped by control area."
          >
            <div className="space-y-5">
              {report.environment.map((grp) => (
                <div key={grp.slug}>
                  <p className="text-sm font-semibold text-accent mb-2">{grp.area}</p>
                  <div className="space-y-3">
                    {grp.items.map((it, i) => (
                      <div key={i} className="rounded-lg border border-edge bg-card-hover/40 px-4 py-3">
                        <p className="text-xs text-ink-3 mb-1">
                          {it.sub_category ? `${it.sub_category} · ` : ''}{it.question}
                        </p>
                        <p className="text-sm text-ink whitespace-pre-line">{it.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ---- Closing CTA ---- */}
        <section className="rounded-2xl border border-edge-accent bg-card p-8 text-center">
          <h2 className="text-xl font-bold text-ink">Ready to close these gaps?</h2>
          <p className="text-ink-2 mt-2 max-w-xl mx-auto">
            vSecure's AI-native identity security platform maps directly to the gaps in
            this report. Talk to us about a tailored remediation plan - this roadmap
            targets a {report.target_score.toFixed(1)} '{report.maturity_label === 'Optimised' ? 'Optimised' : 'Managed'}' posture.
          </p>
          {!pdfMode ? (
            <a
              href="mailto:vijay@vsecure.ai?subject=vSecure%20demo%20request"
              className="inline-block mt-6 rounded-xl btn-gradient text-white font-semibold px-8 py-3.5 hover:opacity-90 transition-opacity no-print"
            >
              Book a demo
            </a>
          ) : (
            <p className="mt-4 text-accent font-semibold">vijay@vsecure.ai · assess.vsecure.ai</p>
          )}
        </section>

        <p className="text-center text-xs text-ink-3 pb-6">
          {report.session.company_name} · {report.session.assessment_type_name} ·
          Based on NIST 800-53, CIS Controls and NIST CSF 2.0 · Generated by vSecure
        </p>
      </main>

      {!pdfMode && <Footer />}
    </div>
  );
}
