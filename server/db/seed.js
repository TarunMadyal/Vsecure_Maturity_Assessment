/**
 * vSecure IAM Maturity Assessment — database seed script.
 *
 * Applies schema.sql, then loads the domains and placeholder questions.
 * Question content lives ONLY here (and in the DB) — never in React components —
 * so Vijay's real questions can be swapped in by editing this file (or the
 * questions table directly) and re-running `npm run seed`.
 *
 * WARNING: re-running this script drops and recreates all four tables.
 */
require('./env');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// Generic placeholder labels following the maturity pattern.
// Level 0 (N/A) comes from the column default in schema.sql.
const generic = () => [
  'Ad hoc and undocumented — no defined process',
  'Repeatable but manual and inconsistent',
  'Standardised, documented process exists',
  'Automated with measurable coverage and metrics',
  'AI-driven and continuously improving',
];

const DOMAINS = [
  {
    name: 'Identity Governance (IGA)',
    slug: 'identity-governance',
    description:
      'How user identities and their access are created, changed, reviewed and removed across the organisation.',
    weight: 3,
    type: 'IGA',
    capability: 'vSecure IGA module',
    icon: 'users',
    questions: [
      {
        text: 'How does your organisation manage user accounts when someone joins or leaves?',
        weight: 3, nist: 'AC-2', csf: 'Protect',
        levels: [
          'Accounts created and removed manually with no standard process',
          'IT follows a manual checklist for joiners and leavers',
          'Documented joiner/mover/leaver process covering all systems',
          'Automated provisioning and deprovisioning driven by the HR system',
          'AI-assisted identity lifecycle that continuously optimises itself',
        ],
      },
      {
        text: 'How do you decide what level of access a new employee gets?',
        weight: 2, nist: 'AC-6', csf: 'Protect',
        levels: [
          'Access granted ad hoc on request, often copied from a colleague',
          'Managers decide case by case; requests are tracked manually',
          'Defined role-based access profiles for common job functions',
          'Automated birthright access driven by role and attribute policies',
          'AI-recommended least-privilege access, continuously right-sized',
        ],
      },
      {
        text: "What happens to accounts and access on an employee's last day?",
        weight: 3, cis: '5.3', csf: 'Protect',
        levels: [
          'No formal step; accounts often remain active after departure',
          'IT disables accounts manually when someone remembers to ask',
          'Documented offboarding checklist covering all systems',
          'Automated same-day deactivation triggered by the HR event',
          'Instant revocation everywhere with continuous verification',
        ],
      },
      {
        text: 'How often are existing access rights formally reviewed and confirmed?',
        weight: 2, nist: 'AC-2(j)', csf: 'Identify',
        levels: [
          'Access rights are never formally reviewed',
          'Occasional manual reviews after incidents or audits',
          'Scheduled periodic access certification campaigns',
          'Automated certifications with completion metrics and escalation',
          'Continuous, risk-driven micro-certifications powered by AI',
        ],
      },
      {
        text: 'How are role changes (promotions, transfers) reflected in system access?',
        weight: 2, nist: 'AC-2', csf: 'Protect',
        levels: [
          'Old access is kept and new access is simply added on top',
          'Managers request changes manually; old access is rarely removed',
          'Documented mover process that adjusts access on role change',
          'Automated access adjustment driven by HR role changes',
          'AI detects and removes unused access after every move',
        ],
      },
      {
        text: 'How is access to sensitive data and critical systems governed?',
        weight: 3, nist: 'AC-3', csf: 'Protect',
        levels: [
          'No specific controls around sensitive systems',
          'Access to sensitive systems is approved manually by owners',
          'Data is classified with defined access policies per tier',
          'Policy-enforced, monitored access with measurable coverage',
          'Adaptive, risk-based controls that continuously improve',
        ],
      },
    ],
  },
  {
    name: 'Privileged Access Management (PAM)',
    slug: 'privileged-access',
    description:
      'How administrator and other high-privilege accounts are controlled, monitored and secured.',
    weight: 3,
    type: 'PAM',
    capability: 'vSecure PAM module',
    icon: 'key',
    questions: [
      {
        text: 'How are admin/IT accounts managed differently from regular employee accounts?',
        weight: 3, nist: 'AC-2(7)', csf: 'Protect',
        levels: [
          'Admins use their everyday accounts for privileged work',
          'Separate admin accounts exist but are unmanaged',
          'Documented standard for separate, inventoried admin accounts',
          'Privileged accounts are vaulted and managed through a PAM tool',
          'Zero-standing-privilege model with AI-driven oversight',
        ],
      },
      {
        text: 'Are actions taken by privileged accounts recorded and reviewable?',
        weight: 3, nist: 'AU-2', csf: 'Detect',
        levels: [
          'No recording or logging of privileged actions',
          'Basic system logs exist but are rarely checked',
          'Defined audit policy; privileged actions logged centrally',
          'Full session recording with searchable audit trails',
          'AI reviews privileged sessions and flags anomalies in real time',
        ],
      },
      {
        text: 'Do IT staff use individual admin accounts or one shared admin login?',
        weight: 3, cis: '5.4', csf: 'Protect',
        levels: [
          'One shared admin login is used by the whole team',
          'Some individual accounts, but shared logins remain common',
          'Policy requires individual admin accounts; sharing is the exception',
          'All privileged access is individual, vaulted and attributable',
          'Shared credentials eliminated; access brokered just-in-time',
        ],
      },
      {
        text: 'How is temporary admin access granted and removed when needed?',
        weight: 2, nist: 'AC-2(2)', csf: 'Protect',
        levels: [
          'Temporary access is granted informally and rarely removed',
          'Granted and removed manually when someone remembers',
          'Documented request and approval process with expiry dates',
          'Automated just-in-time elevation with automatic expiry',
          'AI-approved ephemeral access based on task and risk context',
        ],
      },
      {
        text: 'How are passwords and credentials for admin accounts managed and rotated?',
        weight: 2, cis: '5.2', csf: 'Protect',
        levels: [
          'Admin passwords rarely change and are often reused',
          'Passwords rotated manually on an ad hoc schedule',
          'Documented rotation policy for privileged credentials',
          'Automated vault-driven rotation after each use',
          'Passwordless or ephemeral credentials with continuous validation',
        ],
      },
      {
        text: 'How do you detect and respond to unusual privileged account behaviour?',
        weight: 3, nist: 'SI-4', csf: 'Detect',
        levels: [
          'No way to detect unusual privileged activity',
          'Manual log reviews when something looks wrong',
          'Defined alerts for key privileged account events',
          'Automated behavioural monitoring with measured response times',
          'AI-driven anomaly detection with automated containment',
        ],
      },
    ],
  },
  {
    name: 'Web Access Management (WAM)',
    slug: 'web-access',
    description:
      'How employees authenticate to internal web applications and how those sessions and policies are enforced.',
    weight: 2,
    type: 'WAM',
    capability: 'vSecure WAM module',
    icon: 'globe',
    questions: [
      {
        text: 'What method do employees use to log into internal company applications?',
        weight: 2, nist: 'IA-2', csf: 'Protect',
        levels: [
          'Each app has its own local username and password',
          'Some apps tied to the directory; many stand-alone',
          'Standard corporate login used across most applications',
          'Centralised SSO with strong authentication everywhere',
          'Passwordless, adaptive sign-in that is continuously optimised',
        ],
      },
      {
        text: 'Is MFA required to access internal web applications?',
        weight: 3, nist: 'IA-2(1)', csf: 'Protect',
        levels: [
          'No MFA on internal applications',
          'MFA on a few critical apps, enabled manually',
          'Policy-driven MFA rollout across internal applications',
          'MFA enforced everywhere with coverage metrics',
          'Risk-based, phishing-resistant authentication adapting in real time',
        ],
      },
      {
        text: 'Do employees use single sign-on or log in separately to each application?',
        weight: 2, cis: '6.5', csf: 'Protect',
        levels: [
          'Separate logins for every application',
          'SSO for a handful of apps; the rest are manual',
          'SSO is the standard for onboarding new applications',
          'Near-total SSO coverage, measured and enforced',
          'Unified access fabric continuously extended by automation',
        ],
      },
      {
        text: 'Does a login session automatically expire after inactivity?',
        weight: 2, nist: 'AC-12', csf: 'Protect',
        levels: [
          'Sessions never expire',
          'Some apps time out; settings are inconsistent',
          'Documented session timeout standard applied to key apps',
          'Centrally enforced, measurable session policies',
          'Adaptive session length based on real-time risk',
        ],
      },
      {
        text: 'How are access policies enforced across different web applications?',
        weight: 2, nist: 'AC-4', csf: 'Protect',
        levels: [
          'No consistent access policies across web apps',
          'Policies configured manually per application',
          'Documented access policy standard for all web apps',
          'Central policy engine enforcing access automatically',
          'AI-tuned policies that adapt to usage and threat signals',
        ],
      },
      {
        text: 'How is access to web applications controlled based on user role?',
        weight: 2, nist: 'AC-3', csf: 'Protect',
        levels: [
          'Everyone sees everything once logged in',
          'App-by-app permissions maintained by hand',
          'Defined role model mapped to application entitlements',
          'Automated role-based enforcement with regular attestation',
          'Dynamic, attribute-based access continuously optimised',
        ],
      },
    ],
  },
  {
    name: 'Customer Identity (CIAM)',
    slug: 'customer-identity',
    description:
      'How customers register, sign in and manage their identity on your products, and how those accounts are protected.',
    weight: 2,
    type: 'CIAM',
    capability: 'vSecure CIAM module',
    icon: 'user-check',
    questions: [
      {
        text: 'How do customers currently sign in to your platform or app?',
        weight: 2, nist: 'IA-2 (adapted)', csf: 'Protect',
        levels: [
          'Basic username/password built in-house',
          'Managed sign-in with manual account administration',
          'Standard CIAM patterns: social login and verified email flows',
          'Dedicated CIAM platform with MFA and analytics',
          'Passwordless, adaptive customer authentication',
        ],
      },
      {
        text: 'What security measures protect customer accounts from unauthorised access?',
        weight: 2, cis: '4.1', csf: 'Protect',
        levels: [
          'No specific protections beyond a password',
          'Manual lockouts and basic rate limiting',
          'Documented controls: optional MFA and breached-password checks',
          'Automated bot defence and credential-stuffing protection',
          'AI-based risk scoring on every customer login',
        ],
      },
      {
        text: 'How is customer consent for data usage collected and managed?',
        weight: 2, nist: 'PT', csf: 'Govern',
        levels: [
          'Consent is not explicitly captured',
          'Consent captured at signup but hard to change later',
          'Defined consent flows with a self-service preference centre',
          'Auditable, versioned consent enforced across systems',
          'Fine-grained consent continuously synchronised everywhere',
        ],
      },
      {
        text: 'Can your customer login system handle sudden traffic spikes without downtime?',
        weight: 2, nist: 'SC', csf: 'Protect',
        levels: [
          'The login system struggles even under normal peaks',
          'Spikes handled with manual scaling and firefighting',
          'Documented capacity plan; load tested regularly',
          'Auto-scaling identity platform with SLOs and monitoring',
          'Self-healing, globally distributed login infrastructure',
        ],
      },
      {
        text: 'How are compromised customer accounts detected and handled?',
        weight: 3, nist: 'IR-4', csf: 'Respond',
        levels: [
          'We find out when customers complain',
          'Support investigates and resets accounts manually',
          'Documented playbook for customer account takeover',
          'Automated detection with forced step-up or reset',
          'AI detects takeovers in real time and remediates automatically',
        ],
      },
      {
        text: 'How do customers reset their credentials securely?',
        weight: 2, nist: 'IA-5', csf: 'Protect',
        levels: [
          'Resets are handled by emailing support',
          'Self-service reset with a basic email link',
          'Standardised secure reset with identity verification',
          'Risk-scored reset flows with step-up authentication',
          'Passwordless recovery that adapts to fraud signals',
        ],
      },
    ],
  },
  {
    name: 'Access Governance',
    slug: 'access-governance',
    description:
      'How access control policies are documented, monitored and enforced across the organisation.',
    weight: 2,
    type: 'overall',
    capability: 'vSecure IGA module — policy & compliance',
    icon: 'clipboard-check',
    questions: [
      { text: 'How are access control policies documented and maintained?', csf: 'Govern', levels: generic() },
      { text: 'How is compliance with access policies monitored and reported?', csf: 'Identify', levels: generic() },
      { text: 'How are access violations or policy breaches handled?', csf: 'Respond', levels: generic() },
    ],
  },
  {
    name: 'Authentication',
    slug: 'authentication',
    description:
      'How the strength and method of authentication is managed for employees and external users.',
    weight: 2,
    type: 'overall',
    capability: 'vSecure Adaptive Authentication',
    icon: 'lock',
    questions: [
      { text: "What is your organisation's approach to password policies?", csf: 'Protect', levels: generic() },
      { text: 'How is authentication strength adapted to the sensitivity of the resource?', csf: 'Protect', levels: generic() },
      { text: 'How do you manage authentication for third-party and external users?', csf: 'Protect', levels: generic() },
    ],
  },
  {
    name: 'Monitoring and Analytics',
    slug: 'monitoring-analytics',
    description:
      'How identity-related events are logged, analysed and acted upon.',
    weight: 2,
    type: 'overall',
    capability: 'vSecure Identity Analytics',
    icon: 'activity',
    questions: [
      { text: 'How are identity-related events logged and stored?', csf: 'Detect', levels: generic() },
      { text: 'How is suspicious identity behaviour detected?', csf: 'Detect', levels: generic() },
      { text: 'How are identity logs reviewed and acted upon?', csf: 'Respond', levels: generic() },
    ],
  },
  {
    name: 'Cloud IAM',
    slug: 'cloud-iam',
    description:
      'How identities, roles and permissions are governed across cloud platforms such as AWS, Azure and GCP.',
    weight: 2,
    type: 'overall',
    capability: 'vSecure Cloud IAM module',
    icon: 'cloud',
    questions: [
      { text: 'How are IAM configurations across cloud platforms (AWS, Azure, GCP) managed?', csf: 'Protect', levels: generic() },
      { text: 'How are cloud permissions reviewed for over-provisioning?', csf: 'Identify', levels: generic() },
      { text: 'How are cloud access misconfigurations detected and remediated?', csf: 'Detect', levels: generic() },
    ],
  },
  {
    name: 'Third-party and Vendor Access',
    slug: 'third-party-access',
    description:
      'How access for contractors, vendors and partners is provisioned, monitored and revoked.',
    weight: 1,
    type: 'overall',
    capability: 'vSecure External Identity module',
    icon: 'briefcase',
    questions: [
      { text: 'How is access for contractors and vendors provisioned and managed?', csf: 'Protect', levels: generic() },
      { text: 'How is third-party access monitored during engagement?', csf: 'Detect', levels: generic() },
      { text: 'How is third-party access revoked at end of contract?', csf: 'Protect', levels: generic() },
    ],
  },
  {
    name: 'Security Policies and Training',
    slug: 'policies-training',
    description:
      'How IAM policy, awareness and compliance obligations are maintained and evidenced.',
    weight: 1,
    type: 'overall',
    capability: 'vSecure Governance Advisory',
    icon: 'book-open',
    questions: [
      { text: 'Is there a documented IAM security policy reviewed at least annually?', csf: 'Govern', levels: generic() },
      { text: 'How is IAM security awareness training delivered to employees?', csf: 'Govern', levels: generic() },
      { text: 'How are IAM-related compliance requirements tracked and evidenced?', csf: 'Govern', levels: generic() },
    ],
  },
];

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

  console.log('Seeding domains and questions…');
  for (let d = 0; d < DOMAINS.length; d++) {
    const dom = DOMAINS[d];
    const [res] = await conn.execute(
      `INSERT INTO domains (name, slug, description, domain_weight, domain_type, vsecure_capability, icon, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [dom.name, dom.slug, dom.description, dom.weight, dom.type, dom.capability, dom.icon, d + 1]
    );
    const domainId = res.insertId;
    for (let q = 0; q < dom.questions.length; q++) {
      const qu = dom.questions[q];
      await conn.execute(
        `INSERT INTO questions
           (domain_id, question_text, question_weight, nist_reference, cis_reference, csf_function,
            level_1_label, level_2_label, level_3_label, level_4_label, level_5_label, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          domainId, qu.text, qu.weight || 1, qu.nist || null, qu.cis || null, qu.csf || null,
          qu.levels[0], qu.levels[1], qu.levels[2], qu.levels[3], qu.levels[4], q + 1,
        ]
      );
    }
  }

  const [[{ nd }]] = await conn.query('SELECT COUNT(*) nd FROM domains');
  const [[{ nq }]] = await conn.query('SELECT COUNT(*) nq FROM questions');
  console.log(`Seed complete: ${nd} domains, ${nq} questions.`);
  await conn.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
