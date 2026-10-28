/**
 * ============================================================================
 *  tcgr.in — Portfolio Backend (Google Apps Script)
 *  ============================================================================
 *  Architecture:
 *    Web App (this file)  → JSON API consumed by frontend
 *    Schemas.js           → sheet schema definitions + bootstrap
 *    ResumeGenerator.js   → on-demand PDF generation from Google Doc templates
 *
 *  Security:
 *    - No secrets in this code. All sensitive values live in Script Properties.
 *    - Configure via: Project Settings → Script Properties (in Apps Script editor).
 *
 *  Deploy:
 *    - clasp push && clasp deploy --description "v1.0.0"
 *    - Or manually: Deploy → New deployment → Web app → Anyone access
 *  ============================================================================
 */

// ============================================================================
//  CONFIG (read from Script Properties at runtime — see docs/SETUP.md)
// ============================================================================

// Sheet name → shape. 'kv' = key/value sheet; 'rows' = tabular;
// arrays = columns whose cells hold `;`-separated lists.
const SHEET_SPEC = {
  profile:        { kind: 'kv' },
  stats:          { kind: 'rows' },
  about:          { kind: 'kv' },
  about_facts:    { kind: 'rows' },
  marquee:        { kind: 'rows' },
  expertise:      { kind: 'rows', arrays: ['tools'] },
  projects:       { kind: 'rows', arrays: ['stack', 'description'] },
  timeline:       { kind: 'rows' },
  ai_patterns:    { kind: 'rows' },
  case:           { kind: 'kv' },
  case_meta:      { kind: 'rows' },
  principles:     { kind: 'rows' },
  ladder:         { kind: 'rows' },
  bench:          { kind: 'rows' },
  bench_facts:    { kind: 'rows' },
  components:     { kind: 'rows', arrays: ['stack', 'meta'] },
  value_props:    { kind: 'rows' },
  engagements:    { kind: 'rows' },
  skills:         { kind: 'rows' },
  certifications: { kind: 'rows' },  // columns: group, name, issuer, year, link  // columns: group, name, issuer, year, link
  lessons:        { kind: 'rows' },
  blogs:          { kind: 'rows' },
  profiles:       { kind: 'rows', arrays: ['evidence', 'skills'] },
  resumes:        { kind: 'rows' },
  contact:        { kind: 'kv' },
  copy:           { kind: 'kv' },
  meta:           { kind: 'kv' }
};
const SHEET_NAMES = Object.keys(SHEET_SPEC);

const CACHE_TTL_SECONDS = 1800; // 30 minutes — sheet edits go live within this window (or Clear Cache)

/**
 * Reads a property from Script Properties, with optional default.
 * Throws if the property is required and missing.
 */
function _prop(key, defaultValue) {
  const v = PropertiesService.getScriptProperties().getProperty(key);
  if (v === null && defaultValue === undefined) {
    throw new Error(`Missing required Script Property: ${key}`);
  }
  return v === null ? defaultValue : v;
}

// ============================================================================
//  WEB APP ENTRY POINT
// ============================================================================

/**
 * Main router. Supported actions:
 *   ?action=all              → full payload (used by frontend)
 *   ?action=projects         → just projects, etc. for any sheet
 *   ?action=resume&id=INT-01 → generates resume PDF, returns { url }
 *   ?action=health           → simple health check { ok: true }
 *   ?action=clear_cache      → admin: clears server cache (requires &key=ADMIN_KEY)
 */
function doGet(e) {
  const params = (e && e.parameter) || {};
  const action = params.action || 'all';

  try {
    let payload;

    switch (action) {
      case 'health':
        payload = { ok: true, ts: new Date().toISOString() };
        break;

      case 'clear_cache':
        if (params.key !== _prop('ADMIN_KEY', '')) {
          payload = { error: 'Unauthorized' };
          break;
        }
        CacheService.getScriptCache().removeAll(SHEET_NAMES.concat(['all']));
        payload = { ok: true, message: 'Cache cleared' };
        break;

      case 'resume':
        payload = generateResumePDF(params.id || 'INT-01', { fresh: params.fresh === '1' }); // ResumeGenerator.js
        break;

      case 'all':
        payload = _getAllData();
        break;

      default:
        if (SHEET_NAMES.indexOf(action) !== -1) {
          payload = _getSheetData(action);
        } else {
          payload = { error: `Unknown action: ${action}` };
        }
    }

    return _jsonResponse(payload);
  } catch (err) {
    console.error('doGet error:', err.stack || err.message);
    return _jsonResponse({ error: err.message });
  }
}

