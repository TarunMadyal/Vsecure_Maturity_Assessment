/**
 * PDF generation — Puppeteer renders the results page (in print mode, ?pdf=1)
 * and returns the PDF buffer. The Express server itself serves the built
 * client, so we render against our own local port rather than the public URL.
 */
require('../db/env');
const puppeteer = require('puppeteer');

const PORT = process.env.PORT || 3001;
const RENDER_BASE = process.env.PDF_RENDER_URL || `http://localhost:${PORT}`;

async function generateResultsPdf(token) {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1400 });
    await page.goto(`${RENDER_BASE}/results/${token}?pdf=1`, {
      waitUntil: 'networkidle0',
      timeout: 60000,
    });
    // The results page sets data-report-ready once scores are rendered.
    await page.waitForSelector('[data-report-ready="true"]', { timeout: 30000 });
    return await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '14mm', bottom: '14mm', left: '10mm', right: '10mm' },
    });
  } finally {
    await browser.close();
  }
}

module.exports = { generateResultsPdf };
