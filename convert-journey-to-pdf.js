const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  const htmlPath = path.join(__dirname, 'student-journey.html');
  const fileUrl = 'file://' + htmlPath;
  
  await page.goto(fileUrl, { waitUntil: 'networkidle2' });
  
  const pdfPath = path.join(__dirname, 'student-journey.pdf');
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    margin: {
      top: '20mm',
      right: '15mm',
      bottom: '20mm',
      left: '15mm'
    },
    printBackground: true,
    preferCSSPageSize: true
  });
  
  console.log(`PDF created successfully at: ${pdfPath}`);
  
  await browser.close();
})();
