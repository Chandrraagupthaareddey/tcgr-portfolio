/**
 * config.example.js
 *
 * Copy this file to `config.js` and fill in your values.
 * `config.js` is gitignored — it is the only file containing your deployment URL.
 *
 * On Cloudflare Pages, this file is generated at build time from environment
 * variables (see docs/DEPLOYMENT.md → "Build command").
 */
window.PORTFOLIO_CONFIG = {
  /**
   * Your deployed Apps Script Web App URL.
   * Format: https://script.google.com/macros/s/AKfycbx.../exec
   *
   * Leave empty in development — site will use bundled fallback data.
   */
  API_URL: "",

  /**
   * Client-side cache TTL in milliseconds.
   * Default: 6 hours. Lower this during active editing to see updates faster.
   */
  CACHE_TTL_MS: 6 * 60 * 60 * 1000,

  /**
   * Site version — shown in footer. Bump on meaningful releases.
   */
  SITE_VERSION: "1.0.0",

  /**
   * If true, shows a small banner when the site is rendering from
   * fallback data instead of live API. Useful for debugging.
   */
  SHOW_FALLBACK_BANNER: false
};
