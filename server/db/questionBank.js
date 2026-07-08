/**
 * vSecure IAM Maturity Assessment - question bank.
 *
 * Source of truth for all assessment content, structured per the vSecure
 * methodology:  area (IGA/PAM/WAM/CIAM) → control area → sub-category →
 * question. Question types:
 *   'M' (maturity)    - scored 1-5 against the maturity framework; every
 *                       maturity question carries level descriptors written
 *                       for that specific question.
 *   'I' (information) - free-text; unscored; presented in the report as
 *                       current-environment understanding. Where a question
 *                       offers example options or sub-parts, each is placed
 *                       on its own line for readability.
 *
 * PAM content: transcribed from the PAM assessment workbook.
 * WAM content: from the WAM maturity framework matrix + sample report; the
 *              per-question level descriptors in "Architecture, Tools and
 *              Design", "Identity Lifecycle Management" and "Access
 *              Governance" retain the framework's own wording.
 * IGA content: from the IGA Questionnaire (info capture) plus maturity
 *              questions structured per the framework.
 * CIAM content: structured placeholders following the same framework until
 *              the CIAM workbook arrives.
 */

// Fallback only - every seeded maturity question defines its own levels.
const DEFAULT_LEVELS = [
  'No defined process or capability in place',
  'Basic capability exists but is manual and inconsistent',
  'Documented and standardised across the organisation',
  'Enforced and automated with periodic review and metrics',
  'Continuously reviewed and improved with analytics and automation',
];

// Compact helpers
const M = (sub, text, extra = {}) => ({ type: 'M', sub, text, ...extra });
const I = (sub, text, extra = {}) => ({ type: 'I', sub, text, ...extra });