function _jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================================
//  DATA AGGREGATION — shaped exactly as the frontend expects
// ============================================================================

function _getAllData() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get('all');
  if (cached) return JSON.parse(cached);

  const data = {};
  SHEET_NAMES.forEach(name => { data[name] = _readSheet(name); });

  // `marquee` is a one-column list → flatten to array of strings for the frontend.
  if (Array.isArray(data.marquee)) data.marquee = data.marquee.map(r => r.item).filter(Boolean);

  data.meta = Object.assign({}, data.meta || {}, {
    generated_at: new Date().toISOString(),
    source: 'apps-script-cms',
    version: _prop('SITE_VERSION', '2.0.0')
  });

  try {
    cache.put('all', JSON.stringify(data), CACHE_TTL_SECONDS);
  } catch (e) {
    console.warn('Cache put failed (payload too large?):', e.message);
  }
  return data;
}

/** Reads one sheet according to SHEET_SPEC. */
function _readSheet(name) {
  const spec = SHEET_SPEC[name] || { kind: 'rows' };
  if (spec.kind === 'kv') return _kvFromSheet(name);
  return spec.arrays ? _rowsWithArrays(name, spec.arrays) : _rowsFromSheet(name);
}

function _getSheetData(name) {
  const cache = CacheService.getScriptCache();
  const cached = cache.get(name);
  if (cached) return JSON.parse(cached);
  const data = _readSheet(name);
  try { cache.put(name, JSON.stringify(data), CACHE_TTL_SECONDS); } catch (e) {}
  return data;
}

// ============================================================================
//  SHEET READERS
// ============================================================================

/**
 * Reads a `key | value` sheet (col A = key, col B = value).
 * Used for single-record sheets: profile, about, contact, metrics.
 */
function _kvFromSheet(name) {
  const sh = _activeSheet(name);
  if (!sh) return {};
  const values = sh.getDataRange().getValues();
  const out = {};
  for (let i = 1; i < values.length; i++) {
    const k = String(values[i][0] || '').trim();
    const v = values[i][1];
    if (k) out[k] = (v === '' || v === null) ? null : v;
  }
  return out;
}

/**
 * Reads a tabular sheet → array of objects keyed by header row.
 */
function _rowsFromSheet(name) {
  const sh = _activeSheet(name);
  if (!sh) return [];
  const values = sh.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(h => String(h).trim());
  const out = [];

  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    if (row.every(c => c === '' || c === null)) continue; // skip blank rows
    const obj = {};
    headers.forEach((h, j) => {
      if (h) obj[h] = (row[j] === '' || row[j] === null) ? null : row[j];
    });
    out.push(obj);
  }
  return out;
}

/**
 * Like _rowsFromSheet, but splits multi-value cells (separated by `;` or `|`)
 * into JS arrays for the columns named in `arrayCols`.
 */
function _rowsWithArrays(name, arrayCols) {
  const rows = _rowsFromSheet(name);
  return rows.map(r => {
    arrayCols.forEach(c => {
      if (r[c] && typeof r[c] === 'string') {
        r[c] = r[c].split(/[;|]/).map(s => s.trim()).filter(Boolean);
      } else if (!r[c]) {
        r[c] = [];
      }
    });
    return r;
  });
}

function _activeSheet(name) {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
}

// ============================================================================
//  ADMIN MENU + UTILITIES
// ============================================================================

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🛠 tcgr.in CMS')
    .addItem('Initialize / Update Schema (adds missing sheets)', 'setupSheets')
    .addItem('Reseed ONE sheet from Schemas (overwrite)…', 'adminReseedOne')
    .addItem('Reseed ALL sheets from Schemas (overwrite!)', 'adminReseedAll')
    .addSeparator()
    .addItem('Scan content for private terms', 'adminScanPrivateTerms')
    .addSeparator()
    .addItem('Clear Cache (force fresh fetch)', 'adminClearCache')
    .addItem('Test API: Preview Payload', 'adminPreviewPayload')
    .addSeparator()
    .addItem('Generate Resume: International', 'adminGenerateResumeINT')
    .addItem('Generate Resume: Gulf', 'adminGenerateResumeGULF')
    .addItem('Generate Resume: India', 'adminGenerateResumeIN')
    .addToUi();
}

