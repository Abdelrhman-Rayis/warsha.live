const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const courseTitleAr = 'كورس أسس تصميم البحث في العلوم الاجتماعية';
const courseTitleEn = 'Foundations of Social Science Research Design Course';
const outputDir = path.join(__dirname, '..', 'invoices_ar');

const invoices = [
  {
    invoiceNumber: 'FSSR-2026-001',
    fileSlug: 'invoice-01-nadeen',
    name: 'نادين جعفر المدني احمد',
    email: 'nadeenjaffer@gmail.com',
    paymentDate: '23/4/2026',
    paymentMethod: 'بنك الخرطوم (بنكك)',
    amount: '100,000 جنيه سوداني',
    note: 'تم إعداد هذه الفاتورة بناءً على البيانات المحدثة.',
  },
  {
    invoiceNumber: 'FSSR-2026-002',
    fileSlug: 'invoice-02-alnour',
    name: 'النور مصطفى النور محمد',
    email: 'alnourmustafa97@gmail.com',
    paymentDate: '23/4/2026',
    paymentMethod: 'بنك الخرطوم (بنكك)',
    amount: '100,000 جنيه سوداني',
    note: 'تم إعداد هذه الفاتورة بناءً على البيانات المحدثة.',
  },
  {
    invoiceNumber: 'FSSR-2026-003',
    fileSlug: 'invoice-03-elham',
    name: 'إلهام عامر محمد أحمد',
    email: 'elhamelhamelham99@gmail.com',
    paymentDate: '23/4/2026',
    paymentMethod: 'بنك الخرطوم (بنكك)',
    amount: '200,000 جنيه سوداني',
    note: 'تم إعداد هذه الفاتورة بناءً على البيانات المحدثة.',
  },
  {
    invoiceNumber: 'FSSR-2026-004',
    fileSlug: 'invoice-04-sittana',
    name: 'ستنا عبدالله سيداحمد محمد',
    email: 'sittana8@gmail.com',
    paymentDate: '23/4/2026',
    paymentMethod: 'بنك الخرطوم (بنكك)',
    amount: '200,000 جنيه سوداني',
    note: 'تم إعداد هذه الفاتورة بناءً على البيانات المحدثة.',
  },
];

