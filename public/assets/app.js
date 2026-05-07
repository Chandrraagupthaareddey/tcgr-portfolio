/* ============================================================================
 *  tcgr.in — Frontend Application Logic
 *  Sheet-driven rendering with localStorage cache + bundled fallback.
 *  ============================================================================ */

/* ============================================================================
 *  FALLBACK DATA
 *  Used on first paint and when API is unreachable. Keeps the site functional
 *  even if the backend is down. Update via Sheet, not here.
 *  ============================================================================ */
const FALLBACK_DATA = {
  hero: {
    intro: null,
    notice_period: '60d notice'
  },
  about: { body: null },
  contact: {
    location: 'Location:        Bengaluru, IN · open to UAE / Remote',
    role: 'Current Role:    Senior Staff Engineer — SRE @ Airbnb (via Altimetrik)',
    availability: 'Availability:    60 days notice (negotiable)',
    languages: 'Languages:       English, Hindi, Tamil',
    email: 'tcgr.8553665381@gmail.com',
    linkedin: 'https://www.linkedin.com/in/tcgr/',
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
    { format: 'INT-01',  title: 'International CV', description: 'ATS-friendly, two-page, role-targeted for global SRE / Observability / AI-Ops leadership roles.', link: '#', updated: 'v2026.05' },
    { format: 'GULF-01', title: 'Gulf CV',          description: 'Tailored for UAE / GCC market: visa status, availability, expected salary, regional context.',  link: '#', updated: 'v2026.05' },
    { format: 'IN-01',   title: 'India CV',         description: 'Naukri/LinkedIn-optimized format with detailed project breakdowns and skill matrices.',           link: '#', updated: 'v2026.05' }
  ],
  blogs: [] // empty by default — populated from Sheet when ready
};

/* ============================================================================
 *  APP
 *  ============================================================================ */
