import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
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
  WAM: 'Workforce Access Management (WAM)',
  CIAM: 'Customer Identity (CIAM)',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Field definitions drive validation, progress and rendering order.
const FIELDS = [
  { key: 'contact_name', label: 'Full name', required: true, placeholder: 'Jane Doe',
    validate: (v) => (v.trim().length >= 2 ? null : 'Please enter your full name') },
  { key: 'contact_email', label: 'Work email', required: true, type: 'email', placeholder: 'jane@company.com',
    validate: (v) => (EMAIL_RE.test(v.trim()) ? null : 'Enter a valid email, e.g. jane@company.com') },
  { key: 'company_name', label: 'Company name', required: true, placeholder: 'Acme Ltd',
    validate: (v) => (v.trim().length >= 2 ? null : 'Please enter your company name') },
  { key: 'contact_role', label: 'Your role', placeholder: 'CISO, IT Manager…' },
  { key: 'company_size', label: 'Company size', options: COMPANY_SIZES.map((s) => [s, `${s} employees`]) },
  { key: 'industry', label: 'Industry', options: INDUSTRIES.map((i) => [i, i]) },
  { key: 'region', label: 'Region', options: REGIONS.map((r) => [r, r]) },
];

const CheckIcon = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor"
    strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const Spinner = () => (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor"
    strokeWidth="3" strokeLinecap="round" className="animate-spin" aria-hidden="true">
    <path d="M12 2a10 10 0 0 1 10 10" />
  </svg>
);