function buildInvoiceHtml(invoice) {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${invoice.invoiceNumber}</title>
  <style>
    @page {
      size: A4;
      margin: 8mm;
    }

    :root {
      color-scheme: light;
      --ink: #17324d;
      --accent: #0f766e;
      --accent-deep: #0d4d73;
      --accent-soft: #dff5f1;
      --line: #d8e3eb;
      --paper: #ffffff;
      --muted: #667788;
      --panel: #f7fafc;
      --panel-strong: #eef5f8;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      background: #eef3f8;
      color: #14202b;
      font-family: "Noto Naskh Arabic", "Geeza Pro", "Arial", sans-serif;
    }

    .page {
      min-height: auto;
      padding: 18px;
    }

    .invoice {
      background: var(--paper);
      border: 1px solid var(--line);
      border-radius: 28px;
      overflow: hidden;
      box-shadow: 0 18px 50px rgba(16, 42, 67, 0.08);
      break-inside: avoid;
    }

    .header {
      background:
        radial-gradient(circle at top right, rgba(255, 255, 255, 0.16), transparent 28%),
        linear-gradient(135deg, var(--accent-deep), var(--accent));
      color: #fff;
      padding: 24px 28px;
    }

    .header-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.45fr) minmax(250px, 320px);
      gap: 20px;
      align-items: center;
    }

    .header-copy {
      min-width: 0;
    }

    .kicker {
      display: inline-flex;
      align-items: center;
      padding: 7px 13px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.14);
      border: 1px solid rgba(255, 255, 255, 0.18);
      font-size: 13px;
      font-weight: 700;
      margin-bottom: 12px;
    }

    h1 {
      margin: 0 0 8px;
      font-size: 34px;
      line-height: 1.14;
      word-break: break-word;
    }

    .subtitle {
      margin: 0;
      font-size: 16px;
      line-height: 1.55;
      color: rgba(255, 255, 255, 0.88);
    }

    .invoice-meta {
      background: rgba(255, 255, 255, 0.96);
      color: var(--ink);
      border: 1px solid rgba(255, 255, 255, 0.26);
      border-radius: 20px;
      padding: 16px 18px 14px;
      width: 100%;
      justify-self: stretch;
      display: grid;
      gap: 6px;
      box-shadow: 0 12px 30px rgba(7, 32, 48, 0.12);
      break-inside: avoid;
    }

    .meta-title {
      margin: 0 0 2px;
      font-size: 16px;
      color: var(--ink);
    }

    .meta-subtitle {
      margin: 0 0 4px;
      font-size: 12px;
      color: var(--muted);
    }

    .fact {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
      padding: 9px 0;
      border-bottom: 1px solid var(--line);
    }

    .fact:last-child {
      border-bottom: 0;
      padding-bottom: 4px;
    }

    .fact-label {
      font-size: 12px;
      color: var(--muted);
    }

    .fact-value {
      font-size: 16px;
      font-weight: 700;
      line-height: 1.3;
      overflow-wrap: anywhere;
      text-align: left;
    }

    .ltr {
      direction: ltr;
      unicode-bidi: plaintext;
      text-align: left;
      font-family: "SFMono-Regular", "Menlo", "Consolas", monospace;
      letter-spacing: 0.03em;
    }

    .content {
      padding: 18px 24px 20px;
      display: grid;
      gap: 14px;
    }

    .overview {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(250px, 340px);
      gap: 14px;
      align-items: stretch;
      background: linear-gradient(180deg, #f7fffd, #eff8f7);
      border: 1px solid #cfece6;
      border-radius: 22px;
      padding: 16px 18px;
      break-inside: avoid;
    }

    .overview-copy {
      display: grid;
      gap: 8px;
      align-content: center;
    }

    .overview-title {
      margin: 0;
      font-size: 24px;
      color: var(--ink);
    }

    .overview-text {
      margin: 0;
      font-size: 13px;
      line-height: 1.7;
      color: var(--muted);
    }

    .amount-box {
      background: #fff;
      border: 1px solid #c8e9e1;
      border-radius: 18px;
      padding: 14px 16px;
      display: grid;
      gap: 6px;
      align-content: center;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
    }

    .amount-label {
      color: var(--muted);
      font-size: 12px;
    }

    .amount-value {
      color: var(--accent);
      font-size: 28px;
      font-weight: 800;
      line-height: 1.25;
    }

    .details-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.12fr) minmax(0, 0.88fr);
      gap: 14px;
    }

    .panel {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 20px;
      padding: 18px;
      break-inside: avoid;
    }

    .panel-title {
      margin: 0 0 12px;
      color: var(--ink);
      font-size: 22px;
    }

    .detail-list {
      display: grid;
      gap: 10px;
    }

    .detail-row {
      display: grid;
      grid-template-columns: 120px minmax(0, 1fr);
      gap: 10px;
      align-items: start;
      padding-bottom: 10px;
      border-bottom: 1px dashed #c8d4df;
    }

    .detail-row:last-child {
      border-bottom: 0;
      padding-bottom: 0;
    }

    .detail-label {
      color: var(--muted);
      font-size: 13px;
    }

    .detail-value {
      font-size: 15px;
      color: #12212f;
      line-height: 1.55;
      word-break: break-word;
    }

    .course-name {
      font-size: 14px;
      line-height: 1.45;
    }

    .status-row {
      display: flex;
      justify-content: flex-end;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      padding: 10px 16px;
      background: var(--accent-soft);
      color: #0c5f58;
      border-radius: 999px;
      font-weight: 700;
      border: 1px solid #c9ebe4;
    }

    @media print {
      body {
        background: #fff;
      }

      .page {
        padding: 0;
        min-height: auto;
      }

      .invoice {
        box-shadow: none;
      }

      .status-row {
        display: none;
      }
    }

    @media (max-width: 760px) {
      .page {
        padding: 12px;
      }

      .header {
        padding: 22px 18px;
      }

      .content {
        padding: 18px;
      }

      .header-grid,
      .overview,
      .details-grid {
        grid-template-columns: 1fr;
      }

      h1 {
        font-size: 30px;
      }

      .subtitle {
        font-size: 17px;
      }

      .detail-row {
        grid-template-columns: 1fr;
        gap: 4px;
      }

      .amount-box {
        min-width: 0;
      }

      .amount-value {
        font-size: 28px;
      }
    }
  </style>
