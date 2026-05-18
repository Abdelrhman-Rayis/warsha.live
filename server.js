const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = Number(process.env.PORT) || 3000;
const rootDir = __dirname;

// BigBlueButton API.
// In production these come from the systemd unit (Environment=...).
// For local dev we fall back to our branded BBB instance at meet.warsha.live.
const BBB_DEFAULT_URL = 'https://meet.warsha.live/bigbluebutton';
const BBB_DEFAULT_SECRET = 'Sy0Mk857bcqROxkIfz4kUkesNhfFSS3pMWbc7EszvBs';
const BBB_BASE_URL = (process.env.BBB_BASE_URL || BBB_DEFAULT_URL).replace(/\/+$/, '');
const BBB_SECRET = process.env.BBB_SECRET || BBB_DEFAULT_SECRET;
if (!process.env.BBB_BASE_URL || !process.env.BBB_SECRET) {
  console.warn('[BBB] Using meet.warsha.live defaults. Set BBB_BASE_URL and BBB_SECRET in systemd for production.');
}

// On-disk registry of active classes -- survives node restarts but is
// just a JSON file. Fine for a single 1GB node and zero dependencies.
const CLASSES_DB_PATH = path.join(rootDir, 'data', 'classes.json');
const USERS_DB_PATH = path.join(rootDir, 'data', 'users.json');
const WORKSHOPS_DB_PATH = path.join(rootDir, 'data', 'workshops.json');

// Stripe — optional. Falls back gracefully if no secret key is set.
const STRIPE_SECRET = process.env.STRIPE_SECRET || '';
let stripe = null;
if (STRIPE_SECRET) {
  try {
    stripe = require('stripe')(STRIPE_SECRET);
  } catch (e) {
    console.warn('[stripe] module not installed or key invalid:', e.message);
  }
}

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp'
};

const responses = {
  ar: {
    'شرح منهجية البحث العلمي': 'منهجية البحث تشمل: تحديد المشكلة، مراجعة الأدبيات، تصميم الدراسة، جمع البيانات، ثم تحليل النتائج والخلاصات.',
    'كيف أكتب مقدمة بحث جيدة': 'المقدمة الجيدة تشرح الموضوع، تبين الأهمية، وتحدد أسئلة البحث والأهداف بشكل واضح ومختصر.',
    'ما هي أفضل تقنيات الدراسة': 'أفضل تقنيات الدراسة: تقسيم الوقت، المذاكرة النشطة، التلخيص، والتكرار المتباعد.',
    'كيف أنظم وقتي': 'ابدأ بالأولويات، قسم العمل إلى جلسات قصيرة، وخذ استراحات منتظمة حتى تحافظ على التركيز.',
    'الكورسات': 'لدينا كورسات في منهجية البحث، تحليل البيانات، كتابة البحث، والذكاء الاصطناعي في البحث.',
    'الدفع': 'الدفع داخل المنصة تجريبي حالياً ويمكن تطويره لاحقاً لبوابة دفع حقيقية.',
    'default': 'يمكنني مساعدتك في الدراسة، البحث العلمي، الكورسات، أو تنظيم الوقت. اكتب سؤالك بشكل مباشر.'
  },
  en: {
    'research methodology': 'Research methodology includes defining the problem, reviewing literature, designing the study, collecting data, and analyzing results.',
    'how do i write a good introduction': 'A good introduction explains the topic, shows the importance, and states the research questions and objectives clearly.',
    'best study techniques': 'Best study techniques include time blocking, active recall, summaries, and spaced repetition.',
    'time management': 'Start with priorities, split work into short sessions, and take regular breaks to stay focused.',
    'courses': 'We offer courses in research methodology, data analysis, scientific writing, and AI in research.',
    'payment': 'Payments in the platform are currently a local demo and can be connected to a real gateway later.',
    'default': 'I can help with studying, research, courses, or time management. Ask me directly.'
  }
};

function sendJson(res, statusCode, payload, extraHeaders = {}) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    ...extraHeaders
  });
  res.end(JSON.stringify(payload));
}

function getContentType(filePath) {
  return mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
}

function guessReply(message, lang) {
  const normalized = (message || '').toLowerCase();
  const dict = responses[lang] || responses.ar;

  for (const key of Object.keys(dict)) {
    if (key !== 'default' && normalized.includes(key.toLowerCase())) {
      return dict[key];
    }
  }

  return dict.default;
}

