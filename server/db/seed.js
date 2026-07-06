/**
 * vSecure IAM Maturity Assessment - database seed script.
 *
 * Applies schema.sql, then loads the control areas and questions from
 * questionBank.js. Assessment content lives ONLY in the question bank (and
 * the DB) - never in React components - so updated workbooks from the
 * security team are swapped in by editing questionBank.js and re-running
 * `npm run seed`.
 *
 * WARNING: re-running this script drops and recreates all four tables.
 */
require('./env');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const { AREAS, DEFAULT_LEVELS } = require('./questionBank');

async function seed() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'vsecure_iam',
    multipleStatements: true,
  });

  console.log('Applying schema…');
  await conn.query(`
    SET FOREIGN_KEY_CHECKS = 0;
    DROP TABLE IF EXISTS answers, assessment_sessions, questions, domains;
    SET FOREIGN_KEY_CHECKS = 1;
  `);
  await conn.query(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));

  console.log('Seeding control areas and questions…');
  let areaCount = 0;
  let questionCount = 0;
  let sort = 0;

  for (const [areaType, area] of Object.entries(AREAS)) {
    for (const ca of area.controlAreas) {
      sort += 1;
      const [res] = await conn.execute(
        `INSERT INTO domains (name, slug, description, domain_weight, domain_type, vsecure_capability, icon, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [ca.name, ca.slug, ca.description || null, ca.weight || 1, areaType, ca.capability || null, ca.icon || 'shield', sort]
      );
      const domainId = res.insertId;
      areaCount += 1;

      for (let q = 0; q < ca.questions.length; q++) {
        const qu = ca.questions[q];
        const isMaturity = qu.type === 'M';
        const levels = isMaturity ? (qu.levels || DEFAULT_LEVELS) : [null, null, null, null, null];
        await conn.execute(
          `INSERT INTO questions
             (domain_id, sub_category, question_type, question_text, guidance, question_weight,
              nist_reference, cis_reference, csf_function,
              level_1_label, level_2_label, level_3_label, level_4_label, level_5_label, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            domainId, qu.sub || null, isMaturity ? 'maturity' : 'information',
            qu.text, qu.guidance || null, qu.weight || 1,
            qu.nist || null, qu.cis || null, qu.csf || null,
            levels[0], levels[1], levels[2], levels[3], levels[4], q + 1,
          ]
        );
        questionCount += 1;
      }
    }
  }

  const [[byType]] = await conn.query(
    `SELECT SUM(question_type = 'maturity') m, SUM(question_type = 'information') i FROM questions`
  );
  console.log(
    `Seed complete: ${areaCount} control areas, ${questionCount} questions ` +
    `(${byType.m} maturity, ${byType.i} information).`
  );
  await conn.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
