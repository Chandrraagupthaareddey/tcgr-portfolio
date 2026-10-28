/**
 * ============================================================================
 *  ResumeGenerator.js — On-demand PDF resume generation
 *  ============================================================================
 *  Workflow:
 *    1. Create a Google Doc resume template with placeholders: {{name}}, {{role}},
 *       {{intro}}, {{experience_block}}, {{skills_block}}, {{projects_block}},
 *       {{certifications_block}}, {{generated_date}} plus any key from the
 *       `profile` / `contact` sheets (e.g. {{email}}, {{linkedin}}).
 *    1b. OR skip generation entirely: paste a public PDF URL in the `link`
 *       column of the `resumes` sheet. The frontend opens it directly.
 *    1c. OR do nothing: with no link and no template_doc_id the PDF is built
 *       directly from the Sheet data (profile, contact, timeline, projects,
 *       skills, certifications). One PDF per format per day is reused.
 *    2. Copy the Doc ID from its URL.
 *    3. Paste it into the `template_doc_id` column of the `resumes` sheet for
 *       the matching format (INT-01, GCC-01, IN-01).
 *    4. Frontend calls ?action=resume&id=INT-01 → returns { url } to PDF.
 *
 *  Generated PDFs are stored in a Drive folder (auto-created) and shared as
 *  "anyone with link can view". Old PDFs accumulate — clean periodically.
 *  ============================================================================
 */

const RESUME_FOLDER_NAME = 'tcgr.in_resumes';

function generateResumePDF(formatId, opts) {
  opts = opts || {};
  if (!formatId) return { error: 'Missing format id' };

  // 1. Find the format in `resumes` sheet
  const resumes = _rowsFromSheet('resumes');
  const meta = resumes.find(r => String(r.format).toUpperCase() === String(formatId).toUpperCase());
  if (!meta) return { error: `Unknown resume format: ${formatId}` };

  // 1a. A static `link` wins — no generation needed (fastest, most reliable path).
  if (meta.link && String(meta.link).trim() && String(meta.link).trim() !== '#') {
    return { ok: true, format: meta.format, title: meta.title, url: String(meta.link).trim(), download_url: String(meta.link).trim(), cached: true };
  }
  // 1c. No template → build the PDF directly from Sheet data (zero-config path).
  if (!meta.template_doc_id) {
    return _generateFromData(meta, opts);
  }

  // 1b. Reuse today's PDF if one exists — one Drive copy per format per day, unless opts.fresh.
  const stamp = new Date().toISOString().slice(0, 10);
  const pdfName = `Resume_${meta.format}_${stamp}.pdf`;
  if (!opts.fresh) {
    const existing = _getOrCreateFolder(RESUME_FOLDER_NAME).getFilesByName(pdfName);
    if (existing.hasNext()) {
      const f = existing.next();
      return { ok: true, format: meta.format, title: meta.title, url: 'https://drive.google.com/file/d/' + f.getId() + '/view', download_url: 'https://drive.google.com/uc?export=download&id=' + f.getId(), cached: true };
    }
  }

  // 2. Gather data
  const profile  = _kvFromSheet('profile');
  const contact  = _kvFromSheet('contact');
  const timeline = _rowsFromSheet('timeline');
  const skills   = _rowsFromSheet('skills');
  const certs    = _rowsFromSheet('certifications');
  const projects = _rowsWithArrays('projects', ['stack', 'description']);

  let copy, doc;
  try {
    // 3. Copy template
    copy = DriveApp.getFileById(meta.template_doc_id).makeCopy(
      `Resume_${meta.format}_${stamp}`
    );
    doc = DocumentApp.openById(copy.getId());
    const body = doc.getBody();

    // 4. Replace simple {{key}} placeholders
    Object.keys(profile).forEach(k => body.replaceText(`{{${k}}}`, _safeStr(profile[k])));
    Object.keys(contact).forEach(k => body.replaceText(`{{${k}}}`, _safeStr(contact[k])));

    // 5. Replace block placeholders
    body.replaceText('{{experience_block}}', _formatExperience(timeline));
    body.replaceText('{{skills_block}}',     _formatSkills(skills));
    body.replaceText('{{certifications_block}}', _formatCerts(certs));
    body.replaceText('{{projects_block}}',       _formatProjects(projects));
    body.replaceText('{{generated_date}}',   new Date().toISOString().slice(0, 10));

    doc.saveAndClose();

    // 6. Convert to PDF and place in shared folder
    const pdfBlob = copy.getAs('application/pdf');
    const folder = _getOrCreateFolder(RESUME_FOLDER_NAME);
    const pdfFile = folder.createFile(pdfBlob).setName(pdfName);
    pdfFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    // 7. Cleanup the temporary doc copy
    copy.setTrashed(true);

    return {
      ok: true,
      format: meta.format,
      title: meta.title,
      url: 'https://drive.google.com/file/d/' + pdfFile.getId() + '/view',
      download_url: 'https://drive.google.com/uc?export=download&id=' + pdfFile.getId(),
      generated_at: new Date().toISOString()
    };
  } catch (err) {
    if (copy) try { copy.setTrashed(true); } catch (e) {}
    return { error: err.message };
  }
}

