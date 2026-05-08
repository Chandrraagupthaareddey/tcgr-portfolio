# Security model

This repo is **public on GitHub**. Anything committed here is visible to anyone, forever, including in commit history. The architecture below ensures sensitive values never end up in code.

## Threat model — what we protect against

| Threat | Mitigation |
|---|---|
| Stolen Apps Script Web App URL → unauthorized API calls | URL is injected at build time from Cloudflare env var; never committed |
| Stolen sheet ID → public write attempts | Sheet ID never leaves our Google account; clasp uses Script ID, not Sheet ID |
| Credential leak in commit history | `.gitignore` covers `.env`, `.clasp.json`, `*.secrets.json` |
| Forked repo clones running against our backend | Web App access can be tightened to `Only myself` if API_URL leaks (but then frontend stops working publicly — accept the tradeoff if needed) |
| Old PDFs / drafts in Drive being publicly readable | Generated PDFs are shared `Anyone with link can view` — if you need stricter, change the share level in `ResumeGenerator.js` |

## What's safe to commit

- ✅ All code in `apps-script/` — uses `_prop()` to read secrets at runtime, never hardcoded
- ✅ `public/config.js` with **empty** `API_URL` — overridden at build time
- ✅ `public/config.example.js` — pure template
- ✅ `.clasp.json.example` — template, no real script ID
- ✅ Schema definitions, fallback data, design assets

## What is NEVER safe to commit

- ❌ `.clasp.json` (contains our Apps Script project ID)
- ❌ Real `API_URL` value in `public/config.js`
- ❌ Sheet IDs anywhere in code
- ❌ Slack webhooks, Datadog tokens, AI API keys, OAuth secrets
- ❌ Drive file IDs of internal documents
- ❌ Personal email accounts in code (use the Sheet `contact` row instead)

## Where secrets live

| Type | Location | Visibility |
|---|---|---|
| Apps Script Web App URL | Cloudflare Pages env var (`API_URL`) | only visible to Cloudflare account owner |
| Sheet ID | implicit (Apps Script container — not exposed) | never in code |
| Resume Doc IDs | `resumes` sheet `template_doc_id` column | sheet is private to you |
| Future API tokens (Slack, Datadog) | Apps Script → Project Settings → **Script Properties** | never logged, never sent to client |
| `ADMIN_KEY` for cache-clear | Script Properties | never logged |

## Local development override

You'll want to test the live API locally without committing our URL.

```bash
# 1. Edit public/config.js with our real API_URL
# 2. Tell git to ignore future changes to this tracked file:
git update-index --skip-worktree public/config.js
```

After that, our local edits stay local. If you ever need git to track the file again:

```bash
git update-index --no-skip-worktree public/config.js
```

> ⚠️ Do not use `git rm --cached` on `config.js` — the build step needs the file to exist for static deployment.

## If you accidentally commit a secret

GitHub commits are *forever* — even after deletion, the value lives in commit history and can be retrieved by anyone with the commit hash.

**Treat any committed secret as compromised. Rotate it immediately.**

For an Apps Script Web App URL:
1. Apps Script editor → **Deploy → Manage deployments**
2. Archive the leaked deployment
3. Create a new deployment → new URL
4. Update Cloudflare env var with the new URL
5. Trigger a rebuild

Then optionally remove the leaked value from history with `git filter-repo` (advanced — be careful).

## Hardening checklist

- [ ] `.gitignore` includes `.clasp.json`, `.env*`, `*.secrets.json`
- [ ] No real `scriptId` in `.clasp.json.example`
- [ ] No real `API_URL` in `public/config.js` or `public/config.example.js`
- [ ] No phone numbers, email addresses, or personal data hardcoded in `apps-script/Code.js` (data lives in Sheet)
- [ ] Apps Script Web App is deployed with **Execute as: Me** (not the user) so visitors don't trigger their own auth
- [ ] Apps Script `oauthScopes` in `appsscript.json` are minimal — start with what's listed and only add more as needed
- [ ] `ADMIN_KEY` is set in Script Properties for cache-clear endpoint
- [ ] Generated résumé PDFs aren't accumulating indefinitely — periodically clean `tcgr.in_resumes/` folder

## Why not stricter access control on the Web App?

The frontend is public. The API is called from a public site. If we restrict the Web App to `Only myself`, the public site can't call it.

The realistic security boundary is:
- **The Web App is a read-only public API** that exposes only what's in our CMS Sheet (which you control)
- **The Sheet is private** — only you can write to it
- **Generated PDFs** are public-link (anyone with URL can view), which is the standard for résumé sharing

If you ever expose a write endpoint (e.g. contact form), gate it with a turnstile/captcha + an `ADMIN_KEY`-style server-side check, not by restricting Web App access.

## Dependency surface

| Source | Trust level | Why we accept it |
|---|---|---|
| `cdnjs.cloudflare.com/ajax/libs/gsap/...` | high | Cloudflare-served, content-hash addressed by version |
| `cdn.tailwindcss.com` | medium | First-party Tailwind CDN; consider self-hosting for prod |
| `fonts.googleapis.com` | high | Google's font service; tracked but no PII leakage |

**Hardening option**: download these locally to `public/assets/vendor/` for full offline / supply-chain control. Not done here for simplicity.
