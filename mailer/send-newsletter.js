#!/usr/bin/env node
/**
 * Newsletter sender — Resend HTTP API, no SDK required.
 *
 * Usage:
 *   RESEND_API_KEY=re_xxx node mailer/send-newsletter.js --issue=001
 *   node mailer/send-newsletter.js --issue=001 --dry-run
 *   node mailer/send-newsletter.js --issue=001 --limit=10        # test with 10 recipients
 *   node mailer/send-newsletter.js --issue=001 --only=foo@bar    # smoke test to one address
 *
 * Resume safety: every successful send appends to
 *   mailer/logs/issue-NNN-sent.log  (one email per line).
 * Re-running the script skips any address already in that log,
 * so a crashed/throttled run can be resumed without double-sending.
 *
 * Failures are appended to mailer/logs/issue-NNN-failed.log with the error
 * for inspection.
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

// ---------- args ----------
const args = Object.fromEntries(
  process.argv.slice(2).map(a => {
    const m = a.match(/^--([^=]+)(?:=(.*))?$/);
    return m ? [m[1], m[2] === undefined ? true : m[2]] : [a, true];
  })
);
const issueId = args.issue;
if (!issueId) {
  console.error('Missing --issue=NNN');
  process.exit(1);
}
const dryRun = !!args['dry-run'];
const limit = args.limit ? Number(args.limit) : null;
const onlyEmail = args.only || null;
const throttleMs = args.throttle ? Number(args.throttle) : 120;  // ~8/sec, well under Resend's 10/sec default

// ---------- load issue + recipients ----------
const root = __dirname;
const issuePath = path.join(root, 'issues', `issue-${issueId}.json`);
if (!fs.existsSync(issuePath)) {
  console.error('Issue file not found:', issuePath);
  process.exit(1);
}
const issue = JSON.parse(fs.readFileSync(issuePath, 'utf8'));
const html = fs.readFileSync(path.join(root, 'issues', issue.html_file), 'utf8');
const text = fs.readFileSync(path.join(root, 'issues', issue.text_file), 'utf8');

const recipientsPath = path.join(root, 'recipients.json');
if (!fs.existsSync(recipientsPath)) {
  console.error('recipients.json not found. Run build-recipients.js first.');
  process.exit(1);
}
let recipients = JSON.parse(fs.readFileSync(recipientsPath, 'utf8'));

// ---------- filters ----------
// Suppression list: data/unsubscribes.json (managed by /api/unsubscribe).
const unsubPath = path.join(root, '..', 'data', 'unsubscribes.json');
let unsubSet = new Set();
if (fs.existsSync(unsubPath)) {
  try {
    const u = JSON.parse(fs.readFileSync(unsubPath, 'utf8'));
    unsubSet = new Set(u.map(r => (r.email || '').toLowerCase()).filter(Boolean));
  } catch (e) {
    console.warn('Could not parse unsubscribes.json — continuing without suppression list.');
  }
}
const beforeUnsub = recipients.length;
recipients = recipients.filter(r => !unsubSet.has(r.email));
if (beforeUnsub !== recipients.length) {
  console.log(`Suppressed ${beforeUnsub - recipients.length} unsubscribed addresses.`);
}

if (onlyEmail) recipients = recipients.filter(r => r.email === onlyEmail.toLowerCase());
if (limit) recipients = recipients.slice(0, limit);

// resume log
const logsDir = path.join(root, 'logs');
fs.mkdirSync(logsDir, { recursive: true });
const sentLogPath = path.join(logsDir, `issue-${issueId}-sent.log`);
const failedLogPath = path.join(logsDir, `issue-${issueId}-failed.log`);
const alreadySent = new Set(
  fs.existsSync(sentLogPath)
    ? fs.readFileSync(sentLogPath, 'utf8').split('\n').filter(Boolean).map(line => line.split('\t')[0])
    : []
);
const remaining = recipients.filter(r => !alreadySent.has(r.email));

console.log(`Issue:        #${issueId}: ${issue.subject}`);
console.log(`From:         ${issue.from_name} <${issue.from_email}>`);
console.log(`Recipients:   ${recipients.length} (${remaining.length} pending, ${alreadySent.size} already sent)`);
console.log(`Mode:         ${dryRun ? 'DRY RUN (no emails will be sent)' : 'LIVE'}`);
console.log(`Throttle:     ${throttleMs}ms between sends`);
console.log('');

if (remaining.length === 0) {
  console.log('Nothing to do.');
  process.exit(0);
}

if (!dryRun && !process.env.RESEND_API_KEY) {
  console.error('RESEND_API_KEY is not set. Refusing to send.');
  process.exit(1);
}

// ---------- helpers ----------
function render(template, recipient) {
  const firstName = recipient.first_name || 'there';
  const emailUrl = encodeURIComponent(recipient.email);
  return template
    .replace(/\{\{first_name\}\}/g, firstName)
    .replace(/\{\{email_url\}\}/g, emailUrl)
    .replace(/\{\{email\}\}/g, recipient.email);
}

function sendOne(recipient) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      from: `${issue.from_name} <${issue.from_email}>`,
      to: [recipient.email],
      subject: issue.subject,
      html: render(html, recipient),
      text: render(text, recipient),
      reply_to: issue.reply_to,
      headers: {
        'List-Unsubscribe': `<mailto:${issue.unsubscribe_mailto}?subject=unsubscribe>, <${issue.unsubscribe_url_template.replace('{EMAIL}', encodeURIComponent(recipient.email))}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
      tags: [
        { name: 'issue', value: issueId },
        { name: 'campaign', value: 'launch' },
      ],
    });

    const req = https.request(
      {
        hostname: 'api.resend.com',
        path: '/emails',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          try {
            const json = data ? JSON.parse(data) : {};
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve({ ok: true, id: json.id, statusCode: res.statusCode });
            } else {
              resolve({
                ok: false,
                statusCode: res.statusCode,
                error: json.message || json.error || data || `HTTP ${res.statusCode}`,
              });
            }
          } catch (e) {
            resolve({ ok: false, statusCode: res.statusCode, error: data || e.message });
          }
        });
      }
    );
    req.on('error', (err) => resolve({ ok: false, error: err.message }));
    req.write(body);
    req.end();
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ---------- main loop ----------
(async () => {
  let okCount = 0, errCount = 0;
  for (let i = 0; i < remaining.length; i++) {
    const r = remaining[i];
    const prefix = `[${i + 1}/${remaining.length}] ${r.email}`;
    if (dryRun) {
      console.log(`${prefix}  DRY  first_name=${r.first_name || 'there'}  inst=${r.institution || '-'}`);
      continue;
    }
    const result = await sendOne(r);
    if (result.ok) {
      okCount++;
      fs.appendFileSync(sentLogPath, `${r.email}\t${result.id}\t${new Date().toISOString()}\n`);
      console.log(`${prefix}  OK  ${result.id}`);
    } else {
      errCount++;
      fs.appendFileSync(failedLogPath, `${r.email}\t${result.statusCode || '?'}\t${(result.error || '').toString().replace(/\s+/g, ' ')}\t${new Date().toISOString()}\n`);
      console.error(`${prefix}  ERR ${result.statusCode || '?'} ${result.error}`);
    }
    if (i < remaining.length - 1) await sleep(throttleMs);
  }
  console.log('');
  console.log(`Done. OK=${okCount}  ERR=${errCount}`);
  if (errCount > 0) console.log(`See ${failedLogPath}`);
  process.exit(errCount > 0 ? 1 : 0);
})();
