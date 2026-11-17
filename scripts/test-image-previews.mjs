import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const manifest = JSON.parse(await fs.readFile(path.join(ROOT, 'images/previews/manifest.json'), 'utf8'));
assert.ok(manifest.count > 0, 'preview manifest must not be empty');
assert.equal(manifest.images.length, manifest.count);
assert.ok(manifest.previewBytes < manifest.originalBytes, 'previews must save bytes');

for (const image of manifest.images) {
  const file = path.join(ROOT, image.previewPath);
  const stat = await fs.stat(file);
  assert.equal(stat.size, image.previewBytes, `${image.previewPath} size must match manifest`);
  assert.ok(image.previewBytes < image.originalBytes, `${image.previewPath} must be smaller than its original`);
  assert.ok(image.previewWidth <= 720 && image.previewHeight <= 720, `${image.previewPath} exceeds preview dimensions`);
}

const required = [
  'index.html',
  'cabinet-styles.html',
  'flooring.html',
  'gallery.html',
  'outdoor.html',
  'bathroom-vanities.html',
  'door-style-detail.html',
  'outdoor-product-detail.html',
];
for (const file of required) {
  const source = await fs.readFile(path.join(ROOT, file), 'utf8');
  assert.ok(source.includes('js/image-preview-manifest.js'), `${file} must load the preview manifest`);
  assert.ok(source.includes('js/image-previews.js'), `${file} must load the preview helper`);
}

const main = await fs.readFile(path.join(ROOT, 'js/main.js'), 'utf8');
assert.ok(main.includes('centralHomeImages.fullSource'), 'lightbox must resolve full-resolution sources');
const gallery = await fs.readFile(path.join(ROOT, 'gallery.html'), 'utf8');
assert.ok(gallery.includes("openLightbox(el.dataset.fullSrc || '')"), 'gallery lightbox must use original URLs');
assert.ok(gallery.includes('centralHomeImages.setBackground'), 'gallery cards must use lazy preview backgrounds');
const outdoorDetail = await fs.readFile(path.join(ROOT, 'js/outdoor-product-detail.js'), 'utf8');
assert.ok(outdoorDetail.includes('centralHomeImages.setImage(image, photo.image_url)'), 'outdoor thumbnails must use previews');
assert.ok(outdoorDetail.includes('mainImage.src = photo.image_url'), 'outdoor main image must retain the original');

console.log(`Verified ${manifest.count} previews; ${(100 * (1 - manifest.previewBytes / manifest.originalBytes)).toFixed(1)}% aggregate byte reduction.`);
