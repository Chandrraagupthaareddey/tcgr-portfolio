/* ============================================================================
 *  tcgr.in — Frontend (v1.1.0)
 *  Sheet-driven rendering · localStorage cache · bundled fallback
 *  ----------------------------------------------------------------------------
 *  CHANGES vs v1.0:
 *   - Metric counters now bind via stable `id="metric-*"` selectors (not by
 *     mutating data-counter — fixes the "stats render 0%" bug on Cloudflare).
 *   - Counter animation reads from a separate `data-target` attribute, set
 *     ONCE after data hydrates. No race with _initAnimations().
 *   - Resume cards: real download URLs are built when format ID + API_URL
 *     exist (calls ?action=resume&id=INT-01); falls back gracefully.
 *   - Telemetry: subtle pulse + grid drift driven by JS rAF, not GSAP.
 *   - Smarter caching: stale-while-revalidate that DOESN'T double-render.
 *   - Reduced motion respected throughout.
 *  ============================================================================ */

const FALLBACK_DATA = {
  hero: {
    intro: "I'm Chandraguptha Reddy — a Senior Staff Engineer building AI-augmented observability, automation, and self-healing operational systems for enterprise-scale platforms. Currently architecting reliability for Airbnb Payments.",
    notice_period: '60d notice'
  },
  about: {
    body: "My career didn't start in engineering. It started in hotel revenue analysis — staring at spreadsheets, spotting patterns in noise, and building automations to escape repetition. That instinct never left.\n\nOver 15 years, I've evolved from automating night audits with Google Apps Script to architecting multi-LLM AIOps platforms for Airbnb Payments — combining classical SRE practice with modern AI reasoning to detect, triage, and resolve incidents with minimal human overhead."
  },
  metrics: {
    years: 15,
    alert_noise_reduction_pct: 55,
    manual_effort_reduction_pct: 40,
    mttr_improvement_pct: 35
  },
  contact: {
    location: 'Bengaluru, IN · open to UAE / Remote',
    role: 'Senior Staff Engineer — SRE @ Airbnb (via Altimetrik)',
    availability: '60 days notice (negotiable)',
    languages: 'English, Hindi, Tamil',
    email: 'tcgr.8553665381@gmail.com',
    linkedin: 'https://www.linkedin.com/in/tcgr/',
    github: 'https://github.com/tcgr-in',
    tagline: 'Open to senior SRE / Observability / AI-Ops leadership roles in UAE and remote. I respond within 24 hours.'
  },
  timeline: [
    { year: '2025 — Now',  role: 'Senior Staff Engineer, SRE',  company: 'Airbnb (via Altimetrik)',     description: 'Architecting AI-driven observability for Airbnb Payments. Multi-LLM AIOps with Claude, GPT, Gemini. Reduced alert noise 55%, improved MTTR 35–48%.' },
    { year: '2024 — 2025', role: 'Technical Lead, SRE',         company: 'Airbnb · Payments / Payins',  description: 'Designed Flow-Level Monitors aligned to payment flows. Built composite anomaly detection in Datadog. Automated alert triage via Datadog APIs + Slack + Apps Script.' },
    { year: '2021 — 2024', role: 'Senior SRE',                  company: 'Citi Bank (via Altimetrik)',  description: 'Self-managed Grafana Enterprise across NAM/APAC/EMEA. Migrated POCs to production with Jenkins + Ansible CI/CD. Cut manual rollout effort by 60%.' },
    { year: '2021',        role: 'Senior SRE',                  company: 'PayPal',                      description: 'Application gap & tooling assessment: Splunk, Galileo, Tabule, Kibana, Sherlock. Vulnerability management and security observability.' },
    { year: '2020 — 2021', role: 'DevOps & Infra',              company: 'Happymonk.ai',                description: 'Infrastructure for self-hosted e-commerce. Multi-cloud (AWS, Azure, E2E, Infomaniak). Deployed AI/ML models to Windows + Ubuntu fleets.' },
    { year: '2019 — 2020', role: 'Site Reliability Engineer',   company: 'Vogo Automotive',             description: 'Structured the SRE team. Owned availability, latency, capacity planning, on-call. K8s monitoring, PostgreSQL/MongoDB/Prometheus stack.' },
    { year: '2015 — 2019', role: 'SRE L1 → L3',                 company: 'Treebo Hotels',               description: 'Started with shell automation for PMS Night Audit; evolved into full-stack SRE — ELK, Datadog, Sentry, AWS, on-call. Built 20+ Apps Script automations.' },
    { year: '2014 — 2015', role: 'Data Analyst (CA Internship)', company: 'Keys Hotels',                description: 'First taste of Google Apps Script automation. Auto-email triggers, vendor app integration, financial audit automation.' },
    { year: '2010 — 2014', role: 'Hotel Revenue Analyst',       company: 'Adarsh Developers',           description: 'Where the systems-thinking started. Inventory, dynamic pricing, OTA optimization, data-driven decisioning.' }
  ],
  expertise: [
    { category: 'Observability', title: 'AI-Augmented Observability',     description: 'Combining metrics/logs/traces with LLM reasoning for intelligent triage, summarization, and impact analysis across distributed systems.', tools: ['Datadog','Grafana','Telescope','Claude','MCP'], badge: 'core' },
    { category: 'Automation',    title: 'Google Apps Script Architecture', description: '20+ production GAS automations: PropertiesService for secrets, LockService for concurrency, modular triggers, batch operations, quota-aware retries.', tools: ['GAS','Triggers','Sheets API','Gmail API'], badge: '20+' },
    { category: 'AI / LLM',      title: 'Multi-LLM Orchestration',         description: 'Prompt chaining across Claude, GPT, Gemini for cross-validated reasoning. Severity classification, RCA generation, runbook synthesis.', tools: ['Claude','GPT','Gemini','MCP','RAG'], badge: 'production' },
    { category: 'Reliability',   title: 'SLI / SLO Engineering',           description: 'Golden signals, error budgets, flow-level monitoring tied to business-critical payment workflows. Alert quality over alert quantity.', tools: ['SLI','SLO','Error Budgets','FLM'], badge: '' },
    { category: 'Alerting',      title: 'Alert Intelligence Design',       description: 'Composite alerts, anomaly detection, traffic-aware thresholds. Cut alert noise ~55% via AI classification + dynamic baselines.', tools: ['Datadog','PromQL','Anomaly ML','Z-score'], badge: '−55% noise' },
    { category: 'Cloud',         title: 'Multi-Cloud Reliability',         description: 'Production reliability across AWS, GCP, Azure, OpenShift, EKS clusters. Linux-native automation. Container-aware monitoring.', tools: ['AWS','GCP','Kubernetes','OpenShift'], badge: '' },
    { category: 'CI/CD',         title: 'Monitoring-as-Code',              description: 'Version-controlled FLM configs, parameterized Jenkins pipelines, peer-reviewed alert logic. One-click rollouts across environments.', tools: ['Jenkins','Ansible','GitLab','uDeploy'], badge: '−60% effort' },
    { category: 'Incident',      title: 'Automated Incident Response',     description: 'LLM-driven runbook generation, contextual recommendations, Slack workflow integration, automated impact correlation.', tools: ['Slack API','Datadog API','GAS','LLMs'], badge: '' },
    { category: 'Leadership',    title: 'SRE Mentorship',                  description: 'Drive adoption of AI-driven SRE practices across teams. Cross-team collaboration to improve resilience, scalability, production readiness.', tools: ['Coaching','Architecture','Strategy'], badge: '' }
  ],
  projects: [
    { number: '01', category: 'AI / Observability', title: 'AI Alert Triage System',          subtitle: 'Multi-LLM classification across Datadog → Slack → Sheets',
      description: ['Built end-to-end alert classification using Claude for reasoning, GPT for cross-checking, Gemini for impact summary.','Severity prediction, false-positive filtering, contextual incident grouping. Pulls live signals via Datadog API.','Output piped to Slack with one-click actions (acknowledge, escalate, suppress).'],
      stack: ['Claude','GPT','Gemini','Datadog API','GAS','Slack API'],
      impact: '−55% alert noise · MTTR improved 35–48% · ~30–40% manual effort eliminated' },
    { number: '02', category: 'AI / RCA',           title: 'Datadog Auto-RCA',                subtitle: 'Intelligent correlation engine for payment incidents',
      description: ['Cross-service correlation across metrics, logs, traces. AI-generated RCA summaries with reasoning chains.','Reduces "why" time during incident calls — engineers walk in with context, not raw data.'],
      stack: ['Datadog','Claude','Telescope','Splunk'],
      impact: 'Cuts RCA time from hours to minutes for recurring incident classes' },
    { number: '03', category: 'Automation',         title: 'Flow-Level Monitor (FLM) Framework', subtitle: 'Business-flow-aware alerting for Airbnb Payments',
      description: ['Designed FLMs aligned to actual payment flows — not just service-level signals.','Composite alerts correlating dimensions across services with dynamic anomaly thresholds.','Version-controlled config-as-code; peer-reviewed alerting logic.'],
      stack: ['Datadog','PromQL','Git','Jenkins'],
      impact: 'Granular detection of business-impacting anomalies; reduced blind spots in payment workflows' },
    { number: '04', category: 'Automation Platform', title: 'GAS Workflow Automation Hub',     subtitle: '20+ production automations across Sheets, Gmail, APIs',
      description: ['Centralized scheduler pattern (single trigger, fan-out execution).','PropertiesService-backed secrets management. LockService for concurrent runs.','Batch read/write optimization — 10× faster than cell-by-cell.','Modular architecture: each automation is a versioned module.'],
      stack: ['Apps Script','Sheets API','Gmail API','Triggers'],
      impact: 'Saved hundreds of engineer-hours/month across reporting, audits, and ops workflows' },
    { number: '05', category: 'Reliability',        title: 'Datadog → Telescope Migration',   subtitle: 'End-to-end observability platform transition',
      description: ['Led migration from Datadog to Telescope for Airbnb payments observability stack.','Mapped every alert, dashboard, FLM. Validated alert accuracy via parallel-run shadowing.','Documented signal-quality framework adopted across teams.'],
      stack: ['Datadog','Telescope','Grafana','Splunk'],
      impact: 'Enhanced alert accuracy + signal quality without coverage regression' },
    { number: '06', category: 'Workflow',           title: 'EMR Booking Workflow',            subtitle: 'Patient routing + embedded booking automation',
      description: ['Routing logic for new vs. returning patients, embedded booking experience.','Backed by Apps Script + Sheets as the source of truth.'],
      stack: ['Apps Script','Sheets','Forms'],
      impact: 'Replaced manual coordination with self-service workflow' }
  ],
  ai_capabilities: [
    { label: 'REASONING',     title: 'Claude as primary triage',         description: 'Long-context reasoning over incident timelines, log bursts, and cross-service traces. Synthesizes hypotheses faster than humans on first-look.' },
    { label: 'VALIDATION',    title: 'GPT cross-check pass',             description: "Independent second opinion on Claude's RCA. Surfaces blind spots, contradicts overconfident answers, reduces single-model bias." },
    { label: 'SUMMARIZATION', title: 'Gemini for stakeholder briefs',    description: 'Translates technical RCAs into exec-friendly summaries. Bridges engineering and product/business comms during war rooms.' }
  ],
  lessons: [
    { number: 'L01', title: 'Hardcoding everything',            problem: 'Secrets, API keys, and config baked directly into Apps Script code. Painful to rotate, terrifying to share.', fix: 'Migrated all sensitive values to PropertiesService (Script + User Properties). One config layer, one place to update.', impact: 'Centralized config management. Safe code reviews. Zero credential leakage in 4+ years.' },
    { number: 'L02', title: 'Silent automation failures',       problem: 'Apps Script functions failing without anyone noticing — until a downstream report came up empty days later.', fix: 'Wrapped every entry-point in try/catch with MailApp + Slack alert on exception. Dead-man-switch monitor for scheduled triggers.', impact: 'Failures detected in minutes, not days. Ops trust restored.' },
    { number: 'L03', title: 'Trigger overload',                 problem: '30+ time-driven triggers across one project. Quota collisions, race conditions, debugging chaos.', fix: 'Centralized scheduler pattern: one master trigger fans out to logical handlers based on a schedule sheet.', impact: 'From 30+ triggers to 1. Debugging time cut by 80%.' },
    { number: 'L04', title: 'Cell-by-cell sheet operations',    problem: 'Loops calling getRange() / setValue() per cell. 10,000-row jobs taking 6+ minutes and hitting execution limits.', fix: 'Batch read/write: getValues() into 2D array, mutate in memory, setValues() once.', impact: '10×–50× speedup. Scripts that timed out now run in seconds.' },
    { number: 'L05', title: 'Everything in one function',       problem: 'Monolithic doGet() with 600 lines of business logic, tightly coupled. Refactor-hostile.', fix: 'Modular architecture: routers, services, repos, validators. Clear contracts between layers.', impact: 'Onboarding from days to hours. Confidence to refactor without regression.' },
    { number: 'L06', title: 'Duplicate execution',              problem: 'Two triggers firing in overlap → duplicate emails, double-counted records, corrupted state.', fix: 'LockService at the entry of every mutation function. Properly scoped, properly released.', impact: 'Eliminated entire class of state corruption bugs.' },
    { number: 'L07', title: 'Ignoring quotas & limits',         problem: 'Apps Script execution time limits, daily email quotas, API rate limits — discovered only when production failed.', fix: 'Quota-aware retry logic with exponential backoff. Pre-flight quota checks. Batched API calls.', impact: 'Reliable execution at scale. No more weekend pages from quota exhaustion.' }
  ],
  resumes: [
    { format: 'INT-01',  title: 'International CV', description: 'ATS-friendly, two-page, role-targeted for global SRE / Observability / AI-Ops leadership roles.', link: '', updated: 'v2026.05' },
    { format: 'GULF-01', title: 'Gulf CV',          description: 'Tailored for UAE / GCC market: visa status, availability, expected salary, regional context.',  link: '', updated: 'v2026.05' },
    { format: 'IN-01',   title: 'India CV',         description: 'Naukri/LinkedIn-optimized format with detailed project breakdowns and skill matrices.',           link: '', updated: 'v2026.05' }
  ],
  blogs: []
};

