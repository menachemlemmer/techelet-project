# PDF Distribution Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate a single book-like PDF of the entire tekhelet shiur (all 24 sections across 5 movements) from existing MDX content, via `npm run pdf`.

**Architecture:** A new print-only Astro route (`/print/all`) renders all sections sequentially inside a stripped-down layout, using the existing content collection and Astro components. A Node script starts `astro preview` locally, drives Puppeteer (headless Chrome) against that route, and saves a PDF to `dist-pdf/shiur.pdf`. Interactive 3D molecular viewers are swapped for a static `PrintMolPlaceholder` via MDX component overrides — source MDX is untouched.

**Tech Stack:** Astro 6 + MDX (existing), Puppeteer (new devDependency), Node ESM script. No test framework added.

**Spec:** `docs/superpowers/specs/2026-04-21-pdf-distribution-design.md`.

---

## Engineer notes

- **Commits:** The repo owner manages git himself. After each task, propose the commit message and stage the files, but **do not run `git commit`** unless explicitly approved by the user. Each task's "Commit" step in this plan means "draft the commit, wait for approval."
- **Package installs:** The plan requires installing `puppeteer` (`~200MB including bundled Chromium`). Confirm with the user before running `npm install`.
- **No test framework exists** in this repo. Verification in each task is either (a) `npm run build` passes, (b) a visual/manual check of a rendered route, or (c) the generator script's own post-run smoke check (file exists, size > 100KB). Do not introduce Vitest/Jest.
- **Build hook:** A PostToolUse hook runs `npm run build` automatically after edits to `.mdx`, `.astro`, `.css`, `.ts`. You may still run builds manually when verifying.

---

## File plan

**New files:**
- `src/styles/print.css` — print-specific CSS (@page, page-break, hide chrome)
- `src/components/PrintMolPlaceholder.astro` — static fallback for MolViewer / PlantIndigoViewer / MoleculeShowcase
- `src/layouts/PrintLayout.astro` — minimal HTML shell, no sidebar/nav/ClientRouter
- `src/pages/print/all.astro` — the concatenated-sections route
- `scripts/build-pdf.mjs` — Puppeteer driver

**Modified files:**
- `package.json` — add `pdf` script, add `puppeteer` devDependency
- `.gitignore` — ignore `dist-pdf/`

**Unchanged:** all MDX content files, all existing components, `src/pages/[...slug].astro`, `src/layouts/Main.astro`, `src/styles/global.css`, `src/styles/components.css`.

---

## Task 1: Add dependencies, npm script, and .gitignore entry

**Files:**
- Modify: `package.json`
- Modify: `.gitignore`

- [ ] **Step 1: Confirm with user before installing puppeteer**

The user has a standing instruction ("no package installs without asking"). Before running `npm install`, surface the install to the user:

> "About to run `npm install --save-dev puppeteer`. This pulls in Puppeteer (~5MB) plus a bundled Chromium (~200MB). OK to proceed?"

Proceed only once approved.

- [ ] **Step 2: Install Puppeteer as a devDependency**

Run:
```bash
npm install --save-dev puppeteer
```

Expected: `package.json` now has `"puppeteer": "^X.X.X"` under `devDependencies`; `package-lock.json` updated; `node_modules/puppeteer` present.

- [ ] **Step 3: Add the `pdf` script to package.json**

Edit `package.json`. The `scripts` block currently contains:
```json
"scripts": {
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "astro": "astro"
},
```

Add `"pdf"` as the last entry:
```json
"scripts": {
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "astro": "astro",
  "pdf": "npm run build && node scripts/build-pdf.mjs"
},
```

- [ ] **Step 4: Add `dist-pdf/` to .gitignore**

Edit `.gitignore`. Under the `# build output` section, change:
```
# build output
dist/
```
to:
```
# build output
dist/
dist-pdf/
```

- [ ] **Step 5: Verify**

