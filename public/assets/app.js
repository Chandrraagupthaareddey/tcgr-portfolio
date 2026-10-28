/* ============================================================================
 *  tcgr.in — Frontend v2.0.0
 *  Sheet-driven rendering · stale-while-revalidate cache · bundled fallback
 *  ----------------------------------------------------------------------------
 *  v2.0 changes
 *   - No Tailwind runtime. Hand-written CSS (assets/styles.css).
 *   - Live-data fix: background refresh now re-renders when content changes
 *     (v1 fetched in the background and threw the result away). Client TTL
 *     30 min; `?refresh=1` bypasses the local cache; content revision shown
 *     in the ops panel so you can see what the page is rendering.
 *   - Resume fix: the new tab is opened synchronously on click and then
 *     navigated once the API responds — no more popup-blocked downloads.
 *     Static `link` column wins when present (no API round-trip).
 *   - Mobile menu + marquee no longer depend on a CDN loading first.
 *   - New sections: OIP case study (inside AI Lab), AI-in-SRE patterns,
 *     value to business, skills matrix, certifications, command palette,
 *     light/dark theme, live ops panel with real telemetry.
 *  ============================================================================ */

'use strict';

/* ────────────────────────────────────────────────────────────────────────────
 *  FALLBACK DATA — last known good. Mirrors the Google Sheet schema exactly.
 *  Edit the Sheet for content; edit this only when the shape changes.
 * ──────────────────────────────────────────────────────────────────────────── */
