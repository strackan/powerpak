/**
 * Generate PDF from PowerPak Presentation
 * Captures slides 1-20 (before the demo) as horizontal pages
 */

const puppeteer = require('puppeteer');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

const SLIDES_TO_CAPTURE = 20; // Stop before the demo slide (21)
const OUTPUT_FILE = path.join(__dirname, 'PowerPak-Presentation.pdf');

// Helper for waiting (puppeteer v20+ removed waitForTimeout)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function generatePDF() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Set viewport to 16:9 landscape (1920x1080)
  await page.setViewport({
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1.5 // Higher quality
  });

  // Load the presentation
  const htmlPath = `file://${path.join(__dirname, 'index.html')}`;
  console.log(`Loading: ${htmlPath}`);
  await page.goto(htmlPath, { waitUntil: 'networkidle0' });

  // Wait for fonts and styles to load
  await delay(1000);

  const screenshots = [];

  for (let slideNum = 1; slideNum <= SLIDES_TO_CAPTURE; slideNum++) {
    console.log(`Capturing slide ${slideNum}/${SLIDES_TO_CAPTURE}...`);

    // Navigate to the slide
    await page.evaluate((num) => {
      window.goToScene(num);
    }, slideNum);

    // Wait for animations to complete
    await delay(800);

    // For slides with staged reveals, trigger all reveals
    if (slideNum === 5) {
      // Cambrian split
      await page.evaluate(() => {
        const split = document.querySelector('[data-scene="5"] .cambrian-split-container');
        if (split) split.classList.add('split');
      });
      await delay(500);
    }

    if (slideNum === 19) {
      // Holy shit callout
      await page.evaluate(() => {
        const callout = document.querySelector('[data-scene="19"] .holy-callout');
        if (callout) callout.classList.add('visible');
      });
      await delay(300);
    }

    if (slideNum === 20) {
      // New Internet - reveal all elements
      await page.evaluate(() => {
        const leftCol = document.querySelector('[data-scene="20"] .old-internet');
        const rightCol = document.querySelector('[data-scene="20"] .new-internet');
        const quote = document.querySelector('[data-scene="20"] .internet-quote');
        const items = document.querySelectorAll('[data-scene="20"] .timeline-item');

        if (leftCol) leftCol.classList.add('visible');
        if (rightCol) rightCol.classList.add('visible');
        if (quote) quote.classList.add('visible');
        items.forEach(item => item.classList.add('visible'));
      });
      await delay(500);
    }

    // Hide navigation elements for cleaner capture
    await page.evaluate(() => {
      const nav = document.querySelector('.scene-nav');
      const progress = document.querySelector('.scene-progress');
      if (nav) nav.style.display = 'none';
      if (progress) progress.style.display = 'none';
    });

    // Take screenshot
    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: false
    });
    screenshots.push(screenshot);

    // Restore navigation
    await page.evaluate(() => {
      const nav = document.querySelector('.scene-nav');
      const progress = document.querySelector('.scene-progress');
      if (nav) nav.style.display = '';
      if (progress) progress.style.display = '';
    });
  }

  await browser.close();

  // Create PDF from screenshots
  console.log('Creating PDF...');
  const pdfDoc = await PDFDocument.create();

  for (let i = 0; i < screenshots.length; i++) {
    const pngImage = await pdfDoc.embedPng(screenshots[i]);

    // Create landscape page matching the aspect ratio
    const pageWidth = 1920 * 0.5; // Scale down for reasonable PDF size
    const pageHeight = 1080 * 0.5;

    const pdfPage = pdfDoc.addPage([pageWidth, pageHeight]);

    pdfPage.drawImage(pngImage, {
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight
    });
  }

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(OUTPUT_FILE, pdfBytes);

  console.log(`\n✅ PDF created: ${OUTPUT_FILE}`);
  console.log(`   ${SLIDES_TO_CAPTURE} slides captured`);
}

generatePDF().catch(err => {
  console.error('Error generating PDF:', err);
  process.exit(1);
});