// ============================================================================
//  ZERO-CONFIG PATH — HTML resume rendered from Sheet data → PDF
//  Formats: INT-01 (ATS, two pages), GCC-01 (adds nationality / visa /
//  availability block), IN-01 (adds full project breakdowns + skills matrix).
//  No salary information is ever included.
// ============================================================================

function _generateFromData(meta, opts) {
  opts = opts || {};
  const stamp = new Date().toISOString().slice(0, 10);
  const pdfName = `Resume_${meta.format}_${stamp}.pdf`;
  const folder = _getOrCreateFolder(RESUME_FOLDER_NAME);
  if (!opts.fresh) {
    const existing = folder.getFilesByName(pdfName);
    if (existing.hasNext()) { const f = existing.next(); return _pdfResult(meta, f, true); }
  }
  const data = {
    profile: _kvFromSheet('profile'), contact: _kvFromSheet('contact'),
    timeline: _rowsFromSheet('timeline'), skills: _rowsFromSheet('skills'),
    certs: _rowsFromSheet('certifications'), projects: _rowsWithArrays('projects', ['stack', 'description']),
    expertise: _rowsWithArrays('expertise', ['tools'])
  };
  const html = _resumeHtml(String(meta.format).toUpperCase(), data);
  const pdfBlob = Utilities.newBlob(html, 'text/html', pdfName.replace(/\.pdf$/, '.html')).getAs('application/pdf').setName(pdfName);
  const file = folder.createFile(pdfBlob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return _pdfResult(meta, file, false);
}

function _pdfResult(meta, file, cached) {
  return { ok: true, format: meta.format, title: meta.title, cached: cached,
    url: 'https://drive.google.com/file/d/' + file.getId() + '/view',
    download_url: 'https://drive.google.com/uc?export=download&id=' + file.getId(),
    generated_at: new Date().toISOString() };
}

function _esc(v) { return _safeStr(v).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
function _strip(v) { return _safeStr(v).replace(/^[A-Za-z ]+:\s+/, '').replace(/<[^>]+>/g, ''); }

function _resumeHtml(format, d) {
  const p = d.profile, c = d.contact;
  const isGulf = format.indexOf('GCC') === 0 || format.indexOf('GULF') === 0, isIndia = format.indexOf('IN-') === 0;
  const name = _esc(p.full_name || p.name || 'Chandraguptha Reddy');
  const role = _esc(_strip(p.role || p.role_short || ''));
  const contactBits = [c.email, c.phone_in, isGulf && c.phone_uae ? c.phone_uae : null, _strip(c.location), c.linkedin, 'tcgr.in'].filter(Boolean).map(_esc).join(' · ');

  const summary = _esc(_strip(p.intro || p.tagline || ''));

  const experience = d.timeline.map(t => `
    <div class="job">
      <div class="row"><b>${_esc(t.role)}</b><span class="when">${_esc(t.year)}</span></div>
      <div class="org">${_esc(t.company)}</div>
      <p>${_esc(t.description)}</p>
      ${t.impact ? `<div class="impact">${_esc(t.impact)}</div>` : ''}
    </div>`).join('');

  const groups = {};
  d.skills.forEach(s => { const k = s.domain || 'Other'; (groups[k] = groups[k] || []).push(s); });
  const skillsCompact = Object.keys(groups).map(k => `<div class="skillrow"><b>${_esc(k)}:</b> ${groups[k].map(s => _esc(s.skill)).join(', ')}</div>`).join('');
  const skillsMatrix = `<table class="matrix"><tr><th>Domain</th><th>Skill</th><th>Years</th><th>Level</th></tr>` +
    d.skills.map(s => `<tr><td>${_esc(s.domain)}</td><td>${_esc(s.skill)}</td><td>${_esc(s.years)}</td><td>${_esc(s.level)}</td></tr>`).join('') + `</table>`;

  const projectsShort = d.projects.slice(0, isIndia ? 99 : 4).map(pr => `
    <div class="proj">
      <div class="row"><b>${_esc(pr.title)}</b><span class="when">${_esc(pr.category)}</span></div>
      ${pr.subtitle ? `<div class="org">${_esc(pr.subtitle)}</div>` : ''}
      ${isIndia ? `<ul>${(pr.description || []).map(x => `<li>${_esc(x)}</li>`).join('')}</ul>` : `<p>${_esc((pr.description || [])[0] || '')}</p>`}
      ${pr.impact ? `<div class="impact">Impact: ${_esc(pr.impact)}</div>` : ''}
      ${pr.stack && pr.stack.length ? `<div class="stack">${pr.stack.map(_esc).join(' · ')}</div>` : ''}
    </div>`).join('');

  const certs = d.certs.map(x => `<li>${_esc(x.name)} — ${_esc(x.issuer)}${x.year ? ' (' + _esc(x.year) + ')' : ''}</li>`).join('');

  const gulfBlock = isGulf ? `
    <h2>Personal details</h2>
    <div class="kv">
      ${c.nationality ? `<div><b>Nationality</b> ${_esc(c.nationality)}</div>` : ''}
      ${c.visa_status ? `<div><b>Visa status</b> ${_esc(c.visa_status)}</div>` : ''}
      <div><b>Availability</b> ${_esc(_strip(c.availability || ''))}</div>
      <div><b>Location</b> ${_esc(_strip(c.location || ''))}</div>
      ${c.languages ? `<div><b>Languages</b> ${_esc(_strip(c.languages))}</div>` : ''}
    </div>` : '';

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${name} — Resume</title>
  <style>
    @page { size: A4; margin: 16mm 16mm 18mm; }
    body { font-family: Helvetica, Arial, sans-serif; font-size: 10pt; line-height: 1.42; color: #111; margin: 0; }
    h1 { font-size: 20pt; margin: 0 0 2pt; letter-spacing: -0.01em; }
    .role { font-size: 11pt; color: #333; margin-bottom: 4pt; }
    .contact { font-size: 8.5pt; color: #555; margin-bottom: 10pt; }
    h2 { font-size: 10.5pt; text-transform: uppercase; letter-spacing: 0.08em; color: #8a5a0e; border-bottom: 1px solid #ddd; padding-bottom: 2pt; margin: 12pt 0 6pt; }
    p { margin: 2pt 0 4pt; }
    .row { display: flex; justify-content: space-between; align-items: baseline; gap: 10pt; }
    .when { font-size: 8.5pt; color: #666; white-space: nowrap; }
    .org { font-size: 9pt; color: #555; }
    .job, .proj { margin-bottom: 7pt; page-break-inside: avoid; }
    .impact { font-size: 8.5pt; color: #0b6e64; }
    .stack { font-size: 8pt; color: #666; }
    .skillrow { margin: 2pt 0; }
    ul { margin: 2pt 0 2pt 14pt; padding: 0; } li { margin: 1pt 0; }
    .kv div { margin: 2pt 0; } .kv b { display: inline-block; min-width: 90pt; font-weight: 600; }
    .matrix { border-collapse: collapse; width: 100%; font-size: 8.5pt; } .matrix th, .matrix td { border: 1px solid #ddd; padding: 2pt 5pt; text-align: left; } .matrix th { background: #f3f3f0; }
    .foot { margin-top: 12pt; font-size: 7.5pt; color: #888; }
  </style></head><body>
  <h1>${name}</h1>
  <div class="role">${role}</div>
  <div class="contact">${contactBits}</div>
  <h2>Summary</h2><p>${summary}</p>
  ${gulfBlock}
  <h2>Experience</h2>${experience}
  <h2>Selected work</h2>${projectsShort}
  <h2>Skills</h2>${isIndia ? skillsMatrix : skillsCompact}
  <h2>Certifications</h2><ul>${certs}</ul>
  <div class="foot">Generated ${new Date().toISOString().slice(0, 10)} from tcgr.in · format ${_esc(format)}</div>
  </body></html>`;
}

// ============================================================================
//  FORMATTERS — used by the optional Google Doc template path
// ============================================================================

function _formatExperience(timeline) {
  return timeline.map(t => {
    const parts = [t.year, t.role, t.company].filter(Boolean).join(' · ');
    const desc = t.description ? '\n  ' + t.description : '';
    const tech = t.tech ? '\n  Tech: ' + String(t.tech).replace(/[;|]/g, ', ') : '';
    return parts + desc + tech;
  }).join('\n\n');
}

function _formatSkills(skills) {
  // Group by domain
  const grouped = {};
  skills.forEach(s => {
    const d = s.domain || 'Other';
    if (!grouped[d]) grouped[d] = [];
    grouped[d].push(`${s.skill} (${s.level || ''})`);
  });
  return Object.keys(grouped).map(d => `${d}: ${grouped[d].join(', ')}`).join('\n');
}

function _formatProjects(projects) {
  return projects.map(p => {
    const head = [p.title, p.subtitle].filter(Boolean).join(' — ');
    const desc = (p.description || []).map(d => '  • ' + d).join('\n');
    const impact = p.impact ? '\n  Impact: ' + p.impact : '';
    return head + (desc ? '\n' + desc : '') + impact;
  }).join('\n\n');
}

function _formatCerts(certs) {
  return certs.map(c => `${c.name} — ${c.issuer || ''} (${c.year || ''})`).join('\n');
}

// ============================================================================
//  HELPERS
// ============================================================================

function _safeStr(v) {
  return v === null || v === undefined ? '' : String(v);
}

function _getOrCreateFolder(name) {
  const it = DriveApp.getFoldersByName(name);
  return it.hasNext() ? it.next() : DriveApp.createFolder(name);
}
