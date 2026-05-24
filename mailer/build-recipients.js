#!/usr/bin/env node
/**
 * Build mailer/recipients.json from a contact list xlsx.
 *
 * Usage:
 *   node mailer/build-recipients.js <path/to/contacts.xlsx>
 *
 * Output:
 *   mailer/recipients.json — deduped, validated rows: { email, first_name,
 *   full_name, institution, department }
 *
 * The script assumes the sheet "Master_Contacts" exists with columns
 * full_name, title, department, college_or_school, email, profile_url,
 * research_interests, institution, flag, notes.  Rows without a valid
 * email are silently dropped.
 */
const fs = require('fs');
const path = require('path');

const xlsxPath = process.argv[2];
if (!xlsxPath) {
  console.error('Usage: node mailer/build-recipients.js <path/to/contacts.xlsx>');
  process.exit(1);
}
if (!fs.existsSync(xlsxPath)) {
  console.error('File not found:', xlsxPath);
  process.exit(1);
}

let XLSX;
try {
  XLSX = require('xlsx');
} catch (e) {
  console.error('Missing dependency. Run:  npm install xlsx');
  process.exit(1);
}

const EMAIL_RE = /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/;
const TITLES_RE = /^(Dr\.?|Mr\.?|Mrs\.?|Ms\.?|Prof\.?|Professor)\s+/i;

function firstName(full) {
  if (!full) return null;
  const cleaned = String(full).trim().replace(TITLES_RE, '');
  return cleaned.split(/\s+/)[0] || null;
}

const wb = XLSX.readFile(xlsxPath);
const sheetName = wb.SheetNames.find(n => n === 'Master_Contacts') || wb.SheetNames[0];
const sheet = wb.Sheets[sheetName];
const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });

const seen = new Set();
const out = [];
let dupCount = 0;
let invalidCount = 0;

for (const r of rows) {
  const raw = r.email;
  if (!raw) continue;
  const email = String(raw).trim().toLowerCase();
  if (!EMAIL_RE.test(email)) { invalidCount++; continue; }
  if (seen.has(email)) { dupCount++; continue; }
  seen.add(email);
  out.push({
    email,
    first_name: firstName(r.full_name),
    full_name: (r.full_name || '').trim() || null,
    institution: r.institution || null,
    department: r.department || null,
  });
}

const outPath = path.join(__dirname, 'recipients.json');
fs.writeFileSync(outPath, JSON.stringify(out, null, 2));

console.log(`Sheet:     ${sheetName}`);
console.log(`Rows in:   ${rows.length}`);
console.log(`Kept:      ${out.length}`);
console.log(`Duplicates dropped: ${dupCount}`);
console.log(`Invalid emails dropped: ${invalidCount}`);
console.log(`Wrote ${outPath}`);