const FALLBACK_DATA = {
  profile: {
    name: 'Chandraguptha Reddy',
    full_name: 'Thimmapuram Chandraguptha Reddy',
    role_short: 'Senior Staff Engineer · SRE & AI Ops',
    headline: 'Operations intelligence<br>that <em>shows its work.</em>',
    intro: "I'm Chandraguptha Reddy — a Senior Staff SRE who designs AI-augmented operations platforms: alert triage that cites its evidence, routing that spends the cheapest capable model first, and agents that never act without a human's yes. Fifteen years from hotel revenue desks to payments-scale reliability.",
    availability_line: 'Open to any location · relocation or remote · 60 days notice',
    stats_note: 'Counts, not percentages. Every number here is a thing you can check in a repository, a timeline or a reference call.',
    avatar_url: ''
  },

  stats: [
    { value: '15', unit: 'yrs', label: 'Engineering', note: 'Hospitality → fintech → payments' },
    { value: '9', unit: '', label: 'Roles, 3 industries', note: 'Analyst to Senior Staff' },
    { value: '20', unit: '+', label: 'Production automations', note: 'Apps Script, Python, shell' },
    { value: '6', unit: '', label: 'Observability stacks run', note: 'Datadog · Grafana · Prometheus · Splunk · ELK · in-house' }
  ],

  about: {
    headline: 'From hospitality<br>to <em>SRE</em>, to operations<br>that <em>reason.</em>',
    body: "My career didn't start in engineering. It started in hotel revenue analysis — staring at spreadsheets, spotting patterns in noise, and building automations to escape repetition. That instinct never left.\n\nOver fifteen years I went from automating night audits with Google Apps Script to running reliability for payment systems at Airbnb, and most recently to designing an **operational intelligence platform** where language models sit inside the on-call loop — grounded in evidence, cheap by default, and never allowed to act without a human's approval.\n\nI'm fluent across Datadog, Grafana, Prometheus, Splunk and ELK, and equally at home routing work between local and hosted models through MCP servers and governed tool loops. The interesting problems today live at the intersection: **observability that reasons, and AI that fails closed.**\n\nI write code to remove work, not to make more of it. I optimise for systems that explain themselves. And I believe the best SREs spend more time deleting alerts than creating them."
  },

  about_facts: [
    { key: 'Based in', value: 'Bengaluru, India · open to relocation anywhere, or remote' },
    { key: 'Current', value: 'Senior Staff Engineer, SRE — Airbnb (via Altimetrik)' },
    { key: 'Focus', value: 'AI-augmented operations, alert intelligence, governed agents' },
    { key: 'Working style', value: 'Evidence over opinion. Proposals over surprises. Delete before you add.' },
    { key: 'How I build', value: 'I design the system and direct AI coding agents under governance (evals, approvals, one writer per repo). The platform below was built that way.' }
  ],

  marquee: ['Datadog', 'Grafana', 'Prometheus', 'Alertmanager', 'Splunk', 'ELK', 'incident.io', 'PagerDuty', 'Slack API', 'Ollama', 'Qwen', 'Claude', 'GPT', 'Gemini', 'MCP', 'Node.js', 'Python', 'SQLite', 'MySQL', 'Trino', 'BigQuery', 'Kubernetes', 'AWS', 'GCP', 'SwiftUI', 'Kotlin', 'Apps Script', 'Jenkins', 'Ansible'],

  /* ── Expertise & work ─────────────────────────────────────────────────── */
  expertise: [
    { category: 'Observability', title: 'AI-augmented observability', description: 'Metrics, logs and traces fused with model reasoning for triage, summarisation and impact analysis — with every verdict citing the evidence it used.', tools: ['Datadog', 'Grafana', 'Prometheus', 'MCP', 'Local LLMs'], badge: 'core' },
    { category: 'AI / LLM', title: 'Governed model orchestration', description: 'Cost-ordered routing across local and hosted models, shadow-mode qualification, deterministic evals, and human approval on every write.', tools: ['Ollama', 'Claude', 'GPT', 'Gemini', 'Evals'], badge: 'production' },
    { category: 'Alerting', title: 'Alert intelligence design', description: 'Composite alerts, anomaly baselines, traffic-aware thresholds, coverage-gap detection and graduation gates before anything is allowed to page.', tools: ['PromQL', 'Backtests', 'Anomaly ML', 'Config-as-code'], badge: '' },
    { category: 'Reliability', title: 'SLI / SLO engineering', description: 'Golden signals and error budgets tied to business flows, not just services. Reproducible MTTD / MTTA / MTTR scorecards with SQL lineage.', tools: ['SLI', 'SLO', 'Error budgets', 'Flow monitors'], badge: '' },
    { category: 'Automation', title: 'Google Apps Script architecture', description: '20+ production automations: PropertiesService for secrets, LockService for concurrency, single-trigger fan-out, batch I/O, quota-aware retries.', tools: ['Apps Script', 'Sheets API', 'Gmail API', 'clasp'], badge: '20+' },
    { category: 'Platform', title: 'Local-first systems', description: 'Node and Python services with no runtime dependencies, SQLite as the default store, launchd/containers for lifecycle, Prometheus exposition built in.', tools: ['Node.js', 'Python', 'SQLite', 'FastAPI'], badge: '' },
    { category: 'Cloud', title: 'Multi-cloud reliability', description: 'Production reliability across AWS, GCP, Azure, OpenShift and EKS. Linux-native automation and container-aware monitoring.', tools: ['AWS', 'GCP', 'Kubernetes', 'OpenShift'], badge: '' },
    { category: 'CI/CD', title: 'Monitoring-as-code', description: 'Version-controlled monitor configs, parameterised pipelines, peer-reviewed alert logic. One-click rollouts across regions.', tools: ['Jenkins', 'Ansible', 'GitLab CI', 'TypeScript packs'], badge: '−60% effort' },
    { category: 'Leadership', title: 'SRE mentorship & adoption', description: 'Drive adoption of AI-assisted SRE practice across teams; architecture councils, runbook culture, production-readiness reviews.', tools: ['Coaching', 'Architecture', 'Strategy'], badge: '' },
    { category: 'Forward deployed', title: 'Embedded delivery with AI agents', description: 'Sit with the team that owns the problem, integrate into their Slack, alerts and data, and ship a working pilot in weeks by directing AI coding agents under evals and approval gates.', tools: ['Discovery', 'Integration', 'Agent orchestration', 'Pilots'], badge: 'FDE' }
  ],

  projects: [
    { number: '01', category: 'AI / Operations', title: 'OIP — Operational Intelligence Platform', subtitle: 'Local-first AIOps for a payments on-call team · solo build, 6 months',
      description: ['Ingests alerts from Slack, Alertmanager and trackers; links them to incidents and the on-call rota; runs governed AI triage; posts an evidence-backed decision card back to Slack.', 'Cost-ordered routing (reuse → rules → local model → paid model → human), shadow-mode model qualification, deterministic evals, supervisor-gated writes.', 'About two dozen repositories, ~250K lines, 860+ test files. Full case study in the AI Lab below.'],
      stack: ['Node.js', 'Python', 'SQLite', 'MySQL', 'Ollama', 'MCP', 'Slack', 'incident.io', 'SwiftUI', 'Kotlin'],
      impact: 'Self-hosted triage went from ~30% to 75% agreement with human triage (342 alerts) in a 3-month pilot, closing on the hosted AI agent\'s 80-93% at a fraction of the cost. One noisy alert class was backtested to zero false pages while both real incidents were still caught.' },
    { number: '02', category: 'Alerting', title: 'Flow-level monitoring framework', subtitle: 'Business-flow-aware alerting for payment journeys',
      description: ['Monitors aligned to actual payment flows (authorise, capture, refund) rather than service-level signals alone.', 'Composite alerts correlating dimensions across services with dynamic anomaly thresholds.', 'Config-as-code with peer-reviewed alert logic and parallel-run validation before cut-over.'],
      stack: ['Datadog', 'PromQL', 'Git', 'Jenkins'],
      impact: 'Business-impacting anomalies detected at flow granularity; blind spots in payment workflows closed without adding noise.' },
    { number: '03', category: 'Observability', title: 'Observability platform migration', subtitle: 'Vendor stack → in-house platform, zero coverage regression',
      description: ['Mapped every alert, dashboard and flow monitor; validated accuracy via parallel-run shadowing before switching.', 'Documented a signal-quality framework later adopted by neighbouring teams.'],
      stack: ['Datadog', 'Grafana', 'Prometheus', 'Splunk'],
      impact: 'Improved alert accuracy and signal quality with no loss of coverage during transition.' },
    { number: '04', category: 'Reliability', title: 'Grafana Enterprise at bank scale', subtitle: 'Self-managed observability across NAM / APAC / EMEA',
      description: ['Ran Grafana Enterprise and Prometheus for a global bank; migrated proofs-of-concept to production with Jenkins + Ansible pipelines.', 'Standardised dashboards and alert rules across regions.'],
      stack: ['Grafana', 'Prometheus', 'Jenkins', 'Ansible', 'Splunk'],
      impact: 'Manual rollout effort cut by roughly 60%; one pipeline for every region.' },
    { number: '05', category: 'Automation', title: 'Apps Script automation hub', subtitle: '20+ production automations across Sheets, Gmail and APIs',
      description: ['Centralised scheduler (one trigger, fan-out execution). PropertiesService-backed secrets. LockService for concurrent runs.', 'Batch read/write — 10× faster than cell-by-cell. Each automation a versioned module.'],
      stack: ['Apps Script', 'Sheets API', 'Gmail API', 'Triggers'],
      impact: 'Hundreds of engineer-hours a month returned across reporting, audits and ops workflows.' },
    { number: '06', category: 'Workflow', title: 'Clinic booking workflow', subtitle: 'Patient routing + embedded booking automation',
      description: ['Routing for new vs. returning patients, embedded booking, Sheets as source of truth.'],
      stack: ['Apps Script', 'Sheets', 'Forms'],
      impact: 'Replaced manual coordination with a self-service flow.' }
  ],

  timeline: [
    { year: '2025 — Now', role: 'Senior Staff Engineer, SRE', company: 'Airbnb (via Altimetrik)', description: 'Designed and built an operational intelligence platform from zero: alert ingestion, incident correlation, governed AI triage with local and hosted models, reproducible scorecards, and a supervisor that gates every autonomous write.', impact: 'Self-hosted AI triage improved from ~30% to 75% agreement with human triage over a 3-month pilot, approaching the hosted agent (80-93%) at near-zero marginal cost' },
    { year: '2024 — 2025', role: 'Technical Lead, SRE', company: 'Airbnb · Payments (via Altimetrik)', description: 'Flow-level monitors aligned to payment journeys. Composite anomaly detection. Automated alert triage via monitoring APIs, Slack and Apps Script. Platform migration with parallel-run validation.', impact: 'Flow-level coverage across critical payment paths' },
    { year: '2021 — 2024', role: 'Senior SRE', company: 'Citi (via Altimetrik)', description: 'Self-managed Grafana Enterprise across NAM / APAC / EMEA. Migrated POCs to production with Jenkins + Ansible CI/CD.', impact: '−60% rollout effort' },
    { year: '2021', role: 'Senior SRE', company: 'PayPal', description: 'Application gap and tooling assessment across Splunk, Kibana and internal observability tools. Vulnerability management and security observability.', impact: '' },
    { year: '2020 — 2021', role: 'DevOps & Infrastructure', company: 'Happymonk.ai', description: 'Infrastructure for self-hosted e-commerce. Multi-cloud (AWS, Azure, E2E, Infomaniak). Deployed AI/ML models to Windows and Ubuntu fleets.', impact: 'Multi-cloud production stack' },
    { year: '2019 — 2020', role: 'Site Reliability Engineer', company: 'Vogo Automotive', description: 'Structured the SRE function. Owned availability, latency, capacity planning and on-call. Kubernetes monitoring; PostgreSQL / MongoDB / Prometheus.', impact: 'Built the SRE function from scratch' },
    { year: '2015 — 2019', role: 'SRE L1 → L3', company: 'Treebo Hotels', description: 'Started with shell automation for PMS night audit; grew into full-stack SRE — ELK, Datadog, Sentry, AWS, on-call. Built 20+ Apps Script automations.', impact: '20+ production automations' },
    { year: '2014 — 2015', role: 'Data Analyst', company: 'Keys Hotels', description: 'First Apps Script automation: auto-email triggers, vendor integrations, financial audit automation.', impact: 'Replaced manual reporting' },
    { year: '2010 — 2014', role: 'Hotel Revenue Analyst', company: 'Adarsh Developers', description: 'Where the systems thinking started: inventory, dynamic pricing, OTA optimisation, data-driven decisions.', impact: '' }
  ],

  /* ── AI Lab ───────────────────────────────────────────────────────────── */
  ai_patterns: [
    { label: 'Routing', title: 'Cost-ordered inference', body: 'Reuse → deterministic rules → local model → paid model → human. The order is fixed in code; configuration can only switch rungs off, never reorder them.', how: '<b>Why:</b> most alert volume is repetitive. Spending a frontier model on it is waste; spending nothing on the novel 5% is risk.' },
    { label: 'Qualification', title: 'Shadow mode before trust', body: 'New models run silently beside the incumbent. Promotion needs ≥30 adjudicated samples, a named human, and accuracy within ±0.05 of the recorded baseline.', how: '<b>Why:</b> "it looks good in the demo" is not evidence. Health is not eligibility.' },
    { label: 'Grounding', title: 'Evidence ladders per alert family', body: 'Each alert type gets a staged evidence plan: cheapest check first, stop early, bounded time. The model judges the evidence; it never invents it.', how: '<b>Why:</b> a verdict without citations is an opinion. Cards show evidence for, against, and not checked.' },
    { label: 'Governance', title: 'Every write is a proposal', body: 'Assistants are read-only. Any change becomes a structured proposal that flows to a supervisor and a human approval gate before execution.', how: '<b>Why:</b> the blast radius of an autonomous mistake in ops is an incident, not a typo.' },
    { label: 'Evals', title: 'Deterministic graders, not LLM-as-judge', body: 'Eleven grader classes and a seed registry built from real past regressions. Results post to the supervisor and gate promotion.', how: '<b>Why:</b> a model grading a model inherits the same blind spots.' },
    { label: 'Safety', title: 'MCP with two gates and no trust', body: 'Tool allowlist plus server read-only annotations. Tool output is passed to the model as data, never as instructions. Redaction before anything leaves the box.', how: '<b>Why:</b> prompt injection arrives in log lines and Slack threads, not just in chat.' },
    { label: 'Agents', title: 'Supervising coding agents', body: 'A control plane that splits goals into work units, schedules them across repos with one writer lease each, and runs an AI reviewer before the human gate.', how: '<b>Why:</b> parallel agents without leases produce merge conflicts; without review they produce confident bugs.' },
    { label: 'Continuity', title: 'Knowledge that survives the session', body: 'Session closures, decisions and learnings are consolidated into a skills library and a release knowledge packet. New sessions start from what is known, not from zero.', how: '<b>Why:</b> context windows forget. Teams can\'t afford to.' },
    { label: 'Honesty', title: 'NOT_AVAILABLE beats a made-up number', body: 'Every metric either has lineage or renders as not available. Prototype figures are explicitly banned from live surfaces.', how: '<b>Why:</b> a dashboard that lies once is never trusted again.' }
  ],

  case: {
    headline: 'OIP — an <em>Operational Intelligence</em><br>Platform, built from zero.',
    lede: 'An AI-augmented operations platform for a payments on-call team. Designed, built and run by one engineer in six months — about two dozen repositories, a quarter-million lines, and a self-hosted triage model tuned from 30% to 75% in one pilot.',
    summary: 'OIP takes alerts from Slack channels, Alertmanager webhooks and tracker sheets; links them to incidents, escalations and the on-call rota; runs governed AI triage through a cost-ordered ladder; and posts a structured decision card — verdict, confidence, evidence for and against — back into the channel where the alert fired. Around that core sit payment-impact analysis through a read-only warehouse MCP, coverage-gap detection with backtests, reproducible SQL scorecards, a supervisor for autonomous coding agents, deterministic evals, observability-as-code, and native macOS, iOS and Android clients.',
    ladder_note: 'Eligibility and health are tracked separately: a healthy model never gets promoted just because it is up. Models move through EXPERIMENTAL → SHADOW → HUMAN_REVIEW → QUALIFIED → APPROVED_PRIMARY, each step needing a named human and at least 30 adjudicated samples, with a regression gate of ±0.05 against the recorded baseline.',
    bench_note: 'Agreement is measured against the team\'s manual triage category on held-out alerts, which is a proxy rather than blind adjudication. The hosted-agent band is the observed range during the pilot, not a controlled head-to-head. The qualification bench only ever runs on a copy of the database.'
  },

  case_meta: [
    { label: 'Role', value: 'Architect, sole engineer, operator' },
    { label: 'Timeline', value: 'May → Oct 2026 · ~1,500 commits' },
    { label: 'Scale', value: '~24 repos · ~250K lines · 860+ test files' },
    { label: 'Runtime', value: 'Local-first (laptop or VM), hosted variant designed' },
    { label: 'Models', value: 'Qwen3 30B/8B/4B via Ollama · hosted Claude/GPT/Gemini adapters' },
    { label: 'Posture', value: 'Read-only by default · every write human-approved' }
  ],

  principles: [
    { title: 'Fail closed', body: 'When evidence is missing or a gate is unmet, the system abstains and hands off to a human. It never guesses.' },
    { title: 'Never fabricate', body: 'A metric without lineage renders as NOT_AVAILABLE. Prototype numbers are banned from live surfaces.' },
    { title: 'Cheapest capable step first', body: 'Reuse before rules, rules before a local model, local before paid, paid before a human — and the order is not configurable.' },
    { title: 'Writes are proposals', body: 'Assistants read. Humans approve. The supervisor records every effect in a ledger.' },
    { title: 'Health ≠ eligibility', body: 'A model being up is not a reason to route to it. Qualification is earned with adjudicated samples.' }
  ],

  ladder: [
    { step: 'Step 1', name: 'Reuse', cost: 'cost: ~0', body: 'Same alert, same evidence window, recent verdict? Return it with its citations.' },
    { step: 'Step 2', name: 'Deterministic', cost: 'cost: ~0', body: 'Expected-behaviour rules, maintenance windows, known noisy classes. No model involved.' },
    { step: 'Step 3', name: 'Local model', cost: 'cost: electricity', body: 'Qwen3 30B on Ollama judges a bounded evidence digest. Output parsed into a structured verdict.' },
    { step: 'Step 4', name: 'Paid model', cost: 'cost: per token', body: 'Hosted frontier model only when the local verdict abstains or confidence is capped.' },
    { step: 'Step 5', name: 'Human', cost: 'cost: attention', body: 'Abstain with everything gathered so far attached. The on-call engineer starts with context, not raw data.' }
  ],

  bench: [
    { label: 'Hosted AI agent (paid, reference band)', n: 'typical 80-93%', value: 86, display: '80-93%', kind: 'remote' },
    { label: 'Self-hosted model at pilot start (Qwen3, Ollama)', n: 'month 0', value: 30, display: '~30%', kind: 'local start' },
    { label: 'Self-hosted model after tuning', n: 'month 3 · 342 alerts', value: 75.3, display: '75%', kind: 'local' }
  ],

  bench_facts: [
    { key: 'Abstention rate (local)', value: '6%' },
    { key: 'False-positive rate (local)', value: '17%' },
    { key: 'Pilot duration', value: '~3 months, weekly tuning' },
    { key: 'Benchmark set', value: '534 alerts · 7-day window' },
    { key: 'Noise-class backtest', value: '100% suppressed · 2/2 incidents kept' },
    { key: '"171 alerts" incident claim, re-counted', value: '≈ 25–29 real' }
  ],

  components: [
    { kind: 'Platform', name: 'Core console', version: 'v2.2.x', body: 'Mission control, alert cases, incidents, escalations, on-call rota reconciliation, scorecards, cost page, admin & RBAC. Hosts the governed assistant with a talk → understand → plan → approve → execute → prove chain.', stack: ['Node 22', 'Express', 'SQLite', 'Slack', 'incident.io'], meta: ['~68K lines', '99 test files', '500+ commits'] },
    { kind: 'Domain', name: 'Alert intelligence', version: 'v0.1.x', body: 'Ingestion from Slack, trackers and Alertmanager; channel registry; correlation with incident windows; coverage gaps and backtests; graduation gates; shadow triage with per-family evidence ladders and a Slack decision board.', stack: ['Node', 'SQLite', 'Ollama', 'read-only MCP'], meta: ['~44K lines', '182 test files', '14 channels'] },
    { kind: 'Domain', name: 'Scorecards', version: 'v0.3.x', body: 'Reproducible, lineage-traced SQL scorecards from hashed snapshots of the trackers. MTTD, MTTA, MTTT, MTTR, with a parity harness against the legacy spreadsheet formulas.', stack: ['Python 3.11', 'MySQL 8', 'FastAPI', 'Docker'], meta: ['~16K lines', '36 test files'] },
    { kind: 'Platform', name: 'Agent supervisor', version: 'v0.2.x', body: 'Control plane for autonomous coding agents: work-unit graphs, one writer lease per repo, git guard, prompt-hash execution grants, durable approvals, effects ledger, AI reviewer before the human gate.', stack: ['Node', 'Codex CLI', 'local LLM reviewer'], meta: ['~37K lines', '168 test files'] },
    { kind: 'Plugin', name: 'Impact analyser', version: 'v0.3.x', body: 'Deterministic Slack alert parsing → read-only warehouse queries through MCP → bounded snapshot → two-scope impact in exact decimals with historical FX. Optional evidence-bounded RCA.', stack: ['Node', 'SQLite', 'Trino via MCP'], meta: ['~10K lines', '38 test files'] },
    { kind: 'Tooling', name: 'Deterministic evals', version: 'seed 34', body: 'Eleven grader classes (pass/fail, one-writer, approval integrity, secret non-disclosure…) built from real regressions. Explicitly not model-as-judge. Results feed the supervisor.', stack: ['Node'], meta: ['34 seed cases', '11 outcome classes'] },
    { kind: 'POC', name: 'Local intelligence over MCP', version: 'v0.3.x', body: 'A local model answers ops questions only from evidence pulled through a governed, read-only tool loop. 13-tool allowlist, read-only annotations, redaction, output-as-data.', stack: ['Node', 'MCP SDK', 'Ollama'], meta: ['56 tests', '7/7 negative tests'] },
    { kind: 'Service', name: 'Observability', version: 'v0.1.x', body: 'Telemetry contract, classification and cardinality firewalls, dependency-free exporters, Prometheus /metrics, Grafana dashboards and alert rules as code.', stack: ['Node', 'Prometheus', 'Grafana'], meta: ['166 assertions'] },
    { kind: 'Clients', name: 'macOS · iOS · Android', version: 'v2.0', body: 'A SwiftUI engineering cockpit with a real PTY terminal and diff views; iPhone and Android apps with offline cache, demo mode and a LAN bridge to the core.', stack: ['SwiftUI', 'Kotlin Compose', 'XcodeGen'], meta: ['~31K lines', '120 test files'] },
    { kind: 'Service', name: 'Story engine & render studio', version: 'v0.4 / v0.3', body: 'Turns verified knowledge into five-minute transfer stories behind truth and privacy gates; renders locally with procedural visuals, narration and burned-in captions; a local vision model gives advisory QA.', stack: ['Node', 'Python/Pillow', 'ffmpeg', 'Ollama VLM'], meta: ['261 tests'] },
    { kind: 'Domain', name: 'Orbit — work graph', version: 'v0.1', body: 'System of record for products, projects, sprints and tasks; external PM tools treated as projections. Alert → ticket auto-creation with evidence links.', stack: ['Node', 'SQLite'], meta: ['~17K lines', '98 test files'] },
    { kind: 'Tooling', name: 'QA authority & architecture portal', version: 'v0.2 / v1.0', body: 'Cross-component QA via manifests, golden journeys and quality gates. A YAML → SVG architecture site where every status claim must cite evidence or the build fails.', stack: ['Node', 'Mermaid', 'YAML'], meta: ['52 test files', '12 diagrams'] }
  ],

  /* ── Value ────────────────────────────────────────────────────────────── */
  value_props: [
    { outcome: 'Lower AI spend, *most of the* accuracy.', body: 'Cheapest-capable routing means the bulk of alert volume never touches a paid model. A self-hosted 30B model was tuned from ~30% to 75% agreement with human triage in three months, with the hosted agent reserved for the hard cases.', proof: 'Proof: self-hosted <b>30% → 75%</b> in one pilot; hosted agent reference band <b>80-93%</b>.' },
    { outcome: 'AI you can *audit*, not just admire.', body: 'Every verdict cites evidence. Every write is a proposal with an approver. Deterministic evals catch regressions before they reach on-call. This is what passes a risk review.', proof: 'Proof: <b>0 unapproved writes</b> by design · 34 regression evals · effects ledger.' },
    { outcome: 'Faster, *calmer* on-call.', body: 'Engineers open a decision card, not a wall of graphs. Payment impact arrives in currency, not percentiles. Noisy alert classes are backtested and retired before they page.', proof: 'Proof: one noisy class → <b>100% suppressed</b>, both real incidents retained.' },
    { outcome: 'No lock-in, *no data exodus*.', body: 'Runs on a laptop or in your VPC. Vendor-neutral: Slack, incident.io, Grafana, any MCP-compatible data source, any Ollama or hosted model. Nothing leaves the box unless you say so.', proof: 'Proof: zero runtime dependencies in core services · read-only MCP · local models first.' }
  ],

  engagements: [
    { kind: 'Full-time', title: 'Senior Staff / Principal SRE · Head of AI Operations', body: 'Lead reliability and AI-operations for a platform that cannot afford to be wrong. Any location, relocation or remote.' },
    { kind: 'Forward deployed', title: 'Forward Deployed Engineer · AI / Ops', body: 'Embed with the team that owns the pain, wire the product into their alerts, data and workflow, and ship a working pilot in weeks. See the role-fit page.' },
    { kind: 'Advisory', title: 'AI governance for operations teams', body: 'Routing, qualification gates, evals and approval flows for teams putting models near production.' },
    { kind: 'Build', title: 'A pilot in 6–8 weeks', body: 'Evidence-backed triage on your alert channels, in shadow mode, with a scorecard you can trust.' }
  ],

  /* ── Skills & certs ───────────────────────────────────────────────────── */
  skills: [
    { domain: 'Site reliability', skill: 'Incident management & on-call leadership', years: 10, level: 'Expert' },
    { domain: 'Site reliability', skill: 'SLI / SLO design & error budgets', years: 5, level: 'Expert' },
    { domain: 'Site reliability', skill: 'Alert design, backtesting & noise reduction', years: 7, level: 'Expert' },
    { domain: 'Site reliability', skill: 'Availability, latency & capacity planning', years: 6, level: 'Advanced' },
    { domain: 'Site reliability', skill: 'Postmortems, scorecards (MTTD / MTTA / MTTR)', years: 6, level: 'Advanced' },
    { domain: 'Site reliability', skill: 'ITIL 4 / IT service operations', years: 3, level: 'Intermediate' },
    { domain: 'Observability', skill: 'Datadog', years: 7, level: 'Expert' },
    { domain: 'Observability', skill: 'Grafana / Prometheus / Alertmanager', years: 5, level: 'Expert' },
    { domain: 'Observability', skill: 'Splunk / ELK', years: 6, level: 'Advanced' },
    { domain: 'Observability', skill: 'Loki / Tempo / OpenTelemetry tracing', years: 2, level: 'Intermediate' },
    { domain: 'AI / LLM operations', skill: 'Local models (Ollama, Qwen, Gemma)', years: 1, level: 'Advanced' },
    { domain: 'AI / LLM operations', skill: 'Hosted models (Claude, GPT, Gemini)', years: 2, level: 'Advanced' },
    { domain: 'AI / LLM operations', skill: 'MCP servers & governed tool loops', years: 1, level: 'Advanced' },
    { domain: 'AI / LLM operations', skill: 'Evals, shadow qualification, cost routing', years: 1, level: 'Advanced' },
    { domain: 'AI / LLM operations', skill: 'Prompt & context engineering', years: 2, level: 'Advanced' },
    { domain: 'Building with AI', skill: 'System design, contracts & specifications', years: 8, level: 'Expert' },
    { domain: 'Building with AI', skill: 'Directing coding agents (Claude Code, Codex) under governance', years: 1, level: 'Advanced' },
    { domain: 'Building with AI', skill: 'Reading & reviewing code: Python, JavaScript, Ruby, Swift, Kotlin', years: 4, level: 'Read & review' },
    { domain: 'Building with AI', skill: 'Writing code by hand', years: 0, level: 'AI-assisted' },
    { domain: 'Building with AI', skill: 'SQL for scorecards & analysis (SQLite, MySQL, Trino)', years: 8, level: 'Advanced' },
    { domain: 'Automation & data', skill: 'Google Apps Script', years: 10, level: 'Expert' },
    { domain: 'Automation & data', skill: 'Google Workspace APIs (Sheets, Gmail, Drive)', years: 8, level: 'Expert' },
    { domain: 'Automation & data', skill: 'Slack & webhook integrations', years: 5, level: 'Advanced' },
    { domain: 'Automation & data', skill: 'Shell / Bash', years: 8, level: 'Advanced' },
    { domain: 'Automation & data', skill: 'Reporting pipelines & spreadsheets as systems', years: 12, level: 'Expert' },
    { domain: 'Cloud & delivery', skill: 'AWS', years: 6, level: 'Advanced' },
    { domain: 'Cloud & delivery', skill: 'GCP', years: 3, level: 'Intermediate' },
    { domain: 'Cloud & delivery', skill: 'Kubernetes / OpenShift', years: 4, level: 'Advanced' },
    { domain: 'Cloud & delivery', skill: 'Jenkins · Ansible · GitLab CI', years: 5, level: 'Advanced' }
  ],

  certifications: [
    { group: 'AI & generative AI', name: 'AI Agents and Agentic AI with Python & Generative AI', issuer: 'Vanderbilt University · Coursera', year: '2026', link: 'https://coursera.org/verify/81UV0Q3SZJLE' },
    { group: 'AI & generative AI', name: 'Claude Code: Software Engineering with Generative AI Agents', issuer: 'Vanderbilt University · Coursera', year: '2026', link: 'https://coursera.org/verify/GYA291VQDO9Q' },
    { group: 'AI & generative AI', name: 'Generative AI: Advancing Systems Analysis & Architecture', issuer: 'SkillUp · Coursera', year: '2026', link: 'https://coursera.org/verify/HX796GEM3QJ8' },
    { group: 'AI & generative AI', name: 'Claude Code for Vibe Coding', issuer: 'Edureka · Coursera', year: '2026', link: 'https://coursera.org/verify/V3OZS1IDWRH4' },
    { group: 'AI & generative AI', name: 'Foundations of Generative AI in SDLC', issuer: 'Simplilearn · Coursera', year: '2026', link: 'https://coursera.org/verify/6IRAECI1CA1Y' },
    { group: 'AI & generative AI', name: 'Privacy and Responsible AI: Practical Guidelines for AI Practitioners', issuer: 'Airbnb learning programme', year: '2026', link: '' },
    { group: 'AI & generative AI', name: 'Beginner Microsoft Copilot: AI Prompts & Workflows', issuer: 'Knowledge Accelerators · Coursera', year: '2026', link: 'https://coursera.org/verify/ZVEM7OGKDQGQ' },
    { group: 'AI & generative AI', name: 'Generative AI for Everyone', issuer: 'DeepLearning.AI · Coursera', year: '2025', link: 'https://coursera.org/verify/7IF0GP5O4QQ3' },
    { group: 'AI & generative AI', name: 'Prompt Engineering', issuer: 'Altimetrik L&D · Coursera', year: '2025', link: 'https://coursera.org/verify/2LEDDI3PXWS2' },
    { group: 'Observability & operations', name: 'Datadog Monitoring: Basic to Advanced (11.5 h)', issuer: 'Udemy', year: '2024', link: 'https://ude.my/UC-0b0c486b-f241-4bca-a0c0-0ed50359eac4' },
    { group: 'Observability & operations', name: 'Datadog: Performance Monitoring Tool (Zero to Hero)', issuer: 'Udemy', year: '2024', link: 'https://ude.my/UC-fc13d088-f6e9-45b7-aa5f-8ad2a2095bfc' },
    { group: 'Observability & operations', name: 'Observability with Grafana, Prometheus, Loki, Alloy and Tempo', issuer: 'Udemy', year: '2024', link: 'https://ude.my/UC-686da2e7-1442-4b84-ad70-56e8c5c949c6' },
    { group: 'Observability & operations', name: 'Introduction to Service Management with ITIL 4', issuer: 'Dion Training · Udemy', year: '2024', link: 'https://ude.my/UC-b1ff62ad-77a5-4652-a432-e3449d521e8a' },
    { group: 'Observability & operations', name: 'IT Service Operations and Service Desk Management', issuer: 'Udemy', year: '2024', link: 'https://ude.my/UC-e9fb0eb9-6eff-4c5a-8305-8dd739162e46' },
    { group: 'Automation & data', name: 'Automate the Boring Stuff with Python Programming', issuer: 'Al Sweigart · Udemy', year: '2024', link: 'https://ude.my/UC-36a3b0cf-8b69-4881-8756-c3bcb411b8a5' },
    { group: 'Automation & data', name: 'Master Google Sheets', issuer: 'Udemy', year: '2024', link: 'https://ude.my/UC-f5262841-de70-4448-aaf6-de7ed026f83b' },
    { group: 'Automation & data', name: 'Introduction to Python', issuer: 'Altimetrik L&D · Coursera', year: '2025', link: 'https://coursera.org/verify/63JCOY0TX3XY' },
    { group: 'Automation & data', name: 'Mastering Bitbucket Pipelines for CI/CD', issuer: 'Online', year: '2023', link: '' },
    { group: 'Automation & data', name: 'Introduction to MongoDB', issuer: 'MongoDB', year: '2022', link: '' },
    { group: 'Security & compliance', name: 'ISMS Awareness', issuer: 'Altimetrik · Coursera', year: '2025', link: 'https://coursera.org/verify/BMEPITLVA7L8' },
    { group: 'Security & compliance', name: 'Information Security Awareness and Data Privacy', issuer: 'Altimetrik', year: '2024', link: '' },
    { group: 'Security & compliance', name: 'Data Security and Privacy', issuer: 'Airbnb learning programme', year: '2026', link: '' },
    { group: 'Security & compliance', name: 'ISO 27001:2013 Information Security Awareness', issuer: 'Altimetrik', year: '2023', link: '' },
    { group: 'Leadership', name: 'Leadership Academy: Foundational', issuer: 'Altimetrik', year: '2024', link: '' }
  ],

  /* ── Knowledge ────────────────────────────────────────────────────────── */
  lessons: [
    { number: 'L01', tag: 'AI ops', title: 'A healthy model is not an eligible model', problem: 'Early routing promoted whichever provider was up and fast. A reachable model with no track record was quietly deciding severities.', fix: 'Split health from eligibility. Health is a probe; eligibility is earned through shadow mode, adjudicated samples and a regression gate.', impact: 'No model reaches production routing without evidence. Promotion is a logged decision with a human name on it.' },
    { number: 'L02', tag: 'AI ops', title: 'LLM-as-judge grades its own blind spots', problem: 'Using a model to score another model\'s triage looked rigorous and agreed with itself far too often.', fix: 'Deterministic graders built from real regressions: pass/fail, one-writer, approval integrity, secret non-disclosure. Seed registry grows from every incident.', impact: 'Evals became reproducible and arguable. Disagreements point at a specific case, not a vibe.' },
    { number: 'L03', tag: 'AI ops', title: 'Prototype numbers leak into decks', problem: 'Placeholder metrics from a UI mock ("240 hours saved") started appearing in status updates as if measured.', fix: 'Banned list of synthetic figures. Every metric needs lineage or renders NOT_AVAILABLE. Specs say so explicitly.', impact: 'Stakeholders see fewer numbers and trust all of them.' },
    { number: 'L04', tag: 'Apps Script', title: 'Hardcoding everything', problem: 'Secrets and config baked into code. Painful to rotate, terrifying to share.', fix: 'All sensitive values in PropertiesService. One config layer, one place to update.', impact: 'Safe code reviews. Zero credential leakage in 4+ years.' },
    { number: 'L05', tag: 'Apps Script', title: 'Silent automation failures', problem: 'Functions failing without anyone noticing — until a downstream report came up empty days later.', fix: 'Every entry point wrapped with alerting on exception. Dead-man-switch monitor for scheduled triggers.', impact: 'Failures detected in minutes, not days.' },
    { number: 'L06', tag: 'Apps Script', title: 'Trigger overload', problem: '30+ time-driven triggers in one project. Quota collisions, race conditions, debugging chaos.', fix: 'Centralised scheduler: one master trigger fans out to handlers based on a schedule sheet.', impact: 'From 30+ triggers to 1. Debugging time cut by ~80%.' },
    { number: 'L07', tag: 'Apps Script', title: 'Cell-by-cell sheet operations', problem: 'Loops calling getRange()/setValue() per cell. 10,000-row jobs taking 6+ minutes and timing out.', fix: 'Batch read/write: getValues() into a 2D array, mutate in memory, setValues() once.', impact: '10×–50× speedup.' },
    { number: 'L08', tag: 'Apps Script', title: 'Duplicate execution', problem: 'Overlapping triggers → duplicate emails, double-counted records, corrupted state.', fix: 'LockService at the entry of every mutating function. Properly scoped, properly released.', impact: 'Eliminated an entire class of state-corruption bugs.' }
  ],

  blogs: [],

  resumes: [
    { format: 'INT-01', title: 'International CV', description: 'ATS-friendly, two pages, targeted at global SRE / observability / AI-operations leadership roles.', link: '', updated: 'v2026.10' },
    { format: 'GULF-01', title: 'Gulf CV', description: 'Tailored for the UAE / GCC market: visa status, availability, regional context.', link: '', updated: 'v2026.10' },
    { format: 'IN-01', title: 'India CV', description: 'Naukri / LinkedIn-optimised format with detailed project breakdowns and a skills matrix.', link: '', updated: 'v2026.10' }
  ],

  contact: {
    email: 'tcgr.8553665381@gmail.com',
    linkedin: 'https://www.linkedin.com/in/tcgr/',
    github: 'https://github.com/tcgr-in',
    location: 'Bengaluru, IN · open to any location, relocation or remote',
    role: 'Senior Staff Engineer — SRE @ Airbnb (via Altimetrik)',
    availability: '60 days notice (negotiable)',
    languages: 'English, Hindi, Tamil, Telugu, Kannada',
    timezone: 'IST (UTC+5:30) · overlaps GST, CET, US-East mornings',
    headline: 'Let\'s build something<br><em>reliable.</em>',
    tagline: 'Open to Senior Staff SRE, AI-operations, Forward Deployed Engineer and platform roles anywhere in the world, on-site or remote, and to advisory work. I reply within 24 hours.'
  },

  /* ── Role fit (profiles.html) ─────────────────────────────────────────── */
  profiles: [
    { slug: 'fde', title: 'Forward Deployed Engineer — AI / Operations', keywords: 'Forward Deployed Engineer · FDE · Deployment Strategist · Solutions Engineer · Customer Engineer · Implementation Engineer',
      fit: 'FDE work is discovery, integration and fast iteration inside a customer\'s real environment. That is exactly how OIP was built: embedded with an on-call team, wired into their Slack channels, alert sources, incident tool and data warehouse, shipping weekly, with every change proposed and approved in-channel.',
      evidence: ['Shipped a 24-repo platform solo in six months by directing AI coding agents under a supervisor, evals and human approval gates — not by hand-typing code.', 'Integrated Slack, Alertmanager, incident.io, Google Sheets/BigQuery, a Trino warehouse (via MCP) and Ollama into one working loop.', 'Ran discovery with the team that owned the pain: 14 alert channels mapped, 1,890 alerts analysed, noisy classes backtested and retired.', 'Operated what I built: launchd services, Prometheus metrics, Grafana dashboards, backup-before-restart rules.'],
      skills: ['Discovery & requirements', 'Systems integration (APIs, webhooks, MCP)', 'AI agent orchestration', 'Rapid prototyping → pilot', 'Stakeholder comms', 'Slack-native delivery', 'SQL & data modelling', 'Observability'],
      resume_format: 'INT-01' },
    { slug: 'ai-ops', title: 'AI Operations / AIOps Engineer', keywords: 'AIOps Engineer · AI Operations Lead · LLMOps · Applied AI Engineer (Operations) · Incident Intelligence',
      fit: 'I have put language models on-call in a payments environment and kept them honest: cost-ordered routing, shadow-mode qualification, evidence-grounded verdicts, deterministic evals and human-gated writes.',
      evidence: ['Tuned a self-hosted 30B model from ~30% to 75% agreement with human triage in a 3-month pilot (342 alerts), approaching the hosted agent\'s 80-93% at near-zero marginal cost.', 'Designed the routing ladder (reuse → rules → local → paid → human) and the qualification stages with a ±0.05 regression gate.', 'Built a governed MCP tool loop with a 13-tool allowlist, read-only annotations and prompt-injection defences.', 'Deterministic eval registry: 11 grader classes, 34 seed cases from real regressions.'],
      skills: ['LLM routing & cost control', 'Model evaluation & shadow testing', 'Prompt & context engineering', 'MCP / tool governance', 'Local inference (Ollama)', 'Alert intelligence', 'Incident automation'],
      resume_format: 'INT-01' },
    { slug: 'sre', title: 'Senior Staff / Principal Site Reliability Engineer', keywords: 'Staff SRE · Principal SRE · Head of Reliability · Observability Lead · Production Engineering',
      fit: 'Fifteen years of making production quieter: SLI/SLO design, flow-level monitoring, alert quality over quantity, monitoring-as-code, and scorecards that survive an audit.',
      evidence: ['Flow-level monitors aligned to payment journeys; composite anomaly detection; platform migration with parallel-run validation and zero coverage regression.', 'Grafana Enterprise + Prometheus across NAM / APAC / EMEA for a global bank; rollout effort cut ~60% with Jenkins + Ansible.', 'Reproducible MTTD / MTTA / MTTR scorecards with SQL lineage and a parity harness against legacy formulas.', 'Built the SRE function from scratch at a mobility start-up; on-call, capacity, latency, availability.'],
      skills: ['SLI / SLO & error budgets', 'Datadog · Grafana · Prometheus · Splunk · ELK', 'Alert design & backtesting', 'Kubernetes / cloud', 'CI/CD for monitoring', 'Incident command', 'Mentorship'],
      resume_format: 'INT-01' },
    { slug: 'platform', title: 'AI Platform / Solutions Architect', keywords: 'Solutions Architect · AI Platform Engineer · Technical Architect · Internal Tools Lead',
      fit: 'I design systems end to end — contracts, data models, governance, observability, clients — and keep them boring where it matters: no runtime dependencies, SQLite by default, fail closed, every claim with evidence.',
      evidence: ['Architecture portal where every status claim must cite evidence or the build fails; 12 versioned diagrams generated from YAML.', 'Supervisor control plane: work-unit graphs, one writer per repo, prompt-hash grants, effects ledger, AI reviewer before human gate.', 'Native macOS, iOS and Android clients over the same core API; offline-first with demo mode.', 'Observability-as-code: telemetry contract, cardinality firewalls, Prometheus exposition, Grafana provisioning.'],
      skills: ['System & API design', 'Data modelling (SQLite, MySQL, BigQuery)', 'Governance & approval flows', 'Observability-as-code', 'Cross-platform clients', 'Documentation that is tested'],
      resume_format: 'INT-01' },
    { slug: 'automation', title: 'Automation / Workflow Engineer (Google Workspace)', keywords: 'Automation Engineer · Google Apps Script Developer · Workflow Automation · RevOps / BizOps Engineer',
      fit: 'Ten years of Google Apps Script in production: 20+ automations, a single-trigger scheduler pattern, secrets in PropertiesService, LockService for concurrency, batch I/O and quota-aware retries. This site runs on it.',
      evidence: ['Automation hub: one trigger fanning out to versioned modules; hundreds of engineer-hours returned per month.', 'This portfolio: Sheets as CMS, Apps Script as API, Cloudflare at the edge, three-tier fallback.', 'Clinic booking workflow and hotel night-audit automation — the roots of the systems thinking.'],
      skills: ['Google Apps Script', 'Sheets / Gmail / Drive APIs', 'Trigger & quota design', 'Slack integrations', 'Reporting pipelines', 'Python & shell'],
      resume_format: 'IN-01' }
  ],

  copy: {
    'work.headline': 'What I\'m <em>good at</em>,<br>and where it shipped.',
    'journey.headline': 'A <em>15-year</em><br>operating timeline.',
    'journey.lede': 'From hotel reservation systems to AI-governed incident intelligence. Every role taught me how to make systems quieter and humans more leveraged.',
    'ai.headline': 'How I put <em>models</em> on-call<br>without putting <em>trust</em> at risk.',
    'ai.lede': 'Patterns I\'ve taken from idea to production. Each one exists because a simpler version failed first. The case study below is where they were proven.',
    'value.headline': 'What this looks like<br>on <em>your</em> balance sheet.',
    'value.lede': 'Reliability work is only worth funding when it changes cost, risk or speed. This is where mine does.',
    'skills.headline': 'The <em>toolbelt</em>, honestly rated.',
    'skills.lede': 'Years are hands-on production years, not "familiar with". Levels are self-assessed and honest: I design systems and direct AI agents to write the code, then read and review every line. Certificates link to their verification pages.',
    'knowledge.headline': 'Mistakes I made,<br>and the <em>architecture</em> that fixed them.',
    'resume.headline': 'One profile,<br><em>three</em> formats.',
    'resume.lede': 'Tailored to the market you\'re hiring in, generated fresh from the same source of truth that renders this page.',
    'profiles.headline': 'One career,<br><em>five</em> ways to hire it.',
    'profiles.lede': 'Hiring managers search by title. This page maps my experience onto the roles I fit, with the evidence and the resume format for each. I build with AI agents under governance rather than by hand-typing code, and I say so up front.'
  },

  meta: { version: '2.0.0', content_rev: 'bundled' }
};

