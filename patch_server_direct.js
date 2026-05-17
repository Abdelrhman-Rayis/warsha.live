const fs = require('fs');

let serverCode = fs.readFileSync('server.js', 'utf8');

const apiRouteCode = `
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
          ? \`<div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6;"><h2>أهلاً بك في الذكاء الاصطناعي في الخليج!</h2><p>مرحباً \${data.name}،<br><br>سعيدون بانضمامك لنا. ستصلك النشرة الأولى صباح يوم الأحد القادم.</p><p>أطيب التحيات،<br>فريق التحرير</p></div>\`
          : \`<div style="font-family: Arial, sans-serif; line-height: 1.6;"><h2>Welcome to AI in Khaleej!</h2><p>Hi \${data.name},<br><br>We're thrilled to have you. You will receive your first briefing this coming Sunday morning.</p><p>Best regards,<br>The Editorial Team</p></div>\`;

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
`;

if (!serverCode.includes('/api/subscribe-ai')) {
  // Inject right after the OPTIONS check
  serverCode = serverCode.replace(
    "    return;\n  }", 
    "    return;\n  }\n" + apiRouteCode
  );
  fs.writeFileSync('server.js', serverCode);
}