// ---------------------------------------------------------------
// BigBlueButton helpers
// ---------------------------------------------------------------
// Every BBB API call is signed: checksum = SHA1(callName + queryString + sharedSecret).
// `URLSearchParams` produces the *exact* canonical query string BBB
// expects (RFC 3986 percent-encoding, key=value pairs joined by &).
function bbbChecksum(callName, queryString) {
  return crypto
    .createHash('sha1')
    .update(callName + queryString + BBB_SECRET)
    .digest('hex');
}

function buildBbbUrl(callName, params) {
  const query = new URLSearchParams(params).toString();
  const checksum = bbbChecksum(callName, query);
  return `${BBB_BASE_URL}/api/${callName}?${query}&checksum=${checksum}`;
}

// Tiny XML scraper: BBB responses are flat <returncode>/<meetingID>/<messageKey>/...
// elements. Avoiding a real XML dep keeps the prod box dependency-free.
function extractXmlValue(xml, tag) {
  const m = xml.match(new RegExp(`<${tag}>([^<]*)</${tag}>`, 'i'));
  return m ? m[1].trim() : null;
}

function fetchBbb(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? require('https') : http;
    const req = lib.get(url, (resp) => {
      let body = '';
      resp.on('data', (c) => { body += c; });
      resp.on('end', () => resolve({ status: resp.statusCode, body }));
    });
    req.on('error', reject);
    req.setTimeout(15000, () => req.destroy(new Error('BBB request timed out')));
  });
}

function readClassesDb() {
  try {
    if (!fs.existsSync(CLASSES_DB_PATH)) return {};
    return JSON.parse(fs.readFileSync(CLASSES_DB_PATH, 'utf8'));
  } catch (err) {
    console.error('[classes] failed to read db, starting empty:', err.message);
    return {};
  }
}

function writeClassesDb(db) {
  const dir = path.dirname(CLASSES_DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(CLASSES_DB_PATH, JSON.stringify(db, null, 2));
}

function randomToken(bytes = 12) {
  return crypto.randomBytes(bytes).toString('hex');
}

// Same hash as client-side so server-stored passwords match localStorage
function hashPasswordCl(password) {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    hash = ((hash << 5) - hash) + password.charCodeAt(i);
    hash = hash & hash;
  }
  return String(Math.abs(hash));
}

// Calls BBB `create` and returns the persisted class record.
// Idempotent on meetingId: a second call for the same id refreshes
// the meeting on BBB but reuses the originally-issued passwords, so
// any join links already in users' hands keep working.
async function createBbbClass({ className }) {
  const db = readClassesDb();
  const existing = Object.values(db).find((c) => c.name === className);
  let record = existing || {
    meetingId: `warsha-${randomToken(6)}`,
    name: className,
    attendeePW: randomToken(),
    moderatorPW: randomToken(),
    createdAt: new Date().toISOString()
  };

  const url = buildBbbUrl('create', {
    name: record.name,
    meetingID: record.meetingId,
    attendeePW: record.attendeePW,
    moderatorPW: record.moderatorPW,
    welcome: 'Welcome to your live class on Warsha.',
    record: 'true',
    muteOnStart: 'false',
    allowStartStopRecording: 'true'
  });

  const { status, body } = await fetchBbb(url);
  if (status !== 200) {
    throw new Error(`BBB create returned HTTP ${status}`);
  }
  const returncode = extractXmlValue(body, 'returncode');
  if (returncode !== 'SUCCESS') {
    const msg = extractXmlValue(body, 'message') || 'unknown error';
    throw new Error(`BBB create failed: ${msg}`);
  }

  db[record.meetingId] = record;
  writeClassesDb(db);
  return record;
}

