/**
 * ============================================================================
 *  ResumeGenerator.js — On-demand PDF resume generation
 *  ============================================================================
 *  Workflow:
 *    1. Create a Google Doc resume template with placeholders: {{name}}, {{role}},
 *       {{intro}}, {{experience_block}}, {{skills_block}}, {{contact_block}}.
 *    2. Copy the Doc ID from its URL.
 *    3. Paste it into the `template_doc_id` column of the `resumes` sheet for
 *       the matching format (INT-01, GULF-01, IN-01).
 *    4. Frontend calls ?action=resume&id=INT-01 → returns { url } to PDF.
 *
 *  Generated PDFs are stored in a Drive folder (auto-created) and shared as
 *  "anyone with link can view". Old PDFs accumulate — clean periodically.
 *  ============================================================================
 */

const RESUME_FOLDER_NAME = 'tcgr.in_resumes';

function generateResumePDF(formatId) {
  if (!formatId) return { error: 'Missing format id' };

  // 1. Find the format in `resumes` sheet
  const resumes = _rowsFromSheet('resumes');
  const meta = resumes.find(r => String(r.format).toUpperCase() === String(formatId).toUpperCase());
  if (!meta) return { error: `Unknown resume format: ${formatId}` };
  if (!meta.template_doc_id) {
    return { error: `No template_doc_id configured for ${formatId}. Add it in the resumes sheet.` };
  }

  // 2. Gather data
  const profile  = _kvFromSheet('profile');
  const contact  = _kvFromSheet('contact');
  const timeline = _rowsFromSheet('timeline');
  const skills   = _rowsFromSheet('skills');
  const certs    = _rowsFromSheet('certifications');

  let copy, doc;
  try {
    // 3. Copy template
    const stamp = new Date().toISOString().slice(0, 10);
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
    body.replaceText('{{generated_date}}',   new Date().toISOString().slice(0, 10));

    doc.saveAndClose();

    // 6. Convert to PDF and place in shared folder
    const pdfBlob = copy.getAs('application/pdf');
    const folder = _getOrCreateFolder(RESUME_FOLDER_NAME);
    const pdfFile = folder.createFile(pdfBlob).setName(copy.getName() + '.pdf');
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
//  FORMATTERS — adjust these to match your resume template style
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
