/**
 * Report content derived from scores, keyed by control-area slug.
 * Every entry supplies: positive (high-maturity note), observation (gap
 * finding), impact (business consequence), remediation (numbered steps),
 * quick_win (P1 roadmap action), strategic (P2 roadmap action), duration,
 * and reasons per score band. genericContent() covers any new control area
 * that has no bespoke entry yet, so content stays data-driven.
 */

const AREA_CONTENT = {
  /* ------------------------------- PAM ------------------------------- */
  'pam-strategy-landscape': {
    positive: 'A defined PAM strategy and architecture provides a solid foundation for privileged control.',
    observation: 'PAM strategy, design documentation and policy enforcement are incomplete, leaving privileged controls fragmented across the estate.',
    impact: 'Fragmented privileged controls are the fastest route from a single phished admin to full environment compromise.',
    remediation: [
      'Ratify a PAM strategy with named owners and governance cadence.',
      'Document the current PAM architecture and close design gaps.',
      'Enforce the privileged access policy with environment segregation (Prod/UAT/Dev/DR).',
      'Map PAM controls to regulatory requirements and track audit findings to closure.',
    ],
    quick_win: 'Publish the privileged access policy and confirm accountable owners for PAM.',
    strategic: 'Align the full PAM architecture to a hardened, regulator-mapped target state with periodic drift reviews.',
    duration: '6 months',
    reasons: {
      low: 'No ratified strategy or current design documentation governs privileged access.',
      mid: 'Strategy and policies exist but enforcement and review cycles are inconsistent.',
      high: 'Strategy, architecture and audit readiness are established and reviewed.',
    },
  },
  'privileged-identity-management': {
    positive: 'Privileged accounts are inventoried and provisioned through a controlled process.',
    observation: 'Privileged accounts are not reliably discovered and inventoried, and shared/built-in accounts persist without automated revocation.',
    impact: 'Unknown or shared privileged accounts cannot be controlled and are prime targets for attackers.',
    remediation: [
      'Run automated discovery of privileged accounts across all platforms.',
      'Build and secure a maintained privileged account inventory.',
      'Eliminate or vault shared and default built-in accounts.',
      'Automate deletion of privileged accounts linked to leavers and retired applications.',
    ],
    quick_win: 'Run a one-off privileged account discovery sweep and disable orphaned admin accounts.',
    strategic: 'Automate continuous discovery and lifecycle-linked deprovisioning of privileged identities.',
    duration: '4 months',
    reasons: {
      low: 'No reliable inventory of privileged accounts; shared accounts unmanaged.',
      mid: 'Inventory exists but discovery and clean-up are periodic and manual.',
      high: 'Automated discovery keeps a secured, current privileged inventory.',
    },
  },
  'privileged-password-management': {
    positive: 'Strong password policy enforcement and credential rotation are in place for privileged accounts.',
    observation: 'Privileged credential and SSH-key handling relies on policy without vault-driven rotation and compliance validation.',
    impact: 'Static or weakly-protected privileged credentials turn one leaked password into standing access.',
    remediation: [
      'Enforce the password and lockout policy for every account type.',
      'Vault privileged credentials and rotate them after each use.',
      'Centralise SSH key storage and rotation.',
      'Review password compliance reports on a defined cadence.',
    ],
    quick_win: 'Rotate all critical privileged passwords and move them into the vault.',
    strategic: 'Move to ephemeral, per-session credentials and eliminate standing secrets.',
    duration: '4 months',
    reasons: {
      low: 'Privileged passwords are static, shared or outside any vault.',
      mid: 'Vaulting exists but rotation and compliance validation are partial.',
      high: 'Vault-driven rotation and compliance reporting operate consistently.',
    },
  },
  'privileged-authn-authz': {
    positive: 'MFA and least-privilege controls protect sensitive privileged access.',
    observation: 'MFA and least-privilege enforcement for privileged accounts is partial, with standing privileges and limited just-in-time elevation.',
    impact: 'Without MFA and JIT elevation, stolen admin credentials grant unrestricted, persistent control.',
    remediation: [
      'Enforce MFA for every highly sensitive privileged account.',
      'Define standard roles and fine-grained policies for privileged access.',
      'Implement just-in-time elevation with automatic expiry.',
      'Add command/task-level controls for critical shared accounts and drive toward zero standing privileges.',
    ],
    quick_win: 'Enforce MFA on all privileged accounts able to reach production systems.',
    strategic: 'Adopt a zero-standing-privilege model with task-scoped just-in-time elevation.',
    duration: '6 months',
    reasons: {
      low: 'Privileged access lacks consistent MFA and holds broad standing rights.',
      mid: 'MFA is present but least privilege and JIT elevation are partial.',
      high: 'MFA, least privilege and JIT elevation are enforced and measured.',
    },
  },
  'privileged-access-governance': {
    positive: 'Privileged access certification and SoD controls operate on a defined cadence.',
    observation: 'Privileged access reviews, SoD enforcement and vendor privileged access controls are informal or infrequent.',
    impact: 'Unreviewed privileged access accumulates silently; several public breaches began with an unrevoked vendor account.',
    remediation: [
      'Define and run certification of privileged accounts on a fixed cadence.',
      'Document and enforce SoD policies for privileged access.',
      'Restrict vendor privileged access by scope, time window and sensitivity.',
      'Record vendor sessions and auto-revoke access on contract expiry or inactivity.',
    ],
    quick_win: 'Certify all current privileged access and revoke anything unjustified.',
    strategic: 'Automate SoD checks and vendor access lifecycle inside the PAM platform.',
    duration: '6 months',
    reasons: {
      low: 'Privileged access is never formally certified; vendor access is open-ended.',
      mid: 'Reviews happen but SoD and vendor controls are manual.',
      high: 'Certification, SoD and vendor access controls run automatically.',
    },
  },
  'privileged-access-monitoring': {
    positive: 'Privileged sessions are recorded and anomalies are detected and escalated.',
    observation: 'Privileged session recording, anomaly detection and response processes do not yet cover the estate or feed SOC workflows.',
    impact: 'Undetected privileged misuse extends attacker dwell time, which drives breach cost and audit exposure.',
    remediation: [
      'Record all privileged sessions through the PAM solution.',
      'Integrate privileged activity logs with SIEM and SOC workflows.',
      'Define and rehearse response processes for privileged anomalies.',
      'Risk-score alerts and test recovery of compromised systems periodically.',
    ],
    quick_win: 'Enable session recording for all production privileged access.',
    strategic: 'Deploy behavioural analytics with automated containment for privileged anomalies.',
    duration: '9 months',
    reasons: {
      low: 'Privileged activity is largely unrecorded and unmonitored.',
      mid: 'Recording exists but alerting and response are rule-based and partial.',
      high: 'Monitored, risk-scored privileged activity feeds SOC response.',
    },
  },
  'non-human-accounts': {
    positive: 'Machine identities are inventoried, owned and vaulted.',
    observation: 'Service accounts, API keys and other non-human identities lack complete inventory, ownership and credential automation.',
    impact: 'Hard-coded or ownerless machine credentials are invisible attack paths that outlive the people who created them.',
    remediation: [
      'Discover and inventory privileged NHAs across on-prem and cloud.',
      'Assign an owner to every privileged non-human account.',
      'Vault and rotate NHA credentials; remove hard-coded secrets.',
      'Restrict NHAs from interactive login and monitor their usage.',
    ],
    quick_win: 'Inventory service accounts with privileged access and assign owners.',
    strategic: 'Automate machine-identity lifecycle with vaulted, rotating credentials.',
    duration: '6 months',
    reasons: {
      low: 'Non-human accounts are unowned, uninventoried and hard-coded.',
      mid: 'Inventory exists but rotation and interactive-login restrictions are partial.',
      high: 'NHAs are owned, vaulted, rotated and monitored.',
    },
  },

  /* ------------------------------- WAM ------------------------------- */
  'wam-architecture-tools-design': {
    positive: 'Strong central WAM foundation with resilient architecture and clear recovery strategy.',
    observation: 'The WAM architecture is not yet a fully supported, resilient central platform with tested recovery.',
    impact: 'A fragile access platform is a single point of failure for every application behind it.',
    remediation: [
      'Consolidate authentication onto the central WAM/SSO platform.',
      'Close HA/DR design gaps for critical components.',
      'Establish and test the DR and backup plan on a fixed cycle.',
      'Track platform versions and plan supported upgrades.',
    ],
    quick_win: 'Conduct a gap analysis of current WAM architecture, device posture and DR readiness.',
    strategic: 'Implement a zero-trust access architecture with health-driven dynamic policies.',
    duration: '8 months',
    reasons: {
      low: 'Authentication remains application-local with no resilient central platform.',
      mid: 'Central platform in place but resilience and recovery are unproven.',
      high: 'Strong supported platform with tested HA/DR and mature design.',
    },
  },
  'wam-identity-lifecycle': {
    positive: 'Identity inventory and lifecycle automation keep web access aligned to the workforce.',
    observation: 'Identity inventory metadata and JML automation are incomplete, so web access drifts from workforce reality.',
    impact: 'Stale identities and missed leavers hold live sessions into applications they should have lost.',
    remediation: [
      'Standardise identity metadata schemas across directories.',
      'Centralise the identity inventory with automated updates.',
      'Automate JML synchronisation between HR and the WAM platform.',
      'Add orphan-account detection with periodic quality checks.',
    ],
    quick_win: 'Standardise identity metadata across all directories for consistent reporting.',
    strategic: 'Deploy an automated joiner-mover-leaver synchronisation engine between HR and WAM.',
    duration: '6 months',
    reasons: {
      low: 'No dependable identity inventory or JML automation exists.',
      mid: 'Manual metadata management and partial JML automation limit the current score.',
      high: 'Automated inventory and JML keep access continuously accurate.',
    },
  },
  'wam-access-governance': {
    positive: 'Documented grant/revoke processes and scheduled certifications govern web access.',
    observation: 'The process for granting and revoking privileged web access is not fully documented or automated, and least-privilege enforcement lacks tooling.',
    impact: 'Delayed revocation and over-privileged cloud identities risk insider fraud and lateral movement during a breach.',
    remediation: [
      'Create a version-controlled access management standard for lifecycle events.',
      'Automate HR-triggered revocation and run "zombie account" sweeps.',
      'Schedule certification campaigns for privileged and standard access.',
      'Deploy CIEM to enforce least privilege across cloud identities.',
    ],
    quick_win: 'Document the formal request-and-approval workflow for privileged web consoles.',
    strategic: 'Implement just-in-time access for administrative tasks to eliminate standing privileges.',
    duration: '9 months',
    reasons: {
      low: 'Grant/revoke is undocumented and certifications do not run.',
      mid: 'Absence of CIEM and automated revocation processes are the primary gaps.',
      high: 'Automated certification and least-privilege enforcement operate estate-wide.',
    },
  },
  'wam-authentication': {
    positive: 'Consistent session policies and risk-aware MFA protect workforce logins.',
    observation: 'Inconsistent session timeouts and the absence of adaptive/step-up authentication leave sessions exposed after initial login.',
    impact: 'Hijacked sessions stay alive indefinitely, and static MFA cannot stop session-based attacks on critical applications.',
    remediation: [
      'Enforce a global 30-minute inactivity timeout and 12-hour maximum session.',
      'Define high-risk scenarios that trigger mandatory step-up MFA.',
      'Mandate MFA for every VPN/VDI/RDS entry point.',
      'Enable continuous access evaluation to revoke risky live sessions.',
    ],
    quick_win: 'Enable phishing-resistant MFA (FIDO2) for administrators and high-risk users.',
    strategic: 'Roll out risk-based authentication using behavioural signals (UEBA).',
    duration: '6 months',
    reasons: {
      low: 'Sessions persist indefinitely and MFA coverage is minimal.',
      mid: 'Lack of adaptive/step-up authentication for critical apps prevents a higher rating.',
      high: 'Sessions and step-up policies adapt to real-time risk.',
    },
  },
  'wam-password-management': {
    positive: 'Strong password policies are consistently enforced for business accounts.',
    observation: 'Administrative and temporary passwords are shared through insecure channels despite a strong baseline policy.',
    impact: 'Credential interception risks unauthorised account takeover even where policy is strong.',
    remediation: [
      'Deploy a corporate credential vault for administrative password sharing.',
      'Deliver initial credentials through a secure, MFA-verified self-service flow.',
      'Block password transmission via email/chat with DLP rules.',
      'Enforce change-at-first-login for all temporary credentials.',
    ],
    quick_win: 'Enforce a no-shared-accounts policy for web application administration.',
    strategic: 'Integrate WAM with the PAM vault to automate service credential rotation.',
    duration: '4 months',
    reasons: {
      low: 'Password policy is weak or unenforced across account types.',
      mid: 'Insecure password sharing methods for admins detract from a strong policy.',
      high: 'Policy, secure distribution and self-service operate together.',
    },
  },
  'wam-single-sign-on': {
    positive: 'Broad SSO coverage centralises authentication and MFA control.',
    observation: 'Critical legacy applications remain outside the SSO perimeter, forcing separate credentials and bypassing central MFA controls.',
    impact: 'Credential sprawl across standalone logins increases phishing and harvesting success.',
    remediation: [
      'Inventory legacy applications that lack SAML/OIDC support.',
      'Deploy a WAM gateway or header-based proxy for legacy systems.',
      'Mandate SAML 2.0/OIDC support in new application procurement.',
      'Decommission standalone authentication databases after migration.',
    ],
    quick_win: 'Map all legacy internal applications and prioritise them for SSO onboarding by risk.',
    strategic: 'Migrate all Tier-1 applications to OIDC/SAML and decommission legacy authentication silos.',
    duration: '9 months',
    reasons: {
      low: 'Low score due to significant legacy application authentication silos.',
      mid: 'Modern apps are on SSO but legacy silos persist.',
      high: 'Near-universal SSO coverage including legacy applications.',
    },
  },
  'wam-documentation': {
    positive: 'Current documentation is mature with version-controlled architecture and procedures.',
    observation: 'WAM documentation exists but is not centralised, version-controlled or reviewed frequently enough for audit standards.',
    impact: 'Poor documentation delays incident response and weakens audit defensibility.',
    remediation: [
      'Centralise IAM policies, standards and procedures in one version-controlled repository.',
      'Assign owners and review cadence for every document.',
      'Update architecture diagrams to reflect the current estate.',
      'Automate compliance report generation for control effectiveness.',
    ],
    quick_win: 'Centralise all IAM-related policies and procedures into a single version-controlled repository.',
    strategic: 'Automate compliance reporting to give the CISO real-time control visibility.',
    duration: '3 months',
    reasons: {
      low: 'Documentation is scattered, stale or missing.',
      mid: 'Documentation is mature but requires more frequent periodic reviews.',
      high: 'Documentation is current, owned and audit-ready.',
    },
  },
  'wam-regulatory-requirements': {
    positive: 'WAM controls are mapped to regulatory frameworks with collected evidence.',
    observation: 'Evidence mapping of WAM controls to regulatory frameworks (NIST, UK GDPR) needs formalisation.',
    impact: 'Auditors treat missing evidence as missing controls, risking findings and certification delays.',
    remediation: [
      'Map existing WAM controls to NIST 800-53 and UK GDPR requirements.',
      'Identify and close specific evidence gaps.',
      'Stand up continuous compliance monitoring against the approved baseline.',
      'Alert on drift from the regulated "gold image" configuration.',
    ],
    quick_win: 'Map existing WAM controls to NIST 800-53 and UK GDPR to identify evidence gaps.',
    strategic: 'Establish continuous compliance monitoring with drift alerts to the security team.',
    duration: '6 months',
    reasons: {
      low: 'Controls are not mapped to any regulatory framework.',
      mid: 'Evidence mapping to NIST and UK GDPR needs formalisation.',
      high: 'Framework mapping and evidence collection are systematic.',
    },
  },

  /* ------------------------------- IGA ------------------------------- */
  'iga-architecture-landscape': {
    positive: 'The IGA platform is integrated with authoritative sources and well documented.',
    observation: 'IGA platform integration with authoritative HR sources and current design documentation are incomplete.',
    impact: 'Without a governed platform fed by HR truth, every downstream identity process inherits bad data.',
    remediation: [
      'Integrate the IGA platform with authoritative HR sources.',
      'Document the IGA architecture and data flows.',
      'Define team responsibilities across lifecycle and governance processes.',
      'Address geography-specific requirements and challenges.',
    ],
    quick_win: 'Confirm HR-to-IGA data feeds and document the current architecture.',
    strategic: 'Consolidate identity administration onto the governed IGA platform for all business units.',
    duration: '6 months',
    reasons: {
      low: 'No governed IGA platform or HR integration is in place.',
      mid: 'Platform present but integration coverage and documentation lag.',
      high: 'Governed platform with authoritative feeds and current documentation.',
    },
  },
  'iga-identity-access-admin': {
    positive: 'Provisioning is automated with role-based birthright access.',
    observation: 'Provisioning to downstream systems remains largely manual, with limited role and birthright automation.',
    impact: 'Manual provisioning delays productivity and copies excess access from colleague to colleague.',
    remediation: [
      'Automate provisioning for the highest-volume downstream systems.',
      'Design and review roles with business owners.',
      'Configure birthright access driven by HR attributes, including contractors.',
      'Roll out self-service password reset to cut helpdesk load.',
    ],
    quick_win: 'Enable self-service password reset and automate AD provisioning.',
    strategic: 'Extend automated provisioning to enterprise applications (SAP, mainframe) via the central IGA solution.',
    duration: '9 months',
    reasons: {
      low: 'Provisioning is manual with no role model.',
      mid: 'Key systems automated but roles and birthright are partial.',
      high: 'Role-driven automated provisioning covers the estate.',
    },
  },
  'iga-identity-lifecycle': {
    positive: 'JML events flow automatically and on time from HR triggers.',
    observation: 'Joiner, mover and leaver processing is manual or delayed, and leaver deprovisioning is not consistently verified.',
    impact: 'Missed leavers and stale mover access are the classic sources of orphaned, abusable accounts.',
    remediation: [
      'Automate JML processing from HR lifecycle triggers.',
      'Verify leaver deprovisioning across AD and connected applications.',
      'Define emergency termination and re-hire procedures.',
      'Monitor JML SLAs and remediate recurring failures.',
    ],
    quick_win: 'Verify and disable accounts for all recent leavers across AD and key applications.',
    strategic: 'Achieve zero-touch JML with continuous orphan-account detection.',
    duration: '6 months',
    reasons: {
      low: 'JML is manual and leavers persist beyond their exit.',
      mid: 'Core JML automated but exceptions and verification are manual.',
      high: 'Automated, verified JML with orphan detection.',
    },
  },
  'iga-password-management': {
    positive: 'Password and lockout policy are defined, documented and enforced for all account types.',
    observation: 'Password and lockout policies are not consistently defined or enforced across normal and service accounts.',
    impact: 'Weak or unevenly enforced credential policy is the entry point for the majority of breaches.',
    remediation: [
      'Document the password policy for every account type.',
      'Enforce the policy technically across all directories.',
      'Define lockout policy for user and service accounts.',
      'Monitor compliance and exceptions on a set cadence.',
    ],
    quick_win: 'Enforce the documented password and lockout policy in all directories.',
    strategic: 'Introduce breached-password screening and phase in passwordless authentication.',
    duration: '3 months',
    reasons: {
      low: 'Policies are undocumented or unenforced.',
      mid: 'Policy enforced for users but service accounts lag.',
      high: 'Uniform enforcement with monitored compliance.',
    },
  },
  'iga-access-governance': {
    positive: 'Recertification campaigns and SoD reviews run on a defined, tracked cadence.',
    observation: 'Recertification campaigns and SoD policy reviews are ad hoc, with limited coverage and manual remediation.',
    impact: 'Access that is never re-justified accumulates until audit findings or insider incidents expose it.',
    remediation: [
      'Schedule recertification campaigns with defined frequency and coverage.',
      'Streamline request and approval workflows into one interface.',
      'Define and enforce SoD policies with periodic review.',
      'Automate post-certification remediation of revoked access.',
    ],
    quick_win: 'Launch a recertification campaign covering privileged and high-risk application access.',
    strategic: 'Move to continuous, risk-driven certification with automated remediation.',
    duration: '6 months',
    reasons: {
      low: 'No campaigns or SoD reviews take place.',
      mid: 'Campaigns run but coverage and remediation are partial.',
      high: 'Automated campaigns with enforced SoD and tracked remediation.',
    },
  },
  'iga-audit-reporting': {
    positive: 'Lifecycle and governance events are logged, reported and exported for analytics.',
    observation: 'Identity lifecycle and governance events are not consistently logged, reported or available for downstream analytics.',
    impact: 'Without identity reporting you cannot evidence compliance or detect governance failures early.',
    remediation: [
      'Define required reports and their metadata/attributes.',
      'Schedule recurring reports for lifecycle and certification activity.',
      'Retain identity event logs per policy.',
      'Export governance metadata to analytics platforms where required.',
    ],
    quick_win: 'Stand up scheduled reports for JML activity and certification outcomes.',
    strategic: 'Feed identity events into the analytics platform for continuous governance insight.',
    duration: '4 months',
    reasons: {
      low: 'Identity events are not logged or reported.',
      mid: 'Core reports exist but scheduling and export are manual.',
      high: 'Comprehensive logging, reporting and analytics export.',
    },
  },

  /* ------------------------------- CIAM ------------------------------ */
  'ciam-strategy-architecture': {
    positive: 'A dedicated, resilient CIAM platform underpins the customer experience.',
    observation: 'Customer identity relies on bespoke or fragile components without a defined CIAM strategy and resilient platform.',
    impact: 'Customer login is revenue-critical: platform fragility converts directly into lost transactions and trust.',
    remediation: [
      'Define a CIAM strategy aligned to digital business objectives.',
      'Consolidate onto a dedicated CIAM platform.',
      'Design and test high availability and recovery for customer login.',
      'Document the customer identity architecture.',
    ],
    quick_win: 'Document the current customer identity architecture and its failure modes.',
    strategic: 'Migrate customer identity to a dedicated, resilient CIAM platform.',
    duration: '9 months',
    reasons: {
      low: 'No CIAM strategy; bespoke login code carries the customer base.',
      mid: 'Platform in place but resilience and strategy are maturing.',
      high: 'Dedicated resilient platform with clear strategy.',
    },
  },
  'ciam-registration-onboarding': {
    positive: 'Secure, low-friction registration with risk-appropriate verification.',
    observation: 'Customer registration lacks risk-appropriate identity verification and progressive profiling.',
    impact: 'Weak onboarding admits fraudulent accounts and over-collects data you must then protect.',
    remediation: [
      'Add identity verification proportional to service risk.',
      'Introduce progressive profiling to minimise data collected at signup.',
      'Instrument registration funnels to find drop-off and abuse.',
      'Standardise onboarding journeys across channels.',
    ],
    quick_win: 'Add verified-email/phone checks to registration for higher-risk services.',
    strategic: 'Deploy risk-based identity verification with progressive profiling across channels.',
    duration: '6 months',
    reasons: {
      low: 'Registration is unverified and over-collects data.',
      mid: 'Verification exists on some journeys; profiling is static.',
      high: 'Risk-proportional verification with progressive profiling.',
    },
  },
  'ciam-authentication-mfa': {
    positive: 'Customers benefit from MFA, adaptive checks and passwordless options.',
    observation: 'Customer MFA adoption is limited and logins are not risk-scored, with no passwordless options.',
    impact: 'Password-only customer accounts fall to credential stuffing at scale.',
    remediation: [
      'Offer and encourage MFA for customer accounts.',
      'Introduce risk-based adaptive authentication on every login.',
      'Add passkey/passwordless options to cut friction and phishing.',
      'Monitor authentication funnel and challenge rates.',
    ],
    quick_win: 'Enable optional MFA and breached-password checks for customer accounts.',
    strategic: 'Roll out passkeys with risk-based adaptive authentication.',
    duration: '6 months',
    reasons: {
      low: 'Customer login is password-only with no risk signals.',
      mid: 'MFA available but adoption and risk scoring are limited.',
      high: 'Adaptive, phishing-resistant customer authentication.',
    },
  },
  'ciam-consent-privacy': {
    positive: 'Consent is captured, versioned and enforced with customer self-service.',
    observation: 'Customer consent is not consistently captured, versioned or enforced across systems, with no self-service preference centre.',
    impact: 'Unevidenced consent is direct UK GDPR exposure with regulatory and reputational cost.',
    remediation: [
      'Capture and version consent at every collection point.',
      'Build a self-service preference centre.',
      'Synchronise consent state to downstream systems.',
      'Audit consent enforcement periodically.',
    ],
    quick_win: 'Inventory consent capture points and fix unrecorded flows.',
    strategic: 'Deploy centralised consent management synchronised across all systems.',
    duration: '6 months',
    reasons: {
      low: 'Consent is not explicitly captured or enforceable.',
      mid: 'Consent captured but versioning and sync are partial.',
      high: 'Versioned, enforced consent with self-service.',
    },
  },
  'ciam-account-protection': {
    positive: 'Layered defences detect and remediate customer account takeover automatically.',
    observation: 'Customer accounts lack layered protection against credential stuffing, and takeover response is manual.',
    impact: 'Account takeover produces direct fraud losses and support cost, and destroys customer trust.',
    remediation: [
      'Deploy bot detection, rate limiting and breached-password checks.',
      'Automate takeover detection with forced step-up or reset.',
      'Harden recovery flows against social engineering.',
      'Track fraud and ATO metrics with alerting.',
    ],
    quick_win: 'Turn on rate limiting and breached-password checks at customer login.',
    strategic: 'Deploy AI-driven takeover detection with automated remediation.',
    duration: '6 months',
    reasons: {
      low: 'No specific protections beyond the password.',
      mid: 'Basic protections exist; response remains manual.',
      high: 'Automated layered protection with measured response.',
    },
  },
  'ciam-scalability-resilience': {
    positive: 'Customer login absorbs traffic spikes within measured SLOs.',
    observation: 'The customer login platform has unproven behaviour under traffic spikes and lacks measured SLOs.',
    impact: 'Login downtime during peak trading is immediate lost revenue and reputational damage.',
    remediation: [
      'Load test customer login against realistic peak scenarios.',
      'Enable auto-scaling for identity components.',
      'Define and monitor availability/latency SLOs.',
      'Rehearse failover for customer identity services.',
    ],
    quick_win: 'Load test the login journey at projected peak volumes.',
    strategic: 'Move to an auto-scaling, multi-region customer identity deployment.',
    duration: '6 months',
    reasons: {
      low: 'Login struggles under normal peaks; no SLOs exist.',
      mid: 'Scaling is manual; SLOs informal.',
      high: 'Auto-scaled platform with measured SLOs.',
    },
  },
};