function buildJoinUrl({ record, fullName, role }) {
  const password = role === 'moderator' ? record.moderatorPW : record.attendeePW;
  return buildBbbUrl('join', {
    fullName,
    meetingID: record.meetingId,
    password,
    redirect: 'true'
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    });
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/api/subscribe-ai') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        
        // 1. Save to JSON file
        const dbPath = path.join(rootDir, 'ai-in-khaleej', 'subscribers.json');
        let subscribers = [];
        if (fs.existsSync(dbPath)) {
          subscribers = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        }
        data.timestamp = new Date().toISOString();
        subscribers.push(data);
        fs.writeFileSync(dbPath, JSON.stringify(subscribers, null, 2));

        // 2. Send Welcome Email via Resend
        const https = require('https');
        const emailHtmlEN = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f2eb;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f2eb;padding:40px 0;">
<tr><td align="center">
<table width="620" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">

  <!-- Header -->
  <tr><td style="background:#1a1f2e;padding:36px 40px;text-align:center;">
    <div style="font-family:Georgia,serif;font-size:13px;font-weight:600;color:#b08d3c;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;">AI in the Khaleej Classroom</div>
    <div style="font-family:Georgia,serif;font-size:26px;font-weight:600;color:#ffffff;line-height:1.2;letter-spacing:-0.01em;">Issue #001<br>The agent moment has arrived.</div>
    <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:14px;color:#8b92a5;margin-top:10px;">What Gulf faculty should do this semester</div>
  </td></tr>

  <!-- Body -->
  <tr><td style="padding:36px 40px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:15px;line-height:1.7;color:#1a1f2e;">
    
    <p style="margin:0 0 20px;">Hi ${data.name},</p>
    <p style="margin:0 0 20px;">Welcome to <strong>AI in the Khaleej Classroom</strong>. Your first briefing is below. Read in ~8 minutes. Use on Monday.</p>

    <!-- Cold Open Block -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf8f3;border-left:4px solid #b08d3c;margin:24px 0;border-radius:0 8px 8px 0;">
    <tr><td style="padding:20px 24px;">
      <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#8b6e2c;">COLD OPEN</p>
      <p style="margin:0;font-size:14px;color:#5b6478;">OpenAI published guidance on Workspace Agents for higher education. Anthropic and Google are moving the same direction. <strong>The era of AI as a chatbot is ending. The era of AI as a workflow tied to your real work has begun.</strong> This is not a vendor pitch. It is a structural change.</p>
    </td></tr></table>

    <!-- Section 01 -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0 0;">
    <tr><td>
      <table cellpadding="0" cellspacing="0"><tr>
        <td style="font-family:Georgia,serif;font-size:42px;font-weight:600;color:#b08d3c;opacity:0.35;vertical-align:top;line-height:1;padding-right:12px;">01</td>
        <td style="font-family:Georgia,serif;font-size:18px;font-weight:600;color:#1a1f2e;line-height:1.3;">A pedagogy pattern: the course-specific GPT</td>
      </tr></table>
      <p style="margin:12px 0 0;font-size:14px;"><strong>What it is:</strong> A Custom GPT that holds your course readings, rubric, and teaching persona. Students get a 24/7 study partner tethered to <em>your</em> course.</p>
      
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1f2e;border-radius:8px;margin:16px 0;">
      <tr><td style="padding:20px 24px;font-family:Menlo,Monaco,monospace;font-size:11px;line-height:1.65;color:#e2e8f0;">
        <strong style="color:#b08d3c;">Starter system prompt</strong><br><br>
        You are a study partner for [COURSE NAME]. Your job is to help students understand difficult concepts.<br><br>
        &bull; Never write a complete assignment<br>
        &bull; Always cite course material<br>
        &bull; Guide students toward correct reasoning<br>
        &bull; Match the student's language
      </td></tr></table>

      <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff8e7;border:1px solid #e6d5a8;border-radius:8px;margin:12px 0;">
      <tr><td style="padding:14px 18px;font-size:13px;color:#8b6e2c;">
        <strong>&#9888; Gulf classroom note:</strong> Arabic-language reasoning quality is behind English. For Arabic courses, budget extra pilot time.
      </td></tr></table>
    </td></tr></table>

    <!-- Section 02 -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:32px 0 0;">
    <tr><td>
      <table cellpadding="0" cellspacing="0"><tr>
        <td style="font-family:Georgia,serif;font-size:42px;font-weight:600;color:#b08d3c;opacity:0.35;vertical-align:top;line-height:1;padding-right:12px;">02</td>
        <td style="font-family:Georgia,serif;font-size:18px;font-weight:600;color:#1a1f2e;line-height:1.3;">A tool worth your time: NotebookLM</td>
      </tr></table>
      <p style="margin:12px 0 0;font-size:14px;">Google's research notebook &mdash; upload sources, ask questions, get passage-level citations. Built for the <em>researcher's</em> workflow. Excellent for literature reviews, dissertation supervision, and grant prep.</p>
      <p style="font-size:14px;"><strong>Arabic limitations:</strong> Audio overviews are English-only. OCR on Arabic PDFs is inconsistent. Citation accuracy: ~80% for Arabic vs ~95% for English.</p>
    </td></tr></table>

    <!-- Section 03 -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:32px 0 0;">
    <tr><td>
      <table cellpadding="0" cellspacing="0"><tr>
        <td style="font-family:Georgia,serif;font-size:42px;font-weight:600;color:#b08d3c;opacity:0.35;vertical-align:top;line-height:1;padding-right:12px;">03</td>
        <td style="font-family:Georgia,serif;font-size:18px;font-weight:600;color:#1a1f2e;line-height:1.3;">Agents are coming. No Gulf accreditor has guidance yet.</td>
      </tr></table>
      <p style="margin:12px 0 0;font-size:14px;">None of the Gulf regulatory frameworks were written with AI agents in mind. An agent that <em>takes actions</em> is not what those frameworks contemplated.</p>
      
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef2f2;border-left:4px solid #dc2626;margin:16px 0;border-radius:0 8px 8px 0;">
      <tr><td style="padding:16px 20px;font-size:13px;color:#991b1b;">
        <strong>Your move:</strong> Do not deploy agents in institutional systems without written sign-off from IT and the dean. Lead the governance conversation now.
      </td></tr></table>
    </td></tr></table>

    <!-- Divider -->
    <tr><td style="padding:0 40px;"><hr style="border:0;border-top:1px solid #e6e1d4;margin:32px 0;"></td></tr>

    <!-- Next -->
    <tr><td style="padding:0 40px 36px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:14px;line-height:1.7;color:#1a1f2e;">
      <p style="margin:0 0 8px;"><strong>Issue #002 next Sunday:</strong> The minus/plus/times AI grading framework, ready-to-adapt rubric, and an Arabic translation workflow that beats Google Translate.</p>
      <p style="margin:0;color:#5b6478;">Founding subscribers lock in $48/month for life. Annual: $450.</p>
    </td></tr>

  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#faf8f3;padding:24px 40px;text-align:center;font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:12px;color:#8b92a5;border-top:1px solid #e6e1d4;">
    <p style="margin:0 0 4px;">&mdash; Mazin</p>
    <p style="margin:0;">AI in the Khaleej Classroom &middot; Weekly briefing for Gulf faculty</p>
    <p style="margin:4px 0 0;">Reply with one question to shape a future issue.</p>
  </td></tr>

</table>
</td></tr></table>
</body>
</html>`;
        const emailHtmlAR = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body dir="rtl" style="margin:0;padding:0;background:#f5f2eb;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f2eb;padding:40px 0;">
<tr><td align="center">
<table width="620" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">

  <tr><td style="background:#1a1f2e;padding:36px 40px;text-align:center;">
    <div style="font-family:Georgia,serif;font-size:13px;font-weight:600;color:#b08d3c;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;">AI in the Khaleej Classroom</div>
    <div style="font-family:'IBM Plex Sans Arabic',Arial,sans-serif;font-size:24px;font-weight:700;color:#ffffff;line-height:1.4;">العدد الأول<br>لحظة الوكلاء الأذكياء قد وصلت.</div>
    <div style="font-family:'IBM Plex Sans Arabic',Arial,sans-serif;font-size:14px;color:#8b92a5;margin-top:10px;">ما الذي يجب على أعضاء هيئة التدريس في الخليج فعله هذا الفصل</div>
  </td></tr>

  <tr><td style="padding:36px 40px;font-family:'IBM Plex Sans Arabic',Arial,sans-serif;font-size:15px;line-height:1.8;color:#1a1f2e;text-align:right;">
    
    <p style="margin:0 0 20px;">مرحباً ${data.name}،</p>
    <p style="margin:0 0 20px;">أهلاً بك في <strong>الذكاء الاصطناعي في الفصل الخليجي</strong>. نشرتك الأولى أدناه.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf8f3;border-right:4px solid #b08d3c;margin:24px 0;border-radius:8px 0 0 8px;">
    <tr><td style="padding:20px 24px;">
      <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#8b6e2c;">المقدمة</p>
      <p style="margin:0;font-size:14px;color:#5b6478;">انتهى عصر الذكاء الاصطناعي كدردشة. بدأ عصر الذكاء الاصطناعي كسير عمل. هذا تحوّل هيكلي، لا حملة تسويقية.</p>
    </td></tr></table>

    <!-- 01 -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0 0;">
    <tr><td>
      <table cellpadding="0" cellspacing="0"><tr>
        <td style="font-family:Georgia,serif;font-size:42px;font-weight:600;color:#b08d3c;opacity:0.35;vertical-align:top;line-height:1;padding-left:12px;">01</td>
        <td style="font-family:'IBM Plex Sans Arabic',Arial,sans-serif;font-size:18px;font-weight:700;color:#1a1f2e;line-height:1.4;">نمط تعليمي: GPT مخصص لمقررك</td>
      </tr></table>
      <p style="margin:12px 0 0;font-size:14px;">نموذج ذكي مرتبط بمحتوى مقررك ومعايير تقييمك. خمس خطوات للتطبيق مع نموذج جاهز للنسخ. للفصول العربية: جودة الاستدلال أقل، فتوقع تصحيحاً إضافياً.</p>
    </td></tr></table>

    <!-- 02 -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:32px 0 0;">
    <tr><td>
      <table cellpadding="0" cellspacing="0"><tr>
        <td style="font-family:Georgia,serif;font-size:42px;font-weight:600;color:#b08d3c;opacity:0.35;vertical-align:top;line-height:1;padding-left:12px;">02</td>
        <td style="font-family:'IBM Plex Sans Arabic',Arial,sans-serif;font-size:18px;font-weight:700;color:#1a1f2e;line-height:1.4;">NotebookLM من Google</td>
      </tr></table>
      <p style="margin:12px 0 0;font-size:14px;">أداة بحثية ممتازة بالإنجليزية. الملخصات الصوتية لا تدعم العربية. دقة OCR على المصادر العربية القديمة ضعيفة. دقة الاستشهاد أقل بـ 15%.</p>
    </td></tr></table>

    <!-- 03 -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:32px 0 0;">
    <tr><td>
      <table cellpadding="0" cellspacing="0"><tr>
        <td style="font-family:Georgia,serif;font-size:42px;font-weight:600;color:#b08d3c;opacity:0.35;vertical-align:top;line-height:1;padding-left:12px;">03</td>
        <td style="font-family:'IBM Plex Sans Arabic',Arial,sans-serif;font-size:18px;font-weight:700;color:#1a1f2e;line-height:1.4;">لا إرشادات خليجية للوكلاء بعد</td>
      </tr></table>
      <p style="margin:12px 0 0;font-size:14px;">الأطر التنظيمية في الخليج كُتبت قبل الوكلاء. لا تنشر وكيلاً في الأنظمة المؤسسية دون موافقة خطية.</p>
    </td></tr></table>

  </td></tr>

  <tr><td style="padding:0 40px;"><hr style="border:0;border-top:1px solid #e6e1d4;margin:32px 0;"></td></tr>

  <tr><td style="padding:0 40px 36px;font-family:'IBM Plex Sans Arabic',Arial,sans-serif;font-size:14px;line-height:1.8;color:#1a1f2e;text-align:right;">
    <p style="margin:0 0 8px;"><strong>العدد القادم:</strong> إطار minus/plus/times AI مع نموذج تقييم كامل، وسير عمل للترجمة الأكاديمية العربية.</p>
    <p style="margin:0;color:#5b6478;">المشتركون المؤسسون: 48$ شهرياً مدى الحياة.</p>
  </td></tr>

  <tr><td style="background:#faf8f3;padding:24px 40px;text-align:center;font-family:'IBM Plex Sans Arabic',Arial,sans-serif;font-size:12px;color:#8b92a5;border-top:1px solid #e6e1d4;">
    <p style="margin:0 0 4px;">&mdash; مازن</p>
    <p style="margin:0;">الذكاء الاصطناعي في الفصل الخليجي &middot; نشرة أسبوعية لأعضاء هيئة التدريس في الخليج</p>
  </td></tr>

</table>
</td></tr></table>
</body>
</html>`;
        const emailHtml = data.lang === 'ar' ? emailHtmlAR : emailHtmlEN;
        
        const postData = JSON.stringify({
          from: 'newsletter@warsha.live',
          to: [data.email],
          subject: data.lang === 'ar' ? 'مرحباً بك في الذكاء الاصطناعي في الخليج' : 'Welcome to AI in Khaleej',
          html: emailHtml
        });

        const options = {
          hostname: 'api.resend.com',
          port: 443,
          path: '/emails',
          method: 'POST',
          headers: {
            'Authorization': 'Bearer re_S4XR2TnF_7rRvhsNfA3aiuoSTMxCXidfD',
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
          }
        };

        const emailReq = https.request(options, (emailRes) => {
          let emailBody = '';
          emailRes.on('data', chunk => emailBody += chunk);
          emailRes.on('end', () => {
             console.log("Resend API Response:", emailBody);
             sendJson(res, 200, { success: true });
          });
        });

        emailReq.on('error', (e) => {
          console.error("Resend Error:", e);
          sendJson(res, 500, { error: 'Failed to connect to email provider.' });
        });

        emailReq.write(postData);
        emailReq.end();

      } catch (err) {
        console.error("Subscription Error:", err);
        sendJson(res, 500, { error: 'Server processing error.' });
      }
    });
    return;
  }


  
  if (req.method === 'POST' && req.url.startsWith('/api/subscribers-reset')) {
    const urlParams = new URLSearchParams(req.url.split('?')[1] || '');
    const key = urlParams.get('key') || '';
    if (key !== 'gateflow2026') {
      sendJson(res, 403, { error: 'Unauthorized' });
      return;
    }
    try {
      const dbPath = path.join(rootDir, 'ai-in-khaleej', 'subscribers.json');
      fs.writeFileSync(dbPath, '[]');
      sendJson(res, 200, { success: true });
    } catch (err) {
      sendJson(res, 500, { error: 'Failed to reset' });
    }
    return;
  }

  if (req.method === 'GET' && req.url.startsWith('/api/subscribers-ai')) {
    const urlParams = new URLSearchParams(req.url.split('?')[1] || '');
    const key = urlParams.get('key') || '';
    if (key !== 'gateflow2026') {
      sendJson(res, 403, { error: 'Unauthorized' });
      return;
    }
    try {
      const dbPath = path.join(rootDir, 'ai-in-khaleej', 'subscribers.json');
      if (fs.existsSync(dbPath)) {
        const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        sendJson(res, 200, data);
      } else {
        sendJson(res, 200, []);
      }
    } catch (err) {
      sendJson(res, 500, { error: 'Failed to read subscribers' });
    }
    return;
  }


  if (req.method === 'POST' && req.url === '/api/ai') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 1e6) {
        req.destroy();
      }
    });

    req.on('end', () => {
      try {
        const parsed = body ? JSON.parse(body) : {};
        const reply = guessReply(parsed.message, parsed.lang);
        sendJson(res, 200, { reply });
      } catch (error) {
        sendJson(res, 400, { error: 'Invalid request body' });
      }
    });
    return;
  }

  // ---------------------------------------------------------------
  // POST /api/register
  // Body: { name, email, password }
  // ---------------------------------------------------------------
  if (req.method === 'POST' && req.url === '/api/register') {
    let body = '';
    req.on('data', (chunk) => { body += chunk.toString(); if (body.length > 1e5) req.destroy(); });
    req.on('end', () => {
      try {
        const { name, email, password } = JSON.parse(body);
        if (!name || !email || !password || password.length < 6) {
          sendJson(res, 400, { error: 'Name, valid email, and password (6+ chars) required.' });
          return;
        }
        const dir = path.dirname(USERS_DB_PATH);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        let users = [];
        if (fs.existsSync(USERS_DB_PATH)) {
          users = JSON.parse(fs.readFileSync(USERS_DB_PATH, 'utf8'));
        }
        if (users.find(u => u.email === email)) {
          sendJson(res, 409, { error: 'An account with this email already exists.' });
          return;
        }
        const newUser = { id: Date.now(), name, email, password: hashPasswordCl(password), role: 'instructor', joinedDate: new Date().toISOString() };
        users.push(newUser);
        fs.writeFileSync(USERS_DB_PATH, JSON.stringify(users, null, 2));
        sendJson(res, 201, { message: 'Account created.', user: { id: newUser.id, name, email, role: 'instructor' } });
      } catch (err) {
        sendJson(res, 500, { error: err.message || 'Registration failed.' });
      }
    });
    return;
  }

  // ---------------------------------------------------------------
  // POST /api/login — check credentials against users.json
  // ---------------------------------------------------------------
  if (req.method === 'POST' && req.url === '/api/login') {
    let body = '';
    req.on('data', (chunk) => { body += chunk.toString(); if (body.length > 1e5) req.destroy(); });
    req.on('end', () => {
      try {
        const { email, password } = JSON.parse(body);
        if (!email || !password) { sendJson(res, 400, { error: 'Email and password required.' }); return; }
        let users = [];
        if (fs.existsSync(USERS_DB_PATH)) users = JSON.parse(fs.readFileSync(USERS_DB_PATH, 'utf8'));
        const hashed = hashPasswordCl(password);
        const user = users.find(u => u.email === email && u.password === hashed);
        if (user) {
          sendJson(res, 200, { id: user.id, name: user.name, email: user.email, role: user.role, joinedDate: user.joinedDate });
        } else {
          sendJson(res, 401, { error: 'Incorrect email or password.' });
        }
      } catch (err) {
        sendJson(res, 500, { error: err.message || 'Login failed.' });
      }
    });
    return;
  }

  // ---------------------------------------------------------------
  // GET /api/my-workshops?email=...  — enrolled workshops for a user
  // ---------------------------------------------------------------
  if (req.method === 'GET' && req.url.startsWith('/api/my-workshops')) {
    const u = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const email = u.searchParams.get('email') || '';
    try {
      const db = JSON.parse(fs.readFileSync(WORKSHOPS_DB_PATH, 'utf8'));
      const enrolled = db.filter(w => w.enrolled.includes(email)).map(w => ({
        id: w.id, title: w.title, instructor: w.instructor,
        duration: w.duration, startDate: w.startDate, price: w.price, avatar: w.avatar
      }));
      sendJson(res, 200, enrolled);
    } catch (err) {
      sendJson(res, 500, { error: 'Failed to load your workshops.' });
    }
    return;
  }

  // ---------------------------------------------------------------
  // GET /api/workshops — list all workshops with enrollment counts
  // ---------------------------------------------------------------
  if (req.method === 'GET' && req.url === '/api/workshops') {
    try {
      const db = JSON.parse(fs.readFileSync(WORKSHOPS_DB_PATH, 'utf8'));
      const list = db.map(w => ({
        id: w.id, title: w.title, description: w.description,
        instructor: w.instructor, price: w.price, currency: w.currency,
        duration: w.duration, startDate: w.startDate, avatar: w.avatar,
        category: w.category || 'Research',
        enrolledCount: w.enrolled.length
      }));
      sendJson(res, 200, list);
    } catch (err) {
      sendJson(res, 500, { error: 'Failed to load workshops.' });
    }
    return;
  }

  // ---------------------------------------------------------------
  // POST /api/workshop/enroll
  // Body: { workshopId, userEmail }
  // Free → enrolled instantly. Paid → returns Stripe checkout URL.
  // ---------------------------------------------------------------
  if (req.method === 'POST' && req.url === '/api/workshop/enroll') {
    let body = '';
    req.on('data', (chunk) => { body += chunk.toString(); if (body.length > 1e5) req.destroy(); });
    req.on('end', async () => {
      try {
        const { workshopId, userEmail } = JSON.parse(body);
        if (!workshopId) { sendJson(res, 400, { error: 'workshopId required.' }); return; }
        const db = JSON.parse(fs.readFileSync(WORKSHOPS_DB_PATH, 'utf8'));
        const w = db.find(x => x.id === workshopId);
        if (!w) { sendJson(res, 404, { error: 'Workshop not found.' }); return; }

        if (w.price === 0) {
          // Free workshop — enroll immediately
          if (!w.enrolled.includes(userEmail)) w.enrolled.push(userEmail);
          fs.writeFileSync(WORKSHOPS_DB_PATH, JSON.stringify(db, null, 2));
          sendJson(res, 200, { enrolled: true, workshopId: w.id, title: w.title });
        } else if (!stripe) {
          // Paid but no Stripe configured
          sendJson(res, 503, { error: 'Payment system not yet configured. Stripe secret key missing.' });
        } else {
          // Paid workshop — create Stripe Checkout Session
          const DOMAIN = process.env.SITE_DOMAIN || 'https://warsha.live';
          const session = await stripe.checkout.sessions.create({
            line_items: [{
              price_data: {
                currency: w.currency,
                product_data: { name: w.title },
                unit_amount: w.price * 100, // cents
              },
              quantity: 1,
            }],
            mode: 'payment',
            success_url: `${DOMAIN}/api/workshop/payment-success?session_id={CHECKOUT_SESSION_ID}&workshop_id=${workshopId}&email=${encodeURIComponent(userEmail)}`,
            cancel_url: `${DOMAIN}/`,
            metadata: { workshopId, userEmail },
          });
          sendJson(res, 200, { stripeUrl: session.url });
        }
      } catch (err) {
        sendJson(res, 500, { error: err.message || 'Enrollment failed.' });
      }
    });
    return;
  }

  // ---------------------------------------------------------------
  // GET /api/workshop/payment-success — Stripe callback
  // ---------------------------------------------------------------
  if (req.method === 'GET' && req.url.startsWith('/api/workshop/payment-success')) {
    const u = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const sessionId = u.searchParams.get('session_id');
    const workshopId = u.searchParams.get('workshop_id');
    const email = u.searchParams.get('email');
    try {
      if (!stripe || !sessionId) {
        sendJson(res, 400, { error: 'Invalid payment session.' });
        return;
      }
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status !== 'paid') {
        res.writeHead(302, { Location: '/' });
        res.end();
        return;
      }
      // Enroll the user
      const db = JSON.parse(fs.readFileSync(WORKSHOPS_DB_PATH, 'utf8'));
      const w = db.find(x => x.id === workshopId);
      if (w && email && !w.enrolled.includes(email)) w.enrolled.push(email);
      if (w) fs.writeFileSync(WORKSHOPS_DB_PATH, JSON.stringify(db, null, 2));
      // Redirect to a nice success page or the home page
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Enrolled!</title>
<style>body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f8f9fa;margin:0;}
.card{background:#fff;padding:3rem;border-radius:12px;text-align:center;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:480px;}
.card h1{color:#15543a;margin:0 0 1rem;} .card p{color:#5b6478;margin:0 0 1.5rem;}
.card a{display:inline-block;padding:0.75rem 2rem;background:#1a1f2e;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;}
</style></head><body><div class="card">
<h1>✓ You're enrolled!</h1><p>${w ? 'Welcome to <b>' + w.title + '</b>.' : 'You now have access to the workshop.'}</p>
<p>Your instructor will share the live class link before the start date.</p>
<a href="/">Back to Warsha</a> &nbsp; <a href="/?my-workshops=1">View My Workshops →</a></div></body></html>`);
    } catch (err) {
      res.writeHead(302, { Location: '/' });
      res.end();
    }
    return;
  }

  // ---------------------------------------------------------------
  // POST /api/class/create
  // Body: { className: string }
  // Resp: { meetingId, className, moderatorJoinUrl, attendeeJoinUrl }
  // The moderator URL is what the educator clicks to start the class;
  // attendeeJoinUrl is what they share with students.
  // ---------------------------------------------------------------
  if (req.method === 'POST' && req.url === '/api/class/create') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
      if (body.length > 1e5) req.destroy();
    });
    req.on('end', async () => {
      try {
        const parsed = body ? JSON.parse(body) : {};
        const className = String(parsed.className || '').trim();
        if (!className) {
          sendJson(res, 400, { error: 'className is required' });
          return;
        }
        const educatorName = String(parsed.educatorName || 'Educator').trim();
        const record = await createBbbClass({ className });
        sendJson(res, 200, {
          meetingId: record.meetingId,
          className: record.name,
          moderatorJoinUrl: `/api/class/join?meetingId=${encodeURIComponent(record.meetingId)}&name=${encodeURIComponent(educatorName)}&role=moderator`,
          attendeeJoinUrl: `/api/class/join?meetingId=${encodeURIComponent(record.meetingId)}&name=Student&role=attendee`
        });
      } catch (error) {
        sendJson(res, 500, { error: error.message || 'Failed to create class' });
      }
    });
    return;
  }

  // ---------------------------------------------------------------
  // GET /api/class/join?meetingId=...&name=...&role=moderator|attendee
  // - Default: 302 redirect to the signed BBB join URL.
  // - With ?format=json: returns { joinUrl } so the SPA can decide.
  // ---------------------------------------------------------------
  if (req.method === 'GET' && req.url.startsWith('/api/class/join')) {
    const u = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const meetingId = u.searchParams.get('meetingId') || '';
    const fullName = (u.searchParams.get('name') || 'Guest').slice(0, 80);
    const role = u.searchParams.get('role') === 'moderator' ? 'moderator' : 'attendee';
    const wantsJson = u.searchParams.get('format') === 'json';

    const db = readClassesDb();
    const record = db[meetingId];
    if (!record) {
      sendJson(res, 404, { error: 'Class not found. Ask the educator to start it.' });
      return;
    }

    const joinUrl = buildJoinUrl({ record, fullName, role });
    if (wantsJson) {
      sendJson(res, 200, { joinUrl, meetingId, role });
    } else {
      res.writeHead(302, { Location: joinUrl });
      res.end();
    }
    return;
  }

  // ---------------------------------------------------------------
  // GET /api/classes — list active classes (meeting IDs + names)
  // ---------------------------------------------------------------
  if (req.method === 'GET' && req.url === '/api/classes') {
    const db = readClassesDb();
    const list = Object.entries(db).map(([id, c]) => ({
      meetingId: id,
      name: c.name,
      createdAt: c.createdAt
    }));
    sendJson(res, 200, list);
    return;
  }

  const rawPath = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  const requestPath = (rawPath === '/events' || rawPath === '/events/') ? '/event/index.html' : rawPath;
  const filePath = path.join(rootDir, requestPath);

  if (!filePath.startsWith(rootDir)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (error, stats) => {
    if (error) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not Found');
      return;
    }

    const targetPath = stats.isDirectory() ? path.join(filePath, 'index.html') : filePath;

    fs.readFile(targetPath, (readError, data) => {
      if (readError) {
        const statusCode = readError.code === 'ENOENT' ? 404 : 500;
        res.writeHead(statusCode, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(statusCode === 404 ? 'Not Found' : 'Internal Server Error');
        return;
      }

      res.writeHead(200, { 'Content-Type': getContentType(targetPath) });
      res.end(data);
    });
  });
});

server.listen(PORT, () => {
  console.log(`Local platform running at http://localhost:${PORT}`);
  console.log(`BBB endpoint:    ${BBB_BASE_URL}`);
});