Run:
```bash
npm run build
```
Expected: build completes successfully, 26 pages generated as before. No new pages yet (the print route hasn't been added).

Run:
```bash
node -e "console.log(require('puppeteer').executablePath())"
```
Expected: prints a path to the bundled Chromium (no error).

- [ ] **Step 6: Propose commit**

Suggested message: `Add puppeteer devDependency and pdf npm script`

Stage: `package.json`, `package-lock.json`, `.gitignore`. Wait for user approval before committing.

---

## Task 2: Create the print stylesheet

**Files:**
- Create: `src/styles/print.css`

- [ ] **Step 1: Create `src/styles/print.css`**

Write this file exactly:

```css
/* ═══════════════════════════════════════════════════
   PRINT STYLES — loaded only by PrintLayout.astro
═══════════════════════════════════════════════════ */

/* Physical page */
@page {
  size: Letter;
  margin: 0.75in;
}

/* Scope: only applies inside the print route (<body class="print-root">) */
.print-root {
  background: var(--paper);
  color: var(--ink);
}

/* Hide interactive chrome on the print route — at screen AND print */
.print-root .sidebar,
.print-root .navbar,
.print-root .nav-buttons,
.print-root #lb-overlay,
.print-root .drawer-toggle,
.print-root .drawer-overlay,
.print-root .no-print {
  display: none !important;
}

/* Remove padding that the web layout adds to #main / #content */
.print-root #main,
.print-root #content,
.print-root main {
  padding: 0;
  margin: 0;
  max-width: none;
  width: 100%;
}

/* Page break between sections */
.section-break {
  page-break-before: always;
  break-before: page;
  border: 0;
  height: 0;
  margin: 0;
  visibility: hidden;
}

/* Keep related content together */
.print-root .callout,
.print-root .dp,
.print-root .term,
.print-root .aramaic-block,
.print-root figure {
  page-break-inside: avoid;
  break-inside: avoid;
}

/* Prevent oversize images from overflowing a page */
.print-root img {
  max-width: 100%;
  max-height: 8.5in;
  page-break-inside: avoid;
}

/* Ensure backgrounds and colors print */
.print-root,
.print-root * {
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* Heading break control: don't strand a heading at the bottom of a page */
.print-root h1,
.print-root h2,
.print-root h3,
.print-root .sec-title,
.print-root .sec-num {
  page-break-after: avoid;
  break-after: avoid-page;
}

/* Print section wrapper — add top padding so first section isn't flush to edge */
.print-section {
  padding: 0.25in 0 0.5in 0;
}

.print-section:first-of-type {
  padding-top: 0;
}
```

- [ ] **Step 2: Verify**

Run:
```bash
npm run build
```
Expected: build succeeds. No new behavior yet — the file exists but no one imports it.

- [ ] **Step 3: Propose commit**

Suggested message: `Add print.css for PDF rendering`

Stage: `src/styles/print.css`. Wait for user approval.

---

## Task 3: Create PrintMolPlaceholder component

**Files:**
- Create: `src/components/PrintMolPlaceholder.astro`

- [ ] **Step 1: Create the component**

Write `src/components/PrintMolPlaceholder.astro` exactly:

```astro
---
interface Props {
  label?: string;
}
const { label } = Astro.props;
---

<figure class="mol-print-placeholder">
  <div class="mol-print-frame">
    <div class="mol-print-icon" aria-hidden="true">◯</div>
    {label && <div class="mol-print-label">{label}</div>}
    <div class="mol-print-note">Interactive 3D model — view the online version to rotate and explore.</div>
  </div>
</figure>

<style>
.mol-print-placeholder {
  margin: 1rem 0;
}
.mol-print-frame {
  border: 1px dashed var(--border);
  background: var(--parch-100);
  padding: 2rem 1rem;
  text-align: center;
  border-radius: 4px;
  font-family: var(--ff-body);
}
.mol-print-icon {
  font-size: 2.4rem;
  color: var(--muted);
  line-height: 1;
  margin-bottom: 0.5rem;
}
.mol-print-label {
  font-weight: 600;
  color: var(--ink);
  margin-bottom: 0.25rem;
  font-size: 0.95rem;
}
.mol-print-note {
  font-size: 0.82rem;
  color: var(--muted);
  font-style: italic;
}
</style>
```

- [ ] **Step 2: Verify**

Run:
```bash
npm run build
```
Expected: build succeeds. Component exists but is unused — no visible effect on the site.

- [ ] **Step 3: Propose commit**

Suggested message: `Add PrintMolPlaceholder component for PDF 3D viewer fallback`

Stage: `src/components/PrintMolPlaceholder.astro`. Wait for user approval.

---

## Task 4: Create PrintLayout

**Files:**
- Create: `src/layouts/PrintLayout.astro`

- [ ] **Step 1: Create the layout**

Write `src/layouts/PrintLayout.astro` exactly:

```astro
---
import '../styles/global.css';
import '../styles/components.css';
import '../styles/print.css';
---
<!DOCTYPE html>
<html lang="en" data-theme="tekhelet">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>The Chemistry of Tekhelet — Shiur</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;1,400&family=Noto+Serif+Hebrew&display=swap" rel="stylesheet" />
</head>
<body class="print-root">
  <main>
    <slot />
  </main>
</body>
</html>
```

Note: no `ClientRouter`, no sidebar, no drawer, no lightbox script. Fonts link is kept so Hebrew renders with `Noto Serif Hebrew`.

- [ ] **Step 2: Verify**

Run:
```bash
npm run build
```
Expected: build succeeds. Layout exists but no page uses it yet.

- [ ] **Step 3: Propose commit**

Suggested message: `Add PrintLayout for PDF rendering`

Stage: `src/layouts/PrintLayout.astro`. Wait for user approval.

---

## Task 5: Create the /print/all route

**Files:**
- Create: `src/pages/print/all.astro`

- [ ] **Step 1: Create the route file**

Create directory `src/pages/print/` if missing. Write `src/pages/print/all.astro` exactly:

```astro
---
import { getCollection, render } from 'astro:content';
import PrintLayout from '../../layouts/PrintLayout.astro';
import SectionHead from '../../components/SectionHead.astro';

// All content components — same set as [...slug].astro
import AramaicBlock from '../../components/AramaicBlock.astro';
import Callout from '../../components/Callout.astro';
import TermDef from '../../components/TermDef.astro';
import SubHead from '../../components/SubHead.astro';
import DiagramPanel from '../../components/DiagramPanel.astro';
import ImageTextGrid from '../../components/ImageTextGrid.astro';
import EnzymeCascade from '../../components/EnzymeCascade.astro';
import DimerGrid from '../../components/DimerGrid.astro';
import FlatMolComparison from '../../components/FlatMolComparison.astro';
import BromineShield from '../../components/BromineShield.astro';
import ResistGrid from '../../components/ResistGrid.astro';
import ThresholdDiagram from '../../components/ThresholdDiagram.astro';
import TermWithImage from '../../components/TermWithImage.astro';
import PtilProcessSteps from '../../components/PtilProcessSteps.astro';
import PhotostabilityComparison from '../../components/PhotostabilityComparison.astro';
import PtilThreshold from '../../components/PtilThreshold.astro';
import TwoKeysComparison from '../../components/TwoKeysComparison.astro';
import ZidermanPaths from '../../components/ZidermanPaths.astro';
import ZidermanLevers from '../../components/ZidermanLevers.astro';
import ZidermanThreshold from '../../components/ZidermanThreshold.astro';
import VatDyeingSteps from '../../components/VatDyeingSteps.astro';
import PhScale from '../../components/PhScale.astro';
import MbiAggregateComparison from '../../components/MbiAggregateComparison.astro';
import LightboxImage from '../../components/LightboxImage.astro';
import SuppressionTimeline from '../../components/SuppressionTimeline.astro';

// Print-specific substitutes
import PrintMolPlaceholder from '../../components/PrintMolPlaceholder.astro';

const sections = (await getCollection('sections')).sort(
  (a, b) => a.data.order - b.data.order
);

const rendered = await Promise.all(
  sections.map(async (entry) => {
    const { Content } = await render(entry);
    return { entry, Content };
  })
);

// MolViewer / PlantIndigoViewer / MoleculeShowcase are all swapped for the static placeholder.
const componentMap = {
  AramaicBlock, Callout, TermDef, SubHead, DiagramPanel, ImageTextGrid,
  EnzymeCascade, DimerGrid, FlatMolComparison, BromineShield, ResistGrid,
  ThresholdDiagram, TermWithImage, PtilProcessSteps, PhotostabilityComparison,
  PtilThreshold, TwoKeysComparison, ZidermanPaths, ZidermanLevers, ZidermanThreshold,
  VatDyeingSteps, PhScale, MbiAggregateComparison, LightboxImage, SuppressionTimeline,
  MolViewer: PrintMolPlaceholder,
  PlantIndigoViewer: PrintMolPlaceholder,
  MoleculeShowcase: PrintMolPlaceholder,
};

function headerNum(data) {
  if (data.headerNum) return data.headerNum;
  if (data.sectionNum === 'Intro') return data.movementLabel;
  return `${data.movementLabel} · ${data.sectionNum}`;
}
---
<PrintLayout>
  {rendered.map(({ entry, Content }, i) => (
    <section class="print-section">
      {i > 0 && <hr class="section-break" />}
      {!entry.data.hideHeader && (
        <SectionHead
          num={headerNum(entry.data)}
          title={entry.data.title}
          subtitle={entry.data.subtitle}
        />
      )}
      <Content components={componentMap} />
    </section>
  ))}
</PrintLayout>
```

- [ ] **Step 2: Build**

Run:
```bash
npm run build
```
Expected: build succeeds; output includes `dist/print/all/index.html`.

Verify:
```bash
ls dist/print/all/index.html
```

- [ ] **Step 3: Visual check in dev**

Run (in a separate terminal or backgrounded):
```bash
npm run dev
```

Open `http://localhost:4321/print/all` in a browser.

Expected:
- Page shows all 24 sections stacked top to bottom
- No sidebar, no navbar, no nav buttons
- Every section has its `SectionHead`
- Hebrew/Aramaic renders correctly
- 3D viewer slots show the `PrintMolPlaceholder` box (not a 3Dmol.js canvas)
- Diagrams, callouts, and term boxes render with their normal styling
- Section count: 24 sections separated by visible gaps

Stop the dev server before proceeding.

- [ ] **Step 4: Propose commit**

Suggested message: `Add /print/all route rendering all sections for PDF generation`

Stage: `src/pages/print/all.astro`. Wait for user approval.

---

## Task 6: Create the Puppeteer generator script

**Files:**
- Create: `scripts/build-pdf.mjs`

- [ ] **Step 1: Ensure `scripts/` directory exists**

Run:
```bash
mkdir -p scripts
```

- [ ] **Step 2: Create `scripts/build-pdf.mjs`**

Write exactly:

```javascript
#!/usr/bin/env node
/**
 * Generate a single PDF of the entire shiur.
 *
 * Flow:
 *   1. Start `astro preview` on localhost:4322 (assumes `npm run build` ran first)
 *   2. Wait for the server to answer /print/all
 *   3. Launch Puppeteer, navigate to /print/all, wait for fonts + network idle
 *   4. page.pdf() → dist-pdf/shiur.pdf
 *   5. Smoke check (file exists, reasonable size)
 *   6. Always clean up: kill preview, close browser
 */
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import puppeteer from 'puppeteer';

const PORT = 4322;
const URL = `http://127.0.0.1:${PORT}/print/all`;
const OUTPUT_DIR = 'dist-pdf';
const OUTPUT_PATH = `${OUTPUT_DIR}/shiur.pdf`;
const READY_TIMEOUT_MS = 30_000;
const POLL_INTERVAL_MS = 500;
const MIN_PDF_BYTES = 100_000; // smoke-check threshold

async function waitForServer(url, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // server not up yet
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
  throw new Error(`preview server did not respond at ${url} within ${timeoutMs}ms`);
}

let preview = null;
let browser = null;

try {
  console.log(`Starting astro preview on port ${PORT}...`);
  preview = spawn(
    'npx',
    ['astro', 'preview', '--port', String(PORT), '--host', '127.0.0.1'],
    { stdio: ['ignore', 'pipe', 'pipe'] }
  );
  preview.stdout.on('data', (d) => process.stdout.write(`[preview] ${d}`));
  preview.stderr.on('data', (d) => process.stderr.write(`[preview] ${d}`));
  preview.on('exit', (code) => {
    if (code !== null && code !== 0) {
      console.error(`[preview] exited with code ${code}`);
    }
  });

  await waitForServer(URL, READY_TIMEOUT_MS);
  console.log('Preview server ready.');

  await mkdir(OUTPUT_DIR, { recursive: true });

  console.log('Launching Puppeteer...');
  browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  console.log(`Navigating to ${URL}...`);
  await page.goto(URL, { waitUntil: 'networkidle0', timeout: 60_000 });
  await page.evaluate(() => document.fonts.ready);

  console.log(`Rendering PDF to ${OUTPUT_PATH}...`);
  await page.pdf({
    path: OUTPUT_PATH,
    format: 'Letter',
    printBackground: true,
    margin: {
      top: '0.75in',
      right: '0.75in',
      bottom: '0.75in',
      left: '0.75in',
    },
    preferCSSPageSize: true,
  });

  // Smoke check
  if (!existsSync(OUTPUT_PATH)) {
    throw new Error(`PDF not created at ${OUTPUT_PATH}`);
  }
  const size = statSync(OUTPUT_PATH).size;
  if (size < MIN_PDF_BYTES) {
    throw new Error(`PDF suspiciously small: ${size} bytes (expected > ${MIN_PDF_BYTES})`);
  }
  console.log(
    `✓ PDF generated: ${OUTPUT_PATH} (${(size / 1024 / 1024).toFixed(2)} MB)`
  );
} catch (err) {
  console.error('PDF generation failed:', err.message);
  process.exitCode = 1;
} finally {
  if (browser) {
    await browser.close().catch(() => {});
  }
  if (preview && !preview.killed) {
    preview.kill('SIGTERM');
  }
}
```

- [ ] **Step 3: Verify script syntax**

Run:
```bash
node --check scripts/build-pdf.mjs
```
Expected: no output, exit 0 (syntax is valid).

- [ ] **Step 4: Propose commit**

Suggested message: `Add scripts/build-pdf.mjs — Puppeteer PDF generator`

Stage: `scripts/build-pdf.mjs`. Wait for user approval.

---

## Task 7: End-to-end verification

**Files:** none changed.

- [ ] **Step 1: Run the pipeline end-to-end**

Run:
```bash
npm run pdf
```

Expected console output (approximate):
```
[build] Generating static routes...
[build] 27 page(s) built
[build] Complete!
Starting astro preview on port 4322...
[preview] ... Local    http://127.0.0.1:4322/
Preview server ready.
Launching Puppeteer...
Navigating to http://127.0.0.1:4322/print/all...
Rendering PDF to dist-pdf/shiur.pdf...
✓ PDF generated: dist-pdf/shiur.pdf (X.XX MB)
```

Note: "27 page(s) built" = existing 26 + the new `/print/all` route.

- [ ] **Step 2: Inspect the PDF against the spec checklist**

Open `dist-pdf/shiur.pdf` in a PDF reader. Confirm:

1. File exists and is > 1 MB
2. All 24 sections present in reading order:
   - opening: introduction, the-chain, two-manifestations, the-face-and-the-back
   - light-and-color: introduction, what-is-color, white-light, lapis-lazuli, the-sky, the-sea, the-inversion
   - sources-history-loss-recovery: ancient-world-and-color, a-history-of-loss
   - the-chemistry: introduction, the-chemistry, plant-indigo, murex-trunculus, ptil-tekhelet, zidermans-process
   - return-to-the-sources: introduction, shabbat-75a, menachot-42b, menachot-43a, logical-conclusions, conclusion
3. Hebrew/Aramaic characters render (not tofu boxes)
4. No blank pages
5. Each section starts on its own page (section break working)
6. Diagrams (SVG + raster images) render
7. Callouts, TermDefs, AramaicBlocks keep their framing and colors
8. 3D viewer slots show `PrintMolPlaceholder` — NOT an empty box or 3Dmol canvas
9. No sidebar, no nav buttons, no lightbox chrome leaking through
10. No text clipped at page margins

- [ ] **Step 3: If any checklist item fails, diagnose and iterate**

Common issues and targeted fixes (do not pre-emptively add these — only if seen):

- **Text clipped at margins** → reduce `@page margin` in `print.css` or fix body width inheritance.
- **Section break not working** → verify `.section-break` class is applied and `page-break-before: always` is in print.css.
- **Hebrew renders as tofu** → the `document.fonts.ready` await is not sufficient; add a `await new Promise(r => setTimeout(r, 1000))` after `fonts.ready` before `page.pdf()`.
- **Images oversize and truncated** → tighten `max-height` in the `.print-root img` rule.
- **Diagrams split across pages** → add the specific class to the `page-break-inside: avoid` list in `print.css`.
- **3Dmol canvas visible (not placeholder)** → verify `MolViewer`, `PlantIndigoViewer`, `MoleculeShowcase` are all in `componentMap` overrides in `all.astro`.
- **Blank white pages between sections** → check `.print-section` padding; `section-break` element may be introducing an extra page.

For each failure: change the relevant file (`print.css`, `all.astro`, or `build-pdf.mjs`), re-run `npm run pdf`, re-inspect. Repeat until checklist passes.

- [ ] **Step 4: Propose commit (if any iteration fixes were made)**

Suggested message: `Tune print CSS for clean page breaks` (or similar, per actual changes)

Stage only the files you changed. Wait for user approval.

- [ ] **Step 5: Report to user**

Summarize what works, what the PDF size is, and any known limitations that are acceptable for MVP (e.g., "no page numbers, no TOC — deferred per spec").

---

## Self-review notes

**Spec coverage:**
- Goal 1 (one combined PDF) → Task 5, Task 6, Task 7
- Goal 2 (single command) → Task 1 (npm script), Task 6 (driver)
- Goal 3 (Hebrew renders) → Task 4 (font link), Task 7 (verify step)
- Goal 4 (components look close to web) → Task 5 (reuses all components + SectionHead)
- Goal 5 (3D viewers degrade) → Task 3 + Task 5 (component override map)
- Goal 6 (MDX untouched) → All MDX remains unmodified throughout this plan
- Non-goal: TOC / page numbers / running headers / front matter — not addressed by any task, correct per spec
- Architecture: PrintLayout (Task 4), /print/all (Task 5), PrintMolPlaceholder (Task 3), print.css (Task 2), build-pdf.mjs (Task 6) — all mapped
- Error handling: build-pdf.mjs wraps everything in try/finally with process.exitCode = 1 on failure
- Verification: Task 7 checklist matches the spec's verification section verbatim

**Placeholder scan:** No "TBD", "TODO", "implement later" in any step. Every code block is complete. Every command has expected output.

**Type/name consistency:**
- `PrintMolPlaceholder` used consistently (import in Task 5, definition in Task 3)
- `.print-root` class used consistently (print.css scopes on it in Task 2, PrintLayout applies it on body in Task 4)
- `.section-break` used consistently (print.css in Task 2 styles it, all.astro in Task 5 emits it)
- `componentMap` name used in Task 5 only
- Output path `dist-pdf/shiur.pdf` identical in Task 6 script and Task 7 verification
- Port 4322 identical in Task 6 script and Task 7 console output expectation