const AREAS = {
  /* ================================ PAM ================================ */
  PAM: {
    name: 'Privileged Access Management',
    controlAreas: [
      {
        name: 'PAM Strategy & Landscape',
        slug: 'pam-strategy-landscape',
        icon: 'key',
        capability: 'vSecure PAM module - strategy & architecture',
        description: 'Strategy, architecture, policies and audit readiness of the privileged access estate.',
        questions: [
          M('PAM Strategy', 'Does the organization have a defined Privileged Access Management (PAM) strategy, and is it aligned with business objectives?', {
            nist: 'PM-9',
            levels: [
              'No PAM strategy exists; privileged access is handled reactively',
              'An informal strategy exists in pockets but is not written down or agreed',
              'A documented PAM strategy exists and is approved by stakeholders',
              'The strategy is aligned with business objectives, funded and tracked against a roadmap',
              'The strategy is reviewed regularly and continuously adjusted to business and threat changes',
            ],
          }),
          M('PAM Strategy', 'Are roles and responsibilities for PAM clearly defined, with accountable owners and governance processes in place?', {
            nist: 'PM-2',
            levels: [
              'No defined ownership; PAM tasks fall to whoever is available',
              'Some responsibilities are understood informally but are undocumented',
              'Roles, owners and governance forums are defined and documented',
              'Accountable owners actively govern PAM with regular reviews and reporting',
              'Governance is embedded and continuously improved with measurable accountability',
            ],
          }),
          I('Architecture', 'Provide current PAM landscape view (tools and technology involved).'),
          M('Architecture', 'Is current PAM design documented and up-to-date?', {
            nist: 'PL-2',
            levels: [
              'No design documentation exists',
              'Partial or outdated documentation exists for some components',
              'The current design is documented to an agreed standard',
              'Documentation is version-controlled, reviewed and updated with every change',
              'Documentation is continuously maintained and validated against the live estate',
            ],
          }),
          I('Architecture', 'What is the version of each of the PAM solution components deployed?'),
          I('Architecture', 'Provide a view on any gaps and challenges with current PAM implementation.'),
          I('Architecture', 'Where is PAM deployed - on-prem / cloud / SaaS?'),
          I('Architecture', 'Which modules or use cases are implemented with the current PAM solution? Sample use cases:\n- Automatic/manual check-in/check-out of credentials\n- Automatic logon to managed systems\n- Session recording\n- Password retrieval with dual-control approval\n- Remote access\n- Secrets management'),
          M('Architecture', 'Is PAM integrated with any ITSM solution? If yes, provide use case details (e.g. real-time ticket validation).', {
            nist: 'CM-3',
            levels: [
              'No integration with ITSM; privileged access is granted without tickets',
              'Tickets are referenced manually with no validation',
              'A documented process links privileged access to ITSM tickets',
              'PAM validates tickets automatically before granting access',
              'Fully integrated, context-aware approvals with continuous audit of ticket-to-access mapping',
            ],
          }),
          I('Architecture', 'How many AD domains is the PAM solution integrated with? Provide domain names.'),
          I('Architecture', 'Is PAM integrated with any SSO / MFA solution? Please provide details.'),
          I('Architecture', 'Is PAM integrated with a SIEM solution? If yes, provide tool name and use case details.'),
          I('Architecture', 'Please provide details of any planned expansion / enhancements / upgrades.'),
          M('Architecture', 'Are privileged systems and PAM tools built against a hardened configuration baseline?', {
            nist: 'CM-6', cis: '4.1',
            levels: [
              'No hardening baseline exists for privileged systems or PAM tools',
              'Ad hoc hardening is applied inconsistently',
              'A documented hardened baseline is defined for privileged systems and PAM components',
              'The baseline is enforced and verified with periodic compliance scans',
              'Continuous configuration validation with automated drift remediation',
            ],
          }),
          I('Architecture', 'Please clarify access methods for each platform integrated with the PAM solution - the different ways users log in with privileged accounts and operate on systems (e.g. RDP, SSH).'),
          M('Availability of privileged access policies and processes', 'Is the privileged access policy defined and documented?', {
            nist: 'AC-1',
            levels: [
              'No privileged access policy exists',
              'Informal practices exist but nothing is documented',
              'The policy is defined, documented and approved',
              'The policy is enforced with technical controls and reviewed on a schedule',
              'Policy effectiveness is measured and continuously improved',
            ],
          }),
          M('Availability of privileged access policies and processes', 'Is the privileged access policy practiced/enforced?', {
            nist: 'AC-2(7)',
            levels: [
              'The policy is not followed in practice',
              'Followed by some teams, inconsistently',
              'Enforced through defined processes across the estate',
              'Enforced with automated technical controls and managed exceptions',
              'Enforcement is continuously monitored with automatic violation remediation',
            ],
          }),
          M('Availability of privileged access policies and processes', 'Is the privileged access policy reviewed periodically? How frequently is the policy reviewed?', {
            nist: 'AC-1',
            levels: [
              'The policy has never been reviewed',
              'Reviewed only after incidents or audit findings',
              'A review cadence is defined and generally followed',
              'Reviewed on schedule with tracked actions and sign-off',
              'Continuously refreshed from threat intelligence, audit and usage insight',
            ],
          }),
          M('Availability of privileged access policies and processes', 'Are there any controls in place to restrict lateral or vertical movements?', {
            nist: 'AC-4', cis: '13.4',
            levels: [
              'No controls restrict lateral or vertical movement',
              'Basic network segmentation only, without privileged-access controls',
              'Documented controls (tiering, segmentation) applied to key systems',
              'An enforced tiered access model with monitored boundaries',
              'Adaptive controls that detect and block movement attempts in real time',
            ],
          }),
          M('Availability of privileged access policies and processes', 'Are environment-level access segregations (Prod, UAT, Dev, DR) enforced for privileged access?', {
            nist: 'AC-4',
            levels: [
              'The same privileged accounts are used across Prod, UAT, Dev and DR',
              'Some separation exists but is not enforced',
              'Environment-level segregation for privileged access is documented',
              'Segregation is enforced technically with monitored exceptions',
              'Continuously verified segregation with automated violation response',
            ],
          }),
          M('Availability of privileged access policies and processes', 'Are broker bypass incidents detected and remediated by the PAM tool?', {
            nist: 'SI-4',
            levels: [
              'No visibility of access that bypasses the PAM broker',
              'Bypass is discovered manually, after the fact',
              'A defined process exists to detect and review bypass incidents',
              'The PAM tool automatically detects and remediates bypass',
              'Bypass is technically prevented and continuously verified',
            ],
          }),
          M('Security Classification', 'Is system security classification for assets defined?', {
            nist: 'RA-2',
            levels: [
              'Assets are not classified',
              'Partial classification exists for some systems',
              'A classification scheme is defined and applied to assets',
              'Classification is maintained and verified across the estate',
              'Classification is continuously updated and drives automated control selection',
            ],
          }),
          M('Security Classification', 'Is the security classification of assets reviewed periodically? How frequently are these classifications reviewed?', {
            nist: 'RA-2',
            levels: [
              'Classifications are never reviewed',
              'Reviewed ad hoc when problems surface',
              'A defined review frequency is documented and followed',
              'Reviews run on schedule with tracked updates',
              'Continuous review driven by asset and business change',
            ],
          }),
          M('Security Classification', 'Are there any PAM controls defined based on the system security classification?', {
            nist: 'AC-6',
            levels: [
              'Controls are the same regardless of system sensitivity',
              'Stronger controls are applied informally to some critical systems',
              'Control requirements per classification tier are documented',
              'Tiered controls are enforced automatically by classification',
              'Controls adapt continuously as classification and risk change',
            ],
          }),
          M('Resilience, Compliance & Audit Readiness', 'Is break-glass / emergency access defined, time-bound, monitored, and post-reviewed?', {
            nist: 'AC-2(2)',
            levels: [
              'No defined break-glass process',
              'Emergency accounts exist but are unmanaged and rarely checked',
              'A documented break-glass process with defined accounts',
              'Time-bound, monitored break-glass with mandatory post-review',
              'Fully automated break-glass lifecycle with continuous assurance testing',
            ],
          }),
          M('Resilience, Compliance & Audit Readiness', 'Is PAM included in BCP / DR testing, including vault recovery?', {
            nist: 'CP-4',
            levels: [
              'PAM is not considered in BCP/DR',
              'Included on paper but never tested',
              'PAM recovery is documented and tested at least annually',
              'Vault recovery is tested regularly with measured recovery objectives',
              'Continuous DR readiness with automated failover and verified recovery',
            ],
          }),
          M('Resilience, Compliance & Audit Readiness', 'Are PAM controls mapped to regulatory requirements (ISO 27001, NIST, SOX, RBI, DORA)?', {
            nist: 'PM-9',
            levels: [
              'PAM controls are not mapped to any regulation',
              'Partial, informal mapping to some requirements',
              'Documented mapping to the applicable regulations',
              'Mapping is maintained with evidence collected for audits',
              'Continuous compliance monitoring against mapped requirements',
            ],
          }),
          M('Resilience, Compliance & Audit Readiness', 'Are audit findings related to PAM tracked to closure with remediation evidence?', {
            nist: 'CA-5',
            levels: [
              'PAM audit findings are not tracked',
              'Tracked informally without ownership or evidence',
              'Findings are logged with owners and remediation plans',
              'Tracked to closure with remediation evidence and reporting',
              'Trends are analysed to prevent recurrence and improve controls',
            ],
          }),
          M('Resilience, Compliance & Audit Readiness', 'Are PAM configurations periodically reviewed and hardened against misconfiguration drift?', {
            nist: 'CM-6', cis: '4.2',
            levels: [
              'PAM configurations are never reviewed after go-live',
              'Reviewed only when something breaks',
              'Periodic configuration reviews are documented and performed',
              'Automated checks detect and correct misconfiguration drift',
              'Continuous hardening with drift prevented by policy-as-code',
            ],
          }),
        ],
      },
      {
        name: 'Privileged Identity Management',
        slug: 'privileged-identity-management',
        icon: 'users',
        capability: 'vSecure PAM module - privileged identity lifecycle',
        description: 'Discovery, inventory, provisioning and control of privileged accounts.',
        questions: [
          M('Privileged Accounts Inventory', 'Are privileged accounts automatically discovered periodically?', {
            cis: '5.1',
            levels: [
              'No discovery; unknown privileged accounts likely exist',
              'Manual, occasional discovery exercises',
              'Documented periodic discovery across key platforms',
              'Automated scheduled discovery feeding the inventory',
              'Continuous real-time discovery across on-prem and cloud',
            ],
          }),
          M('Privileged Accounts Inventory', 'Is the inventory of privileged accounts prepared?', {
            cis: '5.1',
            levels: [
              'No inventory of privileged accounts exists',
              'Partial lists are kept in spreadsheets',
              'A central inventory is prepared covering major systems',
              'A complete inventory with ownership and attributes, refreshed automatically',
              'A real-time inventory continuously validated for completeness',
            ],
          }),
          M('Privileged Accounts Inventory', 'Is the inventory of privileged accounts maintained and secured?', {
            cis: '5.1',
            levels: [
              'The inventory is neither maintained nor protected',
              'Updated occasionally; access to it is loosely controlled',
              'Maintained on a schedule with restricted access',
              'Automatically maintained and secured with audited access',
              'Continuously reconciled with tamper-evident controls',
            ],
          }),
          I('Privileged Identity Management', 'Please provide details around how the privileged accounts are classified, and their naming conventions.'),
          M('Provisioning of Privileged Access', 'Is there a process defined and documented for provisioning of privileged accounts?', {
            nist: 'AC-2',
            levels: [
              'Privileged accounts are created ad hoc without approval',
              'Requests are handled informally by administrators',
              'A documented provisioning process with approvals exists',
              'Automated workflow-driven provisioning with enforced approvals',
              'Just-in-time creation aligned to zero standing privilege',
            ],
          }),
          M('Provisioning of Privileged Access', 'Are privileged accounts deleted automatically with the linked primary account or application?', {
            nist: 'AC-2(1)',
            levels: [
              'Privileged accounts persist after the owner leaves',
              'Removed manually when someone remembers',
              'Documented deprovisioning is linked to the leaver process',
              'Automatically deleted or disabled with the linked primary account',
              'Continuous reconciliation removes orphaned privileged access',
            ],
          }),
          I('Shared privileged accounts and Access elevation', 'Do any shared privileged accounts exist? Are these default built-in accounts or created for provisioning privileged access to a team?'),
          M('Shared privileged accounts and Access elevation', 'Are these accounts accessed persistently or temporarily? Is the access revoked automatically post usage?', {
            nist: 'AC-2(2)',
            levels: [
              'Shared accounts are used persistently with no revocation',
              'Passwords are changed occasionally after use',
              'A documented check-in/check-out process governs shared accounts',
              'Temporary, vault-brokered access is revoked automatically after use',
              'Shared access is eliminated or fully ephemeral',
            ],
          }),
          M('Shared privileged accounts and Access elevation', 'Are default and built-in privileged accounts disabled or renamed on all systems?', {
            cis: '4.7',
            levels: [
              'Default accounts are left enabled with default names and passwords',
              'Changed on some systems only',
              'A standard requires disabling or renaming; mostly applied',
              'Enforced and verified across all systems',
              'Continuously scanned with automatic remediation',
            ],
          }),
        ],
      },
      {
        name: 'Privileged Password Management',
        slug: 'privileged-password-management',
        icon: 'lock',
        capability: 'vSecure PAM module - credential vaulting & rotation',
        description: 'Password policy, vaulting, rotation and protection of privileged credentials and SSH keys.',
        questions: [
          M('Enforcement of strong password policy', 'Is there a password policy defined and documented for all account types?', {
            nist: 'IA-5', cis: '5.2',
            levels: [
              'No password policy exists for privileged accounts',
              'A policy exists for user accounts only, not all account types',
              'A documented policy covers all account types',
              'The policy is technically enforced for every account type',
              'Compliance is continuously measured and the policy tuned to risk',
            ],
          }),
          M('Enforcement of strong password policy', 'Is the password policy strictly enforced for all types of accounts?', {
            nist: 'IA-5',
            levels: [
              'The policy is not enforced',
              'Enforced on some systems only',
              'Enforced through standard configuration across major systems',
              'Centrally enforced and monitored for compliance',
              'Enforcement continuously verified with automated remediation',
            ],
          }),
          M('Enforcement of strong password policy', 'Is the account lockout policy defined and documented?', {
            nist: 'AC-7',
            levels: [
              'No lockout policy is defined',
              'System defaults are used without review',
              'A lockout policy is defined and documented',
              'Enforced consistently and monitored',
              'Adaptive lockout tuned by risk analytics',
            ],
          }),
          M('Enforcement of strong password policy', 'Is the account lockout policy strictly enforced for all the accounts?', {
            nist: 'AC-7',
            levels: [
              'Not enforced anywhere',
              'Enforced on some systems',
              'Enforced on all major systems',
              'Enforced everywhere with alerting on lockout events',
              'Continuously verified with anomaly detection on lockout patterns',
            ],
          }),
          M('Enforcement of strong password policy', 'Is the password for critical privileged accounts rotated periodically?', {
            cis: '5.2',
            levels: [
              'Critical privileged passwords are never rotated',
              'Rotated manually and infrequently',
              'A documented rotation schedule is followed',
              'Automated vault-driven rotation',
              'Rotated after every use or replaced by ephemeral credentials',
            ],
          }),
          M('Enforcement of strong password policy', 'Are the password compliance reports being analysed periodically for validation?', {
            nist: 'CA-7',
            levels: [
              'No password compliance reporting exists',
              'Reports are produced but rarely read',
              'Reviewed on a defined cadence',
              'Automated reporting with tracked exceptions',
              'Continuous analytics driving policy improvement',
            ],
          }),
          M('Confidentiality of passwords and SSH keys in storage and in transit', 'Is there a process defined and documented to secure the SSH keys and privileged account passwords?', {
            nist: 'IA-5(2)',
            levels: [
              'Keys and passwords are unmanaged and scattered across systems',
              'Stored with basic protection (files, spreadsheets)',
              'A documented process secures keys and passwords',
              'Vaulted with controlled retrieval and rotation',
              'Fully automated lifecycle with continuous exposure scanning',
            ],
          }),
          I('Confidentiality of passwords and SSH keys in storage and in transit', 'What is the solution leveraged for storing and rotating SSH keys?'),
        ],
      },
      {
        name: 'Privileged Authentication and Authorisation',
        slug: 'privileged-authn-authz',
        icon: 'shield',
        capability: 'vSecure PAM module - MFA & least privilege',
        description: 'MFA for privileged access and enforcement of least privilege and just-in-time elevation.',
        questions: [
          M('Enforcement of Multi-factor Authentication (MFA)', 'How is multifactor authentication implemented and enforced for all the highly sensitive privileged accounts?', {
            nist: 'IA-2(1)', cis: '6.5',
            levels: [
              'No MFA on privileged access',
              'MFA on a few systems, optional elsewhere',
              'MFA is required by policy for sensitive privileged accounts',
              'MFA is enforced everywhere with coverage monitoring',
              'Phishing-resistant, risk-based MFA on all privileged access',
            ],
          }),
          M('Enforcement of least privilege principle (for ex: SUDO)', 'Is there a principle of least privileges process defined and documented?', {
            nist: 'AC-6',
            levels: [
              'No least-privilege process; broad admin rights are common',
              'Applied informally by some teams',
              'A documented least-privilege process exists',
              'Enforced with role-based fine-grained controls and reviews',
              'Privileges continuously right-sized from usage analytics',
            ],
          }),
          I('Enforcement of least privilege principle (for ex: SUDO)', 'How are the fine-grained access policies and process enforced for all the privileged accounts?'),
          M('Enforcement of least privilege principle (for ex: SUDO)', 'Are there any standard roles defined for privileged system access?', {
            nist: 'AC-2(7)',
            levels: [
              'No roles; rights are assigned individually',
              'Some common patterns are reused informally',
              'Standard privileged roles are defined and documented',
              'Role-based assignment is enforced with periodic attestation',
              'Roles are continuously refined by mining and analytics',
            ],
          }),
          M('Enforcement of least privilege principle (for ex: SUDO)', 'Is there a process in place for Just-In-Time access elevation for shared or personal privileged accounts?', {
            nist: 'AC-2(2)',
            levels: [
              'All privileged access is standing',
              'Manual temporary elevation, rarely revoked on time',
              'A documented JIT process for shared and personal accounts',
              'Automated JIT elevation with automatic expiry',
              'Zero standing privilege with task-scoped ephemeral elevation',
            ],
          }),
          M('Enforcement of least privilege principle (for ex: SUDO)', 'Are there any command / task level controls defined to allow only limited activity using critical shared privileged accounts?', {
            nist: 'AC-6(3)',
            levels: [
              'No restrictions on what shared privileged accounts can do',
              'Relies on trust and after-the-fact review',
              'Documented command restrictions for critical accounts',
              'Enforced command/task filtering with alerts',
              'Adaptive controls that block risky commands in real time',
            ],
          }),
          M('Enforcement of least privilege principle (for ex: SUDO)', 'Do privileged accounts have zero standing privileges?', {
            nist: 'AC-6',
            levels: [
              'Broad standing privileges are the norm',
              'Standing privilege reduced for a few accounts',
              'A plan and process to minimise standing privilege is defined',
              'The majority of access is brokered just-in-time',
              'Zero standing privilege achieved and continuously verified',
            ],
          }),
        ],
      },
      {
        name: 'Privileged Access Governance',
        slug: 'privileged-access-governance',
        icon: 'clipboard-check',
        capability: 'vSecure PAM module - access certification & SoD',
        description: 'Certification of privileged access, segregation of duties and third-party privileged access.',
        questions: [
          M('Review of existing privileged access', 'Is there a process defined and documented to certify privileged accounts and accesses?', {
            nist: 'AC-2(j)',
            levels: [
              'Privileged access is never certified',
              'Reviewed ad hoc after incidents or audits',
              'A documented certification process exists',
              'Automated campaigns with tracked revocations',
              'Continuous risk-driven certification',
            ],
          }),
          M('Review of existing privileged access', 'How frequently is the privileged access reviewed?', {
            nist: 'AC-2(j)',
            levels: [
              'Never reviewed',
              'Less than annually, on an irregular basis',
              'A defined frequency (e.g. quarterly or semi-annual) is followed',
              'Frequent reviews with automated tracking and escalation',
              'Continuous, event-driven review',
            ],
          }),
          M('Segregation of Duties (SoD)', 'Is the SoD policy defined and documented for privileged accesses?', {
            nist: 'AC-5',
            levels: [
              'No SoD policy for privileged access; conflicts unmanaged',
              'Conflicts are known informally',
              'The SoD policy is defined and documented',
              'Enforced preventively during provisioning',
              'Real-time SoD analytics with automated conflict remediation',
            ],
          }),
          M('Segregation of Duties (SoD)', 'Is the SoD policy currently being enforced? How are the policies enforced?', {
            nist: 'AC-5',
            levels: [
              'The policy is not enforced',
              'Occasional detective reviews only',
              'Manual preventive checks on request',
              'Automated preventive and detective enforcement',
              'Continuous enforcement with risk-scored exceptions',
            ],
          }),
          M('Segregation of Duties (SoD)', 'Is there a process defined to review the SoD policies periodically?', {
            nist: 'AC-5',
            levels: [
              'SoD policies are never reviewed',
              'Reviewed only after audit findings',
              'A documented review cadence exists',
              'Scheduled reviews with tracked updates',
              'Continuous refinement from violation and usage data',
            ],
          }),
          M('Third-Party / Vendor Privileged Access', 'How is privileged access managed for third-party or vendor personnel?', {
            nist: 'AC-20',
            levels: [
              'Vendors use shared or standing admin access, unmanaged',
              'Managed case by case, informally',
              'A documented vendor privileged access process exists',
              'Managed through PAM with sponsorship and expiry dates',
              'Fully brokered, ephemeral vendor access',
            ],
          }),
          M('Third-Party / Vendor Privileged Access', 'Is vendor privileged access restricted by scope, time window, and system sensitivity?', {
            nist: 'AC-20(1)',
            levels: [
              'Unrestricted once granted',
              'Some restrictions, inconsistently applied',
              'Documented scope and time-window restrictions',
              'Enforced technically per system sensitivity',
              'Adaptive restrictions driven by risk',
            ],
          }),
          M('Third-Party / Vendor Privileged Access', 'Are vendor privileged sessions recorded, monitored, and reviewed?', {
            nist: 'AU-2',
            levels: [
              'No recording or review of vendor sessions',
              'Occasional spot checks only',
              'Recording is required and generally applied',
              'All vendor sessions recorded and reviewed',
              'AI-assisted review flags anomalies automatically',
            ],
          }),
          M('Third-Party / Vendor Privileged Access', 'Is vendor access automatically revoked upon contract expiry or inactivity?', {
            nist: 'AC-2(3)',
            levels: [
              'Access persists after the contract ends',
              'Revoked manually when noticed',
              'Documented offboarding tied to contract dates',
              'Automatic revocation on expiry or inactivity',
              'Continuous verification that no expired access remains',
            ],
          }),
        ],
      },
      {
        name: 'Privileged Access Monitoring and Reporting',
        slug: 'privileged-access-monitoring',
        icon: 'activity',
        capability: 'vSecure PAM module - session monitoring & analytics',
        description: 'Session recording, anomaly detection, response, recovery and compliance reporting for privileged activity.',
        questions: [
          I('Recording and Monitoring of sessions for highly sensitive privileged activities', 'Does an audit and retention policy exist for privileged accounts?'),
          M('Recording and Monitoring of sessions for highly sensitive privileged activities', 'Are all privileged sessions recorded with the PAM solution?', {
            nist: 'AU-2', cis: '8.2',
            levels: [
              'No privileged session recording',
              'Basic logs on some systems only',
              'Recording is required for critical systems',
              'All privileged sessions are recorded and searchable',
              'Recording with real-time AI review of sessions',
            ],
          }),
          M('Recording and Monitoring of sessions for highly sensitive privileged activities', 'Is there a process in place to monitor the sessions for privileged accounts?', {
            nist: 'AU-6',
            levels: [
              'Nobody monitors privileged sessions',
              'Reviewed only after incidents',
              'A documented monitoring process with sampling',
              'Proactive monitoring with alerting',
              'Continuous behavioural monitoring with automated response',
            ],
          }),
          M('Recording and Monitoring of sessions for highly sensitive privileged activities', 'Is there a defined process for reporting and escalating privileged account compromise incidents?', {
            nist: 'IR-6',
            levels: [
              'No process exists for privileged account compromise',
              'Handled ad hoc through general IT support',
              'A documented reporting and escalation path exists',
              'A rehearsed process with defined SLAs',
              'Automated detection-to-response with continuous improvement',
            ],
          }),
          I('Regulatory Compliance Requirements', 'Please clarify if there are any immediate audit points against PAM controls.'),
          I('Regulatory Compliance Requirements', 'Clarify if any specific regulatory requirements are applicable to the PAM solution and the current compliance state.'),
          M('Timely detection and response to attacks and access anomalies', 'Is there a mechanism or process in place to detect & respond to access anomalies?', {
            nist: 'SI-4', cis: '13.1',
            levels: [
              'No ability to detect access anomalies',
              'Manual log review when something looks suspicious',
              'Defined alerts for key anomaly types',
              'Automated behavioural detection with measured response',
              'Real-time AI detection with automated containment',
            ],
          }),
          I('Timely detection and response to attacks and access anomalies', 'How are the access anomalies detected & responded to? For example:\na) No mechanism or process in place for timely detection and response to attacks and access anomalies.\nb) Industry standard solution in place (e.g. Splunk), however only some core systems are integrated.\nc) Industry standard solution in place to detect and respond.\nd) Highly sophisticated, industry standard solution detecting and responding in real time.'),
          I('Timely detection and response to attacks and access anomalies', 'How are the alerts configured to the systems? For example:\na) No automated alerts are configured for unexpected behaviour, additions to administrator groups, attack types or access anomalies.\nb) Automated alerts are configured for some attack types and access anomalies.\nc) Automated alerts are configured to respective teams.'),
          M('Timely detection and response to attacks and access anomalies', 'How are the response processes defined? For example:\na) No response processes are defined.\nb) Defined for very few scenarios.\nc) Defined to ensure effective response.\nd) Well defined and reviewed periodically to ensure effective response.', {
            nist: 'IR-4',
            levels: [
              'No response processes are defined',
              'Response processes are defined for very few scenarios',
              'Response processes are defined to ensure effective response',
              'Processes are well defined and reviewed periodically to ensure effective response',
              'Response processes are continuously tested, measured and improved with automation',
            ],
          }),
          M('Timely detection and response to attacks and access anomalies', 'Are privileged activity logs integrated with SIEM and SOC workflows?', {
            nist: 'AU-6(1)', cis: '8.9',
            levels: [
              'Privileged logs are not collected centrally',
              'Some logs are forwarded without use cases',
              'Integrated with SIEM with defined use cases',
              'SOC workflows act on privileged alerts with SLAs',
              'Detection content continuously tuned with automation',
            ],
          }),
          M('Timely detection and response to attacks and access anomalies', 'Are alerts risk-scored and prioritized rather than purely rule-based?', {
            nist: 'SI-4(2)',
            levels: [
              'No alerting exists at all',
              'Static rule alerts generate heavy noise',
              'Prioritised alerting is defined by severity',
              'Risk-scored alerts measurably reduce noise',
              'Adaptive scoring continuously tuned by outcomes',
            ],
          }),
          M('Timely recovery of compromised systems', 'Is there a mechanism or process in place to detect and recover some of the critical compromised systems?', {
            nist: 'IR-4',
            levels: [
              'No detection or recovery capability',
              'Recovery is improvised per incident',
              'A documented detection and recovery process for critical systems',
              'Tested recovery with defined objectives',
              'Automated containment and recovery, continuously exercised',
            ],
          }),
          I('Timely recovery of compromised systems', 'What processes are in place to recover the compromised systems? For example:\na) No processes in place to recover compromised systems.\nb) Processes in place to detect and timely recover some of the critical compromised systems, however not tested to ensure effectiveness.\nc) Processes in place, however not reviewed and tested periodically.\nd) Detailed steps and processes in place, however not reviewed periodically.\ne) Detailed steps and processes in place, periodically tested and reviewed to ensure up-to-dateness.'),
        ],
      },
      {
        name: 'Non-Human Accounts',
        slug: 'non-human-accounts',
        icon: 'cloud',
        capability: 'vSecure PAM module - secrets & machine identity',
        description: 'Governance of service accounts, application IDs, API keys and other machine identities with privileged access.',
        questions: [
          I('Processes, Operating procedures and Standards', 'Please provide a process document describing how service accounts are created, how frequently the passwords are re-cycled, and processes around how service accounts are requested for human access (if any such instances).'),
          M('Processes, Operating procedures and Standards', 'What types of non-human accounts have privileged access (service accounts, application IDs, API keys, cloud service principals)?', {
            cis: '5.5',
            levels: [
              'No visibility of which non-human accounts hold privileged access',
              'Partial understanding within some teams',
              'Privileged NHA types are identified and documented',
              'A complete, maintained catalogue of privileged NHA types',
              'NHAs are continuously discovered and classified automatically',
            ],
          }),
          M('Processes, Operating procedures and Standards', 'How are privileged NHAs discovered and inventoried across on-prem and cloud?', {
            cis: '5.1',
            levels: [
              'Privileged NHAs are not inventoried',
              'Manual, partial lists exist',
              'Documented discovery across on-prem and cloud',
              'Automated inventory refreshed continuously',
              'Real-time discovery with anomaly detection on new NHAs',
            ],
          }),
          M('Processes, Operating procedures and Standards', 'Are owners assigned for every privileged non-human account?', {
            nist: 'AC-2',
            levels: [
              'No owners; accounts outlive the people who created them',
              'Owners are known for some accounts',
              'Ownership is required and recorded',
              'Ownership is enforced with periodic attestation',
              'Ownership continuously validated through lifecycle integration',
            ],
          }),
          M('Processes, Operating procedures and Standards', 'How are NHA credentials secured, rotated, and accessed (vaulting, automation, no hard-coding)?', {
            nist: 'IA-5(7)',
            levels: [
              'Hard-coded and static credentials are common',
              'Some credentials vaulted, many still embedded',
              'A standard requires vaulting; adoption is under way',
              'Credentials vaulted and rotated automatically, with no hard-coding',
              'Ephemeral machine credentials with continuous secret scanning',
            ],
          }),
          M('Processes, Operating procedures and Standards', 'Are non-human accounts restricted from interactive login and lateral movement?', {
            nist: 'AC-6',
            levels: [
              'NHAs are used interactively by staff',
              'Interactive use is discouraged but possible',
              'Policy restricts interactive use, with monitoring',
              'Interactive login technically blocked with alerting',
              'Restrictions continuously verified with automated response',
            ],
          }),
          I('Processes, Operating procedures and Standards', 'How is privileged access for NHAs governed to ensure least privilege and periodic review?'),
          I('Processes, Operating procedures and Standards', 'How is usage of privileged NHAs monitored, logged, and audited?'),
        ],
      },
    ],
  },

  /* ================================ WAM ================================ */
  WAM: {
    name: 'Web Access Management',
    controlAreas: [
      {
        name: 'Architecture, Tools and Design',
        slug: 'wam-architecture-tools-design',
        icon: 'globe',
        capability: 'vSecure WAM module - access architecture',
        description: 'Central WAM/SSO architecture, product strategy, resilience and recovery.',
        questions: [
          M('Central WAM platform', 'Is a central SSO and MFA solution implemented to enforce strong authentication and seamless access for workforce identities?', {
            levels: [
              'Workforce identities rely on local or application-level authentication with no central control',
              'Centralized WAM with SSO/MFA is partially deployed for selected applications',
              'A centralized WAM solution enforces SSO and MFA consistently for most applications',
              'WAM is fully integrated with IAM, applying adaptive MFA and centralised policy across the estate',
              'Enterprise-wide WAM delivers risk-based, AI-driven adaptive authentication',
            ], nist: 'IA-2(1)', cis: '6.5',
          }),
          M('Product strategy', 'Is the solution a COTS product or a home-grown solution?', {
            levels: [
              'Solution is entirely home-grown with no vendor support',
              'Home-grown solution with limited support and roadmap',
              'Mix of COTS and custom components with partial support coverage',
              'Commercial off-the-shelf (COTS) solution with vendor support',
              'Fully supported enterprise-grade COTS solution with managed roadmap and updates',
            ],
          }),
          M('Resilience', 'Is the solution designed with HA and DR with a clear recovery strategy?', {
            levels: [
              'No high availability (HA) or disaster recovery (DR) provisions',
              'Basic backup procedures in place',
              'HA and DR designed for critical components',
              'Comprehensive HA and DR architecture across the platform',
              'Fully automated HA and DR with clearly defined recovery objectives',
            ], nist: 'CP-10',
          }),
          M('Resilience', 'Has a Disaster Recovery and Backup plan been established and tested?', {
            levels: [
              'No DR or backup plan',
              'DR plan exists but not tested',
              'DR plan documented and tested annually',
              'DR plan integrated with IAM, tested semi-annually',
              'Continuous DR readiness with automated failover',
            ], nist: 'CP-4',
          }),
          I('Landscape', 'Provide the current WAM landscape view (tools and technology involved).'),
          I('Landscape', 'What is the current IdP for all the users? Provide a breakdown if there is more than one IdP.'),
          I('Landscape', 'Users and groups reside in which directory (AD / LDAP / Local DB)?'),
        ],
      },
      {
        name: 'Identity Lifecycle Management',
        slug: 'wam-identity-lifecycle',
        icon: 'users',
        capability: 'vSecure IGA module - lifecycle automation',
        description: 'Identity inventory, metadata quality and joiner-mover-leaver automation.',
        questions: [
          M('Identity inventory', 'Is an up-to-date inventory available for all identity types along with their critical metadata (joining date, last date, manager, department, etc.)?', {
            levels: [
              'No comprehensive inventory of identities or metadata maintained',
              'Manual inventory maintained for some identities with incomplete metadata',
              'Inventory maintained in a central repository but updated manually',
              'Automated inventory updates with complete metadata, reviewed periodically',
              'Continuous, real-time identity inventory with automated quality checks and reporting',
            ], nist: 'IA-4', cis: '5.1',
          }),
          M('JML automation', 'Is joiner-mover-leaver (JML) provisioning automated and driven by HR lifecycle events?', {
            levels: [
              'JML handled manually with no defined process',
              'Manual JML checklist exists; timeliness inconsistent',
              'Documented JML process covering key applications',
              'Automated JML synchronisation between HR and the IAM platform',
              'Zero-touch lifecycle automation with continuous verification',
            ], nist: 'AC-2', cis: '5.3',
          }),
          I('Current processes', 'Provide details on the current joiner, mover and leaver processes.'),
          I('User population', 'Provide a view of user types and volumes (employees, contractors, partners).'),
        ],
      },
      {
        name: 'Access Governance',
        slug: 'wam-access-governance',
        icon: 'clipboard-check',
        capability: 'vSecure IGA module - certification & SoD',
        description: 'Grant/revoke processes, access certification, segregation of duties and least privilege.',
        questions: [
          M('Grant & revoke', 'Is a process documented for granting and revoking standard and privileged accesses?', {
            levels: [
              'No documented process; ad hoc access granting and revocation',
              'Basic process exists but inconsistently followed',
              'Documented and approved process enforced for standard accounts only',
              'Documented process enforced for both standard and privileged accounts with periodic reviews',
              'Fully automated, policy-driven granting/revoking integrated with risk scoring and approvals',
            ], nist: 'AC-2',
          }),
          M('Certification', 'Are access certification campaigns scheduled and run at least every 6 months for privileged accesses & annually for standard accesses?', {
            levels: [
              'No access certification campaigns conducted',
              'Ad hoc campaigns for some systems without defined frequency',
              'Scheduled campaigns for privileged access only',
              'Scheduled campaigns for privileged (>=6-monthly) and standard (>=annually) accesses with tracking of results',
              'Continuous or event-driven certification with automated reminders, exception handling and analytics',
            ], nist: 'AC-2(j)',
          }),
          M('Segregation of Duties', 'Are Segregation of Duty (SoD) policies identified and enforced in preventive and detective modes?', {
            levels: [
              'No SoD policies defined; conflicts unmanaged',
              'SoD policies partially identified but enforced reactively',
              'Documented SoD policies with manual preventive and detective reviews',
              'Automated SoD checks integrated into access provisioning with detective controls',
              'Continuous real-time SoD enforcement with analytics and automated conflict remediation',
            ], nist: 'AC-5',
          }),
          M('Least privilege', 'Is least privilege enforced for cloud and web identities (e.g. via Cloud Infrastructure Entitlement Management)?', {
            levels: [
              'Siloed least-privilege efforts; no visibility of effective permissions',
              'Manual permission reviews on selected platforms',
              'Centralized CIEM enforces least privilege on major cloud platforms',
              'CIEM integrates with IAM/IGA to provide continuous least-privilege enforcement',
              'Enterprise-wide CIEM delivers real-time, AI-driven least-privilege optimisation',
            ], nist: 'AC-6',
          }),
          I('Workflows', 'Provide details about the access request and approval workflows configured.'),
        ],
      },
      {
        name: 'Authentication',
        slug: 'wam-authentication',
        icon: 'lock',
        capability: 'vSecure Adaptive Authentication',
        description: 'Session controls, MFA coverage and adaptive/step-up authentication for workforce applications.',
        questions: [
          M('Session management', 'Are session timeout and automatic logoff policies enforced consistently across workforce applications?', {
            levels: [
              'Sessions never expire; no automatic logoff anywhere',
              'Some applications time out; settings inconsistent and unmanaged',
              'Documented session timeout standard applied to key applications',
              'Centrally enforced inactivity and maximum session policies for all integrated applications',
              'Adaptive session duration driven by real-time risk with continuous access evaluation',
            ], nist: 'AC-12',
          }),
          M('Adaptive authentication', 'Is adaptive or step-up authentication enabled based on risk signals (location, IP, device, time of login)?', {
            levels: [
              'No adaptive capability; MFA challenged only at initial login, if at all',
              'Manual step-up for a small set of applications',
              'Defined step-up rules for sensitive applications',
              'Risk-based policies evaluating context on every sensitive access',
              'AI-driven continuous authentication with automated session revocation',
            ], nist: 'IA-2(6)',
          }),
          M('Remote access MFA', 'Is MFA enforced for all remote access entry points (VPN / VDI / RDS)?', {
            nist: 'IA-2(1)', cis: '6.4',
            levels: [
              'No MFA on remote access',
              'MFA on some entry points, enabled manually',
              'Policy-driven MFA on primary remote access paths',
              'MFA enforced on every remote entry point with coverage metrics',
              'Phishing-resistant factors enforced everywhere with risk-based challenges',
            ],
          }),
          I('MFA estate', 'Which MFA tool(s) are used and which factors are enabled?\nFor example: phone call, SMS, TOTP, number matching, email, authenticator app, push-based.'),
          I('MFA exceptions', 'If MFA is disabled for any application, share the technical or business justification.'),
        ],
      },
      {
        name: 'Password Management',
        slug: 'wam-password-management',
        icon: 'key',
        capability: 'vSecure WAM module - credential hygiene',
        description: 'Password policy enforcement, secure credential distribution and self-service for workforce identities.',
        questions: [
          M('Policy', 'Is there a password policy defined, documented and strictly enforced for all account types?', {
            nist: 'IA-5', cis: '5.2',
            levels: [
              'No password policy exists for workforce accounts',
              'A basic policy exists but is unevenly enforced',
              'A documented policy covers all account types',
              'Technically enforced everywhere with compliance monitoring',
              'Continuously measured, with breached-password screening in place',
            ],
          }),
          M('Credential distribution', 'Are administrative and temporary passwords shared only through secure, approved channels (vault / secret server)?', {
            levels: [
              'Passwords shared over email/chat with no controls',
              'Informal sharing practices; some teams use secure notes',
              'Documented standard for secure sharing; adoption partial',
              'Corporate credential vault enforced for all administrative sharing',
              'No shared secrets - ephemeral credentials and passwordless flows',
            ], nist: 'IA-5(6)',
          }),
          M('Self-service', 'Is self-service password reset available and adopted across the workforce?', {
            nist: 'IA-5', cis: '6.2',
            levels: [
              'All resets go through the helpdesk',
              'Self-service exists but is little used',
              'Available and adopted for most users',
              'Secure, MFA-verified self-service is the default, with adoption metrics',
              'Passwordless authentication minimises resets entirely',
            ],
          }),
          I('Initial credentials', 'How is the initial password generated and shared with users?'),
        ],
      },
      {
        name: 'Single Sign-On',
        slug: 'wam-single-sign-on',
        icon: 'user-check',
        capability: 'vSecure WAM module - SSO fabric',
        description: 'SSO coverage across modern and legacy applications and protocol standardisation.',
        questions: [
          M('Coverage', 'What proportion of applications are integrated with the central SSO solution?', {
            levels: [
              'No SSO - every application has separate credentials',
              'SSO for a small set of applications; most remain standalone',
              'SSO standard defined; the majority of modern applications integrated',
              'Near-complete SSO coverage including legacy applications via gateways/proxies',
              'Full SSO coverage continuously maintained; new applications onboarded by default',
            ], cis: '6.5',
          }),
          M('Legacy onboarding', 'Are legacy applications brought under the SSO perimeter (e.g. header-based proxy or identity-aware gateway)?', {
            levels: [
              'Legacy applications entirely outside the SSO perimeter',
              'A few legacy applications manually integrated',
              'Defined onboarding pattern for legacy applications',
              'Most legacy applications onboarded via gateway with a tracked pipeline',
              'Legacy authentication silos decommissioned; universal SSO enforced',
            ],
          }),
          I('Protocols', 'Which SSO protocols are in use?\nFor example: SAML, OIDC, header-based, Kerberos.'),
          I('Gaps', 'List critical applications that remain outside the SSO perimeter.'),
        ],
      },
      {
        name: 'Documentation',
        slug: 'wam-documentation',
        icon: 'book-open',
        capability: 'vSecure Governance Advisory',
        description: 'Currency and governance of WAM architecture, policy and operational documentation.',
        questions: [
          M('Design documentation', 'Are WAM architecture and design documents maintained, version-controlled and current?', {
            nist: 'PL-2',
            levels: [
              'No architecture or design documentation exists',
              'Outdated, partial documents exist',
              'Current documentation maintained to an agreed standard',
              'Version-controlled documentation reviewed on a schedule',
              'Continuously maintained, audit-ready documentation',
            ],
          }),
          M('Policies & procedures', 'Are IAM-related policies, standards and operating procedures centralised and reviewed periodically?', {
            nist: 'AC-1',
            levels: [
              'No documented IAM policies or procedures',
              'Scattered documents with unclear ownership',
              'Centralised policies and procedures with owners',
              'Version-controlled with periodic reviews and sign-off',
              'Continuously improved with compliance automation',
            ],
          }),
        ],
      },
      {
        name: 'Regulatory Requirements',
        slug: 'wam-regulatory-requirements',
        icon: 'briefcase',
        capability: 'vSecure Governance Advisory - compliance evidence',
        description: 'Mapping of WAM controls to regulatory frameworks and audit evidence readiness.',
        questions: [
          M('Framework mapping', 'Are WAM controls mapped to applicable regulatory frameworks (NIST, UK GDPR, FCA, ISO 27001)?', {
            nist: 'PM-9',
            levels: [
              'Controls are not mapped to any regulatory framework',
              'Partial, informal mapping to some requirements',
              'Documented mapping to the applicable frameworks',
              'Mapping maintained with audit evidence collected',
              'Continuous compliance monitoring with drift alerts',
            ],
          }),
          M('Evidence & reporting', 'Is compliance evidence for WAM controls collected and reported for audit readiness?', {
            nist: 'CA-2',
            levels: [
              'No compliance evidence is collected',
              'Evidence gathered manually per audit, with difficulty',
              'A defined evidence catalogue is maintained',
              'Automated evidence collection and reporting',
              'Real-time audit-readiness dashboards',
            ],
          }),
          I('Obligations', 'Clarify any specific regulatory requirements applicable to the WAM estate and the current compliance state.'),
        ],
      },
    ],
  },

  /* ================================ IGA ================================ */
  IGA: {
    name: 'Identity Governance & Administration',
    controlAreas: [
      {
        name: 'Architecture, Tools and Design',
        slug: 'iga-architecture-landscape',
        icon: 'globe',
        capability: 'vSecure IGA module - platform & integration',
        description: 'IGA platform, integrations with authoritative sources and organisational landscape.',
        questions: [
          M('Platform', 'Is an IGA platform implemented and integrated with authoritative sources (HR) for identity data?', {
            nist: 'IA-4',
            levels: [
              'No IGA platform; identity data is managed manually',
              'Scripts and partial tools exist without an authoritative feed',
              'An IGA platform is integrated with HR for the core population',
              'An authoritative HR feed drives all identity types with monitoring',
              'Real-time integration with continuous data-quality checks',
            ],
          }),
          M('Platform', 'Is the current IGA design documented and up to date?', {
            nist: 'PL-2',
            levels: [
              'No design documentation exists',
              'Partial or stale documentation exists',
              'The current design is documented to an agreed standard',
              'Version-controlled documentation updated with every change',
              'Documentation continuously validated against the live estate',
            ],
          }),
          I('Integrations', 'Please provide any use-case implemented with any existing scripts / ITSM tool etc.'),
          I('Integrations', 'How frequently is new user data read from the HR source?'),
          I('Organisation', 'Provide the list of teams involved in current User Lifecycle Management (Access Mgmt) and Access Governance (Access Certification) aka IGA processes.'),
          I('Organisation', 'Provide the view of different business units/countries involved in IGA.\na) Is there any specific requirement or challenges in each geography?'),
        ],
      },
      {
        name: 'Identity and Access Administration',
        slug: 'iga-identity-access-admin',
        icon: 'users',
        capability: 'vSecure IGA module - provisioning & administration',
        description: 'User types, sources of truth, provisioning automation and administration tooling.',
        questions: [
          M('Provisioning automation', 'Is provisioning and deprovisioning to downstream systems automated from the IGA platform?', {
            levels: [
              'All provisioning is manual with no central tracking',
              'Scripted/manual provisioning for a few systems',
              'Documented provisioning process; key systems connected',
              'Majority of downstream systems automated with monitored SLAs',
              'Zero-touch provisioning across the estate with continuous reconciliation',
            ], nist: 'AC-2',
          }),
          M('Roles', 'a) Are there roles configured?\nb) Have you designed the roles manually? How are they reviewed?', {
            nist: 'AC-2(7)',
            levels: [
              'No roles are configured',
              'A few roles built ad hoc and never reviewed',
              'Roles are designed and documented with owners',
              'Roles are reviewed periodically with certification',
              'The role model is continuously optimised through role mining',
            ],
          }),
          M('Birthright', 'a) Is any birthright access provisioning or role configured?\nb) How do you handle birthright role provisioning for the contractors?', {
            nist: 'AC-2',
            levels: [
              'No birthright access; everything is requested manually',
              'Basic defaults exist for some populations',
              'Documented birthright for employees; contractors handled manually',
              'Automated birthright for all populations, including contractors',
              'Attribute-driven birthright continuously right-sized',
            ],
          }),
          M('Self-service', 'Is there any self-service password reset functionality in place?', {
            nist: 'IA-5',
            levels: [
              'All resets go through the helpdesk',
              'Self-service exists but adoption is low',
              'Available and adopted across most of the workforce',
              'Secure, MFA-verified self-service is the default with metrics',
              'Passwordless authentication minimises resets entirely',
            ],
          }),
          I('User landscape', 'Type and number of each user type - e.g. employees, contractors, partners, etc.'),
          I('User landscape', 'How do these user types differentiate? Please add examples as well.'),
          I('User landscape', 'Provide a view on the numbers of each category of users.'),
          I('User landscape', 'Provide the source of truth for each identity type.'),
          I('Accounts', 'a) Is there any naming convention followed for the accounts?\nb) How is it enforced?'),
          I('Downstream systems', 'Provide a view on downstream systems where identities are to be provisioned.\na) How many are automated?\nb) Is there any Robotic Process Automation (RPA) implemented for any use cases?'),
          I('Credentials', 'a) How is the initial password generated and shared with the user?\nb) What is the segregation of password policy between payroll and non-payroll users and sub-categories?'),
          I('Tooling', 'a) Clarify the tool used for ITSM (ticketing tool).\nb) Is it used for any joiner, mover, leaver identity management?'),
          I('Directory provisioning', 'Are there any automated provisioning of any of the AD domains?\na) How are you handling AD-based application access provisioning and deprovisioning?'),
          I('Data flows', 'Provide details on any writeback of unique userIDs/email IDs from any other source system.'),
          I('Enterprise applications', 'Provide details about any enterprise applications like SAP, Mainframe where provisioning is to be automated through the centralized IGA solution.'),
        ],
      },
      {
        name: 'Identity Lifecycle Management',
        slug: 'iga-identity-lifecycle',
        icon: 'user-check',
        capability: 'vSecure IGA module - JML automation',
        description: 'Joiner, mover, leaver, emergency termination and re-hire processes.',
        questions: [
          M('Lifecycle automation', 'Are joiner, mover and leaver events processed automatically and on time from HR triggers across systems?', {
            levels: [
              'JML is entirely manual and often delayed',
              'Manual JML with checklists; leavers occasionally missed',
              'Documented JML processes covering AD and key applications',
              'Automated JML from HR events with same-day deprovisioning',
              'Zero-touch JML with continuous verification and orphan detection',
            ], nist: 'AC-2', cis: '5.3',
          }),
          I('Joiner', 'a) Provide details on the current Joiner process.\nb) How is the AD and Exchange provisioning handled?'),
          I('Mover', 'Provide details on the current Mover process.'),
          I('Leaver', 'Provide details on the current Leaver process configured.\na) How is the AD deprovisioning handled?\nb) When an account is removed, is it disabled or deleted?\nc) Do you disable or delete the access entirely for AD and other applications?'),
          I('Emergency termination', 'Provide details on the current Emergency Termination process.'),
          I('Re-hire', 'Provide details on the current Re-hire process.'),
          I('Challenges', 'Provide a view on any challenges with current Joiner Mover Leaver processes related to any of the source or target systems.'),
        ],
      },
      {
        name: 'Password Management',
        slug: 'iga-password-management',
        icon: 'lock',
        capability: 'vSecure IGA module - credential policy',
        description: 'Password and lockout policy definition and enforcement across account types.',
        questions: [
          M('Policy', 'Is there a password policy defined and documented for all account types? Please provide supporting document (if any).', {
            nist: 'IA-5', cis: '5.2',
            levels: [
              'No password policy exists',
              'A policy exists for user accounts only, not all account types',
              'A documented policy covers all account types',
              'The policy is technically enforced for every account type',
              'Compliance is continuously measured and the policy tuned to risk',
            ],
          }),
          M('Enforcement', 'Is the password policy strictly enforced for all types of accounts?', {
            nist: 'IA-5',
            levels: [
              'The policy is not enforced',
              'Enforced on some systems only',
              'Enforced through standard configuration across major systems',
              'Centrally enforced and monitored for compliance',
              'Enforcement continuously verified with automated remediation',
            ],
          }),
          M('Lockout', 'Is the account lockout policy defined and documented?\na) For normal user accounts\nb) For service accounts', {
            nist: 'AC-7',
            levels: [
              'No lockout policy is defined',
              'Defaults are used; service accounts are unaddressed',
              'Documented for both user and service accounts',
              'Enforced for both account types with monitoring',
              'Adaptive lockout policies tuned by risk analytics',
            ],
          }),
        ],
      },
      {
        name: 'Access Governance',
        slug: 'iga-access-governance',
        icon: 'clipboard-check',
        capability: 'vSecure IGA module - certification & SoD',
        description: 'Recertification campaigns, request/approval workflows and segregation of duties.',
        questions: [
          M('Certification', 'Are there any recertification campaigns run?', {
            levels: [
              'No recertification campaigns are run',
              'Ad hoc campaigns after audits or incidents',
              'Scheduled campaigns with a defined frequency',
              'Automated campaigns with tracked remediation of revoked access',
              'Continuous, risk-driven micro-certifications with analytics',
            ], nist: 'AC-2(j)',
          }),
          M('Access requests', 'Are access requests raised for roles (role-based requesting with approvals)?', {
            nist: 'AC-2',
            levels: [
              'Access is requested via email or chat with no approvals',
              'Ticket-based requests without any role structure',
              'Role-based requests with documented approvals',
              'Automated request workflows with SLA tracking',
              'Intelligent request recommendations with risk-based approvals',
            ],
          }),
          M('SoD review', 'Is there a process defined to review the SoD policies periodically? If yes, what is the frequency?', {
            nist: 'AC-5',
            levels: [
              'SoD policies are never reviewed',
              'Reviewed only after audit findings',
              'A documented review cadence exists and is followed',
              'Scheduled reviews with tracked policy updates',
              'Continuous refinement driven by violation and usage data',
            ],
          }),
          I('Campaigns', 'a) What is the frequency of campaigns?\nb) How is the frequency defined?\nc) Is it based on any application-specific compliance standard?'),
          I('Campaigns', 'a) What is the identity coverage for access review campaigns?\nb) Who are the target audience?\nc) How is data collected?\nd) What type of campaigns are being run - app-wise, user-wise, role-wise, etc.?\ne) What is the process to remediate accesses post certification?'),
          I('Workflows', 'Provide details about the type of request and approval workflows configured.'),
          I('Workflows', 'Are there more than one access request interfaces?'),
          I('Provisioning', 'What is the process of provisioning access? Is there any automated provisioning?'),
          I('SoD', 'Provide details about any Segregation of Duties (SoD) policies defined.'),
          I('SoD', 'How are SoD policies enforced?'),
        ],
      },
      {
        name: 'Audit, Reporting and Event Logging',
        slug: 'iga-audit-reporting',
        icon: 'activity',
        capability: 'vSecure Identity Analytics',
        description: 'Reporting on lifecycle and governance activity, event logging and downstream analytics.',
        questions: [
          M('Logging & review', 'Are identity lifecycle and governance events logged, retained and reviewed in line with policy?', {
            nist: 'AU-2', cis: '8.5',
            levels: [
              'No identity event logging exists',
              'Scattered logs that are never reviewed',
              'Centralised logging with a retention policy',
              'Scheduled reviews and reporting with alerting',
              'Continuous analytics feeding governance decisions',
            ],
          }),
          I('Reporting', 'Provide details about various reporting requirements related to User Lifecycle Management (Access Mgmt) and Access Governance (Access Certification).'),
          I('Reporting', 'Is there any requirement for scheduling any specific report for a regular interval?\na) What type of metadata is required to generate the reports?\nb) What are the attributes required?'),
          I('Data export', 'Is User Lifecycle Management (Access Mgmt) and Access Governance (Access Certification) metadata being exported to any other databases for further reporting requirements?'),
        ],
      },
    ],
  },

  /* ================================ CIAM ================================ */
  CIAM: {
    name: 'Customer Identity & Access Management',
    controlAreas: [
      {
        name: 'CIAM Strategy & Architecture',
        slug: 'ciam-strategy-architecture',
        icon: 'globe',
        capability: 'vSecure CIAM module - platform & architecture',
        description: 'Customer identity strategy, platform architecture and resilience.',
        questions: [
          M('Strategy', 'Does the organisation have a defined customer identity (CIAM) strategy aligned with business and digital objectives?', {
            levels: [
              'No CIAM strategy; customer identity handled reactively per product',
              'Informal direction exists but is not written down or agreed',
              'A documented CIAM strategy approved by stakeholders',
              'The strategy is aligned to digital objectives, funded and tracked',
              'Continuously refreshed strategy driven by customer and threat insight',
            ],
          }),
          M('Platform', 'Is customer identity handled by a dedicated CIAM platform rather than bespoke in-house code?', {
            levels: [
              'Custom-built login code maintained in-house',
              'A mix of custom code and third-party components',
              'A dedicated CIAM product handles the core journeys',
              'An enterprise CIAM platform with vendor support covers all journeys',
              'The platform is continuously evolved, leveraging managed innovation',
            ],
          }),
          M('Resilience', 'Is the customer login platform designed for high availability with a tested recovery strategy?', {
            nist: 'CP-10',
            levels: [
              'No high availability or recovery provisions for customer login',
              'Basic backups exist; recovery is untested',
              'HA design with a documented, annually tested recovery plan',
              'Comprehensive HA/DR with regularly tested recovery objectives',
              'Automated failover with continuous DR readiness',
            ],
          }),
          I('Landscape', 'Provide the current CIAM landscape view (tools and technology involved).'),
          I('Volumes', 'Provide customer identity volumes and peak login rates.'),
        ],
      },
      {
        name: 'Registration & Onboarding',
        slug: 'ciam-registration-onboarding',
        icon: 'user-check',
        capability: 'vSecure CIAM module - onboarding journeys',
        description: 'Customer self-registration, identity verification and progressive profiling.',
        questions: [
          M('Registration', 'Is customer self-registration secure, with appropriate identity verification for the risk of the service?', {
            nist: 'IA-12',
            levels: [
              'No verification at signup',
              'Email link verification only',
              'Verification proportional to service risk is documented',
              'Automated identity verification for higher-risk services',
              'Adaptive verification driven by fraud signals',
            ],
          }),
          M('Profiling', 'Is progressive profiling used to minimise data collected at registration?', {
            levels: [
              'All data is demanded upfront at signup',
              'Long forms with some optional fields',
              'A defined minimal signup with later enrichment',
              'Progressive profiling automated across journeys',
              'Continuously optimised through experimentation',
            ],
          }),
          I('Journeys', 'Describe the current customer registration and onboarding flows (channels, verification steps, drop-off points).'),
        ],
      },
      {
        name: 'Customer Authentication & MFA',
        slug: 'ciam-authentication-mfa',
        icon: 'lock',
        capability: 'vSecure CIAM module - adaptive customer authentication',
        description: 'Authentication options, MFA coverage and risk-based challenges for customers.',
        questions: [
          M('MFA', 'Are MFA options available and encouraged/enforced for customer accounts?', {
            nist: 'IA-2(1)',
            levels: [
              'No MFA is available to customers',
              'Available but hidden and rarely used',
              'Offered and encouraged at key moments',
              'Risk-based enforcement with adoption tracking',
              'Phishing-resistant, adaptive customer authentication',
            ],
          }),
          M('Adaptive', 'Is risk-based adaptive authentication applied to customer logins (device, location, behaviour)?', {
            nist: 'IA-2(6)',
            levels: [
              'The same checks apply to every login',
              'Manual rules exist for a few cases',
              'Documented risk rules (device, location) are applied',
              'Automated risk scoring on every login',
              'AI-driven continuous authentication',
            ],
          }),
          M('Passwordless', 'Are passwordless options (passkeys, magic links, social login) offered to customers?', {
            levels: [
              'Passwords are the only option',
              'Social login only',
              'Magic links or passkeys on some journeys',
              'Passkeys broadly available with adoption goals',
              'Passwordless is the default experience',
            ],
          }),
          I('Factors', 'Which customer authentication factors and tools are currently in use?'),
        ],
      },
      {
        name: 'Consent & Privacy Management',
        slug: 'ciam-consent-privacy',
        icon: 'clipboard-check',
        capability: 'vSecure CIAM module - consent & preference management',
        description: 'Capture, versioning and enforcement of customer consent, and self-service privacy controls.',
        questions: [
          M('Consent', 'Is customer consent captured, versioned and enforced across systems in line with UK GDPR?', {
            nist: 'PT-2',
            levels: [
              'Consent is not explicitly captured',
              'Captured at signup but unversioned',
              'Documented consent flows with records kept',
              'Versioned consent enforced across systems',
              'Fine-grained consent synchronised in real time',
            ],
          }),
          M('Preference centre', 'Can customers manage their consent and preferences through self-service?', {
            levels: [
              'No way for customers to manage preferences',
              'Requests handled manually via support',
              'A basic self-service preference page exists',
              'A full preference centre synced to downstream systems',
              'Continuously improved with granular controls',
            ],
          }),
          I('Records', 'Describe how consent records are stored and synchronised with downstream systems.'),
        ],
      },
      {
        name: 'Account Protection & Fraud',
        slug: 'ciam-account-protection',
        icon: 'shield',
        capability: 'vSecure CIAM module - fraud & takeover protection',
        description: 'Defences against credential stuffing, account takeover detection and secure recovery.',
        questions: [
          M('Attack protection', 'Are bot detection, rate limiting and breached-password checks in place for customer login?', {
            cis: '4.1',
            levels: [
              'No protection beyond the password itself',
              'Basic rate limiting only',
              'Documented layered controls on the login journey',
              'Automated bot defence and breached-password screening',
              'AI risk scoring on every login attempt',
            ],
          }),
          M('Takeover response', 'Are compromised customer accounts detected and remediated automatically (step-up, forced reset)?', {
            nist: 'IR-4',
            levels: [
              'We learn about takeovers from customer complaints',
              'Manual investigation and password resets',
              'A documented account-takeover playbook exists',
              'Automated detection with forced step-up or reset',
              'Real-time detection with automated remediation',
            ],
          }),
          M('Recovery', 'Are customer credential recovery flows secure and resistant to social engineering?', {
            nist: 'IA-5',
            levels: [
              'Recovery via support email, easily abused',
              'A basic email reset link only',
              'Standardised recovery flows with identity verification',
              'Risk-scored recovery with step-up authentication',
              'Passwordless recovery adapting to fraud signals',
            ],
          }),
          I('Incidents', 'Describe any account takeover or fraud incidents in the last 12 months and how they were handled.'),
        ],
      },
      {
        name: 'Scalability & Resilience',
        slug: 'ciam-scalability-resilience',
        icon: 'activity',
        capability: 'vSecure CIAM module - scale & reliability',
        description: 'Ability of the customer identity platform to absorb traffic spikes and meet availability targets.',
        questions: [
          M('Scale', 'Can the customer login system handle sudden traffic spikes without downtime (auto-scaling, load tested)?', {
            nist: 'SC-5',
            levels: [
              'Login degrades even under normal peaks',
              'Spikes are handled with manual scaling and firefighting',
              'A documented capacity plan, load tested regularly',
              'Auto-scaling identity components with monitoring',
              'Self-healing, multi-region resilience',
            ],
          }),
          M('SLOs', 'Are availability and latency SLOs defined, measured and reported for customer login?', {
            levels: [
              'No availability targets exist for login',
              'Informal expectations only',
              'SLOs are defined and measured',
              'SLOs monitored with alerting and regular reporting',
              'Error budgets drive continuous improvement',
            ],
          }),
          I('History', 'Describe peak login volumes and any customer-facing identity outages in the last 12 months.'),
        ],
      },
    ],
  },
};

module.exports = { AREAS, DEFAULT_LEVELS };