/* ========================================================================== */

const App = {
  data: null,
  hydrated: false,
  config: window.PORTFOLIO_CONFIG || {},

  async init() {
    this._initStaticUI();
    this._initBackgroundMotion();
    this._initInteractions();

    // First paint: synchronous fallback render so UI is never empty
    this.data = FALLBACK_DATA;
    this._render();
    this._initAnimations();

    // Then: try cache → API. If newer data, re-render only sections that need it.
    const fresh = await this._loadData();
    if (fresh && fresh !== FALLBACK_DATA) {
      this.data = fresh;
      this._render();           // safe: render is idempotent (clears containers)
      this._refreshCounters();  // re-bind counter targets to new metrics
      this._initAnimations();   // re-trigger reveals on newly added elements
    }
    this.hydrated = true;
  },

  /* ── Static UI ────────────────────────────────────────────────────────── */
  _initStaticUI() {
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
    const ver = document.getElementById('site-version');
    if (ver) ver.textContent = this.config.SITE_VERSION || '1.0.0';
  },

  /* ── Data loading: stale-while-revalidate ─────────────────────────────── */
  async _loadData() {
    let cached = null;
    try {
      const raw = localStorage.getItem('tcgr_data');
      if (raw) cached = JSON.parse(raw);
    } catch (e) { /* ignore */ }

    const ttl = this.config.CACHE_TTL_MS || 21600000;
    const isFresh = cached && (Date.now() - cached.ts < ttl);

    if (isFresh) {
      // Background refresh — ignore failure
      this._fetchAndCache().catch(() => {});
      return cached.data;
    }

    if (this.config.API_URL) {
      try {
        const data = await this._fetchAndCache();
        if (data) return data;
      } catch (e) {
        console.warn('[tcgr.in] API unreachable:', e.message);
      }
    }

    // Even stale cache beats fallback
    return cached?.data || FALLBACK_DATA;
  },

  async _fetchAndCache() {
    if (!this.config.API_URL) return null;
    const url = `${this.config.API_URL}?action=all&v=${encodeURIComponent(this.config.SITE_VERSION || '1')}`;
    const res = await fetch(url, { method: 'GET', redirect: 'follow' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data || data.error) throw new Error(data?.error || 'Empty response');
    try { localStorage.setItem('tcgr_data', JSON.stringify({ ts: Date.now(), data })); } catch (e) {}
    return data;
  },

  /* ── Render orchestrator ──────────────────────────────────────────────── */
  _render() {
    this._renderHero();
    this._renderAbout();
    this._renderMetrics();
    this._renderContact();
    this._renderList('timeline-container', 'tpl-timeline', this.data.timeline, this._fillTimeline);
    this._renderList('expertise-grid',    'tpl-expertise', this.data.expertise, this._fillExpertise);
    this._renderList('projects-list',     'tpl-project',   this.data.projects,  this._fillProject);
    this._renderList('ai-capabilities',   'tpl-ai-cap',    this.data.ai_capabilities, this._fillAI);
    this._renderList('lessons-list',      'tpl-lesson',    this.data.lessons,   this._fillLesson);
    this._renderResumes();
    this._renderBlogs();
  },

  _renderList(containerId, tplId, items, filler) {
    const c = document.getElementById(containerId);
    const t = document.getElementById(tplId);
    if (!c || !t || !Array.isArray(items)) return;
    // Clear (keep static children like timeline-line)
    [...c.querySelectorAll('[data-injected="1"]')].forEach(n => n.remove());
    items.forEach(item => {
      const node = t.content.cloneNode(true);
      const root = node.firstElementChild;
      if (root) root.setAttribute('data-injected', '1');
      filler.call(this, node, item);
      c.appendChild(node);
    });
  },

  /* ── Section renderers ────────────────────────────────────────────────── */
  _renderHero() {
    const intro = this.data.hero?.intro;
    if (intro) {
      const el = document.getElementById('hero-intro');
      if (el) el.textContent = intro;
    }
    const notice = this.data.hero?.notice_period;
    if (notice) {
      document.querySelectorAll('[data-bind="hero.notice_period"]').forEach(el => {
        el.textContent = notice;
      });
    }
  },

  _renderAbout() {
    const body = this.data.about?.body;
    if (!body) return;
    const el = document.getElementById('about-body');
    if (!el) return;
    el.innerHTML = '';
    body.split(/\n{2,}/).map(s => s.trim()).filter(Boolean).forEach(para => {
      const p = document.createElement('p');
      p.textContent = para;
      el.appendChild(p);
    });
  },

  // FIX: bind by stable id, store target separately, don't mutate the lookup key
  _renderMetrics() {
    const m = this.data.metrics || {};
    const map = {
      'metric-years':          this._n(m.years, 15),
      'metric-alert-noise':    this._n(m.alert_noise_reduction_pct, 55),
      'metric-manual-effort':  this._n(m.manual_effort_reduction_pct, 40),
      'metric-mttr':           this._n(m.mttr_improvement_pct, 35)
    };
    Object.entries(map).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.setAttribute('data-target', String(val));
      // Show fallback value immediately so nothing reads as "0"
      if (!el.hasAttribute('data-animated')) el.textContent = String(val);
    });
  },

  _refreshCounters() {
    // After data refresh, re-run counter animation on changed targets
    document.querySelectorAll('[data-target]').forEach(el => {
      const target = parseFloat(el.getAttribute('data-target'));
      const current = parseFloat(el.textContent) || 0;
      if (target !== current) this._animateCounter(el, current, target);
    });
  },

  _renderContact() {
    const c = this.data.contact || {};
    const email = document.getElementById('cta-email');
    const linkedin = document.getElementById('cta-linkedin');
    if (email && c.email) email.href = `mailto:${c.email}`;
    if (linkedin && c.linkedin) linkedin.href = c.linkedin;

    const fields = ['location', 'role', 'availability', 'languages', 'tagline'];
    fields.forEach(f => {
      if (!c[f]) return;
      document.querySelectorAll(`[data-bind="contact.${f}"]`).forEach(el => {
        // Strip leading "Label:    " prefix if present in cell, terminal already shows label
        const v = String(c[f]).replace(/^[A-Za-z ]+:\s+/, '');
        el.textContent = v;
      });
    });
  },

  /* ── Fillers (templated rows) ─────────────────────────────────────────── */
  _fillTimeline(node, item) {
    this._setText(node, '[data-tl="year"]',        item.year);
    this._setText(node, '[data-tl="role"]',        item.role);
    this._setText(node, '[data-tl="company"]',     item.company);
    this._setText(node, '[data-tl="description"]', item.description);
  },

  _fillExpertise(node, item) {
    this._setText(node, '[data-ex="category"]',    item.category ? `— ${item.category}` : '');
    this._setText(node, '[data-ex="badge"]',       item.badge || '');
    this._setText(node, '[data-ex="title"]',       item.title);
    this._setText(node, '[data-ex="description"]', item.description);
    this._renderTags(node, '[data-ex="tools"]',    item.tools);
  },

  _fillProject(node, item) {
    this._setText(node, '[data-pr="number"]',   item.number);
    this._setText(node, '[data-pr="category"]', item.category);
    this._setText(node, '[data-pr="title"]',    item.title);
    this._setText(node, '[data-pr="subtitle"]', item.subtitle);
    this._setText(node, '[data-pr="impact"]',   item.impact);

    const desc = node.querySelector('[data-pr="description"]');
    const items = Array.isArray(item.description) ? item.description : (item.description ? String(item.description).split(/[;|]/) : []);
    items.forEach(p => {
      const para = document.createElement('p');
      para.textContent = p.trim();
      desc.appendChild(para);
    });
    this._renderTags(node, '[data-pr="stack"]', item.stack);
  },

  _fillAI(node, item) {
    this._setText(node, '[data-ai="label"]',       item.label);
    this._setText(node, '[data-ai="title"]',       item.title);
    this._setText(node, '[data-ai="description"]', item.description);
  },

  _fillLesson(node, item) {
    this._setText(node, '[data-le="number"]',  item.number);
    this._setText(node, '[data-le="title"]',   item.title);
    this._setText(node, '[data-le="problem"]', item.problem);
    this._setText(node, '[data-le="fix"]',     item.fix);
    this._setText(node, '[data-le="impact"]',  item.impact);
  },

  // Resume: build real download URL when format ID + API_URL exist
  _renderResumes() {
    const grid = document.getElementById('resume-cards');
    const tpl  = document.getElementById('tpl-resume');
    if (!grid || !tpl) return;
    [...grid.querySelectorAll('[data-injected="1"]')].forEach(n => n.remove());

    (this.data.resumes || []).forEach(item => {
      const node = tpl.content.cloneNode(true);
      const root = node.firstElementChild;
      root.setAttribute('data-injected', '1');

      const a = node.querySelector('a');
      const downloadHref = item.link && item.link !== '#'
        ? item.link
        : (this.config.API_URL && item.format
            ? `${this.config.API_URL}?action=resume&id=${encodeURIComponent(item.format)}`
            : '#');

      a.href = downloadHref;
      if (downloadHref !== '#') {
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener');
        a.addEventListener('click', (ev) => this._handleResumeClick(ev, item, downloadHref));
      } else {
        a.classList.add('opacity-60', 'cursor-not-allowed');
        a.addEventListener('click', (ev) => { ev.preventDefault(); this._toast('Resume not yet wired — add template_doc_id in the resumes sheet'); });
      }

      this._setText(node, '[data-rs="format"]',      item.format ? `— ${item.format}` : '');
      this._setText(node, '[data-rs="title"]',       item.title);
      this._setText(node, '[data-rs="description"]', item.description);
      this._setText(node, '[data-rs="updated"]',     item.updated);
      grid.appendChild(node);
    });
  },

  // If link points to ?action=resume API, the API returns JSON, not a PDF.
  // Intercept, fetch JSON, then redirect to the actual PDF URL.
  async _handleResumeClick(ev, item, href) {
    if (!href.includes('action=resume')) return; // direct link — let it through
    ev.preventDefault();
    const a = ev.currentTarget;
    const original = a.querySelector('span').textContent;
    a.querySelector('span').textContent = 'Generating PDF…';
    try {
      const res = await fetch(href);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      const url = json.download_url || json.url;
      if (!url) throw new Error('No URL returned');
      window.open(url, '_blank', 'noopener');
    } catch (err) {
      this._toast(`Could not generate ${item.format}: ${err.message}`);
    } finally {
      a.querySelector('span').textContent = original;
    }
  },

  _renderBlogs() {
    const blogs = (this.data.blogs || []).filter(b => b && b.status !== 'draft' && b.title);
    const section = document.getElementById('blogs-section');
    const list = document.getElementById('blogs-list');
    const tpl = document.getElementById('tpl-blog');
    if (!section || !list || !tpl) return;
    [...list.querySelectorAll('[data-injected="1"]')].forEach(n => n.remove());

    if (!blogs.length) { section.classList.add('hidden'); return; }
    section.classList.remove('hidden');

    blogs.forEach(item => {
      const node = tpl.content.cloneNode(true);
      const root = node.firstElementChild;
      root.setAttribute('data-injected', '1');
      const a = node.querySelector('a');
      a.href = item.link || '#';
      if (item.link && item.link !== '#') {
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener');
      }
      this._setText(node, '[data-bl="category"]', item.category);
      this._setText(node, '[data-bl="title"]',    item.title);
      this._setText(node, '[data-bl="summary"]',  item.summary);
      this._setText(node, '[data-bl="date"]',     item.date);
      list.appendChild(node);
    });
  },

  /* ── Helpers ─────────────────────────────────────────────────────────── */
  _setText(scope, sel, val) {
    const el = scope.querySelector(sel);
    if (el && val !== undefined && val !== null && val !== '') el.textContent = val;
  },
  _renderTags(scope, sel, items) {
    const c = scope.querySelector(sel);
    if (!c) return;
    (items || []).forEach(t => {
      const span = document.createElement('span');
      span.className = 'chip';
      span.textContent = t;
      c.appendChild(span);
    });
  },
  _n(v, fallback) {
    if (v === null || v === undefined || v === '') return fallback;
    const n = parseFloat(v);
    return isNaN(n) ? fallback : n;
  },
  _toast(msg) {
    const t = document.getElementById('toast');
    if (!t) { console.log('[toast]', msg); return; }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => t.classList.remove('show'), 3500);
  },

  /* ── Animations ──────────────────────────────────────────────────────── */
  _initAnimations() {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      document.querySelectorAll('[data-reveal]').forEach(el => {
        el.style.opacity = '1'; el.style.transform = 'none';
      });
      document.querySelectorAll('[data-target]').forEach(el => {
        el.textContent = el.getAttribute('data-target');
        el.setAttribute('data-animated', '1');
      });
      return;
    }

    // Reveal on scroll via IntersectionObserver (lighter than GSAP for this)
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target;
        if (el.hasAttribute('data-revealed')) return;
        el.setAttribute('data-revealed', '1');
        el.style.transition = 'opacity 0.7s ease, transform 0.7s cubic-bezier(.2,.7,.2,1)';
        el.style.opacity = '1';
        el.style.transform = 'none';
        if (el.hasAttribute('data-target')) {
          this._animateCounter(el, 0, parseFloat(el.getAttribute('data-target')));
        }
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });

    document.querySelectorAll('[data-reveal]:not([data-revealed])').forEach(el => io.observe(el));
    document.querySelectorAll('[data-target]:not([data-animated])').forEach(el => io.observe(el));
  },

  _animateCounter(el, from, to) {
    if (el.hasAttribute('data-animating')) return;
    el.setAttribute('data-animating', '1');
    const dur = 1400;
    const start = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    const step = (now) => {
      const p = Math.min(1, (now - start) / dur);
      const v = from + (to - from) * ease(p);
      el.textContent = String(Math.round(v));
      if (p < 1) requestAnimationFrame(step);
      else { el.removeAttribute('data-animating'); el.setAttribute('data-animated', '1'); }
    };
    requestAnimationFrame(step);
  },

  /* ── Background motion: telemetry pulses on hero grid ─────────────────── */
  _initBackgroundMotion() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const canvas = document.getElementById('telemetry-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, dpr;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Particle pulses traveling along grid lines — observability vibe
    const cell = 64;
    const pulses = Array.from({ length: 14 }, () => this._spawnPulse(w, h, cell));

    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min(50, now - last); last = now;
      ctx.clearRect(0, 0, w, h);

      pulses.forEach((p, i) => {
        p.t += dt * p.speed;
        if (p.t > 1) pulses[i] = this._spawnPulse(w, h, cell);

        const x = p.x0 + (p.x1 - p.x0) * p.t;
        const y = p.y0 + (p.y1 - p.y0) * p.t;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, 14);
        grad.addColorStop(0, `rgba(201,184,138,${0.55 * (1 - Math.abs(p.t - 0.5) * 2)})`);
        grad.addColorStop(1, 'rgba(201,184,138,0)');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(x, y, 14, 0, Math.PI * 2); ctx.fill();
      });

      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  },

  _spawnPulse(w, h, cell) {
    const horizontal = Math.random() > 0.5;
    if (horizontal) {
      const y = Math.floor(Math.random() * (h / cell)) * cell;
      const dir = Math.random() > 0.5 ? 1 : -1;
      return { x0: dir > 0 ? -50 : w + 50, x1: dir > 0 ? w + 50 : -50, y0: y, y1: y, t: 0, speed: 0.00012 + Math.random() * 0.00015 };
    } else {
      const x = Math.floor(Math.random() * (w / cell)) * cell;
      const dir = Math.random() > 0.5 ? 1 : -1;
      return { x0: x, x1: x, y0: dir > 0 ? -50 : h + 50, y1: dir > 0 ? h + 50 : -50, t: 0, speed: 0.00012 + Math.random() * 0.00015 };
    }
  },

  /* ── Mobile menu + smooth scroll ──────────────────────────────────────── */
  _initInteractions() {
    const toggle = document.getElementById('menu-toggle');
    const menu = document.getElementById('mobile-menu');
    const iconOpen = document.getElementById('icon-open');
    const iconClose = document.getElementById('icon-close');
    if (toggle && menu) {
      const setOpen = (open) => {
        menu.classList.toggle('open', open);
        if (iconOpen) iconOpen.style.display = open ? 'none' : '';
        if (iconClose) iconClose.style.display = open ? '' : 'none';
      };
      toggle.addEventListener('click', () => setOpen(!menu.classList.contains('open')));
      menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
    }

    // Header shrink on scroll
    const nav = document.querySelector('nav.sticky-nav');
    if (nav) {
      let lastY = 0;
      window.addEventListener('scroll', () => {
        const y = window.scrollY;
        nav.classList.toggle('scrolled', y > 24);
        lastY = y;
      }, { passive: true });
    }

    // Magnetic hover on primary buttons (subtle)
    document.querySelectorAll('.btn-primary, .btn-ghost').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * 0.08}px, ${y * 0.08}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }
};

window.addEventListener('DOMContentLoaded', () => App.init());
