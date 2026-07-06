# vSecure IAM Maturity Assessment Platform

A web platform where enterprise teams (CISOs, IT managers) evaluate their
organisation's identity & access management maturity, capture their current
environment, and receive a board-ready report with a prioritised 12-month
improvement roadmap. Hosted at **assess.vsecure.ai**.

## Assessment model

```
assessment area (IGA / PAM / WAM / CIAM — or "overall" = all areas)
  └─ control area            e.g. "PAM Strategy & Landscape"   (scored /5)
      └─ sub-category        e.g. "Architecture"
          └─ question
              ├─ maturity     — rated Level 1–5 (or 0 = N/A, excluded)
              └─ information  — free text, unscored, reported as
                                current-environment understanding
```

Maturity framework levels: **1 Initial · 2 Repeatable · 3 Defined ·
4 Managed · 5 Optimised**. Risk tiers per the report legend: Critical (≤1),
High (≤2), Medium (≤3), Low (>3).

Question sets (in `server/db/questionBank.js`):
- **PAM** — full workbook: 7 control areas, 84 questions
- **WAM** — framework matrix + report sections: 8 control areas, 35 questions
  (with the framework's own per-level descriptors where provided)
- **IGA** — questionnaire: 6 control areas, 45 questions
- **CIAM** — structured placeholders pending the CIAM workbook: 6 areas, 22 questions

## Report structure (results page + PDF)

Mirrors the vSecure reference report: title page with overall score and
control-area breakdown → executive summary (goals, key positives, industry
benchmark statement, key observations, business impact, quick wins /
strategic improvements / business benefits) → scope & current state
(engagement context: sections assessed, questions answered, text responses)
→ maturity footprint radar (current vs proposed vs maximum) with reasons per
rating → question-level risk distribution and areas by risk tier →
observations & remediations with durations → framework coverage
(covered 4–5 / partial 2–3 / not covered 1, per framework) → 6-phase
improvement roadmap (P1 risk-prioritised + P2 strategic) → detailed
remediation actions → current environment understanding (information
responses).

## Stack

- **Frontend:** React 18 (Vite) + Tailwind CSS + Recharts, dark navy/teal theme
- **Backend:** Node.js + Express
- **Database:** MySQL (works with MariaDB)
- **PDF:** Puppeteer renders the results page server-side
- **Email:** Nodemailer (lead + completion notifications)

## Quick start

```bash
npm install                # workspaces: root, client, server
cp .env.example .env       # DB credentials, SMTP, ADMIN_PASSWORD
mysql -e "CREATE DATABASE vsecure_iam"
npm run seed               # drops & recreates all tables — dev only
npm run dev                # Express :3001 + Vite :5173 (/api proxied)
```

Production: `npm run build` then `npm start` — Express serves the API and
the built client on one port. If SMTP credentials are left empty, emails are
logged to the console instead of sent.

## Project layout

```
client/src/components/   LevelOption, ControlAreaNav, ProgressBar, RadarChart,
                         DomainScoreBar, RiskDonut, CoverageBars,
                         ObservationsTable, RoadmapTimeline, …
client/src/pages/        Landing, SelectType, Register, Assessment, Results, Admin
server/routes/           sessions.js, answers.js, results.js, admin.js
server/services/         scoring.js (engine), report.js (report payload),
                         recommendations.js (per-area narrative content),
                         email.js, pdf.js
server/db/               schema.sql, questionBank.js (ALL assessment content),
                         seed.js, pool.js
```

## Key routes

| Route | Purpose |
|---|---|
| `GET /` | Landing page |
| `GET /start` | Assessment type selection (full / IGA / PAM / WAM / CIAM) |
| `GET /register?type=…` | Lead capture (name, email, company, role, size, industry, region) |
| `GET /assessment/:token` | Assessment: control-area sidebar, maturity + information questions, auto-save |
| `GET /results/:token` | Full report (`?pdf=1` = print layout) |
| `GET /results/:token/pdf` | Puppeteer-generated PDF download |
| `GET /admin` | Password-protected dashboard + CSV export |

### API

```
POST /api/sessions                 create session (register form)
GET  /api/sessions/:token          session + control areas/questions + answers
POST /api/answers                  auto-save one answer: {level} or {text}
POST /api/sessions/:token/submit   score (all maturity questions required)
GET  /api/results/:token           full report payload
GET  /api/meta                     assessment-type catalogue (from DB)
GET  /api/admin/…                  sessions / detail / stats / export (Basic auth)
```

Admin endpoints use HTTP Basic auth: username `admin`, password =
`ADMIN_PASSWORD` from `.env`.

## Scoring

Server-side only (`server/services/scoring.js`), on submit:

- Control-area score = `SUM(level × weight) / SUM(5 × weight) × 5` over
  **maturity** answers; Level 0 (N/A) and information answers excluded.
- Overall = weighted average of control-area scores (weights default 1 →
  simple average, matching the reference report).
- Submission requires every maturity question answered; information
  questions are optional discovery detail.
- Results stored on the session row; answers lock after submit.

## Updating assessment content

All questions live in `server/db/questionBank.js` — control areas,
sub-categories, question types, framework references and per-level
descriptors. Edit and re-run `npm run seed`. Per-area report narrative
(observations, remediation steps, reasons, roadmap actions, benchmarks)
lives in `server/services/recommendations.js`, keyed by control-area slug
with a generic fallback for new areas.