const App = {
  data: null,
  config: window.PORTFOLIO_CONFIG || {},

  async init() {
    this._initStaticUI();
    this.data = await this._loadData();
    this._render();
    this._initAnimations();
    this._initInteractions();
  },

  /* -- Static UI not dependent on data -- */
  _initStaticUI() {
    document.getElementById('year').textContent = new Date().getFullYear();
    const v = document.getElementById('site-version');
    if (v) v.textContent = this.config.SITE_VERSION || '1.0.0';
  },

  /* -- Data layer with multi-tier fallback -- */
  async _loadData() {
    // Tier 1: localStorage cache
    try {
      const cached = JSON.parse(localStorage.getItem('tcgr_data') || 'null');
      if (cached && (Date.now() - cached.ts < this.config.CACHE_TTL_MS)) {
        // Background refresh, don't await
        this._fetchAndCache().catch(() => {});
        return cached.data;
      }
    } catch (e) { /* localStorage may be disabled — fall through */ }

    // Tier 2: live API
    if (this.config.API_URL) {
      try {
        const data = await this._fetchAndCache();
        if (data) return data;
      } catch (e) {
        console.warn('[tcgr.in] API unreachable, using fallback:', e.message);
      }
    }

    // Tier 3: bundled fallback
    return FALLBACK_DATA;
  },

  async _fetchAndCache() {
    if (!this.config.API_URL) return null;
    const url = `${this.config.API_URL}?action=all&v=${this.config.SITE_VERSION || '1'}`;
    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data && !data.error) {
      try { localStorage.setItem('tcgr_data', JSON.stringify({ ts: Date.now(), data })); } catch (e) {}
      return data;
    }
    throw new Error(data?.error || 'Empty response');
  },

  /* -- Rendering -- */
  _render() {
    this._renderHero();
    this._renderAbout();
    this._renderMetrics();
    this._renderTimeline();
    this._renderExpertise();
    this._renderProjects();
    this._renderAI();
    this._renderLessons();
    this._renderResumes();
    this._renderBlogs();
    this._renderContact();
  },

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

  _renderMetrics() {
    const m = this.data.metrics || {};
    const counters = {
      '[data-counter="15"]': m.years,
      '[data-counter="55"]': m.alert_noise_reduction_pct,
      '[data-counter="40"]': m.manual_effort_reduction_pct,
      '[data-counter="35"]': m.mttr_improvement_pct
    };
    Object.entries(counters).forEach(([sel, val]) => {
      if (val == null) return;
      const el = document.querySelector(sel);
      if (el) {
        el.setAttribute('data-counter', String(val));
        el.textContent = '0';
      }
    });
  },

  _renderContact() {
    const c = this.data.contact || {};
    const email = document.getElementById('cta-email');
    const linkedin = document.getElementById('cta-linkedin');
    if (email && c.email) email.href = `mailto:${c.email}`;
    if (linkedin && c.linkedin) linkedin.href = c.linkedin;

    const terminalBinds = ['contact.location', 'contact.role', 'contact.availability', 'contact.languages', 'contact.tagline'];
    terminalBinds.forEach(path => {
      const key = path.split('.')[1];
      const val = c[key];
      if (!val) return;
      document.querySelectorAll(`[data-bind="${path}"]`).forEach(el => {
        el.textContent = val;
      });
    });
  },

  _renderTimeline() {
    const container = document.getElementById('timeline-container');
    const tpl = document.getElementById('tpl-timeline');
    (this.data.timeline || []).forEach(item => {
      const node = tpl.content.cloneNode(true);
      this._setText(node, '[data-tl="year"]',        item.year);
      this._setText(node, '[data-tl="role"]',        item.role);
      this._setText(node, '[data-tl="company"]',     item.company);
      this._setText(node, '[data-tl="description"]', item.description);
      container.appendChild(node);
    });
  },

  _renderExpertise() {
    const grid = document.getElementById('expertise-grid');
    const tpl = document.getElementById('tpl-expertise');
    (this.data.expertise || []).forEach(item => {
      const node = tpl.content.cloneNode(true);
      this._setText(node, '[data-ex="category"]',    item.category ? `— ${item.category}` : '');
      this._setText(node, '[data-ex="badge"]',       item.badge);
      this._setText(node, '[data-ex="title"]',       item.title);
      this._setText(node, '[data-ex="description"]', item.description);
      this._renderTags(node, '[data-ex="tools"]',    item.tools);
      grid.appendChild(node);
    });
  },

  _renderProjects() {
    const list = document.getElementById('projects-list');
    const tpl = document.getElementById('tpl-project');
    (this.data.projects || []).forEach(item => {
      const node = tpl.content.cloneNode(true);
      this._setText(node, '[data-pr="number"]',   item.number);
      this._setText(node, '[data-pr="category"]', item.category);
      this._setText(node, '[data-pr="title"]',    item.title);
      this._setText(node, '[data-pr="subtitle"]', item.subtitle);
      this._setText(node, '[data-pr="impact"]',   item.impact);

      const desc = node.querySelector('[data-pr="description"]');
      const items = Array.isArray(item.description) ? item.description : (item.description ? [item.description] : []);
      items.forEach(p => {
        const para = document.createElement('p');
        para.textContent = p;
        desc.appendChild(para);
      });

      this._renderTags(node, '[data-pr="stack"]', item.stack);
      list.appendChild(node);
    });
  },

  _renderAI() {
    const container = document.getElementById('ai-capabilities');
    const tpl = document.getElementById('tpl-ai-cap');
    (this.data.ai_capabilities || []).forEach(item => {
      const node = tpl.content.cloneNode(true);
      this._setText(node, '[data-ai="label"]',       item.label);
      this._setText(node, '[data-ai="title"]',       item.title);
      this._setText(node, '[data-ai="description"]', item.description);
      container.appendChild(node);
    });
  },

  _renderLessons() {
    const list = document.getElementById('lessons-list');
    const tpl = document.getElementById('tpl-lesson');
    (this.data.lessons || []).forEach(item => {
      const node = tpl.content.cloneNode(true);
      this._setText(node, '[data-le="number"]',  item.number);
      this._setText(node, '[data-le="title"]',   item.title);
      this._setText(node, '[data-le="problem"]', item.problem);
      this._setText(node, '[data-le="fix"]',     item.fix);
      this._setText(node, '[data-le="impact"]',  item.impact);
      list.appendChild(node);
    });
  },

  _renderResumes() {
    const grid = document.getElementById('resume-cards');
    const tpl = document.getElementById('tpl-resume');
    (this.data.resumes || []).forEach(item => {
      const node = tpl.content.cloneNode(true);
      const a = node.querySelector('a');
      a.href = item.link || '#';
      if (item.link && item.link !== '#') {
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener');
      }
      this._setText(node, '[data-rs="format"]',      item.format ? `— ${item.format}` : '');
      this._setText(node, '[data-rs="title"]',       item.title);
      this._setText(node, '[data-rs="description"]', item.description);
      this._setText(node, '[data-rs="updated"]',     item.updated);
      grid.appendChild(node);
    });
  },

  _renderBlogs() {
    const blogs = (this.data.blogs || []).filter(b => b && b.status !== 'draft');
    if (!blogs.length) return;

    const section = document.getElementById('blogs-section');
    const list = document.getElementById('blogs-list');
    const tpl = document.getElementById('tpl-blog');
    section.classList.remove('hidden');

    blogs.forEach(item => {
      const node = tpl.content.cloneNode(true);
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

  /* -- Helpers -- */
  _setText(scope, selector, value) {
    const el = scope.querySelector(selector);
    if (el && value !== undefined && value !== null) el.textContent = value;
  },
  _renderTags(scope, selector, items) {
    const container = scope.querySelector(selector);
    if (!container) return;
    (items || []).forEach(t => {
      const span = document.createElement('span');
      span.className = 'font-mono text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border border-white/10 text-fog-300';
      span.textContent = t;
      container.appendChild(span);
    });
  },

  /* -- Animations -- */
  _initAnimations() {
    if (typeof gsap === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Show everything immediately if motion is reduced or GSAP missing
      document.querySelectorAll('[data-reveal]').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    document.querySelectorAll('[data-reveal]').forEach(el => {
      gsap.to(el, {
        opacity: 1, y: 0,
        duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });

    document.querySelectorAll('[data-counter]').forEach(el => {
      const target = parseFloat(el.getAttribute('data-counter'));
      const obj = { v: 0 };
      gsap.to(obj, {
        v: target, duration: 1.8, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 80%', once: true },
        onUpdate: () => { el.textContent = Math.round(obj.v); }
      });
    });
  },

  /* -- Mobile menu, etc. -- */
  _initInteractions() {
    const toggle = document.getElementById('menu-toggle');
    const menu = document.getElementById('mobile-menu');
    const iconOpen = document.getElementById('icon-open');
    const iconClose = document.getElementById('icon-close');
    if (!toggle || !menu) return;

    const setOpen = (open) => {
      menu.classList.toggle('open', open);
      iconOpen.style.display = open ? 'none' : '';
      iconClose.style.display = open ? '' : 'none';
    };

    toggle.addEventListener('click', () => setOpen(!menu.classList.contains('open')));
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
  }
};

window.addEventListener('DOMContentLoaded', () => App.init());
