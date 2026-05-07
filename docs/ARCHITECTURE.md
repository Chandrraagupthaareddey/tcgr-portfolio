# Architecture

How the pieces fit together. Read this if you're forking, debugging, or extending.

## System diagram

```
┌──────────────────────────────────────────────────────────────────┐
│  AUTHOR  (you)                                                   │
│                                                                   │
│   1. Edit cells in Google Sheet  →  CMS                          │
│   2. Push code to GitHub         →  triggers Cloudflare deploy   │
│   3. Push backend with clasp     →  updates Apps Script          │
└──────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────────┐
│  GOOGLE WORKSPACE (private)                                      │
│  ┌─────────────────────┐    ┌─────────────────────────────────┐  │
│  │  Sheet (CMS)         │←──│  Apps Script (backend)          │  │
│  │  14 sheets, plain   │    │  - Code.js (router + readers)   │  │
│  │  rows               │    │  - Schemas.js (bootstrap)       │  │
│  │                     │    │  - ResumeGenerator.js (PDFs)    │  │
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
│  │  Static frontend                                        │     │
│  │  - public/index.html                                    │     │
│  │  - public/assets/app.js (renders, caches, falls back)   │     │
│  │  - public/config.js (built from env vars)               │     │
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

## Request lifecycle (page load)

1. Visitor hits `tcgr.in`
2. Cloudflare CDN serves `index.html` + `assets/app.js` + `config.js` (cached at edge)
3. `app.js` runs `App.init()`:
   - Tier 1: checks `localStorage` for cached payload (≤6h old) — if hit, render immediately, kick off background refresh
   - Tier 2: if no cache, calls `${API_URL}?action=all` → Apps Script Web App
   - Tier 3: if API fails or `API_URL` empty, render bundled `FALLBACK_DATA`
4. Apps Script:
   - Checks server-side `CacheService` for the `all` payload (≤6h)
   - If miss: reads all 14 sheets, transforms into the JSON shape the frontend expects, caches result
   - Returns JSON
5. Frontend renders templates, runs GSAP animations, attaches interactions

> **Cold start latency**: ~1.5–3s for first uncached fetch from Apps Script. After that, browser cache + edge cache make it instant.

## Why three caching tiers

| Tier | Lives in | TTL | Purpose |
|---|---|---|---|
| Browser localStorage | Visitor's browser | 6h | Repeat visits feel instant |
| Apps Script CacheService | Google's edge | 6h | One sheet read per 6h regardless of traffic |
| Bundled FALLBACK_DATA | Static asset | forever | Site never breaks if backend is down |

This is over-engineered for a personal portfolio — but it costs nothing and prevents quota issues if the site ever goes viral.

## Data shape contract

The frontend expects this exact shape from `?action=all`:

```js
{
  hero:            { intro, notice_period, ... },         // KV from `profile`
  about:           { body, ... },                          // KV from `about`
  contact:         { email, linkedin, location, ... },     // KV from `contact`
  metrics:         { years, mttr_improvement_pct, ... },   // KV from `metrics`
  timeline:        [ { year, role, company, ... } ],       // rows from `timeline`
  expertise:       [ { category, title, tools[], ... } ],  // rows, tools split into array
  projects:        [ { number, title, stack[], description[] } ],
  ai_capabilities: [ { label, title, description } ],
  lessons:         [ { number, title, problem, fix, impact } ],
  resumes:         [ { format, title, link, ... } ],
  skills:          [ { domain, skill, level, years } ],
  certifications:  [ { name, issuer, year, link } ],
  blogs:           [ { title, category, summary, status, ... } ],
  meta:            { generated_at, version, source }
}
```

If you change the schema, update both:
- `apps-script/Schemas.js` (sheet structure + seed data)
- `public/assets/app.js` (`FALLBACK_DATA` + render functions)

## Adding a new section

Say you want a "Speaking" section.

### 1. Add the schema

In `apps-script/Schemas.js`, add to `_SCHEMAS()`:

```js
speaking: {
  headers: ['title', 'venue', 'date', 'link', 'topic'],
  rows: [
    ['Building Reliable LLM Pipelines', 'SREcon APAC', '2025-09', '', 'AI/SRE']
  ]
}
```

Add `'speaking'` to the `SHEET_NAMES` array in `apps-script/Code.js`.

### 2. Run setup again

In Apps Script: run `setupSheets()` → adds the new tab without touching existing ones.

### 3. Wire the API

In `_getAllData()` in `Code.js`:

```js
speaking: _rowsFromSheet('speaking'),
```

### 4. Add fallback data

In `public/assets/app.js`, extend `FALLBACK_DATA.speaking = []`.

### 5. Render in HTML

Add a `<section id="speaking">` with a container element and a `<template>`.
Add a `_renderSpeaking()` method in `App` and call it from `_render()`.

That's it. Repeat for any future section.

## Why no framework

| Option | Why we didn't pick it |
|---|---|
| React | Bundling, hydration, build tooling — overkill for a static site |
| Vue / Svelte | Same |
| Astro / Next.js | Sheet-driven CMS doesn't benefit from SSG; we want runtime sheet pulls |
| 11ty / Hugo | Would require committing data files; defeats the "edit sheet, no commit" model |

Plain HTML + Tailwind + ~400 lines of vanilla JS does everything we need, loads faster than any framework, and will still work in 10 years.

## Why Apps Script (and not, say, Cloudflare Workers)

- **Free** — no payment method required
- **Native Sheet access** — no API key juggling
- **Built-in OAuth** — for Drive/Docs PDF generation
- **Caching primitive included** — `CacheService`
- **Container-bound** to the Sheet — schema setup is in the same project

The cost is cold-start latency (~1.5s). For a portfolio, that's fine.

If you ever outgrow Apps Script (~20 reads/sec sustained, larger payloads, or you need writes from public users), the migration target is **Cloudflare Workers + Sheets API + KV cache** — same architecture, faster runtime, more cost.

## Why Cloudflare Pages over Vercel/Netlify

- **No bandwidth limits** on free tier
- **DNS lives at the same provider** — one place to manage
- **Custom domain SSL** is automatic and instant
- **Preview deployments** for free on every PR

Vercel and Netlify are equally good — pick the one whose UI you prefer. The architecture works on any static host.
