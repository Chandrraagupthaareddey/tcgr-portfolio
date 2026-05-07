/**
 * ============================================================================
 *  Schemas.js — Sheet schema definitions and bootstrap
 *  ============================================================================
 *  Run setupSheets() once after creating the spreadsheet.
 *  Re-running is idempotent — existing sheets are skipped.
 *  ============================================================================
 */

function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const schemas = _SCHEMAS();
  let created = 0;

  Object.keys(schemas).forEach(name => {
    if (!ss.getSheetByName(name)) {
      const sh = ss.insertSheet(name);
      const { headers, rows } = schemas[name];
      sh.getRange(1, 1, 1, headers.length)
        .setValues([headers])
        .setFontWeight('bold')
        .setBackground('#0c0c10')
        .setFontColor('#e8dfc4');
      if (rows && rows.length) {
        sh.getRange(2, 1, rows.length, headers.length).setValues(rows);
      }
      sh.setFrozenRows(1);
      sh.autoResizeColumns(1, headers.length);
      created++;
    }
  });

  // Remove default Sheet1 if present and we've added others
  const def = ss.getSheetByName('Sheet1');
  if (def && Object.keys(schemas).indexOf('Sheet1') === -1 && ss.getSheets().length > 1) {
    ss.deleteSheet(def);
  }

  ss.toast(`Schema initialized · ${created} sheet(s) created ✓`, 'tcgr.in CMS', 5);
}

