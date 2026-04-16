// debg-coins.mjs
// Replaces near-white/near-black backgrounds in coin images with the page parchment colour.
// Strategy: flood-fill from the four corners with a tolerance, then composite the original
// coin circle on top of the new background.
// Requires: sharp (already installed as devDependency)

import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// Page background: #ede5d5 → rgb(237, 229, 213)
const BG = { r: 237, g: 229, b: 213 };

const COIN_IMAGES = [
  'public/images/emperors/Gold_Solidus_of_Constantius_II,_Antioch.jpg',
  'public/images/emperors/theodosius-ii.jpg',
  'public/images/emperors/Gold_Solidus_of_Leo_I,_462-466.jpg',
  'public/images/emperors/Solidus_of_Heraclius_and_Heraclius_Constantine_MET_sf04-2-821s1.jpg',
  'public/images/emperors/Solidus_of_Heraclius_and_Heraclius_Constantine_MET_sf04-2-821s1 (1).jpg',
];

// Tolerance for background colour detection (0–255 per channel)
const TOLERANCE = 38;

function colourMatch(r, g, b, tr, tg, tb, tol) {
  return Math.abs(r - tr) <= tol && Math.abs(g - tg) <= tol && Math.abs(b - tb) <= tol;
}

// BFS flood-fill from corners, marking background pixels
function floodFill(data, width, height, seedR, seedG, seedB, tol) {
  const mask = new Uint8Array(width * height); // 1 = background
  const queue = [];

  const seed = (x, y) => {
    const idx = (y * width + x) * 4;
    const r = data[idx], g = data[idx + 1], b = data[idx + 2];
    if (!mask[y * width + x] && colourMatch(r, g, b, seedR, seedG, seedB, tol)) {
      mask[y * width + x] = 1;
      queue.push(x, y);
    }
  };

  // Seed from all four corners (sample 5×5 area)
  for (let cy = 0; cy < 5; cy++) for (let cx = 0; cx < 5; cx++) {
    seed(cx, cy);
    seed(width - 1 - cx, cy);
    seed(cx, height - 1 - cy);
    seed(width - 1 - cx, height - 1 - cy);
  }

  let qi = 0;
  while (qi < queue.length) {
    const x = queue[qi++], y = queue[qi++];
    const neighbours = [[x-1,y],[x+1,y],[x,y-1],[x,y+1]];
    for (const [nx, ny] of neighbours) {
      if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
      if (mask[ny * width + nx]) continue;
      const idx = (ny * width + nx) * 4;
      const r = data[idx], g = data[idx + 1], b = data[idx + 2];
      if (colourMatch(r, g, b, seedR, seedG, seedB, tol)) {
        mask[ny * width + nx] = 1;
        queue.push(nx, ny);
      }
    }
  }
  return mask;
}

async function processImage(relPath) {
  const fullPath = resolve(root, relPath);
  console.log(`Processing: ${relPath}`);

  const img = sharp(fullPath);
  const { width, height } = await img.metadata();

  // Get raw RGBA data
  const raw = await img.ensureAlpha().raw().toBuffer();
  const data = new Uint8Array(raw.buffer);

  // Sample corner to determine background colour
  const cornerR = data[0], cornerG = data[1], cornerB = data[2];
  console.log(`  Corner colour: rgb(${cornerR},${cornerG},${cornerB})`);

  // Flood fill from corners
  const mask = floodFill(data, width, height, cornerR, cornerG, cornerB, TOLERANCE);

  // Replace masked pixels with page background, preserve alpha
  let replaced = 0;
  for (let i = 0; i < width * height; i++) {
    if (mask[i]) {
      data[i * 4]     = BG.r;
      data[i * 4 + 1] = BG.g;
      data[i * 4 + 2] = BG.b;
      data[i * 4 + 3] = 255;
      replaced++;
    }
  }
  console.log(`  Replaced ${replaced} px (${((replaced / (width * height)) * 100).toFixed(1)}%)`);

  // Write back as JPEG (no alpha needed now that bg matches)
  await sharp(Buffer.from(data.buffer), { raw: { width, height, channels: 4 } })
    .flatten({ background: BG })
    .jpeg({ quality: 92 })
    .toFile(fullPath + '.tmp.jpg');

  // Rename over original
  const { renameSync } = await import('fs');
  renameSync(fullPath + '.tmp.jpg', fullPath.replace(/\.(jpe?g|webp|png)$/i, '.jpg'));
  console.log(`  Done → ${relPath.replace(/\.(jpe?g|webp|png)$/i, '.jpg')}`);
}

for (const img of COIN_IMAGES) {
  try {
    await processImage(img);
  } catch (e) {
    console.error(`  ERROR: ${e.message}`);
  }
}
console.log('\nAll done.');