function adminClearCache() {
  CacheService.getScriptCache().removeAll(SHEET_NAMES.concat(['all']));
  SpreadsheetApp.getActiveSpreadsheet().toast('Cache cleared ✓', 'tcgr.in CMS', 3);
}

function adminPreviewPayload() {
  const data = _getAllData();
  const html = HtmlService.createHtmlOutput(
    '<pre style="font-family:monospace;font-size:11px;line-height:1.5;">' +
    JSON.stringify(data, null, 2).replace(/[<>&]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[c])) +
    '</pre>'
  ).setWidth(900).setHeight(700);
  SpreadsheetApp.getUi().showModalDialog(html, 'API Output Preview');
}

/** Overwrites one sheet with its seed rows from Schemas.js (prompts for the name). */
function adminReseedOne() {
  const ui = SpreadsheetApp.getUi();
  const r = ui.prompt('Reseed sheet', 'Sheet name to overwrite from Schemas.js:\n' + SHEET_NAMES.join(', '), ui.ButtonSet.OK_CANCEL);
  if (r.getSelectedButton() !== ui.Button.OK) return;
  const name = r.getResponseText().trim();
  if (SHEET_NAMES.indexOf(name) === -1) { ui.alert('Unknown sheet: ' + name); return; }
  reseedSheet(name);
  adminClearCache();
  ui.alert('Reseeded "' + name + '" ✓');
}

/** Overwrites EVERY sheet with seed data. Destructive — confirms first. */
function adminReseedAll() {
  const ui = SpreadsheetApp.getUi();
  const r = ui.alert('Reseed ALL sheets?', 'This overwrites every tab with the seed data in Schemas.js. Your edits will be lost. Continue?', ui.ButtonSet.YES_NO);
  if (r !== ui.Button.YES) return;
  SHEET_NAMES.forEach(reseedSheet);
  adminClearCache();
  ui.alert('All sheets reseeded ✓');
}

/**
 * Scans every cell for terms that must never appear on the public site
 * (configure as a comma-separated list in Script Property PRIVATE_TERMS).
 * Reports sheet!cell for each hit so you can fix it before clearing cache.
 */
function adminScanPrivateTerms() {
  const ui = SpreadsheetApp.getUi();
  const terms = _prop('PRIVATE_TERMS', '').split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
  if (!terms.length) { ui.alert('Set Script Property PRIVATE_TERMS (comma-separated) first.'); return; }
  const hits = [];
  SpreadsheetApp.getActiveSpreadsheet().getSheets().forEach(sh => {
    const vals = sh.getDataRange().getValues();
    vals.forEach((row, i) => row.forEach((cell, j) => {
      const txt = String(cell || '').toLowerCase();
      terms.forEach(t => { if (txt.indexOf(t) !== -1) hits.push(sh.getName() + '!' + sh.getRange(i + 1, j + 1).getA1Notation() + ' → "' + t + '"'); });
    }));
  });
  ui.alert(hits.length ? 'Private terms found:\n\n' + hits.join('\n') : 'Clean — no private terms found ✓');
}

function adminGenerateResumeINT()  { _adminGenResume('INT-01');  }
function adminGenerateResumeGULF() { _adminGenResume('GULF-01'); }
function adminGenerateResumeIN()   { _adminGenResume('IN-01');   }

function _adminGenResume(id) {
  const result = generateResumePDF(id, { fresh: true });
  const ui = SpreadsheetApp.getUi();
  if (result.error) {
    ui.alert('Error', result.error, ui.ButtonSet.OK);
  } else {
    ui.alert('Resume generated', 'Format: ' + result.format + '\n\nDownload URL:\n' + result.url, ui.ButtonSet.OK);
  }
}
