import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync('js/flooring-product-specs.js', 'utf8'), sandbox);
const products = sandbox.window.CENTRAL_HOME_FLOORING_SPECS;
const documents = sandbox.window.CENTRAL_HOME_FLOORING_DOCUMENTS;
const entries = Object.entries(products);

assert.equal(entries.length, 34, 'all 34 current flooring products must have verified detail data');
assert.deepEqual(Object.keys(documents).sort(), ['hardwood', 'spc', 'wpc']);

const requiredVinyl = ['Brand', 'Type', 'SKU', 'Dimension', 'Coverage', 'Wear Layer Thickness', 'Thickness', 'Width', 'Length', 'Attached Pad', 'Profile', 'Warranty'];
const requiredHardwood = ['Brand', 'Type', 'Collection', 'Species', 'Wood Grade', 'Dimension', 'Coverage', 'Thickness', 'Width', 'Length', 'Veneer Thickness', 'Profile', 'Warranty'];
const names = new Set();
const sources = new Set();

for (const [id, product] of entries) {
  assert.match(id, /^[0-9a-f-]{36}$/i, `${product.name}: invalid product id`);
  assert.ok(product.name && !names.has(product.name), `${product.name}: duplicate or empty name`);
  names.add(product.name);
  assert.ok(product.overview.length >= 100, `${product.name}: overview is too short`);
  assert.equal(product.features.length, 4, `${product.name}: expected four key features`);
  assert.match(product.sourceUrl, /^https:\/\/peninsulafloorings\.com\/product\//, `${product.name}: missing manufacturer source`);
  assert.ok(!sources.has(product.sourceUrl), `${product.name}: duplicate manufacturer source`);
  sources.add(product.sourceUrl);

  const byLabel = Object.fromEntries(product.specifications.map(spec => [spec.label, spec.value]));
  const required = product.type === 'Engineered Hardwood Flooring' ? requiredHardwood : requiredVinyl;
  for (const label of required) assert.ok(byLabel[label], `${product.name}: missing ${label}`);
}

for (const [category, links] of Object.entries(documents)) {
  assert.equal(links.length, 4, `${category}: expected four installation/care/warranty documents`);
  for (const link of links) assert.match(link.url, /^https:\/\/peninsulafloorings\.com\/.+\.pdf$/i);
}

const html = fs.readFileSync('flooring-product-detail.html', 'utf8');
assert.ok(html.includes('js/flooring-product-specs.js'), 'detail page must load verified specs before renderer');
assert.ok(html.indexOf('js/flooring-product-specs.js') < html.indexOf('js/flooring-product-detail.js'), 'spec data must load before renderer');
for (const id of ['product-quick-specs', 'product-features', 'product-specifications', 'product-documents']) {
  assert.ok(html.includes(`id="${id}"`), `detail page missing ${id}`);
}

console.log(`Verified comprehensive detail data for ${entries.length} flooring products.`);
