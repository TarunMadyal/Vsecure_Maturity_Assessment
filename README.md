# vSecure IAM Maturity Assessment Platform

A web platform where enterprise teams (CISOs, IT managers) evaluate their
organisation's identity & access management maturity across IAM domains,
see weighted scores against industry benchmarks, and get a personalised
90-day remediation roadmap mapped to vSecure capabilities.

Hosted at **assess.vsecure.ai**. This is a *maturity assessment*, not a quiz —
every question is answered on a Level 1–5 scale (plus Level 0 = N/A):

| Level | Name | Meaning |
|---|---|---|
| 0 | N/A | Not applicable to our organisation *(excluded from scoring)* |
| 1 | Initial | Ad hoc, chaotic, no defined process |
| 2 | Managed | Repeatable but manual |
| 3 | Defined | Standardised process exists |
| 4 | Quantified | Automated and measurable |
| 5 | Optimising | AI-driven, continuously improving |

## Stack

- **Frontend:** React 18 (Vite) + Tailwind CSS + Recharts, dark navy/teal theme
- **Backend:** Node.js + Express
- **Database:** MySQL (works with MariaDB)
- **PDF:** Puppeteer renders the results page server-side
- **Email:** Nodemailer (lead + completion notifications)

## Quick start

```bash
# 1. Install everything (npm workspaces)
npm install

# 2. Configure
cp .env.example .env       # fill in DB credentials, SMTP, ADMIN_PASSWORD

# 3. Create the database, then apply schema + seed placeholder questions
mysql -e "CREATE DATABASE vsecure_iam"
npm run seed               # drops & recreates all tables — dev only

# 4. Develop (Express on :3001, Vite on :5173 with /api proxy)
npm run dev

# 5. Production
npm run build              # builds client/dist
npm start                  # Express serves the API + built client on :3001
```

If SMTP credentials are left empty, emails are logged to the console instead
of sent, so the whole flow works locally without a mail account.

## Project layout

```
client/                  React frontend (no question text hardcoded anywhere)
  src/components/        LevelOption, DomainNav, ProgressBar, RadarChart,
                         DomainScoreBar, CriticalGapCard, RoadmapTimeline, …
  src/pages/             Landing, SelectType, Register, Assessment, Results, Admin
server/
  routes/                sessions.js, answers.js, results.js, admin.js
  services/              scoring.js (scoring engine), email.js, pdf.js,
                         recommendations.js (gap text, benchmarks, roadmap)
  db/                    schema.sql, seed.js, pool.js
  index.js               Express app; also serves client/dist + SPA fallback
```

## Key routes

| Route | Purpose |
|---|---|
| `GET /` | Landing page |
| `GET /start` | Assessment type selection (full / IGA / PAM / WAM / CIAM) |
| `GET /register?type=…` | Lead capture form — creates the session |
| `GET /assessment/:token` | The assessment (auto-saves every answer) |
| `GET /results/:token` | Scored report (`?pdf=1` = print layout) |
| `GET /results/:token/pdf` | Puppeteer-generated PDF download |
| `GET /admin` | Password-protected dashboard + CSV export |

### API

```
POST /api/sessions                 create session (register form)
GET  /api/sessions/:token          session + questions + saved answers
POST /api/answers                  save one answer immediately (upsert)
POST /api/sessions/:token/submit   run scoring, store results, send emails
GET  /api/results/:token           full scored report payload
GET  /api/meta                     assessment-type catalogue (from DB)
GET  /api/admin/sessions           all sessions            (Basic auth)
GET  /api/admin/sessions/:token    one full report         (Basic auth)
GET  /api/admin/stats              aggregate domain scores (Basic auth)
GET  /api/admin/export             CSV export              (Basic auth)
```

Admin endpoints use HTTP Basic auth: username `admin`, password =
`ADMIN_PASSWORD` from `.env`.

## Scoring

Runs **server-side only** (`server/services/scoring.js`), on submit:

- `domain_score = SUM(level × question_weight) / SUM(5 × question_weight) × 5`
- Overall score = domain scores weighted by `domain_weight`
- Critical gaps = bottom 3 domains by score
- **Level 0 (N/A) answers are excluded** so organisations aren't penalised for
  questions that don't apply; a domain answered entirely N/A is omitted.
- Risk bands: `<1.5` Critical · `<2.5` High · `<3.5` Medium · else Low

Results are stored on the session row (`overall_score`, `domain_scores`,
`critical_gaps`) at submit time.

## Swapping in the real questions

Placeholder content lives in `server/db/seed.js` (one entry per domain with
its questions, weights, NIST/CIS references and level labels). Replace the
text there and re-run `npm run seed`, or edit the `questions` table directly —
the client renders whatever the database returns, including question counts
and estimated durations.

The score-derived report copy (business-risk explanations, industry
benchmarks, roadmap actions per domain) lives in
`server/services/recommendations.js`, keyed by domain slug.

## Environment variables

See `.env.example`. Notable ones:

- `ADMIN_PASSWORD` — required for `/admin` and `/api/admin/*`
- `BASE_URL` — public URL used in emails (https://assess.vsecure.ai)
- `PUPPETEER_EXECUTABLE_PATH` — optional path to a system Chromium for PDF
  generation (leave empty to use Puppeteer's bundled Chrome)