/* ────────────────────────────────────────────────────────────────────────────
 *  APP
 * ──────────────────────────────────────────────────────────────────────────── */
const App = {
  data: null,
  config: window.PORTFOLIO_CONFIG || {},
  telemetry: { source: 'bundled snapshot', latency: null, cacheAge: null, rev: 'bundled', samples: [] },
  reduced: window.matchMedia('(prefers-reduced-motion: reduce)').matches,

  async init() {
    this._initTheme();
    this._initNav();
    this._initPalette();
    this._initBackgroundMotion();
    this._initClock();

    // 1. Instant paint from bundled data — the page is never empty.
    this.data = FALLBACK_DATA;
    this._render();
    this._initReveals();

    // 2. Cache → API, stale-while-revalidate. Re-render only if content changed.
    const result = await this._loadData();
    if (result && result.data && this._rev(result.data) !== this._rev(this.data)) {
      this.data = result.data;
      this._render();
      this._initReveals();
    }
    this._renderOps();
  },

  /* ── Data ───────────────────────────────────────────────────────────── */
  _rev(d) {
    // A stable-ish content revision: meta.generated_at if the API provides it, else a hash of the JSON.
    if (d && d.meta && d.meta.generated_at) return d.meta.generated_at;
    try { return 'h' + this._hash(JSON.stringify(d)); } catch (e) { return 'unknown'; }
  },
  _hash(str) { let h = 0; for (let i = 0; i < str.length; i++) { h = (h * 31 + str.charCodeAt(i)) | 0; } return (h >>> 0).toString(36); },

  async _loadData() {
    const params = new URLSearchParams(location.search);
    const bypass = params.has('refresh');
    const ttl = Number(this.config.CACHE_TTL_MS) || 1800000;

    let cached = null;
    try { const raw = localStorage.getItem('tcgr_data_v2'); if (raw) cached = JSON.parse(raw); } catch (e) {}
    const age = cached ? Date.now() - cached.ts : null;
    const fresh = cached && !bypass && age < ttl;

    if (fresh) {
      this.telemetry.source = 'browser cache';
      this.telemetry.cacheAge = age;
      this.telemetry.rev = this._rev(cached.data);
      // Background revalidate; APPLY the result if content changed (v1 bug: it was discarded).
      this._fetchAndCache().then(live => {
        if (live && this._rev(live) !== this._rev(this.data)) {
          this.data = live; this._render(); this._initReveals(); this._renderOps();
          this._toast('Content refreshed from the CMS');
        }
      }).catch(() => {});
      return { data: cached.data };
    }

    if (this.config.API_URL) {
      try {
        const live = await this._fetchAndCache();
        if (live) return { data: live };
      } catch (e) {
        console.warn('[tcgr.in] API unreachable:', e.message);
        this.telemetry.source = cached ? 'stale cache (API down)' : 'bundled snapshot (API down)';
      }
    }
    if (cached) { this.telemetry.cacheAge = age; this.telemetry.rev = this._rev(cached.data); if (!this.telemetry.source.includes('down')) this.telemetry.source = 'stale cache'; return { data: cached.data }; }
    return null;
  },

  async _fetchAndCache() {
    if (!this.config.API_URL) return null;
    const url = `${this.config.API_URL}?action=all&v=${encodeURIComponent(this.config.SITE_VERSION || '2')}&t=${Date.now()}`;
    const t0 = performance.now();
    const res = await fetch(url, { method: 'GET', redirect: 'follow', cache: 'no-store' });
    const ms = Math.round(performance.now() - t0);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data || data.error) throw new Error((data && data.error) || 'Empty response');
    this.telemetry.latency = ms;
    this.telemetry.samples.push(ms);
    this.telemetry.source = 'live CMS';
    this.telemetry.cacheAge = 0;
    this.telemetry.rev = this._rev(data);
    try {
      localStorage.setItem('tcgr_data_v2', JSON.stringify({ ts: Date.now(), data }));
      const hist = JSON.parse(localStorage.getItem('tcgr_latency') || '[]'); hist.push(ms);
      localStorage.setItem('tcgr_latency', JSON.stringify(hist.slice(-24)));
    } catch (e) {}
    return data;
  },

  /* ── Render orchestration ───────────────────────────────────────────── */
  _render() {
    const d = this.data;
    this._bindAll();
    this._renderHeroIntro();
    this._renderList('stats', 'tpl-stat', d.stats, (n, s) => {
      this._txt(n, '[data-s="value"]', s.value); this._txt(n, '[data-s="unit"]', s.unit); this._txt(n, '[data-s="label"]', s.label); this._txt(n, '[data-s="note"]', s.note);
    });
    this._renderMarquee();
    this._renderAbout();
    this._renderList('about-facts', 'tpl-fact', d.about_facts, (n, f) => { this._txt(n, '[data-f="key"]', f.key); this._txt(n, '[data-f="value"]', f.value); });

    this._renderList('expertise', 'tpl-expertise', d.expertise, (n, x) => {
      this._txt(n, '[data-x="category"]', x.category); this._txt(n, '[data-x="badge"]', x.badge); this._txt(n, '[data-x="title"]', x.title); this._txt(n, '[data-x="description"]', x.description); this._chips(n, '[data-x="tools"]', x.tools);
    });
    this._renderList('projects', 'tpl-project', d.projects, (n, p) => {
      this._txt(n, '[data-pr="number"]', p.number); this._txt(n, '[data-pr="category"]', p.category); this._txt(n, '[data-pr="title"]', p.title); this._txt(n, '[data-pr="subtitle"]', p.subtitle); this._txt(n, '[data-pr="impact"]', p.impact);
      const desc = n.querySelector('[data-pr="description"]'); this._arr(p.description).forEach(t => { const el = document.createElement('p'); el.textContent = t; desc.appendChild(el); });
      this._chips(n, '[data-pr="stack"]', p.stack);
    });
    this._renderList('timeline', 'tpl-timeline', d.timeline, (n, t) => {
      this._txt(n, '[data-tl="year"]', t.year); this._txt(n, '[data-tl="role"]', t.role); this._txt(n, '[data-tl="company"]', t.company); this._txt(n, '[data-tl="description"]', t.description); this._txt(n, '[data-tl="impact"]', t.impact);
    });

    // AI Lab
    this._renderList('ai-patterns', 'tpl-cap', d.ai_patterns, (n, a) => {
      this._txt(n, '[data-a="label"]', a.label); this._txt(n, '[data-a="title"]', a.title); this._txt(n, '[data-a="body"]', a.body); this._html(n, '[data-a="how"]', a.how);
    });
    this._txt(document, '#case-summary', d.case && d.case.summary);
    this._renderCaseMeta();
    this._renderList('principles', 'tpl-principle', d.principles, (n, p, i) => { this._txt(n, '[data-p="idx"]', String(i + 1).padStart(2, '0')); this._txt(n, '[data-p="title"]', p.title); this._txt(n, '[data-p="body"]', p.body); });
    this._renderList('ladder', 'tpl-rung', d.ladder, (n, r) => { this._txt(n, '[data-r="step"]', r.step); this._txt(n, '[data-r="name"]', r.name); this._txt(n, '[data-r="cost"]', r.cost); this._txt(n, '[data-r="body"]', r.body); });
    this._renderList('bench-bars', 'tpl-bar', d.bench, (n, b) => {
      this._txt(n, '[data-b="label"]', b.label); this._txt(n, '[data-b="n"]', b.n); this._txt(n, '[data-b="value"]', b.display || `${Math.round(Number(b.value))}%`);
      const fill = n.querySelector('[data-b="fill"]'); fill.dataset.w = String(b.value); if (b.kind === 'remote') fill.classList.add('remote'); if (/start/.test(b.kind || '')) fill.classList.add('start');
    });
    this._renderList('bench-facts', 'tpl-kv', d.bench_facts, (n, k) => { this._txt(n, '[data-k="key"]', k.key); this._txt(n, '[data-k="value"]', k.value); });
    this._renderList('components', 'tpl-component', d.components, (n, c) => {
      this._txt(n, '[data-c="kind"]', c.kind); this._txt(n, '[data-c="version"]', c.version); this._txt(n, '[data-c="name"]', c.name); this._txt(n, '[data-c="body"]', c.body); this._chips(n, '[data-c="stack"]', c.stack);
      const meta = n.querySelector('[data-c="meta"]'); this._arr(c.meta).forEach(m => { const s = document.createElement('span'); s.textContent = m; meta.appendChild(s); });
    });

    // Value
    this._renderList('value-grid', 'tpl-value', d.value_props, (n, v) => { this._html(n, '[data-v="outcome"]', this._emph(v.outcome)); this._txt(n, '[data-v="body"]', v.body); this._html(n, '[data-v="proof"]', v.proof); });
    this._renderList('engage', 'tpl-engage', d.engagements, (n, e) => { this._txt(n, '[data-e="kind"]', e.kind); this._txt(n, '[data-e="title"]', e.title); this._txt(n, '[data-e="body"]', e.body); });

    // Skills + certs
    this._renderSkills();
    this._renderCerts();

    // Knowledge
    this._renderList('lessons', 'tpl-lesson', d.lessons, (n, l) => {
      this._txt(n, '[data-le="number"]', l.number); this._txt(n, '[data-le="tag"]', l.tag); this._txt(n, '[data-le="title"]', l.title); this._txt(n, '[data-le="problem"]', l.problem); this._txt(n, '[data-le="fix"]', l.fix); this._txt(n, '[data-le="impact"]', l.impact ? `Impact — ${l.impact}` : '');
    });
    this._renderProfiles();
    this._renderBlogs();
    this._renderResumes();
    this._renderContact();
    this._renderOps();
    this._initAccordionDeepLinks();
  },

  _renderList(containerId, tplId, items, fill) {
    const c = document.getElementById(containerId), t = document.getElementById(tplId);
    if (!c || !t) return;
    c.querySelectorAll('[data-injected]').forEach(n => n.remove());
    this._arr(items).forEach((item, i) => {
      const node = t.content.cloneNode(true);
      const root = node.firstElementChild; if (root) root.setAttribute('data-injected', '1');
      fill.call(this, node, item, i);
      c.appendChild(node);
    });
  },

  /* data-bind="a.b" → data[a][b] or data.copy["a.b"]; data-bind-html allows <em>/<br> */
  _bindAll() {
    const d = this.data;
    const resolve = (path) => {
      const [a, b] = path.split('.');
      if (d[a] && d[a][b] != null && d[a][b] !== '') return d[a][b];
      if (d.copy && d.copy[path] != null && d.copy[path] !== '') return d.copy[path];
      return null;
    };
    document.querySelectorAll('[data-bind]').forEach(el => { const v = resolve(el.getAttribute('data-bind')); if (v != null) el.textContent = String(v).replace(/^[A-Za-z ]+:\s+/, ''); });
    document.querySelectorAll('[data-bind-html]').forEach(el => { const v = resolve(el.getAttribute('data-bind-html')); if (v != null) el.innerHTML = this._safeHtml(String(v)); });
  },

  _renderHeroIntro() {
    const p = this.data.profile || {};
    this._txt(document, '#hero-intro', p.intro);
    const avatar = document.getElementById('avatar'), mark = document.getElementById('brand-mark');
    if (p.avatar_url) { [avatar, mark].forEach(el => { if (el) { el.innerHTML = ''; const img = document.createElement('img'); img.src = p.avatar_url; img.alt = p.name || ''; el.appendChild(img); } }); }
  },

  _renderMarquee() {
    const m = document.getElementById('marquee'); if (!m) return;
    const items = this._arr(this.data.marquee).map(x => typeof x === 'string' ? x : x.item).filter(Boolean);
    if (!items.length) return;
    m.innerHTML = '';
    // Two identical tracks → translateX(-50%) loops seamlessly regardless of viewport width.
    for (let k = 0; k < 2; k++) {
      const track = document.createElement('div'); track.className = 'marquee-track'; track.setAttribute('aria-hidden', k ? 'true' : 'false');
      items.forEach(it => { const s = document.createElement('span'); s.textContent = it; track.appendChild(s); const sep = document.createElement('span'); sep.className = 'sep'; sep.textContent = '◆'; track.appendChild(sep); });
      m.appendChild(track);
    }
    m.style.setProperty('--marquee-dur', `${Math.max(30, items.length * 1.8)}s`);
  },

  _renderAbout() {
    const el = document.getElementById('about-body'); const body = this.data.about && this.data.about.body; if (!el || !body) return;
    el.innerHTML = '';
    String(body).split(/\n{2,}/).map(s => s.trim()).filter(Boolean).forEach(par => { const p = document.createElement('p'); p.innerHTML = this._emph(this._esc(par), 'strong'); el.appendChild(p); });
  },

  _renderCaseMeta() {
    const c = document.getElementById('case-meta'); if (!c) return; c.innerHTML = '';
    this._arr(this.data.case_meta).forEach(m => { const d = document.createElement('div'); d.className = 'm'; const b = document.createElement('b'); b.textContent = m.label; const s = document.createElement('span'); s.textContent = m.value; d.append(b, s); c.appendChild(d); });
  },

  _renderSkills() {
    const grid = document.getElementById('skills-grid'), tg = document.getElementById('tpl-skill-group'), ts = document.getElementById('tpl-skill');
    if (!grid || !tg || !ts) return;
    grid.innerHTML = '';
    const groups = new Map();
    this._arr(this.data.skills).forEach(s => { const k = s.domain || 'Other'; if (!groups.has(k)) groups.set(k, []); groups.get(k).push(s); });
    const lvl = { expert: 100, advanced: 75, intermediate: 50, beginner: 25, 'read & review': 60, 'ai-assisted': 45 };
    groups.forEach((list, domain) => {
      const g = tg.content.cloneNode(true); g.firstElementChild.setAttribute('data-injected', '1');
      this._txt(g, '[data-sg="domain"]', domain); this._txt(g, '[data-sg="count"]', `${list.length} skills`);
      const holder = g.querySelector('[data-sg="list"]');
      list.forEach(s => {
        const n = ts.content.cloneNode(true);
        this._txt(n, '[data-sk="name"]', s.skill); this._txt(n, '[data-sk="level"]', [s.level, s.years ? `${s.years} yr${s.years == 1 ? '' : 's'}` : ''].filter(Boolean).join(' · '));
        n.querySelector('[data-sk="meter"]').dataset.w = String(lvl[String(s.level || '').toLowerCase()] || 50);
        holder.appendChild(n);
      });
      grid.appendChild(g);
    });
  },

  _renderProfiles() {
    const c = document.getElementById('profiles'); if (!c) return;
    this._renderList('profiles', 'tpl-profile', this.data.profiles, (n, p) => {
      const root = n.firstElementChild; if (p.slug) root.id = 'role-' + p.slug;
      this._txt(n, '[data-pf="title"]', p.title); this._txt(n, '[data-pf="keywords"]', p.keywords); this._txt(n, '[data-pf="fit"]', p.fit);
      const ev = n.querySelector('[data-pf="evidence"]'); this._arr(p.evidence).forEach(e => { const li = document.createElement('li'); li.textContent = e; ev.appendChild(li); });
      this._chips(n, '[data-pf="skills"]', p.skills);
      const a = n.querySelector('[data-pf="resume"]'); if (a) { a.href = 'index.html#resume'; a.textContent = `Resume format: ${p.resume_format || 'INT-01'} →`; }
    });
    const toc = document.getElementById('profiles-toc'); if (toc) { toc.innerHTML = ''; this._arr(this.data.profiles).forEach(p => { const a = document.createElement('a'); a.href = '#role-' + p.slug; a.className = 'chip'; a.textContent = p.title.split(' — ')[0].split(' / ')[0]; toc.appendChild(a); }); }
  },

  _renderCerts() {
    const wrap = document.getElementById('certs'), tg = document.getElementById('tpl-cert-group'), tc = document.getElementById('tpl-cert');
    if (!wrap || !tg || !tc) return;
    wrap.innerHTML = '';
    const groups = new Map();
    this._arr(this.data.certifications).forEach(c => { const k = c.group || 'Other'; if (!groups.has(k)) groups.set(k, []); groups.get(k).push(c); });
    groups.forEach((list, name) => {
      const g = tg.content.cloneNode(true); g.firstElementChild.setAttribute('data-injected', '1');
      this._txt(g, '[data-cg="name"]', name); this._txt(g, '[data-cg="count"]', `${list.length}`);
      const holder = g.querySelector('[data-cg="list"]');
      list.forEach(c => {
        const n = tc.content.cloneNode(true);
        const nameEl = n.querySelector('[data-ce="name"]');
        if (c.link) { const a = document.createElement('a'); a.href = c.link; a.target = '_blank'; a.rel = 'noopener'; a.textContent = c.name; a.className = 'cert-link'; nameEl.appendChild(a); const v = document.createElement('span'); v.className = 'verify'; v.textContent = 'verify ↗'; nameEl.appendChild(v); }
        else nameEl.textContent = c.name;
        this._txt(n, '[data-ce="issuer"]', c.issuer); this._txt(n, '[data-ce="year"]', c.year);
        holder.appendChild(n);
      });
      wrap.appendChild(g);
    });
  },

  _renderBlogs() {
    const blogs = this._arr(this.data.blogs).filter(b => b && b.status !== 'draft' && b.title);
    const section = document.getElementById('blogs-section'); if (!section) return;
    section.hidden = !blogs.length;
    this._renderList('blogs', 'tpl-blog', blogs, (n, b) => {
      const a = n.querySelector('a'); a.href = b.link || '#'; if (b.link) { a.target = '_blank'; a.rel = 'noopener'; }
      this._txt(n, '[data-bl="category"]', b.category); this._txt(n, '[data-bl="title"]', b.title); this._txt(n, '[data-bl="summary"]', b.summary); this._txt(n, '[data-bl="date"]', b.date);
    });
  },

  _renderResumes() {
    this._renderList('resumes', 'tpl-resume', this.data.resumes, (n, r) => {
      const a = n.querySelector('a');
      const direct = r.link && r.link !== '#' ? String(r.link) : '';
      const api = !direct && this.config.API_URL && r.format ? `${this.config.API_URL}?action=resume&id=${encodeURIComponent(r.format)}` : '';
      const href = direct || api;
      this._txt(n, '[data-rs="format"]', r.format ? `— ${r.format}` : ''); this._txt(n, '[data-rs="title"]', r.title); this._txt(n, '[data-rs="description"]', r.description); this._txt(n, '[data-rs="updated"]', r.updated);
      if (direct) { a.href = direct; a.target = '_blank'; a.rel = 'noopener'; return; }
      if (api) { a.href = api; a.addEventListener('click', ev => this._resumeViaApi(ev, r, api)); return; }
      a.href = '#resume'; a.classList.add('disabled'); a.setAttribute('aria-disabled', 'true');
      a.addEventListener('click', ev => { ev.preventDefault(); this._toast(`${r.title}: PDF not published yet — ask me for it by email.`); });
    });
  },

  // Open the tab synchronously (inside the click), then navigate it when the API answers.
  async _resumeViaApi(ev, r, api) {
    ev.preventDefault();
    const a = ev.currentTarget, dl = a.querySelector('.dl'); const original = dl.textContent;
    const win = window.open('', '_blank');
    if (win) { try { win.document.title = 'Generating PDF…'; win.document.body.style.cssText = 'font:14px ui-monospace,monospace;background:#0b0e12;color:#e7eaf0;display:grid;place-items:center;height:100vh;margin:0'; win.document.body.textContent = 'Generating your PDF…'; } catch (e) {} }
    dl.textContent = 'Generating…'; dl.classList.add('busy');
    try {
      const res = await fetch(api, { redirect: 'follow' }); const json = await res.json();
      if (json.error) throw new Error(json.error);
      const url = json.download_url || json.url; if (!url) throw new Error('No URL returned');
      if (win) win.location.href = url; else location.href = url;
    } catch (err) {
      if (win) win.close();
      this._toast(`Could not generate ${r.format}: ${err.message}`);
    } finally { dl.textContent = original; dl.classList.remove('busy'); }
  },

  _renderContact() {
    const c = this.data.contact || {};
    const set = (id, href) => { const el = document.getElementById(id); if (el && href) el.href = href; };
    set('cta-email', c.email ? `mailto:${c.email}` : ''); set('cta-linkedin', c.linkedin); set('cta-github', c.github);
    const copy = document.getElementById('cta-copy');
    if (copy && !copy.dataset.wired) { copy.dataset.wired = '1'; copy.addEventListener('click', async () => { try { await navigator.clipboard.writeText((this.data.contact || {}).email || ''); this._toast('Email address copied'); } catch (e) { this._toast((this.data.contact || {}).email || ''); } }); }
  },

  _renderOps() {
    const t = this.telemetry;
    this._txt(document, '#ops-source', t.source);
    this._txt(document, '#ops-latency', t.latency != null ? `${t.latency} ms` : (this.config.API_URL ? 'pending' : 'n/a (no API configured)'));
    this._txt(document, '#ops-cache', t.cacheAge == null ? '—' : (t.cacheAge < 1000 ? 'fresh' : this._ago(t.cacheAge)));
    this._txt(document, '#ops-rev', String(t.rev).slice(0, 19));
    this._txt(document, '#ops-theme', document.documentElement.getAttribute('data-theme') || 'dark');
    const st = document.getElementById('ops-status'); if (st) { const down = /down/.test(t.source); st.textContent = down ? '● degraded (fallback)' : '● serving'; st.className = 'v ' + (down ? 'warn' : 'ok'); }
    ['site-version', 'site-version-foot'].forEach(id => this._txt(document, '#' + id, this.config.SITE_VERSION || '2.0.0'));
    const y = document.getElementById('year'); if (y) y.textContent = String(new Date().getFullYear());
    // Sparkline of recent API latencies (persisted per browser), or a flat line when none.
    let hist = []; try { hist = JSON.parse(localStorage.getItem('tcgr_latency') || '[]'); } catch (e) {}
    const svg = document.getElementById('ops-spark'); if (!svg) return;
    const pts = hist.length >= 2 ? hist : [1, 1];
    const max = Math.max(...pts, 1), w = 240, h = 36;
    const d = pts.map((v, i) => `${i === 0 ? 'M' : 'L'}${(i / (pts.length - 1)) * w},${h - 4 - (v / max) * (h - 8)}`).join(' ');
    svg.innerHTML = `<path d="${d}" fill="none" stroke="var(--signal)" stroke-width="1.5" opacity=".9"/>`;
  },

  /* ── Helpers ────────────────────────────────────────────────────────── */
  _arr(v) { if (Array.isArray(v)) return v; if (v == null || v === '') return []; return String(v).split(/[;|]/).map(s => s.trim()).filter(Boolean); },
  _txt(scope, sel, val) { const el = scope.querySelector(sel); if (el && val != null && val !== '') el.textContent = String(val); },
  _html(scope, sel, val) { const el = scope.querySelector(sel); if (el && val != null && val !== '') el.innerHTML = this._safeHtml(String(val)); },
  _chips(scope, sel, items) { const c = scope.querySelector(sel); if (!c) return; this._arr(items).forEach(t => { const s = document.createElement('span'); s.className = 'chip'; s.textContent = t; c.appendChild(s); }); },
  _esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); },
  _emph(s, tag = 'em') { return String(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, `<${tag}>$1</${tag}>`); },
  // Allow a tiny whitelist of inline tags from the CMS; strip everything else.
  _safeHtml(s) {
    const tmp = document.createElement('div'); tmp.innerHTML = s;
    tmp.querySelectorAll('*').forEach(el => { if (!/^(EM|STRONG|B|I|BR|SPAN)$/.test(el.tagName)) el.replaceWith(...el.childNodes); else [...el.attributes].forEach(a => el.removeAttribute(a.name)); });
    return tmp.innerHTML;
  },
  _ago(ms) { const m = Math.round(ms / 60000); if (m < 1) return 'under a minute'; if (m < 60) return `${m} min`; const h = Math.round(m / 60); return `${h} h`; },
  _toast(msg) { const t = document.getElementById('toast'); if (!t) return; t.textContent = msg; t.classList.add('show'); clearTimeout(this._tt); this._tt = setTimeout(() => t.classList.remove('show'), 3800); },

  /* ── Theme ──────────────────────────────────────────────────────────── */
  _initTheme() {
    const btn = document.getElementById('theme-toggle'); if (!btn) return;
    btn.addEventListener('click', () => this.toggleTheme());
  },
  toggleTheme() {
    const html = document.documentElement; const next = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', next); try { localStorage.setItem('tcgr_theme', next); } catch (e) {}
    this._renderOps();
  },

  /* ── Nav: mobile menu, scroll state, scroll-spy ─────────────────────── */
  _initNav() {
    const toggle = document.getElementById('menu-toggle'), menu = document.getElementById('mobile-menu'), nav = document.getElementById('nav');
    if (toggle && menu) {
      const setOpen = open => { menu.classList.toggle('open', open); toggle.setAttribute('aria-expanded', String(open)); };
      toggle.addEventListener('click', () => setOpen(!menu.classList.contains('open')));
      menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
      document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
    }
    const onScroll = () => nav && nav.classList.toggle('scrolled', window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

    const links = [...document.querySelectorAll('#nav-links a')];
    const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
    if ('IntersectionObserver' in window && sections.length) {
      const spy = new IntersectionObserver(entries => {
        entries.forEach(e => { if (!e.isIntersecting) return; links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id)); });
      }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
      sections.forEach(s => spy.observe(s));
    }
  },

  /* ── Command palette (⌘K / Ctrl+K) ──────────────────────────────────── */
  _initPalette() {
    const pal = document.getElementById('palette'), input = document.getElementById('palette-input'), list = document.getElementById('palette-list'), openBtn = document.getElementById('palette-open');
    if (!pal || !input || !list) return;
    const actions = () => [
      ...[...document.querySelectorAll('section[id], header[id], div#oip')].map(s => { const h = s.querySelector('h2, h3, h1'); return { label: `Go to: ${(h ? h.textContent : s.id).replace(/\s+/g, ' ').trim()}`, hint: '#' + s.id, run: () => location.hash = '#' + s.id }; }),
      { label: 'Copy email address', hint: 'clipboard', run: () => document.getElementById('cta-copy')?.click() },
      { label: 'Toggle light / dark theme', hint: 'theme', run: () => this.toggleTheme() },
      { label: 'Download resume', hint: '#resume', run: () => location.hash = '#resume' },
      { label: 'Refresh content from CMS', hint: '?refresh=1', run: () => { location.search = '?refresh=1'; } },
      { label: 'Open LinkedIn', hint: 'external', run: () => window.open((this.data.contact || {}).linkedin, '_blank', 'noopener') },
      { label: 'Open GitHub', hint: 'external', run: () => window.open((this.data.contact || {}).github, '_blank', 'noopener') }
    ];
    let items = [], sel = 0;
    const render = q => {
      const qq = q.trim().toLowerCase(); items = actions().filter(a => !qq || a.label.toLowerCase().includes(qq) || a.hint.toLowerCase().includes(qq)); sel = 0; list.innerHTML = '';
      if (!items.length) { const li = document.createElement('li'); li.className = 'empty'; li.textContent = 'No matches'; list.appendChild(li); return; }
      items.forEach((a, i) => { const li = document.createElement('li'); li.setAttribute('role', 'option'); li.setAttribute('aria-selected', String(i === sel)); li.innerHTML = `<span></span><span class="hint"></span>`; li.children[0].textContent = a.label; li.children[1].textContent = a.hint; li.addEventListener('click', () => { close(); a.run(); }); list.appendChild(li); });
    };
    const open = () => { pal.hidden = false; pal.classList.add('open'); input.value = ''; render(''); setTimeout(() => input.focus(), 10); };
    const close = () => { pal.classList.remove('open'); pal.hidden = true; };
    openBtn && openBtn.addEventListener('click', open);
    pal.addEventListener('click', e => { if (e.target === pal) close(); });
    input.addEventListener('input', () => render(input.value));
    input.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') { sel = Math.min(items.length - 1, sel + 1); } else if (e.key === 'ArrowUp') { sel = Math.max(0, sel - 1); } else if (e.key === 'Enter') { if (items[sel]) { close(); items[sel].run(); } return; } else if (e.key === 'Escape') { close(); return; } else return;
      e.preventDefault(); [...list.children].forEach((li, i) => li.setAttribute('aria-selected', String(i === sel)));
    });
    document.addEventListener('keydown', e => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); pal.hidden ? open() : close(); } });
  },

  _initAccordionDeepLinks() {
    // Only one project / lesson open at a time within a stack: keeps the page scannable.
    document.querySelectorAll('.stack').forEach(stack => {
      if (stack.dataset.wired) return; stack.dataset.wired = '1';
      stack.addEventListener('toggle', e => { if (e.target.open) stack.querySelectorAll('details[open]').forEach(d => { if (d !== e.target) d.open = false; }); }, true);
    });
  },

  _initClock() {
    const el = document.getElementById('ops-clock'); if (!el) return;
    const tick = () => { el.textContent = new Date().toLocaleTimeString('en-GB', { hour12: false }) + ' local'; };
    tick(); setInterval(tick, 1000);
  },

  /* ── Reveal on scroll + meters ──────────────────────────────────────── */
  _initReveals() {
    const fillMeters = root => root.querySelectorAll('[data-w]').forEach(el => { el.style.width = el.dataset.w + '%'; });
    if (this.reduced || !('IntersectionObserver' in window)) { document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('in')); fillMeters(document); return; }
    if (!this._io) {
      this._io = new IntersectionObserver(entries => entries.forEach(e => { if (!e.isIntersecting) return; e.target.classList.add('in'); fillMeters(e.target); this._io.unobserve(e.target); }), { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    }
    document.querySelectorAll('[data-reveal]:not(.in)').forEach(el => this._io.observe(el));
    // Elements with meters that are not themselves data-reveal (skills inside cards) — observe their card.
    document.querySelectorAll('.bench, .skills').forEach(el => this._io.observe(el));
  },

  /* ── Hero telemetry canvas: pulses travelling along grid lines ───────── */
  _initBackgroundMotion() {
    if (this.reduced) return;
    const canvas = document.getElementById('telemetry'); if (!canvas) return;
    const ctx = canvas.getContext && canvas.getContext('2d'); if (!ctx) return; let w = 0, h = 0, dpr = 1;
    const resize = () => { dpr = Math.min(window.devicePixelRatio || 1, 2); w = canvas.clientWidth; h = canvas.clientHeight; canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    resize(); window.addEventListener('resize', resize, { passive: true });
    const cell = 48; const spawn = () => { const horiz = Math.random() > 0.5, dir = Math.random() > 0.5 ? 1 : -1, sp = 0.00009 + Math.random() * 0.00012;
      if (horiz) { const y = Math.floor(Math.random() * (h / cell)) * cell; return { x0: dir > 0 ? -40 : w + 40, x1: dir > 0 ? w + 40 : -40, y0: y, y1: y, t: 0, sp }; }
      const x = Math.floor(Math.random() * (w / cell)) * cell; return { x0: x, x1: x, y0: dir > 0 ? -40 : h + 40, y1: dir > 0 ? h + 40 : -40, t: 0, sp }; };
    const pulses = Array.from({ length: 12 }, spawn); let last = performance.now(); let visible = true;
    document.addEventListener('visibilitychange', () => { visible = !document.hidden; last = performance.now(); });
    const color = () => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#f2b84b';
    const tick = now => {
      if (!visible) { requestAnimationFrame(tick); return; }
      const dt = Math.min(50, now - last); last = now; ctx.clearRect(0, 0, w, h); const c = color();
      pulses.forEach((p, i) => { p.t += dt * p.sp; if (p.t > 1) { pulses[i] = spawn(); return; }
        const x = p.x0 + (p.x1 - p.x0) * p.t, y = p.y0 + (p.y1 - p.y0) * p.t, a = 0.5 * (1 - Math.abs(p.t - 0.5) * 2);
        const g = ctx.createRadialGradient(x, y, 0, x, y, 12); g.addColorStop(0, this._rgba(c, a)); g.addColorStop(1, this._rgba(c, 0)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.fill(); });
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  },
  _rgba(hex, a) { const m = hex.replace('#', ''); const n = parseInt(m.length === 3 ? m.split('').map(c => c + c).join('') : m, 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; }
};

window.addEventListener('DOMContentLoaded', () => App.init());
