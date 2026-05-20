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

  
  // --- AI Agentic Course Applications ---
  if (req.method === 'POST' && req.url === '/api/apply-ai') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const appsPath = path.join(rootDir, 'data', 'ai_applications.json');
        let apps = [];
        if (fs.existsSync(appsPath)) {
          apps = JSON.parse(fs.readFileSync(appsPath, 'utf8'));
        }
        data.id = 'app_' + Date.now();
        data.timestamp = new Date().toISOString();
        data.status = 'pending'; // pending, approved, rejected
        apps.push(data);
        fs.writeFileSync(appsPath, JSON.stringify(apps, null, 2));
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, id: data.id }));
      } catch (err) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid data' }));
      }
    });
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  if (req.method === 'GET' && parsedUrl.pathname === '/api/applications-ai') {
    if (parsedUrl.searchParams.get('key') !== 'gateflow2026') {
      res.writeHead(403);
      return res.end(JSON.stringify({ error: 'Unauthorized' }));
    }
    const appsPath = path.join(rootDir, 'data', 'ai_applications.json');
    let apps = [];
    if (fs.existsSync(appsPath)) {
      apps = JSON.parse(fs.readFileSync(appsPath, 'utf8'));
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(apps));
    return;
  }

  if (req.method === 'POST' && parsedUrl.pathname === '/api/applications-ai/status') {
    if (parsedUrl.searchParams.get('key') !== 'gateflow2026') {
      res.writeHead(403);
      return res.end(JSON.stringify({ error: 'Unauthorized' }));
    }
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        const { id, status } = JSON.parse(body);
        const appsPath = path.join(rootDir, 'data', 'ai_applications.json');
        if (fs.existsSync(appsPath)) {
          let apps = JSON.parse(fs.readFileSync(appsPath, 'utf8'));
          const appIndex = apps.findIndex(a => a.id === id);
          if (appIndex !== -1) {
            apps[appIndex].status = status;
            fs.writeFileSync(appsPath, JSON.stringify(apps, null, 2));
            res.writeHead(200);
            return res.end(JSON.stringify({ success: true }));
          }
        }
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Not found' }));
      } catch (err) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid data' }));
      }
    });
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
<body style="margin:0;padding:0;background:#faf8f3;color:#1a1f2e;font-family:-apple-system,BlinkMacSystemFont,sans-serif;-webkit-font-smoothing:antialiased;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#faf8f3;padding:40px 0;">
<tr><td align="center">
<table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e6e1d4;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.02);">
  <tr><td style="padding:40px;line-height:1.7;font-size:15px;">
    <div style="font-family:Georgia,serif;font-size:14px;font-weight:600;color:#b08d3c;text-transform:uppercase;letter-spacing:1px;margin-bottom:24px;">AI in the Khaleej Classroom</div>
    <p style="margin:0 0 16px;">Hi ${data.name || 'there'},</p>
    <p style="margin:0 0 16px;">Thank you for subscribing.</p>
    <p style="margin:0 0 16px;">Here is the deal. Issue #001 will land in your inbox this Sunday morning, Gulf time. Starting with Issue #002, the first 100 subscribers lock in $20/month for life. After that, the standard rate rises to $30.</p>
    <p style="margin:0 0 24px;">If you are not sure yet, <a href="https://warsha.live/ai-in-khaleej/issue-001.html" style="color:#b08d3c;text-decoration:underline;">read Issue #001 first</a>. That is the point of making it free.</p>
    <p style="margin:0;color:#5b6478;">Mazin</p>
  </td></tr>
</table>
</td></tr></table>
</body>
</html>`;
        const emailHtmlAR = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body dir="rtl" style="margin:0;padding:0;background:#faf8f3;color:#1a1f2e;font-family:'IBM Plex Sans Arabic',Arial,sans-serif;-webkit-font-smoothing:antialiased;text-align:right;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#faf8f3;padding:40px 0;">
<tr><td align="center">
<table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e6e1d4;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.02);">
  <tr><td style="padding:40px;line-height:1.8;font-size:15px;text-align:right;">
    <div style="font-family:'IBM Plex Sans Arabic',Arial,sans-serif;font-size:14px;font-weight:700;color:#b08d3c;letter-spacing:1px;margin-bottom:24px;">الذكاء الاصطناعي في الفصل الخليجي</div>
    <p style="margin:0 0 16px;">مرحباً ${data.name || 'بك'}،</p>
    <p style="margin:0 0 16px;">شكرًا لاشتراكك.</p>
    <p style="margin:0 0 16px;">إليك التفاصيل: سيصلك العدد الأول في صندوق بريدك صباح يوم الأحد المقبل بتوقيت الخليج. وبدءًا من العدد الثاني، سيثبت السعر لأول 100 مشترك عند 20 دولارًا شهريًا مدى الحياة. وبعد ذلك، سيرتفع السعر القياسي إلى 30 دولارًا.</p>
    <p style="margin:0 0 24px;">إذا لم تكن متأكدًا بعد، يمكنك <a href="https://warsha.live/ai-in-khaleej/issue-001.html" style="color:#b08d3c;text-decoration:underline;">قراءة العدد الأول أولاً</a>؛ فهذا هو الهدف من كونه مجانيًا.</p>
    <p style="margin:0;color:#5b6478;">مازن</p>
  </td></tr>
</table>
</td></tr></table>
</body>
</html>`;
        const emailHtml = data.lang === 'ar' ? emailHtmlAR : emailHtmlEN;
        
        const postData = JSON.stringify({
          from: 'newsletter@warsha.live',
          to: [data.email],
          subject: data.lang === 'ar' ? 'مرحبًا بك في "الذكاء الاصطناعي في الفصل الخليجي"' : 'Welcome to AI in the Khaleej Classroom.',
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

  // ---------------------------------------------------------------
  // GET /api/recordings
  // ---------------------------------------------------------------
  if (req.method === 'GET' && req.url === '/api/recordings') {
    try {
      const url = buildBbbUrl('getRecordings', { state: 'published' });
      const { status, body } = await fetchBbb(url);
      if (status !== 200) throw new Error(`BBB returned HTTP ${status}`);
      
      const returncode = extractXmlValue(body, 'returncode');
      if (returncode !== 'SUCCESS') throw new Error('Failed to fetch recordings');

      const recordings = [];
      const matches = body.match(/<recording>(.*?)<\/recording>/gs);
      if (matches) {
        for (const match of matches) {
          const id = extractXmlValue(match, 'recordID');
          const name = extractXmlValue(match, 'name');
          const state = extractXmlValue(match, 'state');
          const pbMatch = match.match(/<playback>.*?<format>.*?<url>(.*?)<\/url>.*?<\/format>.*?<\/playback>/s);
          const pbUrl = pbMatch ? pbMatch[1].trim() : null;
          if (pbUrl) {
            recordings.push({ id, name, state, url: pbUrl });
          }
        }
      }
      sendJson(res, 200, recordings);
    } catch (err) {
      sendJson(res, 500, { error: err.message });
    }
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
