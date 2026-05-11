<div align="center">

# tcgr.in

#### Personal engineering identity platform — sheet-driven, statically hosted, AI-augmented.

**[tcgr.in →](https://tcgr.in)**

`Cloudflare Pages` · `Google Apps Script` · `Google Sheets CMS` · `Vanilla JS`

</div>

---

## Overview

A premium engineering portfolio for **Chandraguptha Reddy** — Senior Staff Engineer working at the intersection of Site Reliability Engineering, AI-augmented observability, and automation architecture.

This is not a marketing site. It's a working artifact of how I think about production systems:

- **Sheet-driven CMS** — content updates without code commits or redeploys
- **Static-first delivery** — Cloudflare's edge serves everything; no server to crash
- **Multi-tier fallback** — site renders correctly even if every backend dependency is offline
- **Observability-inspired UI** — telemetry pulses, terminal blocks, monitoring-grade typography
- **Public repo, private data** — every secret lives in environment variables or `PropertiesService`, never in code

The architecture is deliberately boring where it matters and interesting where it counts.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│  AUTHOR (you)                                                    │
│   1. Edit cells in Google Sheet         →  CMS                   │
│   2. Push code to GitHub                →  Cloudflare deploy     │
│   3. Push backend with clasp            →  Apps Script update    │
└──────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────────┐
│  GOOGLE WORKSPACE  (private)                                     │
│  ┌─────────────────────┐    ┌─────────────────────────────────┐  │
│  │  Sheet (CMS)        │←──│  Apps Script (backend)          │  │
│  │  14 sheets           │    │  - Code.js (router + readers)  │  │
│  │  plain rows         │    │  - Schemas.js (bootstrap)       │  │
│  │                     │    │  - ResumeGenerator.js (PDFs)   │  │
│  └─────────────────────┘    └─────────────────────────────────┘  │
│                                            │                     │
│                                            ▼                     │
│                         ┌────────────────────────────────────┐   │
│                         │  Web App URL (public, read-only)   │   │
│                         │  /exec?action=all                  │   │
│                         └────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
                                            │
                                            ▼
┌──────────────────────────────────────────────────────────────────┐
│  CLOUDFLARE PAGES                                                │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │  Static frontend                                         │     │
│  │   - public/index.html                                   │     │
│  │   - public/assets/app.js  (renders, caches, falls back) │     │
│  │   - public/config.js  (built from env vars at deploy)   │     │
│  └─────────────────────────────────────────────────────────┘     │
│                          │                                       │
│                          ▼                                       │
│            ┌──────────────────────────┐                          │
│            │  tcgr.in (custom domain) │                          │
│            └──────────────────────────┘                          │
└──────────────────────────────────────────────────────────────────┘
                                            │
                                            ▼
                                     ┌────────────┐
                                     │  Visitor   │
                                     └────────────┘
```

### Request lifecycle

1. Visitor hits `tcgr.in`
2. Cloudflare's edge serves `index.html`, `assets/app.js`, and `config.js` (cached at edge)
3. Frontend boots: `App.init()` runs synchronously with bundled `FALLBACK_DATA` so the page is never empty for any frame
4. In parallel, the loader walks three tiers in order:
   - **Tier 1** — `localStorage` cache (≤6h old) → render immediately, kick off background refresh
   - **Tier 2** — live API call to `${API_URL}?action=all`
   - **Tier 3** — bundled fallback (already on screen — never flashes)
5. Apps Script receives the request, checks server-side `CacheService`, reads sheets only if cache missed, returns JSON
6. Frontend reconciles new data into the existing DOM, re-runs reveal animations on inserted nodes

Cold-start API latency is ~1.5–3s. Warm: <200ms. Both are invisible because Tier 1 + Tier 3 cover the wait.

---

## Why these choices

| Concern | Solution | Reasoning |
|---|---|---|
| Update content without commits | Google Sheet as CMS | Author UX is "edit cell, save" — no Markdown, no PR, no deploy queue |
| Zero hosting cost | Cloudflare Pages + Apps Script + Sheets | All free tiers; no card on file |
| Public repo, private data | Env vars + `PropertiesService` | Sheet IDs and Web App URLs never enter source control |
| Custom domain with auto-SSL | Cloudflare Pages → `tcgr.in` | One vendor for DNS + CDN + cert |
| Survive backend outage | Three-tier fallback | If Apps Script, Cloudflare's edge, or the CMS goes down, the page still renders |
| No framework rot | Vanilla HTML + JS + Tailwind CDN | Still works in 10 years; no bundler, no migrations |
| AI-Ops aesthetic | Custom telemetry canvas, terminal block, signal-teal accents | The site looks like a monitoring console because that's what I build |

### Why not React / Next.js

Considered and rejected:

| Option | Why not |
|---|---|
| React + Vite | Build pipeline overhead for a site whose data lives in a Google Sheet |
| Next.js + ISR | SSG advantages disappear when content is fetched at runtime from Sheets anyway |
| Astro / 11ty | Would force committing data files; defeats the "edit sheet, no commit" model |
| Hugo | Same as above, plus theme lock-in |

Plain HTML + ~700 lines of vanilla JS does everything this site needs, loads in under 200 KB total, and has zero dependencies that can break.

### Why Apps Script and not Cloudflare Workers

| Factor | Apps Script | Workers |
|---|---|---|
| Cost | Free, no card | Free tier, but card eventually |
| Native Sheet access | Yes (`SpreadsheetApp`) | No — needs Sheets API + OAuth |
| Built-in OAuth scopes | Yes (Drive, Docs, Gmail) | No |
| Server-side cache | Yes (`CacheService`) | Yes (KV) |
| Cold-start latency | ~1.5s | ~5ms |
| Container-bound to Sheet | Yes | No |

Apps Script wins on developer ergonomics for this exact use case. If sustained load ever exceeds ~20 reads/sec, the migration target is **Workers + Sheets API + KV** — same architecture, faster runtime.

### Why Cloudflare Pages over Vercel / Netlify

- Unlimited bandwidth on free tier
- DNS, CDN, and SSL all live at the same vendor
- Preview deployments on every PR (free)
- Custom domain SSL provisions instantly with no config

Vercel and Netlify work equally well. The architecture is portable to either.

---

## Repo structure

```
.
├── public/                          # ← Cloudflare Pages serves this directory
│   ├── index.html                   # Single-page entry; templates + section markup
│   ├── config.js                    # Runtime config — regenerated at build by build.sh
│   ├── config.example.js            # Template
│   └── assets/
│       ├── app.js                   # Rendering, hydration, fallback logic, animations
│       └── img/
│           ├── README.md            # How to add a profile photo
│           └── avatar.jpg           # (optional) drop your portrait here
│
├── apps-script/                     # ← Backend (managed by clasp)
│   ├── Code.js                      # doGet routing, sheet readers, cache, admin menu
│   ├── Schemas.js                   # Idempotent setupSheets() bootstrap + seed data
│   ├── ResumeGenerator.js           # On-demand PDF generation from Doc templates
│   └── appsscript.json              # Manifest — runtime, scopes, web app config
│
├── docs/
│   ├── SETUP.md                     # First-time setup (sheet, clasp, deploy)
│   ├── DEPLOYMENT.md                # Cloudflare Pages + custom domain
│   ├── ARCHITECTURE.md              # How the pieces fit together (deeper)
│   └── SECURITY.md                  # Threat model + what's safe to commit
│
├── .github/workflows/
│   └── validate.yml                 # CI: HTML/JS validation + secret-leak scan on PRs
│
├── build.sh                         # Cloudflare Pages build step (env → config.js)
├── .clasp.json.example              # Template — copy to .clasp.json (gitignored)
├── .gitignore                       # Strict — see SECURITY.md
└── README.md
```

---

## Quickstart

> Full walkthrough lives in [`docs/SETUP.md`](./docs/SETUP.md). The short version:

```bash
# 1. Clone
git clone https://github.com/tcgr-in/portfolio.git
cd portfolio

# 2. Install clasp (Apps Script CLI)
npm install -g @google/clasp

# 3. Auth + create your CMS Sheet
clasp login
# (in browser) create a new Google Sheet → Extensions → Apps Script
# copy the Script ID from Project Settings (⚙)

# 4. Wire clasp to your project
cp .clasp.json.example .clasp.json   # paste your scriptId

# 5. Push the backend
clasp push

# 6. In the Apps Script editor: run setupSheets() once → seeds 14 sheets

# 7. Deploy as Web App (Anyone access) → copy the /exec URL

# 8. Connect repo to Cloudflare Pages
#    - Build command:    sh build.sh
#    - Output directory: public
#    - Env var:          API_URL = <your /exec URL>
#    - Env var:          SITE_VERSION = 1.2.0

# 9. (Optional) Custom domain → tcgr.in (Cloudflare auto-handles SSL)
```

End-to-end time: ~25 minutes.

---

## CMS — how content updates work

The Google Sheet has 14 tabs, each backing a section of the site:

| Sheet | Shape | Drives |
|---|---|---|
| `profile` | key/value | Hero name, role, tagline |
| `about` | key/value | About-section body |
| `contact` | key/value | Email, LinkedIn, location, terminal block |
| `metrics` | key/value | Hero stat counters (years, alert noise %, etc.) |
| `timeline` | rows | Career timeline |
| `expertise` | rows | Expertise grid (with multi-value `tools` column) |
| `projects` | rows | Selected work cards (multi-value `stack`, `description`) |
| `ai_capabilities` | rows | Multi-LLM AIOps section |
| `lessons` | rows | Knowledge / lessons-learned cards |
| `resumes` | rows | Format ID, title, `template_doc_id` for PDF generation |
| `skills` | rows | Skills matrix |
| `certifications` | rows | Certifications |
| `blogs` | rows | Recent writing (filtered by `status != 'draft'`) |
| `meta` | key/value | Version, last-updated marker |

### Updating content

1. Open the CMS Sheet
2. Edit any cell — `expertise`, `projects`, `timeline`, `lessons`, etc.
3. (Optional) **🛠 tcgr.in CMS → Clear Cache** to push live immediately — otherwise updates appear within 6h
4. Done. No git, no deploy.

### Adding a new section

1. Add the schema to `apps-script/Schemas.js → _SCHEMAS()`
2. Add the sheet name to the `SHEET_NAMES` array in `Code.js`
3. Run `setupSheets()` again from the editor — idempotent, only adds the new tab
4. Wire the data into `_getAllData()` in `Code.js`
5. Extend `FALLBACK_DATA` and add a `_render*()` method in `public/assets/app.js`
6. Add a `<section>` and a `<template>` in `index.html`

Pattern documented in `docs/ARCHITECTURE.md → Adding a new section`.

---

## Caching & fallback strategy

Three caching tiers, each with a clear purpose:

| Tier | Lives in | TTL | Purpose |
|---|---|---|---|
| **Browser localStorage** | Visitor's browser | 6h | Repeat visits feel instant |
| **Apps Script CacheService** | Google's edge | 6h | One sheet read per 6h regardless of traffic |
| **Bundled FALLBACK_DATA** | Static asset | forever | Site never breaks if backend is down |

The fallback is not a degraded mode — it's the same data, last known good. A visitor cannot tell whether they're seeing live data or fallback unless they open the network tab.

### Hydration order

```
DOMContentLoaded
   ↓
Sync: render with FALLBACK_DATA (instant first paint, no flash)
   ↓
Async: try localStorage → live API → stale cache (in that order)
   ↓
If newer data: re-render sections, re-trigger reveal animations
```

This is why the site renders correct stats (`15 / 55% / 40% / 35%`) even before any JavaScript fetches anything — the values are baked into HTML and JS only enhances them.

---

## Resume generation

`ResumeGenerator.js` produces tailored PDFs on demand:

1. Author creates 3 Google Docs (International, Gulf, India formats) with placeholders: `{{name}}`, `{{role}}`, `{{intro}}`, `{{experience_block}}`, `{{skills_block}}`, `{{contact_block}}`
2. Doc IDs go into the `resumes` sheet's `template_doc_id` column
3. Frontend resume buttons call `?action=resume&id=INT-01` → backend copies the template, replaces placeholders with current sheet data, exports as PDF, returns a public-link URL
4. Frontend opens the URL in a new tab — visitor never sees the round-trip

If `template_doc_id` is empty, the button shows a toast warning instead of failing silently.

Generated PDFs accumulate in a Drive folder (`tcgr.in_resumes/`) shared as "anyone with link can view" — the standard for resume sharing.

---

## Local development

```bash
cd public
python3 -m http.server 8000
# or: npx serve public
```

Open `http://localhost:8000`. With `API_URL` empty, the site renders bundled fallback data — useful for design iteration without touching the backend.

To test against the live API locally without committing your URL:

```bash
# 1. Edit public/config.js with your real API_URL
# 2. Tell git to ignore future changes to this tracked file:
git update-index --skip-worktree public/config.js

# To re-track later:
git update-index --no-skip-worktree public/config.js
```

> Do not use `git rm --cached` on `config.js` — the build step needs the file to exist as a static deploy target.

---

## Cloudflare Pages — build & deploy

The build step is one bash file:

```bash
# build.sh
API_URL="${API_URL:-}"
SITE_VERSION="${SITE_VERSION:-1.2.0}"
CACHE_TTL_MS="${CACHE_TTL_MS:-21600000}"

cat > public/config.js <<EOF
window.PORTFOLIO_CONFIG = {
  API_URL: "${API_URL}",
  CACHE_TTL_MS: ${CACHE_TTL_MS},
  SITE_VERSION: "${SITE_VERSION}",
  SHOW_FALLBACK_BANNER: false
};
EOF
```

It rewrites `public/config.js` from environment variables at deploy time. The committed version of `config.js` ships with empty values so forks render fallback data on first preview.

### Cloudflare Pages settings

| Setting | Value |
|---|---|
| Build command | `sh build.sh` |
| Build output | `public` |
| Production branch | `main` |
| Framework preset | None |

### Required environment variables

| Variable | Value | Required |
|---|---|---|
| `API_URL` | Apps Script Web App URL (`https://script.google.com/.../exec`) | Yes |
| `SITE_VERSION` | Semver (e.g. `1.2.0`) | Optional — shown in footer |
| `CACHE_TTL_MS` | Client cache TTL in ms (default `21600000`) | Optional |

### Auto-deploy

Every `git push origin main` triggers Cloudflare → clones repo → runs `build.sh` → deploys `public/` to the edge. Live in ~30s. PRs get unique `*.pages.dev` preview URLs automatically.

Common operations are covered in [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md).

---

## Apps Script — clasp workflow

Backend code lives under `apps-script/` and is synced via clasp:

```bash
# First-time setup
npm install -g @google/clasp
clasp login
cp .clasp.json.example .clasp.json   # paste your scriptId
clasp push

# Iterate
# (edit apps-script/Code.js locally)
clasp push                           # uploads changes
# In Apps Script editor: Deploy → Manage deployments → Edit → New version
```

Code changes require a new deployment version. **Sheet edits do not** — they go live within the cache TTL (6h) or immediately on `🛠 → Clear Cache`.

The Apps Script project includes a custom menu (`onOpen()` in `Code.js`) for common admin tasks: clear cache, preview API output, generate resume PDFs.

---

## Security model

This repo is **public on GitHub**. Anything committed lives in commit history forever. The architecture below ensures sensitive values never enter source control.

### Threat model

| Threat | Mitigation |
|---|---|
| Stolen Web App URL → unauthorized API calls | URL injected at build time from Cloudflare env var; never committed |
| Stolen sheet ID → public write attempts | Sheet ID never leaves Google account; clasp uses Script ID, not Sheet ID |
| Credential leak in commit history | `.gitignore` covers `.env`, `.clasp.json`, `*.secrets.json` |
| Forked repos pointing at your backend | Web App access can be tightened to `Only myself` (frontend stops working publicly — accept tradeoff if needed) |
| Public PDF accumulation | Generated resume PDFs are share-by-link; periodically clean `tcgr.in_resumes/` |

### What's safe to commit

- All code in `apps-script/` (uses `_prop()` for runtime secret reads)
- `public/config.js` with **empty** `API_URL`
- `public/config.example.js`
- `.clasp.json.example` (template only)
- All schema definitions, fallback data, design assets

### What is never safe to commit

- `.clasp.json` (contains Apps Script project ID)
- Real `API_URL` in `public/config.js`
- Sheet IDs anywhere in code
- Slack webhooks, Datadog tokens, AI API keys
- Drive file IDs of internal documents

### Where secrets live

| Type | Location |
|---|---|
| Apps Script Web App URL | Cloudflare Pages env var (`API_URL`) |
| Sheet ID | Implicit (Apps Script container — not exposed) |
| Resume Doc IDs | `resumes` sheet `template_doc_id` column (sheet is private) |
| Future API tokens | Apps Script → Project Settings → **Script Properties** |
| `ADMIN_KEY` for cache-clear endpoint | Script Properties |

### CI guardrail

`.github/workflows/validate.yml` runs on every PR:
- HTML/JS syntax validation
- Regex secret-leak scan that flags real-shape Apps Script URLs (`AKfyc` + 50+ chars) — blocks accidental commits

Full hardening checklist in [`docs/SECURITY.md`](./docs/SECURITY.md).

---

## Design philosophy

The visual language is intentional, not decorative:

| Element | Maps to |
|---|---|
| Telemetry canvas (gold pulses traveling along grid) | Distributed traces moving through services |
| Terminal block in Contact section | Engineer-native communication channel |
| Signal-teal `#00d4aa` accent | Healthy-state monitoring color (Datadog, Grafana, Telescope) |
| `JetBrains Mono` for eyebrows, captions, terminal | Code is the native language |
| `Inter` for body (450 weight, fluid `clamp()` sizing) | Readable on dark UIs at any viewport |
| `Instrument Serif` italic for display headings | Editorial weight against the technical chrome |
| Pulse dots on status indicators | Heartbeat / health-check pattern |
| Glass cards with hover-lift | Console panel affordance |
| Reveal-on-scroll via `IntersectionObserver` | Lighter than GSAP; matches the "boring where it matters" rule |

The aesthetic borrows from monitoring dashboards and observability platforms (Linear, Vercel docs, Datadog, Grafana, Anthropic, Stripe Press) — not from generic portfolio templates.

---

## Tech notes

- **No framework** — plain HTML, Tailwind via Play CDN, vanilla JS. Loads fast, ages well.
- **No GSAP** — replaced with native `IntersectionObserver` + `requestAnimationFrame` after v1.1. Removes a CDN dependency.
- **Fluid typography** — `clamp(16px, 0.9vw + 13px, 18px)` scales root font from 16→18px across viewports. Lead text 17→21px. No media queries needed for size.
- **Counter animation** — binds via stable `id="metric-*"` selectors and a separate `data-target` attribute. Eliminates the v1.0 race condition where stats rendered as `0%`.
- **Three-tier hydration** — synchronous fallback first, then async refinement. The page is never empty for any frame.
- **Reduced-motion respected** — every animation gates behind `prefers-reduced-motion`.

---

## Roadmap

### Near-term

- Wire `template_doc_id` for all three resume formats (template Docs are ready, IDs need to be pasted into the `resumes` sheet)
- Replace monogram in the hero portrait card with a real photo (drop file at `public/assets/img/avatar.jpg`)
- Publish the three blog drafts currently in the `blogs` sheet (`status: draft` → `published`):
  - "Why Alert Quality Beats Alert Quantity"
  - "Multi-LLM Workflows in Production"
  - "7 Apps Script Mistakes I Made So You Don't Have To"

### Mid-term

- Self-host fonts and Tailwind output (drop CDN dependencies for full supply-chain control)
- Add `og:image` generation per page section (Cloudflare Workers + SVG → PNG)
- Sheet-driven blog renderer with Markdown body cells
- RSS feed generated from the `blogs` sheet

### Long-term

- Live observability widgets in the AI Lab section (real metrics from a personal Datadog account, scrubbed for sharing)
- Migrate Apps Script → Cloudflare Workers + Sheets API + KV when sustained traffic warrants it
- Open-source the architecture as a fork-ready template under a separate repo

---

## License

MIT — see `LICENSE`. The content (resume text, descriptions, lessons) is © Chandraguptha Reddy. The architecture, code, and design system are free to fork for your own portfolio.

---

## Credits

Designed and built solo, with care, by [Chandraguptha Reddy](https://www.linkedin.com/in/tcgr/).

If you fork this for your own portfolio, a link back is appreciated but not required.