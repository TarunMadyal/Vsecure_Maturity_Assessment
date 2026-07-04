/**
 * Report content that is derived from scores: plain-English business-risk
 * explanations per domain, industry benchmark values, and the templates used
 * to assemble the personalised 90-day remediation roadmap.
 *
 * Keyed by domain slug so new/renamed domains only need a row here — nothing
 * in the React client hardcodes domain or question content.
 */

const GAP_EXPLANATIONS = {
  'identity-governance':
    'Without governed joiner/mover/leaver processes, ex-employees and over-privileged staff retain access they should not have. This is one of the most common root causes of insider incidents and failed audits.',
  'privileged-access':
    'Unmanaged admin accounts are the fastest route from a single phished user to full domain compromise. Attackers specifically target privileged credentials because one account can unlock everything.',
  'web-access':
    'Weak or inconsistent workforce login controls mean a single stolen password can expose internal applications. Missing MFA and SSO gaps materially increase both breach likelihood and helpdesk cost.',
  'customer-identity':
    'Weak customer identity controls lead to account takeover, fraud losses and regulatory exposure. Customer trust is hard to win back after a publicised breach of their accounts.',
  'access-governance':
    'Undocumented or unmonitored access policies make it impossible to prove compliance. Auditors treat missing evidence the same as missing controls, putting certifications and contracts at risk.',
  'authentication':
    'Static, one-size-fits-all authentication leaves sensitive systems protected no better than trivial ones. Password-only access is the entry point for the majority of breaches.',
  'monitoring-analytics':
    'If identity events are not logged and reviewed, breaches go undetected for months. You cannot respond to what you cannot see, and dwell time drives breach cost.',
  'cloud-iam':
    'Cloud permissions sprawl quickly, and a single misconfigured role can expose entire environments. Most cloud breaches trace back to identity and entitlement misconfiguration.',
  'third-party-access':
    'Vendors and contractors with standing access are an attack path you do not fully control. Several high-profile breaches began with a supplier account that was never revoked.',
  'policies-training':
    'Without current policy and trained staff, technical controls erode over time. Regulators and cyber-insurers increasingly require documented IAM policy and awareness evidence.',
};

// Static industry benchmark per domain (typical mid-market maturity, /5).
const BENCHMARKS = {
  'identity-governance': 3.1,
  'privileged-access': 3.0,
  'web-access': 3.3,
  'customer-identity': 3.0,
  'access-governance': 2.9,
  'authentication': 3.2,
  'monitoring-analytics': 2.8,
  'cloud-iam': 2.7,
  'third-party-access': 2.5,
  'policies-training': 2.8,
};

// Per-domain remediation actions for each roadmap phase.
const ROADMAP_ACTIONS = {
  'identity-governance': {
    week12: 'Inventory all user accounts and disable any belonging to leavers.',
    week34: 'Document a joiner/mover/leaver process and assign owners.',
    month2: 'Automate provisioning from HR with vSecure IGA and launch access certifications.',
    month3: 'Track certification completion and orphan-account metrics; tune role model.',
  },
  'privileged-access': {
    week12: 'Identify every privileged account and eliminate shared admin logins.',
    week34: 'Enforce separate admin accounts with MFA and a credential rotation policy.',
    month2: 'Vault privileged credentials and enable session recording with vSecure PAM.',
    month3: 'Move to just-in-time elevation and alert on anomalous privileged behaviour.',
  },
  'web-access': {
    week12: 'Enable MFA on the most critical internal applications.',
    week34: 'Define an SSO onboarding standard and session timeout policy.',
    month2: 'Roll out SSO and central access policies via vSecure WAM.',
    month3: 'Measure MFA/SSO coverage and adopt phishing-resistant factors.',
  },
  'customer-identity': {
    week12: 'Enable breached-password checks and rate limiting on customer login.',
    week34: 'Document an account-takeover playbook and secure reset flow.',
    month2: 'Migrate to a dedicated CIAM platform (vSecure CIAM) with MFA and consent management.',
    month3: 'Add risk-based authentication and automated takeover remediation.',
  },
  'access-governance': {
    week12: 'Collect existing access policies and identify undocumented areas.',
    week34: 'Publish a single access control policy with defined exceptions handling.',
    month2: 'Automate policy compliance monitoring and violation workflows.',
    month3: 'Report policy compliance KPIs to leadership each month.',
  },
  'authentication': {
    week12: 'Raise password minimums and block known-breached passwords.',
    week34: 'Classify resources by sensitivity and define step-up authentication rules.',
    month2: 'Deploy adaptive authentication for sensitive systems and external users.',
    month3: 'Trend authentication failures and phase in passwordless for high-risk roles.',
  },
  'monitoring-analytics': {
    week12: 'Turn on identity event logging for directory, VPN and key applications.',
    week34: 'Centralise identity logs and define retention plus review cadence.',
    month2: 'Deploy identity analytics (vSecure Identity Analytics) with anomaly alerts.',
    month3: 'Integrate identity alerts into incident response with measured MTTR.',
  },
  'cloud-iam': {
    week12: 'Enumerate cloud IAM roles/keys and remove unused credentials.',
    week34: 'Define least-privilege baselines per cloud platform.',
    month2: 'Deploy automated entitlement review and misconfiguration detection.',
    month3: 'Continuously right-size cloud permissions from usage data.',
  },
  'third-party-access': {
    week12: 'List all active vendor/contractor accounts and their expiry dates.',
    week34: 'Require sponsorship, end dates and MFA for every third-party account.',
    month2: 'Automate expiry-based revocation and monitor third-party sessions.',
    month3: 'Review vendor access quarterly against contract status.',
  },
  'policies-training': {
    week12: 'Locate the current IAM policy and note gaps against actual practice.',
    week34: 'Publish an updated IAM policy with an annual review owner.',
    month2: 'Launch role-targeted IAM awareness training with completion tracking.',
    month3: 'Map controls to compliance requirements and collect evidence automatically.',
  },
};

const PHASES = [
  { key: 'week12', title: 'Week 1–2', subtitle: 'Immediate quick wins' },
  { key: 'week34', title: 'Week 3–4', subtitle: 'Define processes and policy' },
  { key: 'month2', title: 'Month 2', subtitle: 'Automate with tooling' },
  { key: 'month3', title: 'Month 3', subtitle: 'Measure and optimise' },
];

function gapExplanation(slug) {
  return (
    GAP_EXPLANATIONS[slug] ||
    'Low maturity in this domain increases the likelihood and impact of identity-related breaches and audit findings.'
  );
}

function benchmark(slug) {
  return BENCHMARKS[slug] ?? 3.0;
}

// Personalised 90-day roadmap: one action per critical-gap domain per phase.
function buildRoadmap(criticalGaps) {
  return PHASES.map((phase) => ({
    title: phase.title,
    subtitle: phase.subtitle,
    actions: criticalGaps.map((gap) => ({
      domain: gap.name,
      slug: gap.slug,
      action:
        (ROADMAP_ACTIONS[gap.slug] && ROADMAP_ACTIONS[gap.slug][phase.key]) ||
        'Prioritise remediation actions for this domain with your vSecure advisor.',
    })),
  }));
}

module.exports = { gapExplanation, benchmark, buildRoadmap };
