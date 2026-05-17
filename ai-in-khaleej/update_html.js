const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const englishForm = `
      <form id="en-subscribe-form" style="display:flex;flex-direction:column;gap:12px;margin-top:20px;text-align:left;">
        <input type="text" id="en-name" placeholder="Your Name" required style="padding:12px; border:1px solid #ccc; font-size:16px;">
        <input type="email" id="en-email" placeholder="Your Email" required style="padding:12px; border:1px solid #ccc; font-size:16px;">
        <input type="text" id="en-role" placeholder="University / Role (Optional)" style="padding:12px; border:1px solid #ccc; font-size:16px;">
        <button type="submit" class="cta" style="border:none; cursor:pointer;">Subscribe</button>
        <div id="en-msg" style="margin-top:10px; font-weight:bold;"></div>
      </form>
`;

const arabicForm = `
      <form id="ar-subscribe-form" style="display:flex;flex-direction:column;gap:12px;margin-top:20px;text-align:right;">
        <input type="text" id="ar-name" placeholder="الاسم" required style="padding:12px; border:1px solid #ccc; font-size:16px; text-align:right;">
        <input type="email" id="ar-email" placeholder="البريد الإلكتروني" required style="padding:12px; border:1px solid #ccc; font-size:16px; text-align:right;">
        <input type="text" id="ar-role" placeholder="الجامعة / المسمى الوظيفي (اختياري)" style="padding:12px; border:1px solid #ccc; font-size:16px; text-align:right;">
        <button type="submit" class="cta" style="border:none; cursor:pointer;">اشترك الآن</button>
        <div id="ar-msg" style="margin-top:10px; font-weight:bold;"></div>
      </form>
`;

const script = `
<script>
async function handleSubscribe(e, lang) {
  e.preventDefault();
  const msgEl = document.getElementById(lang + '-msg');
  const btn = e.target.querySelector('button');
  btn.disabled = true;
  btn.innerText = lang === 'en' ? 'Subscribing...' : 'جاري الاشتراك...';
  
  const payload = {
    name: document.getElementById(lang + '-name').value,
    email: document.getElementById(lang + '-email').value,
    role: document.getElementById(lang + '-role').value,
    lang: lang
  };
  
  try {
    const res = await fetch('/api/subscribe-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if(res.ok) {
      msgEl.style.color = 'green';
      msgEl.innerText = lang === 'en' ? 'Success! Check your inbox for the welcome email.' : 'تم الاشتراك! تفقد بريدك الإلكتروني.';
      e.target.reset();
    } else {
      const data = await res.json();
      msgEl.style.color = 'red';
      msgEl.innerText = data.error || (lang === 'en' ? 'An error occurred.' : 'حدث خطأ.');
    }
  } catch(err) {
    msgEl.style.color = 'red';
    msgEl.innerText = lang === 'en' ? 'An error occurred.' : 'حدث خطأ.';
  }
  
  btn.disabled = false;
  btn.innerText = lang === 'en' ? 'Subscribe' : 'اشترك الآن';
}

document.getElementById('en-subscribe-form')?.addEventListener('submit', (e) => handleSubscribe(e, 'en'));
document.getElementById('ar-subscribe-form')?.addEventListener('submit', (e) => handleSubscribe(e, 'ar'));
</script>
</body>
`;

html = html.replace(/<a href="SUBSTACK_URL_HERE"[^>]*>Subscribe<\/a>/g, englishForm);
html = html.replace(/<a href="SUBSTACK_URL_HERE_AR"[^>]*>اشترك<\/a>/g, arabicForm);
// Also just in case the arabic anchor is different:
html = html.replace(/<a href="[^"]*" class="cta">اشترك<\/a>/g, arabicForm);
html = html.replace('</body>', script);

fs.writeFileSync('index.html', html);
