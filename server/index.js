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

// GET /api/meta - assessment type catalogue for the landing/select pages.
// Control-area lists and question counts come straight from the DB so the
// client never hardcodes content.
app.get('/api/meta', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT d.domain_type, d.name, d.slug, d.icon, d.description,
              SUM(q.question_type = 'maturity') AS maturity_count,
              SUM(q.question_type = 'information') AS info_count
       FROM domains d LEFT JOIN questions q ON q.domain_id = d.id
       GROUP BY d.id ORDER BY d.sort_order`
    );
    const typed = (type) => rows.filter((r) => r.domain_type === type);
    const counts = (list) => ({
      maturity: list.reduce((n, r) => n + Number(r.maturity_count || 0), 0),
      info: list.reduce((n, r) => n + Number(r.info_count || 0), 0),
    });
    // ~0.5 min per maturity rating, ~1.5 min per information response.
    const minutes = (c) => Math.max(10, Math.round(c.maturity * 0.5 + c.info * 1.5));

    const TYPE_INFO = {
      IGA: { name: 'Identity Governance & Administration', tagline: 'Lifecycle automation, provisioning, certification and reporting' },
      PAM: { name: 'Privileged Access Management', tagline: 'Vaulting, least privilege, session monitoring and machine identities' },
      WAM: { name: 'Workforce Access Management', tagline: 'SSO coverage, MFA, sessions, governance and compliance evidence' },
      CIAM: { name: 'Customer Identity', tagline: 'Customer login, consent, fraud protection and resilience' },
    };

    const allCounts = counts(rows);
    const types = [
      {
        type: 'overall',
        name: 'Full IAM Assessment',
        tagline: 'Every control area across IGA, PAM, WAM and CIAM',
        question_count: allCounts.maturity + allCounts.info,
        maturity_count: allCounts.maturity,
        info_count: allCounts.info,
        minutes: minutes(allCounts),
        domains: rows.map((r) => ({ name: r.name, slug: r.slug, icon: r.icon })),
      },
      ...Object.entries(TYPE_INFO).map(([type, info]) => {
        const list = typed(type);
        const c = counts(list);
        return {
          type,
          name: info.name,
          tagline: info.tagline,
          question_count: c.maturity + c.info,
          maturity_count: c.maturity,
          info_count: c.info,
          minutes: minutes(c),
          domains: list.map((r) => ({ name: r.name, slug: r.slug, icon: r.icon })),
        };
      }),
    ];
    res.json({ types });
  } catch (err) {
    next(err);
  }
});

// GET /results/:token/pdf - Puppeteer renders the results page and returns it.
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
