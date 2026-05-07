# Setup — first time

End-to-end: from empty machine to live site at `tcgr.in`. Plan ~30 minutes.

## Prerequisites

- A Google account (the one that will own the Sheet + Apps Script)
- A GitHub account
- A Cloudflare account (free)
- The `tcgr.in` domain registered (any registrar)
- Node.js installed locally (for `clasp`)

---

## Part 1 — Create the CMS Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) → **+ Blank**
2. Rename: **`tcgr.in — CMS`**
3. **Extensions → Apps Script** opens the script editor in a new tab
4. You can either paste code manually here, OR use clasp from your machine (recommended — see Part 2)

> Keep this Sheet's URL handy. The script ID lives in: **Project Settings (⚙) → Script ID** in the Apps Script editor.

---

## Part 2 — Push the backend with clasp

```bash
# Install clasp globally
npm install -g @google/clasp

# Authenticate with Google
clasp login

# In the repo root:
cp .clasp.json.example .clasp.json
```

Edit `.clasp.json` and paste your **Script ID** from the previous step:

```json
{
  "scriptId": "1AbCdEf...long_id_here",
  "rootDir": "./apps-script"
}
```

Push the code:

```bash
clasp push
```

This uploads `Code.js`, `Schemas.js`, `ResumeGenerator.js`, and `appsscript.json` to your Apps Script project.

> If clasp asks you to enable the Apps Script API, do so at [script.google.com/home/usersettings](https://script.google.com/home/usersettings).

---

## Part 3 — Bootstrap the schema

1. Open the Apps Script editor (Sheet → Extensions → Apps Script)
2. In the function dropdown at the top, select **`setupSheets`**
3. Click **Run**
4. Authorize when prompted (Google warns "unverified app" — choose Advanced → Go to project)
5. Refresh the Sheet tab — you'll see all 14 sheets created with seed data
6. The custom menu **🛠 tcgr.in CMS** appears in the Sheet menu bar

> All your CV data is already pre-populated. Edit cells to customize.

---

## Part 4 — Configure Script Properties (security)

Apps Script → **Project Settings (⚙) → Script Properties → Add property**

| Key | Value | Required? |
|---|---|---|
| `SITE_VERSION` | `1.0.0` | optional |
| `ADMIN_KEY` | a random string (e.g. `openssl rand -hex 16`) | optional, used for cache-clear endpoint |

> No sensitive values needed yet. Future integrations (Slack webhook, Datadog token) go here, never in code.

---

## Part 5 — Deploy the Apps Script as a Web App

In the Apps Script editor:

1. **Deploy → New deployment**
2. Click ⚙ next to "Select type" → **Web app**
3. Configure:
   - **Description:** `tcgr.in v1.0.0`
   - **Execute as:** `Me`
   - **Who has access:** `Anyone`
4. Click **Deploy**
5. **Copy the Web app URL** — looks like:
   ```
   https://script.google.com/macros/s/AKfycb.../exec
   ```
6. Test it in a browser:
   ```
   https://script.google.com/macros/s/AKfycb.../exec?action=health
   → { "ok": true, "ts": "..." }
   ```

> ⚠️ **Every code change requires a new deployment version.** Sheet edits do NOT — they go live within 6 hours (or immediately on cache clear).

---

## Part 6 — Configure the frontend

For local development:

```bash
# Edit public/config.js with your Web App URL
# (don't commit this — see Part 8)
```

For Cloudflare Pages deployment, the URL goes into env vars (next part).

---

## Part 7 — Cloudflare Pages deployment

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for the full Cloudflare Pages walkthrough.

The short version:

1. Push this repo to GitHub
2. Cloudflare Dashboard → Pages → Create Project → Connect to GitHub
3. Build settings:
   - **Build command:** `sh build.sh`
   - **Build output directory:** `public`
4. Environment variables:
   - `API_URL` = your Apps Script Web App URL
   - `SITE_VERSION` = `1.0.0`
5. Deploy → Cloudflare assigns `*.pages.dev` URL
6. Add custom domain `tcgr.in` in Pages settings

---

## Part 8 — Local override (don't commit your URL)

Once you have a real `API_URL`, you'll want to test the live API locally without committing the URL.

```bash
# Tell git to ignore changes to config.js even though it's tracked:
git update-index --skip-worktree public/config.js

# Now edit public/config.js with your API_URL — git won't track it.
```

To undo this later:
```bash
git update-index --no-skip-worktree public/config.js
```

> See [`SECURITY.md`](./SECURITY.md) for the full security model.

---

## Part 9 — (Optional) Wire up résumé PDF generation

1. Create three Google Docs — one per format (International, Gulf, India)
2. Use placeholders in each: `{{name}}`, `{{role}}`, `{{intro}}`, `{{experience_block}}`, `{{skills_block}}`, `{{contact_block}}`
3. Copy each Doc's ID from its URL (the long string between `/d/` and `/edit`)
4. Paste each ID into the matching row of the `resumes` sheet, `template_doc_id` column
5. Test from the Sheet menu: **🛠 tcgr.in CMS → Generate Resume: International**

A PDF appears in your Drive at `tcgr.in_resumes/`. The frontend will fetch it via `?action=resume&id=INT-01`.

---

## Verification checklist

- [ ] Sheet has all 14 tabs with data
- [ ] `clasp push` works without errors
- [ ] Apps Script deployed as Web App (Anyone access)
- [ ] `?action=health` returns `{ ok: true }`
- [ ] `?action=all` returns full payload
- [ ] Cloudflare Pages site loads
- [ ] Site shows your data (not fallback) — check by editing a cell and clearing cache
- [ ] Custom domain `tcgr.in` resolves with valid SSL

When all boxes are checked, you're live. Edit the Sheet to change anything.
