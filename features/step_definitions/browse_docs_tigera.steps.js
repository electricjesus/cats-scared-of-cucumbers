
const assert = require('assert');
const { Given, When, Then, setWorldConstructor, Before, After } = require('@cucumber/cucumber');
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

class CustomWorld {
  async init() {
    this.browser = await chromium.launch({ headless: true });
    this.page = await this.browser.newPage();
  }
  async close() {
    if (this.page) await this.page.close();
    if (this.browser) await this.browser.close();
  }
}
setWorldConstructor(CustomWorld);


Before(async function () {
  await this.init();
  // Only enable tracing on failure for performance
});


After(async function () {
  await this.close();
});



Given('I browse to {string}', async function (url) {
  await this.page.goto(url, { waitUntil: 'load' });
});


When('the page has loaded', async function () {
  await this.page.waitForLoadState('load');
  // Wait for React/Vue app to render content
  try {
    // Wait for any main content element to appear
    await this.page.waitForSelector('main, [role="main"], .main-content, #content', { timeout: 5000 });
  } catch (e) {
    // If no main content selector found, wait for any substantial content
    await this.page.waitForFunction(() => {
      const bodyText = document.body.innerText || '';
      return bodyText.length > 1000; // Wait for substantial text content
    }, { timeout: 5000 });
  }
});



Then('I should see a box for {string}', async function (boxText) {
  // Log page content for debugging (use innerText instead of textContent)
  const pageText = await this.page.evaluate(() => document.body.innerText);
  console.log('Page visible text:', pageText.substring(0, 500) + '...');
  
  // Use simpler, faster selectors with multiple strategies
  try {
    const selectors = [
      `text="${boxText}"`,
      `text*="${boxText}"`,
      `[role="button"]:has-text("${boxText}")`,
      `[class*="card"]:has-text("${boxText}")`,
      `[class*="box"]:has-text("${boxText}")`,
      `a:has-text("${boxText}")`,
      `div:has-text("${boxText}")`,
      `h1:has-text("${boxText}")`,
      `h2:has-text("${boxText}")`,
      `h3:has-text("${boxText}")`
    ];
    
    let found = false;
    let foundElement = null;
    for (const selector of selectors) {
      try {
        const elements = await this.page.locator(selector).all();
        for (const element of elements) {
          if (await element.isVisible()) {
            found = true;
            foundElement = element;
            console.log(`Found "${boxText}" using selector: ${selector}`);
            break;
          }
        }
        if (found) break;
      } catch (e) {
        // Try next selector
      }
    }
    
    assert(found, `Could not find a box for '${boxText}'. Available text: ${pageText.substring(0, 200)}...`);
  } catch (error) {
    // Ensure screenshots directory exists
    const screenshotsDir = path.join(process.cwd(), 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
    
    // Take screenshot on failure for debugging
    await this.page.screenshot({ path: `screenshots/failure-${boxText.replace(/\s+/g, '-')}-${Date.now()}.png` });
    throw error;
  }
});
