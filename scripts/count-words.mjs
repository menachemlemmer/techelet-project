import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

function walkDir(dir) {
  const files = [];
  for (const f of readdirSync(dir)) {
    const full = join(dir, f);
    if (statSync(full).isDirectory()) files.push(...walkDir(full));
    else if (f.endsWith('.mdx')) files.push(full);
  }
  return files;
}

const sectionsDir = new URL('../src/content/sections', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
const files = walkDir(sectionsDir);

let total = 0;
const rows = [];

for (const f of files) {
  const content = readFileSync(f, 'utf8');
  // Strip frontmatter
  const stripped = content.replace(/^---[\s\S]*?---/, '').replace(/<[^>]+>/g, ' ').replace(/[{}]/g, ' ');
  const words = stripped.trim().split(/\s+/).filter(Boolean).length;
  total += words;
  rows.push({ words, name: f.split(/[\\/]/).slice(-2).join('/') });
}

rows.sort((a, b) => b.words - a.words);
for (const r of rows) console.log(`${r.words.toString().padStart(6)}  ${r.name}`);
console.log(`\nTOTAL WORDS: ${total}`);
console.log(`EST. PAGES (300 w/page): ${Math.round(total / 300)}`);
console.log(`EST. PAGES (250 w/page): ${Math.round(total / 250)}`);
