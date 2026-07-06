/**
 * Email service - Nodemailer.
 *
 * If SMTP credentials are not configured (dev environments), emails are
 * logged to the console instead of sent, so the rest of the flow still works.
 */
require('../db/env');
const nodemailer = require('nodemailer');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'vijay@vsecure.ai';
const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';
const FROM = process.env.SMTP_FROM || `vSecure Assessments <${process.env.SMTP_USER || 'no-reply@vsecure.ai'}>`;

function transporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

async function send(mail) {
  const t = transporter();
  if (!t) {
    console.log(`[email:dev] To: ${mail.to} | Subject: ${mail.subject}`);
    return;
  }
  try {
    await t.sendMail({ from: FROM, ...mail });
  } catch (err) {
    // Email failures must never break the assessment flow.
    console.error('[email] send failed:', err.message);
  }
}

const wrap = (body) => `
  <div style="background:#080e1c;padding:32px;font-family:Segoe UI,Arial,sans-serif;color:#f0f6ff">
    <div style="max-width:560px;margin:0 auto;background:#0d1627;border:1px solid #1a2540;border-radius:12px;padding:32px">
      <h2 style="color:#1D9E75;margin-top:0">vSecure</h2>
      ${body}
      <p style="color:#475569;font-size:12px;margin-bottom:0">vSecure - AI-native identity security · assess.vsecure.ai</p>
    </div>
  </div>`;

const button = (href, label) =>
  `<p><a href="${href}" style="display:inline-block;background:#1D9E75;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600">${label}</a></p>`;

// ---- Registration (assessment started) ----

async function sendRegistrationEmails(session) {
  const link = `${BASE_URL}/assessment/${session.session_token}`;

  await send({
    to: ADMIN_EMAIL,
    subject: `New assessment started: ${session.company_name} - ${session.contact_email} - ${session.assessment_type}`,
    html: wrap(`
      <p><strong>${session.contact_name}</strong> (${session.contact_role || 'role not given'})
      at <strong>${session.company_name}</strong> has started a
      <strong>${session.assessment_type}</strong> assessment.</p>
      <p>
        Name: ${session.contact_name}<br/>
        Email: ${session.contact_email}<br/>
        Role: ${session.contact_role || '-'}<br/>
        Company: ${session.company_name}<br/>
        Company size: ${session.company_size || '-'}<br/>
        Industry: ${session.industry || '-'}<br/>
        Region: ${session.region || '-'}<br/>
        Assessment: ${session.assessment_type}
      </p>
      ${button(`${BASE_URL}/admin`, 'Open admin dashboard')}
    `),
  });

  await send({
    to: session.contact_email,
    subject: 'Your vSecure IAM Assessment link',
    html: wrap(`
      <p>Hi ${session.contact_name},</p>
      <p>Thanks for starting the vSecure IAM Maturity Assessment for
      <strong>${session.company_name}</strong>. Your progress is saved automatically -
      you can return any time using your personal link below.</p>
      ${button(link, 'Continue my assessment')}
      <p style="color:#94a3b8;font-size:13px">Or copy this link: ${link}</p>
    `),
  });
}

// ---- Completion (results ready) ----

async function sendCompletionEmails(session, results) {
  const resultsLink = `${BASE_URL}/results/${session.session_token}`;
  const gaps = results.criticalGaps.map((g) => g.name).join(', ');

  await send({
    to: ADMIN_EMAIL,
    subject: `Assessment completed: ${session.company_name} - Score: ${results.overallScore.toFixed(1)}/5 - Critical gaps: ${gaps}`,
    html: wrap(`
      <p><strong>${session.company_name}</strong> (${session.contact_email}) completed a
      <strong>${session.assessment_type}</strong> assessment.</p>
      <p>Overall score: <strong>${results.overallScore.toFixed(2)} / 5</strong><br/>
      Critical gaps: ${gaps}</p>
      ${button(`${BASE_URL}/admin`, 'View in admin dashboard')}
    `),
  });

  await send({
    to: session.contact_email,
    subject: 'Your vSecure IAM Assessment Results',
    html: wrap(`
      <p>Hi ${session.contact_name},</p>
      <p>Your IAM maturity results for <strong>${session.company_name}</strong> are ready.
      Overall maturity score: <strong>${results.overallScore.toFixed(1)} / 5</strong>.</p>
      ${button(resultsLink, 'View my results')}
      <p style="color:#94a3b8;font-size:13px">
        You can also <a href="${resultsLink}/pdf" style="color:#1D9E75">download the PDF report</a>.</p>
    `),
  });
}

module.exports = { sendRegistrationEmails, sendCompletionEmails };
