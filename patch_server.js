const fs = require('fs');

let serverCode = fs.readFileSync('server.js', 'utf8');

const apiRouteCode = `
  if (req.method === 'POST' && req.url === '/api/subscribe-ai') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
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
          ? \`<div dir="rtl"><h2>أهلاً بك في الذكاء الاصطناعي في الخليج!</h2><p>مرحباً \${data.name}،<br>سعيدون بانضمامك لنا. ستصلك النشرة الأولى يوم الأحد القادم.</p></div>\`
          : \`<div><h2>Welcome to AI in Khaleej!</h2><p>Hi \${data.name},<br>We're thrilled to have you. You will receive your first briefing this coming Sunday.</p></div>\`;

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
             res.writeHead(200, { 'Content-Type': 'application/json' });
             res.end(JSON.stringify({ success: true }));
          });
        });

        emailReq.on('error', (e) => {
          console.error("Resend Error:", e);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Failed to send email' }));
        });

        emailReq.write(postData);
        emailReq.end();

      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Server error' }));
      }
    });
    return;
  }
`;

if (!serverCode.includes('/api/subscribe-ai')) {
  serverCode = serverCode.replace("if (req.method === 'POST' && req.url === '/api/login') {", apiRouteCode + "\n  if (req.method === 'POST' && req.url === '/api/login') {");
  fs.writeFileSync('server.js', serverCode);
}
