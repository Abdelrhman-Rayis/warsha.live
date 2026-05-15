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
        const emailHtmlEN = `<div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; line-height: 1.65; color: #1a1f2e; padding: 20px;">
<div style="border-bottom: 2px solid #b08d3c; padding-bottom: 20px; margin-bottom: 28px;">
  <h2 style="font-family: Georgia, serif; font-size: 28px; font-weight: 600; margin: 0 0 8px; letter-spacing: -0.01em;">Issue #001: The agent moment has arrived.</h2>
  <p style="color: #8b6e2c; font-size: 13px; font-weight: 600; text-transform: uppercase; margin: 0;">What Gulf faculty should do this semester</p>
</div>

<p>Hi ${data.name},</p>
<p>Welcome to <strong>AI in the Khaleej Classroom</strong>. Below is your first briefing. Read in ~8 minutes. Use on Monday.</p>

<div style="background: #f8f6f0; border-left: 4px solid #b08d3c; padding: 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
  <p style="margin: 0 0 10px;"><strong>Cold open:</strong> Two weeks ago OpenAI published guidance on Workspace Agents for higher education. Anthropic and Google are moving the same direction. The era of AI as a chatbot is ending. The era of AI as a workflow tied to your real work has begun.</p>
  <p style="margin: 0; font-size: 14px; color: #5b6478;">This is not a vendor pitch. It is a structural change.</p>
</div>

<h3 style="font-family: Georgia, serif; font-size: 20px; margin: 28px 0 12px;">01. A pedagogy pattern: the course-specific GPT</h3>
<p><strong>What it is:</strong> A Custom GPT that holds your course readings, rubric, and persona. Students get a 24/7 study partner tethered to <em>your</em> course.</p>
<p><strong>Build it this week:</strong> Pick one course, decide the GPT's job, feed it your materials (syllabus, slides, good/bad student work samples), write the system prompt, pilot with 5 students.</p>

<div style="background: #1a1f2e; color: #e2e8f0; padding: 20px; border-radius: 8px; margin: 16px 0; font-family: monospace; font-size: 12px; line-height: 1.6;">
<strong>Starter system prompt:</strong><br><br>
You are a study partner for [COURSE NAME]. Your job is to help students [PICK ONE: understand difficult concepts / improve their writing / practice problem-solving / prepare for exams].<br><br>
- Never write a complete assignment for a student.<br>
- Always cite which course material your answer is grounded in.<br>
- When a student is wrong, guide them toward the correct frame.<br>
- Language: respond in the language the student writes to you in.
</div>

<p><strong>Caveats for Gulf classrooms:</strong> Arabic-language reasoning quality is behind English. For Arabic courses, expect to spend more time correcting during the pilot. A sanctioned course GPT strengthens academic integrity.</p>

<h3 style="font-family: Georgia, serif; font-size: 20px; margin: 28px 0 12px;">02. A tool worth your time: NotebookLM</h3>
<p>Google's research notebook. Upload sources, ask questions, get passage-level citations. Built for the <em>researcher's</em> workflow. For literature reviews, dissertation supervision, and grant prep.</p>
<p><strong>Arabic limitations:</strong> Audio overviews are English-only. OCR on Arabic-script PDFs is inconsistent. Citation accuracy: ~80% for Arabic vs ~95% for English. Verify before quoting.</p>

<h3 style="font-family: Georgia, serif; font-size: 20px; margin: 28px 0 12px;">03. A regional signal: agents are coming, no Gulf accreditor has guidance yet</h3>
<p>None of the Gulf regulatory frameworks (UAE's PDPL, Saudi's PDPL/SDAIA, Qatar's Law 13) were written with AI agents in mind. An agent that takes actions is not what those frameworks contemplated.</p>
<p><strong>Your move:</strong> Do not deploy agents in institutional systems without written sign-off from IT and the dean. If you lead a department, this is the moment to put a one-page AI agent-use addendum in front of governance.</p>

<div style="border-top: 1px solid #e6e1d4; margin: 32px 0; padding-top: 20px;">
  <p><strong>What's next:</strong> Issue #002 (next Sunday) covers the minus/plus/times AI grading framework, plus an Arabic academic translation workflow that beats Google Translate.</p>
  <p><strong>Subscribe:</strong> Founding subscribers lock in $48/month for life. Annual rate: $450.</p>
</div>

<p style="color: #5b6478; font-size: 13px; margin-top: 32px; border-top: 1px solid #e6e1d4; padding-top: 16px;">
  &mdash; Mazin<br>
  AI in the Khaleej Classroom<br>
  <em>To shape future issues, reply with one question you want answered.</em>
</p>
</div>`;
        const emailHtmlAR = `<div dir="rtl" style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; line-height: 1.8; color: #1a1f2e; padding: 20px; text-align: right;">
<div style="border-bottom: 2px solid #b08d3c; padding-bottom: 20px; margin-bottom: 28px;">
  <h2 style="font-family: Georgia, serif; font-size: 26px; font-weight: 600; margin: 0 0 8px;">العدد الأول: لحظة الوكلاء الأذكياء قد وصلت.</h2>
  <p style="color: #8b6e2c; font-size: 13px; font-weight: 600; margin: 0;">ما الذي يجب على أعضاء هيئة التدريس في الخليج فعله هذا الفصل</p>
</div>

<p>مرحباً ${data.name}،</p>
<p>أهلاً بك في <strong>الذكاء الاصطناعي في الفصل الخليجي</strong>. هذه نشرتك الأولى. اقرأ في 8 دقائق. استخدمها يوم الاثنين.</p>

<div style="background: #f8f6f0; border-right: 4px solid #b08d3c; padding: 20px; margin: 24px 0; border-radius: 8px 0 0 8px;">
  <p style="margin: 0 0 10px;"><strong>المقدمة:</strong> نشرت OpenAI توجيهات عن وكلاء مساحة العمل للتعليم العالي. Anthropic و Google في الاتجاه نفسه. انتهى عصر الذكاء الاصطناعي كدردشة. بدأ عصر الذكاء الاصطناعي كسير عمل.</p>
</div>

<h3 style="font-size: 18px; margin: 28px 0 12px;">٠١. نمط تعليمي: GPT مخصص لمقررك</h3>
<p>نموذج ذكي مرتبط بمحتوى مقررك ومعاييرك. خمس خطوات للتطبيق هذا الأسبوع مع نموذج جاهز. ملاحظة: جودة العربية لا تزال متأخرة، فتوقع تصحيحاً إضافياً.</p>

<h3 style="font-size: 18px; margin: 28px 0 12px;">٠٢. أداة: NotebookLM من Google</h3>
<p>ممتازة للبحث بالإنجليزية. تحفظات للعربية: الملخصات الصوتية لا تدعم العربية، ودقة OCR على المصادر القديمة ضعيفة، ودقة الاستشهاد أقل بـ 15%.</p>

<h3 style="font-size: 18px; margin: 28px 0 12px;">٠٣. إشارة إقليمية: لا إرشادات خليجية للوكلاء بعد</h3>
<p>الأطر التنظيمية في الإمارات والسعودية وقطر كُتبت قبل الوكلاء. لا تنشر وكيلاً في الأنظمة المؤسسية دون موافقة خطية.</p>

<div style="border-top: 1px solid #e6e1d4; margin: 32px 0; padding-top: 20px;">
  <p><strong>العدد القادم:</strong> إطار minus/plus/times AI مع نموذج تقييم كامل، وسير عمل للترجمة الأكاديمية العربية.</p>
  <p><strong>اشترك:</strong> المشتركون المؤسسون بسعر 48$ شهرياً مدى الحياة. السنوي: 450$.</p>
</div>

<p style="color: #5b6478; font-size: 13px; margin-top: 32px; border-top: 1px solid #e6e1d4; padding-top: 16px;">
  &mdash; مازن<br>
  الذكاء الاصطناعي في الفصل الخليجي<br>
  <em>لتشكيل الأعداد القادمة، رد بسؤال تود الإجابة عليه.</em>
</p>
</div>`;
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
