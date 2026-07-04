import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import ProgressBar from '../components/ProgressBar';
import DomainNav from '../components/DomainNav';
import LevelOption from '../components/LevelOption';
import Icon from '../components/Icon';
import { api } from '../lib/api';

export default function Assessment() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [index, setIndex] = useState(0);
  const [error, setError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showResume, setShowResume] = useState(false);
  const [copied, setCopied] = useState(false);
  const advanceTimer = useRef(null);

  useEffect(() => {
    api
      .getSession(token)
      .then((d) => {
        if (d.session.completed_at) {
          navigate(`/results/${token}`, { replace: true });
          return;
        }
        setData(d);
        setAnswers(d.answers);
        // Resume at the first unanswered question.
        const all = d.domains.flatMap((dom) => dom.questions);
        const firstOpen = all.findIndex((q) => d.answers[q.id] === undefined);
        setIndex(firstOpen === -1 ? 0 : firstOpen);
      })
      .catch((e) => setError(e.message));
    return () => clearTimeout(advanceTimer.current);
  }, [token, navigate]);

  const questions = useMemo(
    () =>
      (data?.domains || []).flatMap((dom) =>
        dom.questions.map((q) => ({ ...q, domain: dom }))
      ),
    [data]
  );

  if (error) {
    return (
      <div className="min-h-screen bg-navy">
        <Header />
        <p className="text-center text-[color:var(--risk-critical)] py-20">{error}</p>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="min-h-screen bg-navy">
        <Header />
        <p className="text-center text-ink-3 py-20">Loading your assessment…</p>
      </div>
    );
  }

  const q = questions[index];
  const domain = q.domain;
  const answeredCount = questions.filter((qq) => answers[qq.id] !== undefined).length;
  const domainAnswered = domain.questions.filter((qq) => answers[qq.id] !== undefined).length;
  const allAnswered = answeredCount === questions.length;
  const resumeLink = `${window.location.origin}/assessment/${token}`;

  // Auto-save immediately on selection; optimistic UI with rollback on failure.
  function selectLevel(level) {
    const prev = answers[q.id];
    setAnswers((a) => ({ ...a, [q.id]: level }));
    setSaveError(null);
    api.saveAnswer(token, q.id, level).catch(() => {
      setAnswers((a) => ({ ...a, [q.id]: prev }));
      setSaveError('Could not save that answer — check your connection and try again.');
    });
    // Small pause so the selection is visible, then advance.
    if (index < questions.length - 1) {
      clearTimeout(advanceTimer.current);
      advanceTimer.current = setTimeout(() => setIndex((i) => Math.min(i + 1, questions.length - 1)), 350);
    }
  }

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      await api.submit(token);
      navigate(`/results/${token}`);
    } catch (e) {
      setSaveError(e.message);
      setSubmitting(false);
    }
  }

  function jumpToDomain(domainId) {
    const i = questions.findIndex((qq) => qq.domain.id === domainId);
    if (i !== -1) setIndex(i);
  }

  return (
    <div className="min-h-screen bg-navy pb-32">
      <Header cta={false} />

      {/* Overall progress */}
      <div className="max-w-3xl mx-auto px-4 pt-6">
        <ProgressBar answered={answeredCount} total={questions.length} />
      </div>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Domain header */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex-none w-10 h-10 rounded-xl bg-card border border-edge flex items-center justify-center text-accent">
              <Icon name={domain.icon} size={20} />
            </span>
            <div className="min-w-0">
              <h1 className="text-lg font-semibold text-ink truncate">{domain.name}</h1>
              <p className="text-sm text-ink-2">
                {domainAnswered}/{domain.questions.length} questions answered
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowResume(true)}
            className="flex-none text-xs text-ink-2 border border-edge rounded-lg px-3 py-2 hover:bg-card-hover transition-colors"
          >
            Save & continue later
          </button>
        </div>

        {/* Question card */}
        <div className="rounded-2xl border border-edge bg-card p-6">
          <div className="flex items-start justify-between gap-4 mb-5">
            <h2 className="text-xl font-semibold text-ink leading-snug">{q.text}</h2>
            <span
              className="flex-none text-xs font-semibold text-ink-2 border border-edge rounded-full px-3 py-1.5 whitespace-nowrap"
              title="Question weight in scoring"
            >
              Weight ×{q.weight}
            </span>
          </div>
          {(q.nist_reference || q.cis_reference) && (
            <p className="text-xs text-ink-3 mb-5 -mt-3">
              {q.nist_reference && `NIST ${q.nist_reference}`}
              {q.nist_reference && q.cis_reference && ' · '}
              {q.cis_reference && `CIS ${q.cis_reference}`}
              {q.csf_function && ` · CSF: ${q.csf_function}`}
            </p>
          )}

          <div className="space-y-2.5">
            {[1, 2, 3, 4, 5, 0].map((level) => (
              <LevelOption
                key={level}
                level={level}
                label={q.levels[level]}
                selected={answers[q.id] === level}
                onSelect={selectLevel}
              />
            ))}
          </div>
        </div>

        {saveError && (
          <p className="mt-4 text-sm text-[color:var(--risk-critical)]">{saveError}</p>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            type="button"
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index === 0}
            className="rounded-lg border border-edge px-5 py-2.5 text-ink-2 hover:bg-card-hover transition-colors disabled:opacity-40"
          >
            ← Previous
          </button>
          <span className="text-sm text-ink-3">
            Question {index + 1} of {questions.length}
          </span>
          {allAnswered ? (
            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="rounded-lg bg-accent text-white font-semibold px-6 py-2.5 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting ? 'Scoring…' : 'See my results'}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))}
              disabled={index === questions.length - 1}
              className="rounded-lg border border-edge px-5 py-2.5 text-ink-2 hover:bg-card-hover transition-colors disabled:opacity-40"
            >
              Next →
            </button>
          )}
        </div>
      </main>

      {/* Save & continue later modal */}
      {showResume && (
        <div
          className="fixed inset-0 z-40 bg-black/60 flex items-center justify-center px-4"
          onClick={() => setShowResume(false)}
        >
          <div
            className="rounded-2xl border border-edge bg-card p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-ink font-semibold text-lg">Continue later</h3>
            <p className="text-sm text-ink-2 mt-2">
              Every answer is saved automatically. Use your personal link to pick up
              exactly where you left off — it was also emailed to you when you
              registered.
            </p>
            <div className="mt-4 flex gap-2">
              <input
                readOnly
                value={resumeLink}
                className="flex-1 rounded-lg border border-edge bg-card-hover px-3 py-2 text-sm text-ink-2"
                onFocus={(e) => e.target.select()}
              />
              <button
                type="button"
                className="rounded-lg bg-accent text-white text-sm font-semibold px-4"
                onClick={() => {
                  navigator.clipboard?.writeText(resumeLink);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowResume(false)}
              className="mt-4 w-full rounded-lg border border-edge py-2 text-sm text-ink-2 hover:bg-card-hover"
            >
              Back to the assessment
            </button>
          </div>
        </div>
      )}

      <DomainNav
        domains={data.domains}
        answers={answers}
        currentDomainId={domain.id}
        onSelect={jumpToDomain}
      />
    </div>
  );
}