function _SCHEMAS() {
  return {
    profile: {
      headers: ['key', 'value'],
      rows: [
        ['name', 'Chandraguptha Reddy'],
        ['full_name', 'Thimmapuram Chandraguptha Reddy'],
        ['role', 'Senior Staff Engineer — Site Reliability Engineering'],
        ['tagline', 'AI-Augmented Observability Engineer · Automation Architect · Multi-LLM Workflow Builder'],
        ['intro', "I'm Chandraguptha Reddy — a Senior Staff Engineer building AI-augmented observability, automation, and self-healing operational systems for enterprise-scale platforms. Currently architecting reliability for Airbnb Payments."],
        ['notice_period', '60d notice'],
        ['location_short', 'Bengaluru · UAE / Remote']
      ]
    },
    about: {
      headers: ['key', 'value'],
      rows: [
        ['body', "My career didn't start in engineering. It started in hotel revenue analysis — staring at spreadsheets, spotting patterns in noise, and building automations to escape repetition. That instinct never left.\n\nOver 15 years, I've evolved from automating night audits with Google Apps Script to architecting multi-LLM AIOps platforms for Airbnb Payments — combining classical SRE practice with modern AI reasoning to detect, triage, and resolve incidents with minimal human overhead."]
      ]
    },
    contact: {
      headers: ['key', 'value'],
      rows: [
        ['email', 'tcgr.8553665381@gmail.com'],
        ['linkedin', 'https://www.linkedin.com/in/tcgr/'],
        ['github', 'https://github.com/tcgr-in'],
        ['phone_in', '+91 8553665381'],
        ['phone_uae', '+971 552009343'],
        ['location', 'Location:        Bengaluru, IN · open to UAE / Remote'],
        ['role', 'Current Role:    Senior Staff Engineer — SRE @ Airbnb (via Altimetrik)'],
        ['availability', 'Availability:    60 days notice (negotiable)'],
        ['languages', 'Languages:       English, Hindi, Tamil'],
        ['tagline', 'Open to senior SRE / Observability / AI-Ops leadership roles in UAE and remote. I respond within 24 hours.']
      ]
    },
    metrics: {
      headers: ['key', 'value'],
      rows: [
        ['years', 15],
        ['gas_automations', 20],
        ['alert_noise_reduction_pct', 55],
        ['manual_effort_reduction_pct', 40],
        ['mttr_improvement_pct', 35]
      ]
    },
    timeline: {
      headers: ['year', 'role', 'company', 'description', 'tech', 'impact'],
      rows: [
        ['2025 — Now', 'Senior Staff Engineer, SRE', 'Airbnb (via Altimetrik)', 'Architecting AI-driven observability for Airbnb Payments. Multi-LLM AIOps with Claude, GPT, Gemini. Reduced alert noise 55%, improved MTTR 35–48%.', 'Datadog;Telescope;Claude;GPT;Gemini;MCP', '−55% alert noise · MTTR −35–48%'],
        ['2024 — 2025', 'Technical Lead, SRE', 'Airbnb · Payments / Payins', 'Designed Flow-Level Monitors aligned to payment flows. Built composite anomaly detection in Datadog. Automated alert triage via Datadog APIs + Slack + Apps Script.', 'Datadog;Slack;GAS;PromQL', 'FLM coverage across critical flows'],
        ['2021 — 2024', 'Senior SRE', 'Citi Bank (via Altimetrik)', 'Self-managed Grafana Enterprise across NAM/APAC/EMEA. Migrated POCs to production with Jenkins + Ansible CI/CD. Cut manual rollout effort by 60%.', 'Grafana;Prometheus;Splunk;Jenkins;Ansible', '−60% rollout effort'],
        ['2021', 'Senior SRE', 'PayPal', 'Application gap & tooling assessment: Splunk, Galileo, Tabule, Kibana, Sherlock. Vulnerability management and security observability.', 'Splunk;Galileo;Kibana;MVM', ''],
        ['2020 — 2021', 'DevOps & Infra', 'Happymonk.ai', 'Infrastructure for self-hosted e-commerce. Multi-cloud (AWS, Azure, E2E, Infomaniak). Deployed AI/ML models to Windows + Ubuntu fleets.', 'AWS;Azure;Jenkins;Ansible;Datadog', 'Multi-cloud production stack'],
        ['2019 — 2020', 'Site Reliability Engineer', 'Vogo Automotive', 'Structured the SRE team. Owned availability, latency, capacity planning, on-call. K8s monitoring, PostgreSQL/MongoDB/Prometheus stack.', 'K8s;Datadog;ELK;PagerDuty;PostgreSQL', 'Built SRE function from scratch'],
        ['2015 — 2019', 'SRE L1 → L3', 'Treebo Hotels', 'Started with shell automation for PMS Night Audit; evolved into full-stack SRE — ELK, Datadog, Sentry, AWS, on-call. Built 20+ Apps Script automations.', 'ELK;Datadog;Sentry;AWS;GAS', '20+ GAS automations'],
        ['2014 — 2015', 'Data Analyst (CA Internship)', 'Keys Hotels', 'First taste of Google Apps Script automation. Auto-email triggers, vendor app integration, financial audit automation.', 'GAS;Tableau;PMS', 'Replaced manual reporting'],
        ['2010 — 2014', 'Hotel Revenue Analyst', 'Adarsh Developers', 'Where the systems-thinking started. Inventory, dynamic pricing, OTA optimization, data-driven decisioning.', 'Excel;OTAs;PMS', '']
      ]
    },
    expertise: {
      headers: ['category', 'title', 'description', 'tools', 'badge'],
      rows: [
        ['Observability', 'AI-Augmented Observability', 'Combining metrics/logs/traces with LLM reasoning for intelligent triage, summarization, and impact analysis across distributed systems.', 'Datadog;Grafana;Telescope;Claude;MCP', 'core'],
        ['Automation', 'Google Apps Script Architecture', '20+ production GAS automations: PropertiesService for secrets, LockService for concurrency, modular triggers, batch operations, quota-aware retries.', 'GAS;Triggers;Sheets API;Gmail API', '20+'],
        ['AI / LLM', 'Multi-LLM Orchestration', 'Prompt chaining across Claude, GPT, Gemini for cross-validated reasoning. Severity classification, RCA generation, runbook synthesis.', 'Claude;GPT;Gemini;MCP;RAG', 'production'],
        ['Reliability', 'SLI / SLO Engineering', 'Golden signals, error budgets, flow-level monitoring tied to business-critical payment workflows. Alert quality over alert quantity.', 'SLI;SLO;Error Budgets;FLM', ''],
        ['Alerting', 'Alert Intelligence Design', 'Composite alerts, anomaly detection, traffic-aware thresholds. Cut alert noise ~55% via AI classification + dynamic baselines.', 'Datadog;PromQL;Anomaly ML;Z-score', '−55% noise'],
        ['Cloud', 'Multi-Cloud Reliability', 'Production reliability across AWS, GCP, Azure, OpenShift, EKS clusters. Linux-native automation. Container-aware monitoring.', 'AWS;GCP;Kubernetes;OpenShift', ''],
        ['CI/CD', 'Monitoring-as-Code', 'Version-controlled FLM configs, parameterized Jenkins pipelines, peer-reviewed alert logic. One-click rollouts across environments.', 'Jenkins;Ansible;GitLab;uDeploy', '−60% effort'],
        ['Incident', 'Automated Incident Response', 'LLM-driven runbook generation, contextual recommendations, Slack workflow integration, automated impact correlation.', 'Slack API;Datadog API;GAS;LLMs', ''],
        ['Leadership', 'SRE Mentorship', 'Drive adoption of AI-driven SRE practices across teams. Cross-team collaboration to improve resilience, scalability, production readiness.', 'Coaching;Architecture;Strategy', '']
      ]
    },
    projects: {
      headers: ['number', 'category', 'title', 'subtitle', 'description', 'stack', 'impact', 'link'],
      rows: [
        ['01', 'AI / Observability', 'AI Alert Triage System', 'Multi-LLM classification across Datadog → Slack → Sheets',
         'Built end-to-end alert classification using Claude for reasoning, GPT for cross-checking, Gemini for impact summary.;Severity prediction, false-positive filtering, contextual incident grouping. Pulls live signals via Datadog API.;Output piped to Slack with one-click actions (acknowledge, escalate, suppress).',
         'Claude;GPT;Gemini;Datadog API;GAS;Slack API',
         '−55% alert noise · MTTR improved 35–48% · ~30–40% manual effort eliminated', ''],
        ['02', 'AI / RCA', 'Datadog Auto-RCA', 'Intelligent correlation engine for payment incidents',
         'Cross-service correlation across metrics, logs, traces. AI-generated RCA summaries with reasoning chains.;Reduces "why" time during incident calls — engineers walk in with context, not raw data.',
         'Datadog;Claude;Telescope;Splunk',
         'Cuts RCA time from hours to minutes for recurring incident classes', ''],
        ['03', 'Automation', 'Flow-Level Monitor (FLM) Framework', 'Business-flow-aware alerting for Airbnb Payments',
         'Designed FLMs aligned to actual payment flows — not just service-level signals.;Composite alerts correlating dimensions across services with dynamic anomaly thresholds.;Version-controlled config-as-code; peer-reviewed alerting logic.',
         'Datadog;PromQL;Git;Jenkins',
         'Granular detection of business-impacting anomalies; reduced blind spots in payment workflows', ''],
        ['04', 'Automation Platform', 'GAS Workflow Automation Hub', '20+ production automations across Sheets, Gmail, APIs',
         'Centralized scheduler pattern (single trigger, fan-out execution).;PropertiesService-backed secrets management. LockService for concurrent runs.;Batch read/write optimization — 10× faster than cell-by-cell.;Modular architecture: each automation is a versioned module.',
         'Apps Script;Sheets API;Gmail API;Triggers',
         'Saved hundreds of engineer-hours/month across reporting, audits, and ops workflows', ''],
        ['05', 'Reliability', 'Datadog → Telescope Migration', 'End-to-end observability platform transition',
         'Led migration from Datadog to Telescope for Airbnb payments observability stack.;Mapped every alert, dashboard, FLM. Validated alert accuracy via parallel-run shadowing.;Documented signal-quality framework adopted across teams.',
         'Datadog;Telescope;Grafana;Splunk',
         'Enhanced alert accuracy + signal quality without coverage regression', ''],
        ['06', 'Workflow', 'EMR Booking Workflow', 'Patient routing + embedded booking automation',
         'Routing logic for new vs. returning patients, embedded booking experience.;Backed by Apps Script + Sheets as the source of truth.',
         'Apps Script;Sheets;Forms',
         'Replaced manual coordination with self-service workflow', '']
      ]
    },
    ai_capabilities: {
      headers: ['label', 'title', 'description'],
      rows: [
        ['REASONING', 'Claude as primary triage', 'Long-context reasoning over incident timelines, log bursts, and cross-service traces. Synthesizes hypotheses faster than humans on first-look.'],
        ['VALIDATION', 'GPT cross-check pass', "Independent second opinion on Claude's RCA. Surfaces blind spots, contradicts overconfident answers, reduces single-model bias."],
        ['SUMMARIZATION', 'Gemini for stakeholder briefs', 'Translates technical RCAs into exec-friendly summaries. Bridges engineering and product/business comms during war rooms.']
      ]
    },
    lessons: {
      headers: ['number', 'title', 'problem', 'fix', 'impact'],
      rows: [
        ['L01', 'Hardcoding everything', 'Secrets, API keys, and config baked directly into Apps Script code. Painful to rotate, terrifying to share.', 'Migrated all sensitive values to PropertiesService (Script + User Properties). One config layer, one place to update.', 'Centralized config management. Safe code reviews. Zero credential leakage in 4+ years.'],
        ['L02', 'Silent automation failures', 'Apps Script functions failing without anyone noticing — until a downstream report came up empty days later.', 'Wrapped every entry-point in try/catch with MailApp + Slack alert on exception. Dead-man-switch monitor for scheduled triggers.', 'Failures detected in minutes, not days. Ops trust restored.'],
        ['L03', 'Trigger overload', '30+ time-driven triggers across one project. Quota collisions, race conditions, debugging chaos.', 'Centralized scheduler pattern: one master trigger fans out to logical handlers based on a schedule sheet.', 'From 30+ triggers to 1. Debugging time cut by 80%.'],
        ['L04', 'Cell-by-cell sheet operations', 'Loops calling getRange() / setValue() per cell. 10,000-row jobs taking 6+ minutes and hitting execution limits.', 'Batch read/write: getValues() into 2D array, mutate in memory, setValues() once.', '10×–50× speedup. Scripts that timed out now run in seconds.'],
        ['L05', 'Everything in one function', 'Monolithic doGet() with 600 lines of business logic, tightly coupled. Refactor-hostile.', 'Modular architecture: routers, services, repos, validators. Clear contracts between layers.', 'Onboarding from days to hours. Confidence to refactor without regression.'],
        ['L06', 'Duplicate execution', 'Two triggers firing in overlap → duplicate emails, double-counted records, corrupted state.', 'LockService at the entry of every mutation function. Properly scoped, properly released.', 'Eliminated entire class of state corruption bugs.'],
        ['L07', 'Ignoring quotas & limits', 'Apps Script execution time limits, daily email quotas, API rate limits — discovered only when production failed.', 'Quota-aware retry logic with exponential backoff. Pre-flight quota checks. Batched API calls.', 'Reliable execution at scale. No more weekend pages from quota exhaustion.']
      ]
    },
    resumes: {
      headers: ['format', 'title', 'description', 'link', 'updated', 'template_doc_id'],
      rows: [
        ['INT-01', 'International CV', 'ATS-friendly, two-page, role-targeted for global SRE / Observability / AI-Ops leadership roles.', '', 'v2026.05', ''],
        ['GULF-01', 'Gulf CV', 'Tailored for UAE / GCC market: visa status, availability, expected salary, regional context.', '', 'v2026.05', ''],
        ['IN-01', 'India CV', 'Naukri/LinkedIn-optimized format with detailed project breakdowns and skill matrices.', '', 'v2026.05', '']
      ]
    },
    skills: {
      headers: ['domain', 'skill', 'years', 'level'],
      rows: [
        ['Observability', 'Datadog', 7, 'Expert'],
        ['Observability', 'Grafana / Prometheus', 5, 'Expert'],
        ['Observability', 'Splunk / ELK', 6, 'Advanced'],
        ['Observability', 'Telescope', 1, 'Advanced'],
        ['Cloud', 'AWS', 6, 'Advanced'],
        ['Cloud', 'GCP', 3, 'Intermediate'],
        ['Cloud', 'Kubernetes / OpenShift', 4, 'Advanced'],
        ['Automation', 'Google Apps Script', 10, 'Expert'],
        ['Automation', 'Python', 6, 'Advanced'],
        ['Automation', 'Shell / Bash', 8, 'Advanced'],
        ['AI / LLM', 'Claude', 2, 'Advanced'],
        ['AI / LLM', 'GPT', 2, 'Advanced'],
        ['AI / LLM', 'Gemini', 1, 'Intermediate'],
        ['AI / LLM', 'MCP / Prompt Engineering', 1, 'Advanced'],
        ['CI/CD', 'Jenkins', 5, 'Advanced'],
        ['CI/CD', 'GitLab CI', 3, 'Intermediate']
      ]
    },
    certifications: {
      headers: ['name', 'issuer', 'year', 'link'],
      rows: [
        ['GenAI Toolkit', 'Internal', '2025', ''],
        ['Leadership Academy — Foundational', 'Internal', '2024', ''],
        ['ISO 27001:2013 Information Security Awareness', 'Internal', '2023', ''],
        ['Mastering Bitbucket Pipelines for CI/CD', 'Online', '2023', ''],
        ['Introduction to MongoDB', 'MongoDB', '2022', '']
      ]
    },
    blogs: {
      headers: ['title', 'category', 'summary', 'link', 'date', 'status'],
      rows: [
        ['Why Alert Quality Beats Alert Quantity', 'SRE / Observability', 'How we cut alert noise 55% by treating alerting as a product, not a config file.', '', '', 'draft'],
        ['Multi-LLM Workflows in Production', 'AI / AIOps', 'Why Claude, GPT, and Gemini together beat any single model for incident reasoning.', '', '', 'draft'],
        ["7 Apps Script Mistakes I Made So You Don't Have To", 'Automation', 'Hardcoded secrets to LockService — a decade of GAS lessons in one post.', '', '', 'draft']
      ]
    },
    meta: {
      headers: ['key', 'value'],
      rows: [
        ['version', '1.0.0'],
        ['last_updated', new Date().toISOString().slice(0, 10)],
        ['domain', 'tcgr.in']
      ]
    }
  };
}