</head>
<body>
  <div class="page">
    <main class="invoice">
      <section class="header">
        <div class="header-grid">
          <div class="header-copy">
            <div class="kicker">فاتورة سداد رسوم</div>
            <h1>${courseTitleAr}</h1>
            <p class="subtitle">${courseTitleEn}</p>
          </div>
          <div class="invoice-meta">
            <h2 class="meta-title">بيانات الفاتورة</h2>
            <p class="meta-subtitle">مستند سداد رسوم التسجيل للدورة.</p>
            <div class="fact">
              <div class="fact-label">رقم الفاتورة</div>
              <div class="fact-value ltr">${invoice.invoiceNumber}</div>
            </div>
            <div class="fact">
              <div class="fact-label">تاريخ الإصدار</div>
              <div class="fact-value ltr">${invoice.paymentDate}</div>
            </div>
            <div class="fact">
              <div class="fact-label">الحالة</div>
              <div class="fact-value">تم السداد</div>
            </div>
          </div>
        </div>
      </section>

      <section class="content">
        <section class="overview">
          <div class="overview-copy">
            <h2 class="overview-title">ملخص العملية</h2>
            <p class="overview-text">تؤكد الفاتورة استلام المبلغ أدناه كقيمة في رسوم التسجيل الخاصة بالدورة وفق البيانات المرفقة. ${invoice.note}</p>
          </div>
          <div class="amount-box">
            <div class="amount-label">القيمة الإجمالية</div>
            <div class="amount-value">${invoice.amount}</div>
          </div>
        </section>

        <div class="details-grid">
          <section class="panel">
            <h2 class="panel-title">بيانات الطالب</h2>
            <div class="detail-list">
              <div class="detail-row">
                <div class="detail-label">الاسم</div>
                <div class="detail-value">${invoice.name}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">البريد الإلكتروني</div>
                <div class="detail-value ltr">${invoice.email}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">اسم الدورة</div>
                <div class="detail-value course-name">${courseTitleAr}</div>
              </div>
            </div>
          </section>

          <section class="panel">
            <h2 class="panel-title">بيانات الدفع</h2>
            <div class="detail-list">
              <div class="detail-row">
                <div class="detail-label">تاريخ الدفع</div>
                <div class="detail-value ltr">${invoice.paymentDate}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">وسيلة الدفع</div>
                <div class="detail-value">${invoice.paymentMethod}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">حالة السداد</div>
                <div class="detail-value">تم السداد</div>
              </div>
            </div>
          </section>
        </div>

        <div class="status-row">
          <div class="badge">تم السداد</div>
        </div>
      </section>
    </main>
  </div>
</body>
</html>`;
}

async function generate() {
  fs.mkdirSync(outputDir, { recursive: true });

  const browser = await puppeteer.launch();

  try {
    for (const invoice of invoices) {
      const html = buildInvoiceHtml(invoice);
      const htmlPath = path.join(outputDir, `${invoice.fileSlug}.html`);
      const pdfPath = path.join(outputDir, `${invoice.fileSlug}.pdf`);

      fs.writeFileSync(htmlPath, html, 'utf8');

      const page = await browser.newPage();
      await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
      await page.pdf({
        path: pdfPath,
        printBackground: true,
        preferCSSPageSize: true,
        margin: {
          top: '0',
          right: '0',
          bottom: '0',
          left: '0',
        },
      });
      await page.close();
    }
  } finally {
    await browser.close();
  }

  console.log(`Generated ${invoices.length} Arabic invoices in ${outputDir}`);
}

generate().catch((error) => {
  console.error(error);
  process.exit(1);
});
