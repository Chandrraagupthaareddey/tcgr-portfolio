<div align="center">

# tcgr.in

#### Personal engineering site — sheet-driven, statically hosted, no framework.

**[tcgr.in →](https://tcgr.in)** · **[Role fit →](https://tcgr.in/profiles.html)**

`Cloudflare Pages` · `Google Apps Script` · `Google Sheets CMS` · `Vanilla JS` · `Hand-written CSS`

</div>

---

## What this is

The portfolio of **Chandraguptha Reddy** — Senior Staff SRE working on AI-augmented operations: alert triage that cites its evidence, cost-ordered model routing, and agents that never act without a human's approval.

The site is a small working artifact of the same principles:

- **Sheet-driven CMS** — every section renders from a Google Sheet; edit a cell, see it live within 30 minutes (or instantly after *Clear Cache*).
- **Static-first** — Cloudflare's edge serves HTML/CSS/JS; the Apps Script API is enhancement, not a dependency.
- **Three-tier fallback** — bundled snapshot → browser cache → live API. The page is never empty, and it tells you which tier it rendered from (the *runtime* panel in the hero is real telemetry, not decoration).
- **Public repo, private data** — URLs and IDs live in environment variables and Script Properties; a CI scan blocks private terms from ever reaching the public site.

## v2.0 — what changed

| Area | v1 | v2 |
|---|---|---|
| Styling | Tailwind Play CDN (runtime JIT) | `assets/styles.css`, hand-written, light + dark themes |
| Live data | Background refresh fetched then **discarded**; 6 h caches | Refresh result applied when content changes; 30 min caches; `?refresh=1` bypass; content revision shown |
| Resume download | `window.open` after `await` → popup-blocked | Tab opened synchronously, then navigated; static `link` column wins; one PDF per format per day reused |
| Mobile nav | Depended on CDN loading first | Plain CSS/JS; verified at 390 px |
| Marquee | Hand-duplicated markup | JS builds two identical tracks → seamless loop at any width |
| Content | Employer-specific | Generalised; current role described by industry and scale |
| Sections | 8 | About · Expertise & work · Journey · **AI Lab** (patterns + **OIP case study**) · Value to a business · Skills & certifications · Knowledge · Resume · Contact |
| Pages | 1 | `index.html` + **`profiles.html`** (role fit: Forward Deployed Engineer, AIOps, Staff SRE, AI platform, automation) |
| Extras | — | ⌘K command palette, scroll-spy nav, copy-email, JSON-LD, `_headers`, `robots.txt`, `sitemap.xml` |
| Backend | 14 sheets, manual seeds | 27 sheets; `Schemas.js` **generated** from `FALLBACK_DATA`; reseed-from-code; private-terms scan |

## Architecture

```
Author ──edit cells──▶ Google Sheet (27 tabs) ◀── Apps Script (Code.js · Schemas.js · ResumeGenerator.js)
                                                        │  /exec?action=all   (JSON, 30-min CacheService)
                                                        ▼
Visitor ──▶ Cloudflare Pages ──▶ index.html · profiles.html · assets/{styles.css, app.js} · config.js
                                        │
                                        ├─ paint 0: bundled FALLBACK_DATA (instant)
                                        ├─ tier 1: localStorage (≤30 min) → render, revalidate in background
                                        └─ tier 2: live API → re-render only if content revision changed
```

`config.js` is regenerated at build time by `build.sh` from Cloudflare environment variables (`API_URL`, `SITE_VERSION`, `CACHE_TTL_MS`). The committed copy has an empty `API_URL`, so forks render the bundled snapshot.

## Repo layout

```
public/
  index.html            main page (templates + static copy)
  profiles.html         role-fit page (driven by the `profiles` sheet)
  assets/styles.css     design system (tokens, themes, components)
  assets/app.js         FALLBACK_DATA + renderers + cache + interactions
  assets/img/           drop avatar.jpg here (see README inside)
  config.js             runtime config (regenerated at deploy)
  _headers · robots.txt · sitemap.xml
apps-script/
  Code.js               router, sheet readers, cache, admin menu
  Schemas.js            GENERATED — sheet schemas + seed rows
  ResumeGenerator.js    PDF generation from Doc templates (or static link)
tools/
  gen-schemas.js        FALLBACK_DATA → Schemas.js
  scan-private.sh       fails CI if a private term appears in public files
  private-terms.txt     the list it checks
docs/                   SETUP · DEPLOYMENT · ARCHITECTURE · SECURITY
.github/workflows/      HTML/JS checks, schema-sync check, secret + private-term scans
```

## Content model (sheets)

Key/value sheets: `profile` `about` `case` `contact` `copy` `meta`.
Row sheets: `stats` `about_facts` `marquee` `expertise` `projects` `timeline` `ai_patterns` `case_meta` `principles` `ladder` `bench` `bench_facts` `components` `value_props` `engagements` `skills` `certifications` `lessons` `blogs` `resumes` `profiles`.

Cells that hold lists (`tools`, `stack`, `description`, `meta`, `evidence`, `skills`) are `;`-separated. Headline cells may contain `<em>` and `<br>`; everything else is rendered as text. `copy` holds section headlines/ledes keyed like `ai.headline`.

### Editing workflow

1. Edit the Sheet.
2. `🛠 tcgr.in CMS → Clear Cache` to publish immediately (otherwise ≤30 min).
3. Nothing to commit or deploy.

### Changing the *shape* of content

1. Edit `FALLBACK_DATA` in `public/assets/app.js` (and the renderer/template if it's a new field).
2. `node tools/gen-schemas.js` → regenerates `apps-script/Schemas.js`.
3. Add the sheet to `SHEET_SPEC` in `Code.js` if it's new.
4. `clasp push`, then `🛠 → Initialize / Update Schema` (adds missing tabs) or `Reseed ONE sheet…` (overwrite).

## Local development

```bash
cd public && python3 -m http.server 8000     # renders the bundled snapshot
node tools/gen-schemas.js                    # keep Schemas.js in sync
bash tools/scan-private.sh                   # what CI will run
```

## Deploy

Cloudflare Pages: build command `sh build.sh`, output `public`, env `API_URL` = Apps Script `/exec` URL, `SITE_VERSION` = `2.0.0`. Details in [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

Apps Script: `clasp push`, then **Deploy → Manage deployments → Edit → New version**. Code changes need a new version; sheet edits do not.

## Security

Public repo. Nothing sensitive is committed: no Web App URL, no sheet or script IDs (`.clasp.json` is gitignored; copy `.clasp.json.example`), no tokens. CI runs a secret-shape scan and a private-terms scan on every push. See [`docs/SECURITY.md`](docs/SECURITY.md).

## License

MIT for the code and design system. The written content is © Chandraguptha Reddy.
