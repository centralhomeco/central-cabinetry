import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve('images/social/outdoor-kitchen-library-2026-11-27');
const outputDir = path.join(root, 'posts');
const maxRatio = 1.91;
const targetWidth = 1280;

const posts = [
  ['01-dark-linear-pizza-oven-grill-sink.jpg', 'originals/batch-03/input-38455f77-e74b-4191-bca5-0ebbc6804103.jpg'],
  ['02-dark-linear-grill-kamado-sink.jpg', 'originals/batch-03/input-2cd119c7-5de5-4529-8313-f71423a6b0ac.jpg'],
  ['03-stainless-l-shape-grill-sink-refrigerator.jpg', 'originals/batch-03/input-34131fc9-9567-4b99-9d03-5bc97b5aa1b1.jpg'],
  ['04-family-outdoor-kitchen-grill-kamado-refrigerator.jpg', 'originals/batch-05/input-b10a4403-40bd-47e7-8ea0-fcee68e61639.jpg'],
  ['05-patio-pizza-oven-kamado-sink-refrigerator.jpg', 'originals/batch-05/input-0f4a8f77-2d6e-45e3-a7d3-57f7184fbb1d.jpg'],
  ['06-garden-pizza-oven-grill-sink-refrigerator.jpg', 'originals/batch-05/input-a94c052e-afe9-4f56-a5d5-bca7e88abcc4.jpg'],
  ['07-backyard-grill-kamado-refrigerator.jpg', 'originals/batch-05/input-db52570e-0d3b-456d-b82e-eb52f1ef96ff.jpg'],
  ['08-stainless-l-shape-grill-sink-refrigerator.jpg', 'originals/batch-05/input-3b55de98-51b1-4e8e-a8be-9d433d66e395.jpg'],
  ['09-corner-grill-sink-refrigerator-wood-accent.jpg', 'originals/batch-05/input-f6ae9989-4aa0-4ee3-a63b-17ac4dbfcd46.jpg'],
  ['10-light-linear-grill-kamado-sink-refrigerator.jpg', 'originals/batch-05/input-5bbf3e58-92d0-4004-a88a-442e1407e7b1.jpg'],
  ['11-dark-linear-grill-kamado-sink-refrigerator.jpg', 'originals/batch-05/input-983755e2-e2df-4cea-9076-a4a4212d01ca.jpg'],
  ['12-dark-linear-pizza-oven-kamado-sink-refrigerator.jpg', 'originals/batch-05/input-68359ab1-74df-4ad3-91c2-1b29cb9adaf2.jpg'],
  ['13-dark-corner-grill-sink-refrigerator-wood-accent.jpg', 'originals/batch-05/input-8e6a2ba5-8454-4dfd-9cd3-75d84e218d10.jpg'],
];

const digest = (buffer) => createHash('sha256').update(buffer).digest('hex');
await mkdir(outputDir, { recursive: true });
const manifest = [];
for (const [outputName, sourceRelative] of posts) {
  const sourcePath = path.join(root, sourceRelative);
  const source = await readFile(sourcePath);
  const sourceMeta = await sharp(source).metadata();
  const sourceRatio = sourceMeta.width / sourceMeta.height;
  const targetHeight = sourceRatio > maxRatio
    ? Math.ceil(targetWidth / maxRatio)
    : Math.round(targetWidth / sourceRatio);
  const resize = sourceRatio > maxRatio
    ? { width: targetWidth, height: targetHeight, fit: 'contain', background: '#ffffff', withoutEnlargement: false }
    : { width: targetWidth, height: targetHeight, fit: 'fill', withoutEnlargement: false };
  const output = await sharp(source)
    .rotate()
    .resize(resize)
    .toColourspace('srgb')
    .jpeg({ quality: 90, progressive: true, chromaSubsampling: '4:4:4' })
    .withMetadata({ icc: 'srgb' })
    .toBuffer();
  const outputPath = path.join(outputDir, outputName);
  await writeFile(outputPath, output);
  const outputMeta = await sharp(output).metadata();
  manifest.push({
    output: path.relative(root, outputPath),
    source: sourceRelative,
    sourceWidth: sourceMeta.width,
    sourceHeight: sourceMeta.height,
    sourceSha256: digest(source),
    outputWidth: outputMeta.width,
    outputHeight: outputMeta.height,
    outputRatio: Number((outputMeta.width / outputMeta.height).toFixed(4)),
    outputBytes: output.length,
    outputSha256: digest(output),
    crop: 'none',
    padding: sourceRatio > maxRatio ? 'white vertical padding to 1.91:1 maximum ratio' : 'none',
    adjustments: 'auto-orient, sRGB conversion, high-quality resize only',
  });
}
await writeFile(path.join(root, 'post-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

const selectedSources = new Set(posts.map(([, source]) => source));
const originalFiles = (await readdir(path.join(root, 'originals'), { recursive: true }))
  .filter((file) => file.toLowerCase().endsWith('.jpg'))
  .map((file) => `originals/${file.replaceAll('\\\\', '/')}`)
  .sort();
const libraryManifest = [];
for (const sourceRelative of originalFiles) {
  const source = await readFile(path.join(root, sourceRelative));
  const meta = await sharp(source).metadata();
  libraryManifest.push({
    source: sourceRelative,
    width: meta.width,
    height: meta.height,
    bytes: source.length,
    sha256: digest(source),
    status: selectedSources.has(sourceRelative) ? 'accepted as one-kitchen post' : 'queued as component/detail/supporting image',
  });
}
await writeFile(path.join(root, 'library-manifest.json'), `${JSON.stringify(libraryManifest, null, 2)}\n`);

const cellWidth = 500;
const cellHeight = 340;
const imageWidth = 470;
const imageHeight = 285;
const rows = [];
for (let index = 0; index < posts.length; index += 1) {
  const [outputName, sourceRelative] = posts[index];
  const sourceThumb = await sharp(path.join(root, sourceRelative))
    .rotate().resize({ width: imageWidth, height: imageHeight, fit: 'contain', background: '#ffffff' }).jpeg({ quality: 82 }).toBuffer();
  const outputThumb = await sharp(path.join(outputDir, outputName))
    .resize({ width: imageWidth, height: imageHeight, fit: 'contain', background: '#ffffff' }).jpeg({ quality: 82 }).toBuffer();
  const y = index * cellHeight;
  const label = Buffer.from(`<svg width="1000" height="40"><rect width="1000" height="40" fill="#f2f2f2"/><text x="15" y="27" font-family="Arial,sans-serif" font-size="18" fill="#111">${index + 1}. source</text><text x="515" y="27" font-family="Arial,sans-serif" font-size="18" fill="#111">${outputName}</text></svg>`);
  rows.push({ input: label, left: 0, top: y });
  rows.push({ input: sourceThumb, left: 15, top: y + 45 });
  rows.push({ input: outputThumb, left: cellWidth + 15, top: y + 45 });
}
await sharp({ create: { width: cellWidth * 2, height: cellHeight * posts.length, channels: 3, background: '#dddddd' } })
  .composite(rows)
  .jpeg({ quality: 86, progressive: true })
  .toFile(path.join(root, 'qa-original-vs-post-contact-sheet.jpg'));

console.log(`Built ${manifest.length} post images from ${libraryManifest.length} preserved originals.`);
