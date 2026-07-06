import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import { api } from '../lib/api';

const COMPANY_SIZES = ['1-50', '51-200', '201-1000', '1000+'];
const INDUSTRIES = [
  'Financial Services', 'Healthcare', 'Technology', 'Retail & E-commerce',
  'Manufacturing', 'Government & Public Sector', 'Education', 'Energy & Utilities',
  'Telecommunications', 'Professional Services', 'Media & Entertainment', 'Other',
];
const REGIONS = [
  'UK', 'Europe', 'North America', 'Middle East', 'Asia Pacific', 'Africa',
  'Latin America', 'Global',
];
const TYPE_LABELS = {
  overall: 'Full IAM Assessment',
  IGA: 'Identity Governance (IGA)',
  PAM: 'Privileged Access (PAM)',
  WAM: 'Web Access Management (WAM)',
  CIAM: 'Customer Identity (CIAM)',
};

export default function Register() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const type = TYPE_LABELS[params.get('type')] ? params.get('type') : 'overall';

  const [form, setForm] = useState({
    contact_name: '', contact_email: '', company_name: '',
    contact_role: '', company_size: '', industry: '', region: '',
  });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const { token } = await api.createSession({ ...form, assessment_type: type });
      navigate(`/assessment/${token}`);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  const field =
    'w-full rounded-lg border border-edge bg-card-hover px-3.5 py-2.5 text-ink placeholder:text-ink-3 focus:outline-none focus:border-edge-accent';

  return (
    <div className="min-h-screen bg-navy">
      <Header />
      <main className="max-w-xl mx-auto px-4 py-14">
        <p className="text-accent text-sm font-semibold uppercase tracking-wide text-center">
          {TYPE_LABELS[type]}
        </p>
        <h1 className="text-3xl font-bold text-ink text-center mt-2">
          Before you start
        </h1>
        <p className="text-ink-2 text-center mt-3 mb-8">
          Tell us who the results are for. We'll email you a personal link so you
          can pause and resume any time.
        </p>

        <form onSubmit={onSubmit} className="rounded-2xl border border-edge bg-card p-6 space-y-4">
          <div>
            <label className="block text-sm text-ink-2 mb-1.5" htmlFor="name">Full name *</label>
            <input id="name" required className={field} value={form.contact_name}
              onChange={set('contact_name')} placeholder="Jane Doe" />
          </div>
          <div>
            <label className="block text-sm text-ink-2 mb-1.5" htmlFor="email">Work email *</label>
            <input id="email" type="email" required className={field} value={form.contact_email}
              onChange={set('contact_email')} placeholder="jane@company.com" />
          </div>
          <div>
            <label className="block text-sm text-ink-2 mb-1.5" htmlFor="company">Company name *</label>
            <input id="company" required className={field} value={form.company_name}
              onChange={set('company_name')} placeholder="Acme Ltd" />
          </div>
          <div>
            <label className="block text-sm text-ink-2 mb-1.5" htmlFor="role">Your role</label>
            <input id="role" className={field} value={form.contact_role}
              onChange={set('contact_role')} placeholder="CISO, IT Manager…" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-ink-2 mb-1.5" htmlFor="size">Company size</label>
              <select id="size" className={field} value={form.company_size} onChange={set('company_size')}>
                <option value="">Select…</option>
                {COMPANY_SIZES.map((s) => <option key={s} value={s}>{s} employees</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-ink-2 mb-1.5" htmlFor="industry">Industry</label>
              <select id="industry" className={field} value={form.industry} onChange={set('industry')}>
                <option value="">Select…</option>
                {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-ink-2 mb-1.5" htmlFor="region">Region</label>
            <select id="region" className={field} value={form.region} onChange={set('region')}>
              <option value="">Select…</option>
              {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {error && <p className="text-sm text-[color:var(--risk-critical)]">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl btn-gradient text-white font-semibold py-3.5 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {busy ? 'Creating your assessment…' : 'Start the assessment'}
          </button>
          <p className="text-xs text-ink-3 text-center">
            Wrong assessment? <Link to="/start" className="text-accent">Choose a different one</Link>
          </p>
        </form>
      </main>
    </div>
  );
}