export default function Register() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const type = TYPE_LABELS[params.get('type')] ? params.get('type') : 'overall';

  const [form, setForm] = useState(Object.fromEntries(FIELDS.map((f) => [f.key, ''])));
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState('idle'); // idle | submitting | success
  const [serverError, setServerError] = useState(null);

  const fieldState = useMemo(() => {
    const state = {};
    for (const f of FIELDS) {
      const value = form[f.key];
      const error = f.validate ? f.validate(value) : null;
      const complete = f.validate ? !error : value.trim() !== '';
      state[f.key] = { error, complete, showError: touched[f.key] && f.required && !!error };
    }
    return state;
  }, [form, touched]);

  const completedCount = FIELDS.filter((f) => fieldState[f.key].complete).length;
  const requiredFields = FIELDS.filter((f) => f.required);
  const requiredDone = requiredFields.filter((f) => fieldState[f.key].complete).length;
  const allRequiredValid = requiredDone === requiredFields.length;
  const pct = Math.round((completedCount / FIELDS.length) * 100);

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setServerError(null);
  };
  const blur = (key) => () => setTouched((t) => ({ ...t, [key]: true }));

  async function onSubmit(e) {
    e.preventDefault();
    if (!allRequiredValid || status !== 'idle') return;
    setServerError(null);
    setStatus('submitting');
    try {
      const { token } = await api.createSession({ ...form, assessment_type: type });
      setStatus('success');
      // Let the confirmation register visually before moving on.
      setTimeout(() => navigate(`/assessment/${token}`), 900);
    } catch (err) {
      setServerError(err.message || 'Something went wrong. Please try again.');
      setStatus('idle');
    }
  }

  const inputClass = (f) => {
    const s = fieldState[f.key];
    const border = s.showError
      ? 'border-[color:var(--invalid)]'
      : s.complete && touched[f.key]
        ? 'border-[color:var(--valid)]/60'
        : 'border-edge focus:border-edge-accent';
    return `w-full rounded-lg border bg-card-hover px-3.5 py-2.5 text-ink placeholder:text-ink-3 focus:outline-none transition-colors ${border}`;
  };

  return (
    <div className="min-h-screen bg-navy flex flex-col">
      <Header />
      <main id="main" className="flex-1 max-w-xl w-full mx-auto px-4 py-14">
        <p className="text-accent text-sm font-semibold uppercase tracking-wide text-center">
          {TYPE_LABELS[type]}
        </p>
        <h1 className="text-3xl font-bold text-ink text-center mt-2">Before you start</h1>
        <p className="text-ink-2 text-center mt-3 mb-8">
          Tell us who the results are for. We'll email you a personal link so you can
          pause and resume any time.
        </p>

        <form
          onSubmit={onSubmit}
          noValidate
          className="rounded-2xl border border-edge bg-card p-6 space-y-4"
          aria-describedby="form-progress"
        >
          {/* Live completion progress */}
          <div id="form-progress" aria-live="polite">
            <div className="flex items-baseline justify-between text-xs mb-1.5">
              <span className="text-ink-2">
                {completedCount} of {FIELDS.length} fields completed
              </span>
              <span className={`font-semibold ${allRequiredValid ? 'text-[color:var(--valid)]' : 'text-ink-2'}`}>
                {allRequiredValid ? 'Ready to start' : `${pct}%`}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-card-hover overflow-hidden border border-edge">
              <div
                className={`h-full rounded-full transition-all duration-300 ${allRequiredValid ? 'bg-[color:var(--valid)]' : 'btn-gradient'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {FIELDS.map((f) => {
            const s = fieldState[f.key];
            const errorId = `${f.key}-error`;
            return (
              <div key={f.key}>
                <label className="flex items-center justify-between text-sm text-ink-2 mb-1.5" htmlFor={f.key}>
                  <span>
                    {f.label}
                    {f.required && <span className="text-[color:var(--invalid)] ml-0.5" aria-hidden="true">*</span>}
                    {!f.required && <span className="text-ink-3 ml-1.5 text-xs">(optional)</span>}
                  </span>
                  {s.complete && touched[f.key] && (
                    <span className="text-[color:var(--valid)] inline-flex items-center gap-1 text-xs animate-pop-in">
                      <CheckIcon />
                    </span>
                  )}
                </label>
                {f.options ? (
                  <select
                    id={f.key}
                    value={form[f.key]}
                    onChange={set(f.key)}
                    onBlur={blur(f.key)}
                    className={inputClass(f)}
                  >
                    <option value="">Select…</option>
                    {f.options.map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={f.key}
                    type={f.type || 'text'}
                    required={f.required}
                    value={form[f.key]}
                    onChange={set(f.key)}
                    onBlur={blur(f.key)}
                    placeholder={f.placeholder}
                    aria-invalid={s.showError || undefined}
                    aria-describedby={s.showError ? errorId : undefined}
                    className={inputClass(f)}
                  />
                )}
                {s.showError && (
                  <p id={errorId} role="alert" className="mt-1.5 text-xs text-[color:var(--invalid)] animate-fade-up">
                    {s.error}
                  </p>
                )}
              </div>
            );
          })}

          {serverError && (
            <div role="alert" className="rounded-lg border border-[color:var(--invalid)]/50 bg-[color:var(--invalid)]/10 px-4 py-3 text-sm text-[color:var(--invalid)] animate-fade-up">
              {serverError} - your details are kept, just press the button again.
            </div>
          )}

          <button
            type="submit"
            disabled={!allRequiredValid || status !== 'idle'}
            aria-disabled={!allRequiredValid || status !== 'idle'}
            className={`w-full rounded-xl font-semibold py-3.5 flex items-center justify-center gap-2 transition-all duration-300
              ${status === 'success'
                ? 'bg-[color:var(--valid)] text-white'
                : allRequiredValid && status === 'idle'
                  ? 'btn-gradient text-white hover:opacity-90 focus-visible:opacity-90'
                  : 'bg-card-hover text-ink-3 cursor-not-allowed border border-edge'}`}
          >
            {status === 'submitting' && <><Spinner /> Creating your assessment…</>}
            {status === 'success' && <><CheckIcon className="animate-pop-in" /> Assessment created - taking you there…</>}
            {status === 'idle' && 'Start the assessment'}
          </button>
          <p className="text-xs text-ink-3 text-center" aria-live="polite">
            {allRequiredValid
              ? <>Wrong assessment? <Link to="/start" className="text-accent">Choose a different one</Link></>
              : 'Complete all required fields (*) to continue'}
          </p>
        </form>
      </main>
      <Footer />
    </div>
  );
}
