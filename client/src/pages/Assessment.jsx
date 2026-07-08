import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import ProgressBar from '../components/ProgressBar';
import ControlAreaNav from '../components/ControlAreaNav';
import LevelOption from '../components/LevelOption';
import Icon from '../components/Icon';
import { api } from '../lib/api';
import { areaTheme, LEVEL_COLORS, LEVEL_NAMES, LEVEL_MEANINGS } from '../lib/theme';

const answered = (q, answers) => {
  const a = answers[q.id];
  if (!a) return false;
  return q.type === 'maturity' ? a.level !== undefined : Boolean(a.text && a.text.trim());
};

/** Always-visible reference so raters never have to guess what a level means. */
function ScaleReference({ theme }) {
  return (
    <div className="rounded-2xl border border-edge bg-card p-5">
      <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.accent }} aria-hidden="true" />
        The maturity scale
      </h3>
      <p className="text-xs text-ink-3 mt-1 mb-4">
        Pick the level that best matches your reality today.
      </p>
      <ul className="space-y-3">
        {[1, 2, 3, 4, 5, 0].map((lvl) => (
          <li key={lvl} className="flex gap-3">
            <span
              className="flex-none w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
              style={{ backgroundColor: LEVEL_COLORS[lvl] }}
            >
              {lvl}
            </span>
            <span className="min-w-0">
              <span className="block text-[13px] font-semibold" style={{ color: LEVEL_COLORS[lvl] }}>
                {LEVEL_NAMES[lvl]}
              </span>
              <span className="block text-xs text-ink-3 leading-snug">{LEVEL_MEANINGS[lvl]}</span>
            </span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-ink-3 mt-4 pt-4 border-t border-edge leading-relaxed">
        Only maturity ratings drive your score. Higher-weighted questions count
        for more.
      </p>
    </div>
  );
}

/** Right-hand context for information questions. */
function InfoReference({ theme }) {
  return (
    <div className="rounded-2xl border border-edge bg-card p-5">
      <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.accent }} aria-hidden="true" />
        Information question
      </h3>
      <p className="text-xs text-ink-2 mt-3 leading-relaxed">
        These capture your current environment in your own words. They add
        colour and context to your report.
      </p>
      <ul className="mt-4 space-y-2.5 text-xs text-ink-3">
        <li className="flex gap-2">
          <span style={{ color: theme.accent }}>•</span>
          They do <span className="text-ink-2 font-medium">not</span> affect your score.
        </li>
        <li className="flex gap-2">
          <span style={{ color: theme.accent }}>•</span>
          Saved automatically as you type.
        </li>
        <li className="flex gap-2">
          <span style={{ color: theme.accent }}>•</span>
          Skip any that don't apply to you.
        </li>
      </ul>
    </div>
  );
}

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
  const [infoDraft, setInfoDraft] = useState('');
  const [infoSaved, setInfoSaved] = useState(false);
  const [pulseLevel, setPulseLevel] = useState(null);
  const advanceTimer = useRef(null);
  const infoTimer = useRef(null);

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
        const all = d.control_areas.flatMap((ca) => ca.questions);
        const firstOpen = all.findIndex((q) => !answered(q, d.answers));
        setIndex(firstOpen === -1 ? 0 : firstOpen);
      })
      .catch((e) => setError(e.message));
    return () => {
      clearTimeout(advanceTimer.current);
      clearTimeout(infoTimer.current);
    };
  }, [token, navigate]);

  const questions = useMemo(
    () =>
      (data?.control_areas || []).flatMap((area) =>
        area.questions.map((q) => ({ ...q, area }))
      ),
    [data]
  );

  const q = questions[index];

  // Reset per-question transient UI (pulse + info draft) whenever the current
  // question changes.
  useEffect(() => {
    setPulseLevel(null);
    if (q && q.type === 'information') {
      setInfoDraft(answers[q.id]?.text || '');
      setInfoSaved(Boolean(answers[q.id]?.text));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, data]);

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

  const area = q.area;
  const t = areaTheme(area.area_type);
  const maturityQuestions = questions.filter((qq) => qq.type === 'maturity');
  const maturityAnswered = maturityQuestions.filter((qq) => answered(qq, answers)).length;
  const infoAnswered = questions.filter(
    (qq) => qq.type === 'information' && answered(qq, answers)
  ).length;
  const areaMaturity = area.questions.filter((qq) => qq.type === 'maturity');
  const areaAnswered = areaMaturity.filter((qq) => answered(qq, answers)).length;
  const areaPos = area.questions.findIndex((qq) => qq.id === q.id) + 1;
  const allMaturityAnswered = maturityAnswered === maturityQuestions.length;
  const resumeLink = `${window.location.origin}/assessment/${token}`;

  // ---- auto-save ----

  function selectLevel(level) {
    const prev = answers[q.id];
    setAnswers((a) => ({ ...a, [q.id]: { level } }));
    setPulseLevel(level);
    setSaveError(null);
    api.saveAnswer(token, q.id, { level }).catch(() => {
      setAnswers((a) => ({ ...a, [q.id]: prev }));
      setSaveError('Could not save that answer - check your connection and try again.');
    });
    if (index < questions.length - 1) {
      clearTimeout(advanceTimer.current);
      advanceTimer.current = setTimeout(() => {
        // Clear the pulse in the same batch as the advance so the confirmation
        // glow never bleeds onto the next question's option.
        setPulseLevel(null);
        setIndex((i) => Math.min(i + 1, questions.length - 1));
      }, 350);
    }
  }

  // Move between questions, always dropping any lingering answer pulse.
  function goTo(updater) {
    clearTimeout(advanceTimer.current);
    setPulseLevel(null);
    setIndex(updater);
  }

  function onInfoChange(text) {
    setInfoDraft(text);
    setInfoSaved(false);
    setSaveError(null);
    clearTimeout(infoTimer.current);
    const qid = q.id;
    infoTimer.current = setTimeout(() => {
      setAnswers((a) => ({ ...a, [qid]: text.trim() ? { text } : undefined }));
      api
        .saveAnswer(token, qid, { text })
        .then(() => setInfoSaved(true))
        .catch(() => setSaveError('Could not save your response - check your connection and try again.'));
    }, 700);
  }

  async function submit() {
    setSubmitting(true);
    try {
      await api.submit(token);
      navigate(`/results/${token}`);
    } catch (e) {
      setSaveError(e.message);
      setSubmitting(false);
    }
  }

  function jumpToArea(areaId) {
    const i = questions.findIndex((qq) => qq.area.id === areaId);
    if (i !== -1) goTo(i);
  }

  return (
    <div className="min-h-screen bg-navy pb-16">
      <Header cta={false} />

      {/* Scoring overlay: blocks interaction and duplicate submits while the
          engine runs, then the app navigates to the report. */}
      {submitting && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4"
          role="status"
          aria-live="assertive"
        >
          <div className="rounded-2xl border border-edge bg-card px-8 py-7 text-center animate-pop-in">
            <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="var(--accent)"
              strokeWidth="2.5" strokeLinecap="round" className="animate-spin mx-auto" aria-hidden="true">
              <path d="M12 2a10 10 0 0 1 10 10" />
            </svg>
            <p className="text-ink font-semibold mt-4">Scoring your assessment…</p>
            <p className="text-sm text-ink-2 mt-1">Building your maturity report and roadmap.</p>
          </div>
        </div>
      )}

      <div className="max-w-[1500px] mx-auto px-4 xl:px-8 pt-6">
        <div className="flex items-center justify-between gap-4 mb-1.5">
          <span className="text-sm text-ink-3">
            {infoAnswered > 0
              ? `${infoAnswered} information response${infoAnswered === 1 ? '' : 's'} captured`
              : 'Maturity ratings drive your score; information questions enrich the report'}
          </span>
          <button
            type="button"
            onClick={() => setShowResume(true)}
            className="flex-none text-xs text-ink-2 border border-edge rounded-lg px-3 py-1.5 hover:bg-card-hover transition-colors no-print"
          >
            Save & continue later
          </button>
        </div>
        <ProgressBar answered={maturityAnswered} total={maturityQuestions.length} />
      </div>

      <main id="main" className="max-w-[1500px] mx-auto px-4 xl:px-8 py-8 flex flex-col lg:flex-row gap-6 xl:gap-7 lg:items-start">
        <ControlAreaNav
          areas={data.control_areas}
          answers={answers}
          currentAreaId={area.id}
          onSelect={jumpToArea}
        />

        {/* Center column: the current question. Capped for comfortable reading
            on very wide screens; the reference panel fills the rest. */}
        <div className="flex-1 min-w-0">
          <div className="w-full xl:max-w-3xl xl:mx-auto">
            {/* Control area header, tinted with the domain's accent */}
            <div className="flex items-center gap-3 mb-5">
              <span
                className="flex-none w-10 h-10 rounded-xl flex items-center justify-center border"
                style={{ backgroundColor: t.soft, borderColor: t.ring, color: t.accent }}
              >
                <Icon name={area.icon} size={20} />
              </span>
              <div className="min-w-0">
                <h1 className="text-lg font-semibold text-ink truncate flex items-center gap-2">
                  <span className="truncate">{area.name}</span>
                  {data.session.assessment_type === 'overall' && (
                    <span
                      className="flex-none text-[10px] font-bold uppercase tracking-wider rounded-md px-2 py-0.5 border"
                      style={{ color: t.accent, backgroundColor: t.soft, borderColor: t.ring }}
                    >
                      {area.area_type}
                    </span>
                  )}
                </h1>
                <p className="text-sm text-ink-2">
                  Question {areaPos} of {area.questions.length} in this area
                  <span className="text-ink-3"> · {areaAnswered}/{areaMaturity.length} rated</span>
                </p>
              </div>
            </div>

            {/* Question card - keyed on the question id so it animates in on
                every advance, making it obvious a new question has arrived. */}
            <div
              key={q.id}
              className="animate-q-enter relative overflow-hidden rounded-2xl border border-edge bg-card p-6"
              style={{ '--pulse': t.ring }}
            >
              {/* Thin domain accent strip along the top of the card */}
              <span
                className="absolute inset-x-0 top-0 h-[3px]"
                style={{ backgroundColor: t.accent }}
                aria-hidden="true"
              />

              <div className="flex items-center gap-2 mb-4 flex-wrap">
                {q.sub_category && (
                  <span className="text-xs font-medium text-ink-2 border border-edge rounded-full px-3 py-1">
                    {q.sub_category}
                  </span>
                )}
                <span
                  className="text-xs font-semibold rounded-full px-3 py-1 border"
                  style={
                    q.type === 'maturity'
                      ? { color: t.accent, borderColor: t.ring, backgroundColor: t.soft }
                      : { color: 'var(--level-3)', borderColor: 'var(--level-3)' }
                  }
                >
                  {q.type === 'maturity' ? 'Maturity rating' : 'Information'}
                </span>
                {q.type === 'maturity' && (
                  <span
                    className="ml-auto text-xs font-semibold text-ink-2 border border-edge rounded-full px-3 py-1 whitespace-nowrap"
                    title="Question weight in scoring"
                  >
                    Weight ×{q.weight}
                  </span>
                )}
              </div>

              <h2 className="text-lg font-semibold text-ink leading-snug whitespace-pre-line">
                {q.text}
              </h2>
              {(q.nist_reference || q.cis_reference) && (
                <p className="text-xs text-ink-3 mt-1.5">
                  {q.nist_reference && `NIST ${q.nist_reference}`}
                  {q.nist_reference && q.cis_reference && ' · '}
                  {q.cis_reference && `CIS ${q.cis_reference}`}
                  {q.csf_function && ` · CSF: ${q.csf_function}`}
                </p>
              )}

              {q.type === 'maturity' ? (
                <div className="space-y-2.5 mt-5">
                  {[1, 2, 3, 4, 5, 0].map((level) => (
                    <LevelOption
                      key={level}
                      level={level}
                      label={q.levels[level]}
                      selected={answers[q.id]?.level === level}
                      pulse={pulseLevel === level}
                      accent={t.accent}
                      onSelect={selectLevel}
                    />
                  ))}
                </div>
              ) : (
                <div className="mt-5">
                  <p className="text-sm text-ink-2 mb-3">
                    Describe your current environment. This is captured as-is for the
                    report's current-state understanding - it does not affect your score,
                    and you can skip it if it doesn't apply.
                  </p>
                  <textarea
                    value={infoDraft}
                    onChange={(e) => onInfoChange(e.target.value)}
                    rows={6}
                    placeholder="Type your response…"
                    className="w-full rounded-xl border border-edge bg-card-hover px-4 py-3 text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-edge-accent resize-y"
                  />
                  <p className="text-xs mt-1.5 h-4">
                    {infoSaved && infoDraft.trim() && <span className="text-accent">Saved ✓</span>}
                  </p>
                </div>
              )}
            </div>

            {saveError && (
              <p className="mt-4 text-sm text-[color:var(--risk-critical)]">{saveError}</p>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              <button
                type="button"
                onClick={() => goTo((i) => Math.max(0, i - 1))}
                disabled={index === 0}
                className="rounded-lg border border-edge px-5 py-2.5 text-ink-2 hover:bg-card-hover transition-colors disabled:opacity-40"
              >
                ← Previous
              </button>
              <span className="text-sm text-ink-3">
                {index + 1} / {questions.length}
              </span>
              {allMaturityAnswered && index === questions.length - 1 ? (
                <button
                  type="button"
                  onClick={submit}
                  disabled={submitting}
                  className="rounded-lg btn-gradient text-white font-semibold px-6 py-2.5 hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {submitting ? 'Scoring…' : 'See my results'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => goTo((i) => Math.min(questions.length - 1, i + 1))}
                  disabled={index === questions.length - 1}
                  className="rounded-lg border border-edge px-5 py-2.5 text-ink-2 hover:bg-card-hover transition-colors disabled:opacity-40"
                >
                  {q.type === 'information' && !infoDraft.trim() ? 'Skip →' : 'Next →'}
                </button>
              )}
            </div>

            {allMaturityAnswered && index !== questions.length - 1 && (
              <div className="mt-6 rounded-xl border border-edge-accent bg-card p-4 flex items-center justify-between gap-4">
                <p className="text-sm text-ink-2">
                  All maturity questions are rated - you can submit now or keep adding
                  information detail.
                </p>
                <button
                  type="button"
                  onClick={submit}
                  disabled={submitting}
                  className="flex-none rounded-lg btn-gradient text-white font-semibold px-5 py-2.5 hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {submitting ? 'Scoring…' : 'See my results'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right reference panel - fills the desktop width and keeps the
            maturity scale in view so the flow never feels ambiguous. */}
        <aside className="hidden xl:block w-80 flex-none no-print" aria-label="Reference">
          <div className="sticky top-20">
            {q.type === 'maturity' ? <ScaleReference theme={t} /> : <InfoReference theme={t} />}
          </div>
        </aside>
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
              exactly where you left off - it was also emailed to you when you
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
    </div>
  );
}