// Static industry benchmark per control area (typical mid-market maturity /5).
const DEFAULT_BENCHMARK = 3.0;
const BENCHMARKS = {
  'wam-architecture-tools-design': 3.2,
  'wam-single-sign-on': 3.1,
  'wam-authentication': 3.2,
  'privileged-access-monitoring': 2.7,
  'non-human-accounts': 2.4,
  'ciam-consent-privacy': 2.8,
  'iga-audit-reporting': 2.8,
};

// Assessment-type goal statements for the executive summary.
const TYPE_GOALS = {
  overall: [
    'Evaluate IAM control maturity across governance, privileged, workforce and customer identity.',
    'Identify the control areas exposing the organisation to the greatest identity risk.',
    'Provide a phased, prioritised remediation roadmap.',
    'Benchmark maturity against industry peers.',
  ],
  IGA: [
    'Evaluate identity governance maturity across lifecycle, administration and certification.',
    'Identify gaps in joiner-mover-leaver automation and access governance.',
    'Provide a roadmap towards automated, evidence-ready identity governance.',
  ],
  PAM: [
    'Evaluate privileged access maturity across strategy, vaulting, governance and monitoring.',
    'Identify exposure from shared, standing and non-human privileged access.',
    'Provide a roadmap towards just-in-time, zero-standing-privilege operations.',
  ],
  WAM: [
    'Evaluate WAM control maturity against applicable regulations.',
    'Identify risks in SSO coverage and session management.',
    'Provide a roadmap for phishing-resistant MFA expansion.',
    'Ensure least-privilege governance for multi-cloud web identities.',
  ],
  CIAM: [
    'Evaluate customer identity maturity across onboarding, authentication and protection.',
    'Identify exposure to account takeover and consent non-compliance.',
    'Provide a roadmap for resilient, adaptive customer identity.',
  ],
};

