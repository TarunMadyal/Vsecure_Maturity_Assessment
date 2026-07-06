import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Icon from '../components/Icon';
import { api } from '../lib/api';

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

  return (
    <div className="min-h-screen bg-navy flex flex-col">
      <Header />
      <main id="main" className="flex-1 max-w-6xl w-full mx-auto px-4 py-14">
        <h1 className="text-3xl font-bold text-ink text-center">
          Choose your assessment
        </h1>
        <p className="text-ink-2 text-center mt-3 mb-10 max-w-2xl mx-auto">
          Run the full assessment for a complete maturity picture, or focus on a
          single IAM domain.
        </p>

        {error && (
          <p role="alert" className="text-center text-[color:var(--risk-critical)]">
            {error}
          </p>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4" aria-busy={loading}>
          {loading && (
            <>
              <div className="skeleton h-52 md:col-span-2 lg:col-span-3" aria-hidden="true" />
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton h-64" aria-hidden="true" />
              ))}
            </>
          )}
          {(meta?.types || []).map((t) => (
            <Link
              key={t.type}
              to={`/register?type=${t.type}`}
              className={`card-lift rounded-2xl border bg-card p-6 flex flex-col gap-3
                ${t.type === 'overall' ? 'border-edge-accent md:col-span-2 lg:col-span-3' : 'border-edge'}`}
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-ink">
                  {t.type === 'overall' ? t.name : `${t.type} - ${t.name}`}
                </h2>
                {t.type === 'overall' && (
                  <span className="flex-none text-xs font-semibold text-white btn-gradient rounded-full px-3 py-1">
                    Recommended
                  </span>
                )}
              </div>
              <p className="text-sm text-ink-2">{t.tagline}</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {t.domains.map((d) => (
                  <span
                    key={d.slug}
                    className="inline-flex items-center gap-1.5 text-xs text-ink-2 border border-edge rounded-full px-2.5 py-1"
                  >
                    <Icon name={d.icon} size={12} />
                    {d.name.replace(/\s*\(.*\)$/, '')}
                  </span>
                ))}
              </div>
              <div className="mt-auto pt-3 flex items-center gap-4 text-sm text-ink-3">
                <span>~{t.question_count} questions</span>
                <span aria-hidden="true">·</span>
                <span>~{t.minutes} min</span>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
