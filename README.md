<div align="center">

# tcgr.in

#### Personal engineering identity platform — sheet-driven, statically hosted, AI-augmented.

**[tcgr.in →](https://tcgr.in)**

`Cloudflare Pages` · `Google Apps Script` · `Google Sheets CMS`

</div>

---

## What this is

A premium public portfolio for **Chandraguptha Reddy** — Senior Staff Engineer (SRE).

Built so that updating the website is as simple as editing a Google Sheet. No code commits, no redeploys, no CMS subscriptions.

```
Google Sheet (CMS)
      ↓
Google Apps Script (JSON API + 6h cache)
      ↓
Static frontend on Cloudflare Pages
      ↓
tcgr.in
```

## Why this architecture

| Concern | Solution |
|---|---|
| Update content fast | Edit sheet → site refreshes within 6h (or instantly via cache clear) |
| Zero hosting cost | Cloudflare Pages free tier · Apps Script free tier · Sheets free |
| Public repo, private data | Sheet IDs and deploy URLs live in env vars, never in code |
| Custom domain | Cloudflare Pages → tcgr.in with auto SSL |
| Future-proof | Backend is swappable; frontend is plain HTML/JS/Tailwind |

## Repo structure

```
.
├── public/                      # ← Cloudflare Pages serves this directory
│   ├── index.html               # Single-page entry
│   ├── config.js                # Runtime config (regenerated at build)
│   ├── config.example.js        # Template
│   └── assets/
│       └── app.js               # Rendering logic + fallback data
│
├── apps-script/                 # ← Backend (managed by clasp)
│   ├── Code.js                  # Routing, API, caching
│   ├── Schemas.js               # Sheet bootstrap + seed data
│   ├── ResumeGenerator.js       # PDF generation from Doc templates
│   └── appsscript.json          # Manifest (scopes, runtime)
│
├── docs/
│   ├── SETUP.md                 # First-time setup walkthrough
│   ├── DEPLOYMENT.md            # Cloudflare Pages + custom domain
│   ├── ARCHITECTURE.md          # How the pieces fit together
│   └── SECURITY.md              # What's safe to commit, what isn't
│
├── .github/workflows/
│   └── validate.yml             # CI: HTML/JS validation on PRs
│
├── .clasp.json.example          # Template — copy to .clasp.json (gitignored)
├── .gitignore                   # Strict — see SECURITY.md
└── README.md
```

## Quickstart

> Full walkthrough lives in [`docs/SETUP.md`](./docs/SETUP.md). The short version:

```bash
# 1. Clone
git clone https://github.com/tcgr-in/portfolio.git
cd portfolio

# 2. Install clasp (Apps Script CLI)
npm install -g @google/clasp

# 3. Auth + create your CMS Sheet, then push the backend
clasp login
cp .clasp.json.example .clasp.json   # then paste your scriptId
clasp push

# 4. In the Apps Script editor: run setupSheets() once to seed data
# 5. Deploy the Apps Script as a Web App (Anyone access) — copy the URL
# 6. Set the URL in Cloudflare Pages env var: API_URL
# 7. Connect this repo to Cloudflare Pages → it auto-deploys
```

## Updating content

1. Open the CMS Sheet
2. Edit any cell — `expertise`, `projects`, `timeline`, `lessons`, etc.
3. (Optional) Click **🛠 tcgr.in CMS → Clear Cache** to push live immediately
4. Done. No git, no deploy.

## Local development

```bash
# Serve public/ locally — any static server works:
cd public && python3 -m http.server 8000

# Or with Node:
npx serve public
```

Open `http://localhost:8000`. The site renders with bundled fallback data when `config.js` has an empty `API_URL` — useful for design iteration.

## Tech choices, briefly

- **No framework** — plain HTML, Tailwind via CDN, vanilla JS. Loads fast, never goes stale.
- **GSAP** for scroll animations because the alternatives (AOS, Framer Motion via React) cost more than they're worth here.
- **Editorial typography** — Instrument Serif (display), Geist (body), JetBrains Mono (code). Distinctive without being cliché.
- **Three-tier data fallback** — localStorage cache → live API → bundled fallback. Site never breaks even if everything else is down.

## License

MIT — see `LICENSE`. The content (résumé text, descriptions) is © Chandraguptha Reddy. The architecture and code are free to fork for your own portfolio.

## Credits

Designed and built solo, with care, by [Chandraguptha Reddy](https://www.linkedin.com/in/tcgr/).