const TYPE_NAMES = {
  overall: 'Full IAM',
  IGA: 'Identity Governance & Administration (IGA)',
  PAM: 'Privileged Access Management (PAM)',
  WAM: 'Workforce Access Management (WAM)',
  CIAM: 'Customer Identity & Access Management (CIAM)',
};

// Fallback content builder for control areas without a bespoke entry.
function genericContent(name) {
  const n = name.replace(/\s*\(.*\)$/, '');
  return {
    positive: `${n} practices are operating at a mature, managed level.`,
    observation: `${n} processes are informal or inconsistently applied, leaving control gaps in this area.`,
    impact: `Low maturity in ${n.toLowerCase()} increases the likelihood and impact of identity-related incidents and audit findings.`,
    remediation: [
      `Document and standardise the ${n.toLowerCase()} process with named owners.`,
      'Close the highest-risk gaps identified in this assessment.',
      'Automate enforcement and introduce measurable controls.',
      'Review effectiveness periodically and iterate.',
    ],
    quick_win: `Document and assign ownership for ${n.toLowerCase()}.`,
    strategic: `Automate and continuously measure ${n.toLowerCase()} controls.`,
    duration: '6 months',
    reasons: {
      low: `No defined ${n.toLowerCase()} process is in place.`,
      mid: `${n} is defined but automation and measurement are partial.`,
      high: `${n} is enforced, measured and regularly reviewed.`,
    },
  };
}

function contentFor(slug, name) {
  return AREA_CONTENT[slug] || genericContent(name || slug);
}

function reasonFor(slug, name, score) {
  const c = contentFor(slug, name);
  if (score < 3) return c.reasons.low;
  if (score < 4) return c.reasons.mid;
  return c.reasons.high;
}

function benchmark(slug) {
  return BENCHMARKS[slug] ?? DEFAULT_BENCHMARK;
}

function goalsFor(type) {
  return TYPE_GOALS[type] || TYPE_GOALS.overall;
}

function typeName(type) {
  return TYPE_NAMES[type] || type;
}

module.exports = { contentFor, reasonFor, benchmark, goalsFor, typeName };
