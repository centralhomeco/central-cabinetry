import fs from 'node:fs/promises';
import { chromium } from 'playwright-core';

const CHROME = process.env.CHROME_PATH || chromium.executablePath();
const LIBS = process.env.CHROME_LIBS || '';
const beforeOrigin = process.env.BEFORE_ORIGIN || 'https://www.centralhomeco.com';
const afterOrigin = process.env.AFTER_ORIGIN || 'http://127.0.0.1:4173';
const pages = ['index.html', 'cabinet-styles.html', 'flooring.html', 'gallery.html'];

const browser = await chromium.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
  env: { ...process.env, LD_LIBRARY_PATH: [LIBS, process.env.LD_LIBRARY_PATH].filter(Boolean).join(':') },
});

async function measure(origin, pathname) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, serviceWorkers: 'block' });
  const page = await context.newPage();
  const client = await context.newCDPSession(page);
  await client.send('Network.enable');
  await client.send('Network.setCacheDisabled', { cacheDisabled: true });
  const requests = new Map();
  const images = [];
  const errors = [];
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', error => errors.push(error.message));
  client.on('Network.requestWillBeSent', event => requests.set(event.requestId, { url: event.request.url, type: event.type }));
  client.on('Network.loadingFinished', event => {
    const request = requests.get(event.requestId);
    if (request?.type === 'Image') images.push({ url: request.url, bytes: event.encodedDataLength });
  });
  await page.goto(`${origin}/${pathname}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);
  const result = {
    origin,
    pathname,
    viewport: '1440x900@1x',
    cache: 'disabled',
    imageRequests: images.length,
    imageBytes: images.reduce((sum, item) => sum + item.bytes, 0),
    supabaseStorageRequests: images.filter(item => item.url.includes('.supabase.co/storage/')).length,
    supabaseStorageBytes: images.filter(item => item.url.includes('.supabase.co/storage/')).reduce((sum, item) => sum + item.bytes, 0),
    localPreviewRequests: images.filter(item => item.url.includes('/images/previews/')).length,
    localPreviewBytes: images.filter(item => item.url.includes('/images/previews/')).reduce((sum, item) => sum + item.bytes, 0),
    errors,
  };
  if (pathname === 'gallery.html') {
    const first = page.locator('.gallery-full-item').first();
    await first.click();
    await page.locator('#lightbox.open').waitFor({ timeout: 10000 });
    await page.locator('#lightboxImg').evaluate(img => img.complete && img.naturalWidth > 0
      ? true
      : new Promise((resolve, reject) => {
          img.addEventListener('load', () => resolve(true), { once: true });
          img.addEventListener('error', () => reject(new Error('Lightbox image failed to load')), { once: true });
        }));
    result.lightbox = await page.locator('#lightboxImg').evaluate(img => ({ src: img.currentSrc || img.src, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight }));
  }
  await context.close();
  return result;
}

const results = { generatedAt: new Date().toISOString(), pages: [] };
for (const pathname of pages) {
  results.pages.push({ before: await measure(beforeOrigin, pathname), after: await measure(afterOrigin, pathname) });
}
await browser.close();
await fs.mkdir('reports', { recursive: true });
await fs.writeFile('reports/image-egress-comparison.json', JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
