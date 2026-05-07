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

const SHEET_NAMES = [
  'profile', 'about', 'timeline', 'expertise', 'projects',
  'ai_capabilities', 'lessons', 'resumes', 'contact', 'metrics',
  'skills', 'certifications', 'blogs', 'meta'
];

const CACHE_TTL_SECONDS = 21600; // 6 hours

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
        payload = generateResumePDF(params.id || 'INT-01'); // defined in ResumeGenerator.js
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

  const data = {
    hero:            _kvFromSheet('profile'),
    about:           _kvFromSheet('about'),
    contact:         _kvFromSheet('contact'),
    metrics:         _kvFromSheet('metrics'),
    timeline:        _rowsFromSheet('timeline'),
    expertise:       _rowsWithArrays('expertise', ['tools']),
    projects:        _rowsWithArrays('projects', ['stack', 'description']),
    ai_capabilities: _rowsFromSheet('ai_capabilities'),
    lessons:         _rowsFromSheet('lessons'),
    resumes:         _rowsFromSheet('resumes'),
    skills:          _rowsFromSheet('skills'),
    certifications:  _rowsFromSheet('certifications'),
    blogs:           _rowsFromSheet('blogs'),
    meta: {
      generated_at: new Date().toISOString(),
      source: 'apps-script-cms',
      version: _prop('SITE_VERSION', '1.0.0')
    }
  };

  try {
    cache.put('all', JSON.stringify(data), CACHE_TTL_SECONDS);
  } catch (e) {
    console.warn('Cache put failed (payload too large?):', e.message);
  }
  return data;
}

function _getSheetData(name) {
  const cache = CacheService.getScriptCache();
  const cached = cache.get(name);
  if (cached) return JSON.parse(cached);

  let data;
  if (['profile', 'about', 'contact', 'metrics'].indexOf(name) !== -1) {
    data = _kvFromSheet(name);
  } else if (name === 'projects') {
    data = _rowsWithArrays('projects', ['stack', 'description']);
  } else if (name === 'expertise') {
    data = _rowsWithArrays('expertise', ['tools']);
  } else {
    data = _rowsFromSheet(name);
  }

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
    .addItem('Initialize / Update Schema', 'setupSheets')
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

function adminGenerateResumeINT()  { _adminGenResume('INT-01');  }
function adminGenerateResumeGULF() { _adminGenResume('GULF-01'); }
function adminGenerateResumeIN()   { _adminGenResume('IN-01');   }

function _adminGenResume(id) {
  const result = generateResumePDF(id);
  const ui = SpreadsheetApp.getUi();
  if (result.error) {
    ui.alert('Error', result.error, ui.ButtonSet.OK);
  } else {
    ui.alert('Resume generated', 'Format: ' + result.format + '\n\nDownload URL:\n' + result.url, ui.ButtonSet.OK);
  }
}
