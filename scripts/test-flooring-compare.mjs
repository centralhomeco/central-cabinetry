import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html = fs.readFileSync('flooring-compare.html', 'utf8');
const flooringHtml = fs.readFileSync('flooring.html', 'utf8');
const sitemap = fs.readFileSync('sitemap.xml', 'utf8');
const compareJs = fs.readFileSync('js/flooring-compare.js', 'utf8');
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync('js/flooring-product-specs.js', 'utf8'), sandbox);
const products = Object.values(sandbox.window.CENTRAL_HOME_FLOORING_SPECS);

assert.match(html, /<link rel="canonical" href="https:\/\/www\.centralhomeco\.com\/flooring-compare\.html">/);
assert.equal((html.match(/class="compare-card" data-category=/g) || []).length, 3, 'expected three collection cards');
assert.match(html, /<table class="compare-table">/);
assert.match(html, /Engineered Hardwood/);
assert.match(html, /WPC Luxury Vinyl/);
assert.match(html, /SPC Luxury Vinyl/);
assert.match(html, /FloorScore®/);
assert.match(html, /EPA TSCA Title VI/);
assert.match(html, /CARB Phase 2/);
assert.match(html, /Lacey Act/);
assert.match(html, /Zero Added Formaldehyde/);
assert.match(html, /Wholesale available\./);

const imagePaths = [...html.matchAll(/(?:src)="(images\/(?:flooring-compare|certifications)\/[^"]+)"/g)].map(match => match[1]);
assert.ok(imagePaths.length >= 8, 'comparison page should use collection and certification images');
for (const imagePath of new Set(imagePaths)) {
  assert.ok(fs.existsSync(imagePath), `${imagePath} is missing`);
  assert.ok(fs.statSync(imagePath).size > 1000, `${imagePath} is empty`);
}

const counts = products.reduce((result, product) => {
  const type = product.type || '';
  const category = type === 'Engineered Hardwood Flooring' ? 'hardwood' : (type.startsWith('WPC') ? 'wpc' : 'spc');
  result[category] = (result[category] || 0) + 1;
  return result;
}, {});
assert.deepEqual(counts, { hardwood: 15, spc: 11, wpc: 8 });
for (const [category, count] of Object.entries(counts)) {
  assert.match(html, new RegExp(`data-product-count="${category}">${count}<`), `${category} fallback count is incorrect`);
  assert.match(html, new RegExp(`flooring\\.html\\?type=${category}`), `${category} catalog link is missing`);
}

assert.match(flooringHtml, /href="flooring-compare\.html"/);
assert.match(flooringHtml, /new URLSearchParams\(window\.location\.search\)\.get\('type'\)/);
assert.match(sitemap, /https:\/\/www\.centralhomeco\.com\/flooring-compare\.html/);
assert.doesNotMatch(compareJs, /…/, 'comparison script contains an abbreviated API key');
assert.match(compareJs, /flooring_products\?active=eq\.true&select=category/);

console.log('Verified flooring collection comparison page, data ranges, assets, links, and discovery paths.');
