import { useEffect, useState } from 'react';
import Header from '../components/Header';
import DomainScoreBar from '../components/DomainScoreBar';
import { RISK_COLORS, scoreColor } from '../lib/theme';
import { api } from '../lib/api';

export default function Admin() {
  const [password, setPassword] = useState(sessionStorage.getItem('vsecure_admin') || '');
  const [input, setInput] = useState('');
  const [authed, setAuthed] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState(null);
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState(null);

  async function load(pw) {
    setError(null);
    try {
      const [list, agg] = await Promise.all([api.adminSessions(pw), api.adminStats(pw)]);
      setSessions(list.sessions);
      setStats(agg);
      setAuthed(true);
      setPassword(pw);
      sessionStorage.setItem('vsecure_admin', pw);
    } catch (e) {
      sessionStorage.removeItem('vsecure_admin');
      setAuthed(false);
      setError(e.status === 401 ? 'Wrong password' : e.message);
    }
  }

  useEffect(() => {
    if (password) load(password);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function openDetail(row) {
    if (!row.completed_at) return;
    setDetail({ loading: true });
    try {
      setDetail(await api.adminSessionDetail(password, row.session_token));
    } catch (e) {
      setDetail(null);
      setError(e.message);
    }
  }

  async function exportCsv() {
    const res = await fetch('/api/admin/export', { headers: api.adminAuth(password) });
    if (!res.ok) return setError('Export failed');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vsecure-assessments.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

  if (!authed) {
    return (
      <div className="min-h-screen bg-navy">
        <Header cta={false} />
        <main className="max-w-sm mx-auto px-4 py-24">
          <h1 className="text-2xl font-bold text-ink text-center mb-6">Admin dashboard</h1>
          <form
            className="rounded-2xl border border-edge bg-card p-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              load(input);
            }}
          >
            <label className="block text-sm text-ink-2" htmlFor="pw">Admin password</label>
            <input
              id="pw"
              type="password"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full rounded-lg border border-edge bg-card-hover px-3.5 py-2.5 text-ink focus:outline-none focus:border-edge-accent"
              autoFocus
            />
            {error && <p className="text-sm text-[color:var(--risk-critical)]">{error}</p>}
            <button className="w-full rounded-xl btn-gradient text-white font-semibold py-3">
              Sign in
            </button>
          </form>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy pb-20">
      <Header cta={false} />
      <main className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-ink">Assessments</h1>
            {stats && (
              <p className="text-sm text-ink-2 mt-1">
                {stats.totals.completed} completed of {stats.totals.total} started
                {stats.totals.avg_overall !== null && ` · average score ${stats.totals.avg_overall.toFixed(2)}/5`}
              </p>
            )}
          </div>
          <button
            onClick={exportCsv}
            className="rounded-lg border border-edge-accent text-accent font-semibold px-5 py-2.5 hover:bg-card-hover transition-colors"
          >
            Export to CSV
          </button>
        </div>

        {/* Aggregate intelligence */}
        {stats && stats.domains.length > 0 && (
          <section className="rounded-2xl border border-edge bg-card p-6">
            <h2 className="text-lg font-semibold text-ink mb-1">Average score by domain</h2>
            <p className="text-sm text-ink-2 mb-5">Across all completed assessments - weakest first.</p>
            <div className="space-y-4">
              {stats.domains.map((d) => (
                <div key={d.slug}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-ink">{d.name}</span>
                    <span className="text-ink-2">
                      {d.avg_score.toFixed(2)} / 5 · {d.companies} {d.companies === 1 ? 'company' : 'companies'}
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-card-hover border border-edge overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(d.avg_score / 5) * 100}%`, backgroundColor: scoreColor(d.avg_score) }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Sessions table */}
        <section className="rounded-2xl border border-edge bg-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ink-3 border-b border-edge">
                <th className="px-4 py-3 font-medium">Company</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Score</th>
                <th className="px-4 py-3 font-medium">Completed</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr
                  key={s.session_token}
                  onClick={() => openDetail(s)}
                  className={`border-b border-edge last:border-0 ${
                    s.completed_at ? 'cursor-pointer hover:bg-card-hover' : 'opacity-60'
                  }`}
                >
                  <td className="px-4 py-3 text-ink">{s.company_name}</td>
                  <td className="px-4 py-3 text-ink-2">{s.contact_email}</td>
                  <td className="px-4 py-3 text-ink-2">{s.assessment_type}</td>
                  <td className="px-4 py-3">
                    {s.overall_score !== null ? (
                      <span className="font-semibold" style={{ color: RISK_COLORS[s.risk] }}>
                        {s.overall_score.toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-ink-3">in progress ({s.answers_count} answers)</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink-2">{fmtDate(s.completed_at)}</td>
                </tr>
              ))}
              {sessions.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-ink-3">
                    No assessments yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </main>

      {/* Detail drawer */}
      {detail && (
        <div
          className="fixed inset-0 z-40 bg-black/60 flex justify-end"
          onClick={() => setDetail(null)}
        >
          <div
            className="w-full max-w-lg h-full overflow-y-auto bg-card border-l border-edge p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {detail.loading ? (
              <p className="text-ink-3">Loading…</p>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-ink">{detail.session.company_name}</h2>
                    <p className="text-sm text-ink-2 mt-1">
                      {detail.contact.email} · {detail.contact.role || 'role n/a'} ·{' '}
                      {detail.contact.company_size || 'size n/a'} · {detail.contact.industry || 'industry n/a'}
                    </p>
                  </div>
                  <button onClick={() => setDetail(null)} className="text-ink-3 hover:text-ink text-xl leading-none">
                    ✕
                  </button>
                </div>
                <div className="mt-5 rounded-xl border border-edge bg-card-hover p-4 flex items-center justify-between">
                  <span className="text-ink-2 text-sm">Overall maturity</span>
                  <span className="text-2xl font-bold text-ink">
                    {detail.overall_score.toFixed(2)}<span className="text-sm text-ink-3 font-normal"> / 5</span>
                    <span className="ml-3 text-sm font-semibold" style={{ color: RISK_COLORS[detail.risk] }}>
                      {detail.maturity_label}
                    </span>
                  </span>
                </div>
                <div className="mt-6 grid gap-3">
                  {detail.control_areas.map((a) => (
                    <DomainScoreBar
                      key={a.slug}
                      name={a.short_name}
                      score={a.score}
                      label={a.label}
                      benchmark={a.benchmark}
                    />
                  ))}
                </div>
                <div className="mt-6">
                  <h3 className="text-ink font-semibold mb-2">Critical gaps</h3>
                  <ul className="space-y-1.5 text-sm text-ink-2">
                    {detail.critical_gaps.map((g, i) => (
                      <li key={g.slug}>
                        {i + 1}. {g.name} - {g.score.toFixed(1)}/5 ·{' '}
                        <span style={{ color: RISK_COLORS[g.risk] }}>{g.risk} risk</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <a
                  href={`/results/${detail.session.token}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block mt-6 text-accent text-sm font-semibold"
                >
                  Open full report →
                </a>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
