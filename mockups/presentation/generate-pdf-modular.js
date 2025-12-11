/**
 * Generate PDF from Modular PowerPak Presentation
 * Reads slides from individual files and captures them with all animations triggered
 */

const puppeteer = require('puppeteer');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

// Slide configuration - same as in index-modular.html
const SLIDES = [
  '01-title',
  '02-credibility',
  '03-wilderness',
  '04-question',
  '05-cambrian',
  '06-adhd-problem',
  '07-founder-os',
  '08-devcomx',
  '09-spite',
  '10-voice-os',
  '11-convergence',
  '12-api',
  '13-mcp',
  '14-intro-powerpak',
  '15-permissions',
  '16-professional',
  '17-personal',
  '18-corporate',
  '19-holyshit',
  '20-new-internet'
  // Stop before demo slides for PDF
];

const OUTPUT_FILE = path.join(__dirname, 'PowerPak-Presentation.pdf');
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
    deviceScaleFactor: 1.5
  });

  // Load the presentation
  const htmlPath = `file://${path.join(__dirname, 'index.html')}`;
  console.log(`Loading: ${htmlPath}`);
  await page.goto(htmlPath, { waitUntil: 'networkidle0' });
  await delay(1000);

  const screenshots = [];

  for (let i = 0; i < SLIDES.length; i++) {
    const slideNum = i + 1;
    const slideName = SLIDES[i];
    console.log(`Capturing slide ${slideNum}/${SLIDES.length}: ${slideName}...`);

    // Navigate to the slide
    await page.evaluate((num) => {
      window.goToScene(num);
    }, slideNum);

    // Wait for animations
    await delay(800);

    // Trigger all reveals for specific slides
    await page.evaluate((num) => {
      const scene = document.querySelector(`[data-scene="${num}"]`);
      if (!scene) return;

      // Make all animated elements visible
      scene.querySelectorAll('[data-delay]').forEach(el => el.classList.add('visible'));

      // Slide-specific reveals
      if (num === 5) {
        const split = scene.querySelector('.cambrian-split-container');
        if (split) split.classList.add('split');
      }

      if (num === 19) {
        const callout = scene.querySelector('.holy-callout');
        if (callout) callout.classList.add('visible');
      }

      if (num === 20) {
        scene.querySelectorAll('.timeline-col, .timeline-item, .internet-quote, .internet-title, .internet-subtitle')
          .forEach(el => el.classList.add('visible'));
      }

      // Generic visibility for common animated elements
      scene.querySelectorAll('.realization-line, .convergence-box, .convergence-plus, .os-branch, .os-root, .mcp-bullet, .mcp-footer, .api-panel, .template-column, .blend-card, .voice-accuracy, .devcomx-left, .devcomx-right, .powerpak-features, .network-preview, .major-branch, .pro-panel, .scenario-timeline, .dating-panels, .scenario-controls, .company-card, .dashboard-container, .project-bubble')
        .forEach(el => el.classList.add('visible'));
    }, slideNum);

    await delay(500);

    // Hide navigation
    await page.evaluate(() => {
      const nav = document.querySelector('.scene-nav');
      const progress = document.querySelector('.scene-progress');
      if (nav) nav.style.display = 'none';
      if (progress) progress.style.display = 'none';
    });

    // Take screenshot
    const screenshot = await page.screenshot({ type: 'png', fullPage: false });
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

  // Create PDF
  console.log('Creating PDF...');
  const pdfDoc = await PDFDocument.create();

  for (let i = 0; i < screenshots.length; i++) {
    const pngImage = await pdfDoc.embedPng(screenshots[i]);
    const pageWidth = 1920 * 0.5;
    const pageHeight = 1080 * 0.5;
    const pdfPage = pdfDoc.addPage([pageWidth, pageHeight]);
    pdfPage.drawImage(pngImage, { x: 0, y: 0, width: pageWidth, height: pageHeight });
  }

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(OUTPUT_FILE, pdfBytes);

  console.log(`\n✅ PDF created: ${OUTPUT_FILE}`);
  console.log(`   ${SLIDES.length} slides captured`);
}

generatePDF().catch(err => {
  console.error('Error generating PDF:', err);
  process.exit(1);
});
