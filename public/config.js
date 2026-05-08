/**
 * config.js — DEFAULT (committed) version.
 *
 * This file is intentionally committed with empty values so the site renders
 * with bundled fallback data on first load (e.g. local preview, fork).
 *
 * For production on Cloudflare Pages, this file is REGENERATED at build time
 * from environment variables — overriding these defaults. Your real API_URL
 * never lives in the repo.
 *
 * For local development with a live API, override locally:
 *   1. Edit this file with your URL
 *   2. Don't commit the change (use `git update-index --skip-worktree public/config.js`)
 */
window.PORTFOLIO_CONFIG = {
  API_URL: "",
  CACHE_TTL_MS: 6 * 60 * 60 * 1000,
  SITE_VERSION: "1.1.0",
  SHOW_FALLBACK_BANNER: false
};
