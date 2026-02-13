#!/usr/bin/env node
/**
 * One-off script: navigate to localhost:3000, scroll to "Why Gigamon?", run evaluate, output result.
 * Run: node evaluate-section.js (requires: npm install playwright)
 */
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.evaluate(() => {
      const heading = [...document.querySelectorAll('h2, h3')].find(el =>
        el.textContent.includes('Why Gigamon')
      );
      if (heading) heading.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await page.waitForTimeout(800);
    const result = await page.evaluate(() => {
      const section = document.querySelector('.section.lottie-animation-container');
      if (!section) return 'No section found';
      const children = [...section.children].map(el => {
        return `<${el.tagName.toLowerCase()} class="${el.className}"> children: ${[...el.children].map(c => `<${c.tagName.toLowerCase()} class="${c.className}">`).join(', ')}`;
      });
      return children.join('\n');
    });
    console.log(result);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
