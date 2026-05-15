const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = Number(process.env.PORT) || 3000;
const rootDir = __dirname;
const BBB_BASE_URL = (process.env.BBB_BASE_URL || '').replace(/\/$/, '');
const BBB_SECRET = process.env.BBB_SECRET || '';

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

function toSafeMeetingId(raw) {
  return String(raw || 'general-workshop')
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

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

async function ensureMeetingExists({ meetingId, meetingName }) {
  const createUrl = buildBbbUrl('create', {
    name: meetingName,
    meetingID: meetingId,
    attendeePW: 'ap',
    moderatorPW: 'mp',
    welcome: 'Welcome to your live workshop on Warsha.',
    muteOnStart: 'false',
    allowStartStopRecording: 'false'
  });

  const response = await fetch(createUrl, { method: 'GET' });
  if (!response.ok) {
    throw new Error('Failed to create or access meeting on BigBlueButton');
  }
}

const server = http.createServer((req, res) => {
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
        const emailHtml = data.lang === 'ar' 
          ? `<div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6;"><h2>أهلاً بك في الذكاء الاصطناعي في الخليج!</h2><p>مرحباً ${data.name}،<br><br>سعيدون بانضمامك لنا. ستصلك النشرة الأولى صباح يوم الأحد القادم.</p><p>أطيب التحيات،<br>فريق التحرير</p></div>`
          : `<div style="font-family: Arial, sans-serif; line-height: 1.6;"><h2>Welcome to AI in Khaleej!</h2><p>Hi ${data.name},<br><br>We're thrilled to have you. You will receive your first briefing this coming Sunday morning.</p><p>Best regards,<br>The Editorial Team</p></div>`;

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

  if (req.method === 'POST' && req.url === '/api/bbb/join') {
    if (!BBB_BASE_URL || !BBB_SECRET) {
      sendJson(res, 500, {
        error: 'BigBlueButton is not configured on the server. Please set BBB_BASE_URL and BBB_SECRET.'
      });
      return;
    }

    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 1e6) {
        req.destroy();
      }
    });

    req.on('end', async () => {
      try {
        const parsed = body ? JSON.parse(body) : {};
        const meetingId = toSafeMeetingId(parsed.meetingId || parsed.courseId || parsed.courseName);
        const meetingName = String(parsed.meetingName || parsed.courseName || 'Live Workshop');
        const fullName = String(parsed.fullName || parsed.userName || 'Guest');
        const role = parsed.role === 'instructor' ? 'instructor' : 'student';
        const password = role === 'instructor' ? 'mp' : 'ap';

        if (!meetingId) {
          sendJson(res, 400, { error: 'meetingId is required.' });
          return;
        }

        await ensureMeetingExists({ meetingId, meetingName });

        const joinUrl = buildBbbUrl('join', {
          fullName,
          meetingID: meetingId,
          password,
          redirect: 'true'
        });

        sendJson(res, 200, { joinUrl, meetingId, role });
      } catch (error) {
        sendJson(res, 500, {
          error: error.message || 'Unable to create or join BigBlueButton meeting.'
        });
      }
    });
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
});
