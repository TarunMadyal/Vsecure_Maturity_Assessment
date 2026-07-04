require('./db/env');
const path = require('path');
const express = require('express');
const cors = require('cors');
const pool = require('./db/pool');

const sessionsRouter = require('./routes/sessions');
const answersRouter = require('./routes/answers');
const resultsRouter = require('./routes/results');
const adminRouter = require('./routes/admin');
const { findSessionByToken } = require('./routes/sessions');
const { generateResultsPdf } = require('./services/pdf');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/sessions', sessionsRouter);
app.use('/api/answers', answersRouter);
app.use('/api/results', resultsRouter);
app.use('/api/admin', adminRouter);

// GET /api/meta — assessment type catalogue for the landing/select pages.
// Question counts and domain lists come straight from the DB so the client
// never hardcodes content.
app.get('/api/meta', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT d.domain_type, d.name, d.slug, d.icon, d.description,
              COUNT(q.id) AS question_count
       FROM domains d LEFT JOIN questions q ON q.domain_id = d.id
       GROUP BY d.id ORDER BY d.sort_order`
    );
    const totalQuestions = rows.reduce((n, r) => n + Number(r.question_count), 0);
    const typed = (type) => rows.filter((r) => r.domain_type === type);
    const sumQ = (list) => list.reduce((n, r) => n + Number(r.question_count), 0);

    const TYPE_INFO = {
      IGA: { name: 'Identity Governance', tagline: 'Joiner/mover/leaver, access reviews and entitlements' },
      PAM: { name: 'Privileged Access', tagline: 'Admin accounts, vaulting, session recording and JIT access' },
      WAM: { name: 'Web Access Management', tagline: 'Workforce SSO, MFA, sessions and access policies' },
      CIAM: { name: 'Customer Identity', tagline: 'Customer login, account protection, consent and recovery' },
    };

    const types = [
      {
        type: 'overall',
        name: 'Full IAM Assessment',
        tagline: 'Every domain, complete maturity picture with benchmarks',
        question_count: totalQuestions,
        minutes: Math.max(25, Math.round(totalQuestions * 0.35)),
        domains: rows.map((r) => ({ name: r.name, slug: r.slug, icon: r.icon })),
      },
      ...Object.entries(TYPE_INFO).map(([type, info]) => {
        const list = typed(type);
        return {
          type,
          name: info.name,
          tagline: info.tagline,
          question_count: sumQ(list),
          minutes: Math.max(10, Math.round(sumQ(list) * 0.6)),
          domains: list.map((r) => ({ name: r.name, slug: r.slug, icon: r.icon })),
        };
      }),
    ];
    res.json({ types, total_questions: totalQuestions });
  } catch (err) {
    next(err);
  }
});

// GET /results/:token/pdf — Puppeteer renders the results page and returns it.
app.get(['/results/:token/pdf', '/api/results/:token/pdf'], async (req, res, next) => {
  try {
    const session = await findSessionByToken(req.params.token);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (!session.completed_at) {
      return res.status(409).json({ error: 'Assessment not yet submitted' });
    }
    const pdf = await generateResultsPdf(session.session_token);
    res.set('Content-Type', 'application/pdf');
    res.set(
      'Content-Disposition',
      `attachment; filename="vsecure-iam-assessment-${session.company_name.replace(/[^\w-]+/g, '-')}.pdf"`
    );
    res.send(Buffer.from(pdf));
  } catch (err) {
    next(err);
  }
});

// Serve the built React client in production; all non-API routes fall back to
// the SPA so /assessment/:token, /results/:token and /admin work on refresh.
const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));
app.get(/^\/(?!api\/).*/, (req, res, next) => {
  res.sendFile(path.join(clientDist, 'index.html'), (err) => {
    if (err) next();
  });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`vSecure IAM Assessment server listening on http://localhost:${PORT}`);
});
