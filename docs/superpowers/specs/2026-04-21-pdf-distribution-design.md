# PDF Distribution — Design Spec

**Date:** 2026-04-21
**Status:** Draft for implementation
**Author:** dev (menachem), with Claude

## Problem

The tekhelet shiur is currently a static Astro website. The site was built as a development and authoring surface; the author's intended primary distribution method is a PDF that he can email, print, or share directly. No PDF pipeline exists today.

Goal: produce a single, book-like PDF of the full shiur — all 24 sections across 5 movements in reading order — from the existing MDX content, with minimal friction and without changing the authoring workflow.

## Goals (MVP)

1. One combined PDF containing all sections in `order` sequence.
2. Generated via a single command (`npm run pdf`) producing a local file.
3. Hebrew/Aramaic text renders correctly.
4. Existing Astro components (Callout, DiagramPanel, AramaicBlock, TermDef, diagrams, etc.) render in the PDF looking as close to the web as is practical.
5. Interactive 3D molecular viewers degrade gracefully to a placeholder.
6. Source MDX files are untouched — the PDF is a pure rendering of existing content.

## Non-Goals (deferred)

- Table of contents with page numbers
- Running headers / footers
- Page numbers
- Title page / front matter
- Pre-captured screenshots for 3D viewers
- Automated publishing of the PDF via Vercel build hook or to a static URL
- Per-section PDF exports

These may be added later; the MVP is deliberately minimal to prove the pipeline works.

## Approach

Headless-Chrome rendering of a dedicated print route, driven by Puppeteer.

Rejected alternatives:
- **Paged.js** — higher fidelity (real TOC, page numbers, running headers) but more upfront CSS work; revisit if MVP output is insufficient.
- **Pandoc / LaTeX** — would require porting every custom Astro component to a LaTeX equivalent; disproportionate effort for a content set already invested in MDX+Astro.

## Architecture

Three new artifacts, zero changes to existing MDX:

```
src/
  layouts/
    PrintLayout.astro          # NEW — stripped-down layout for print route
  pages/
    print/
      all.astro                # NEW — renders all sections sequentially
  components/
    PrintMolPlaceholder.astro  # NEW — static fallback for 3D viewers
  styles/
    print.css                  # NEW — @page rules, print overrides

scripts/
  build-pdf.mjs                # NEW — Puppeteer driver

dist-pdf/                      # NEW — gitignored output directory
  shiur.pdf                    # the artifact

package.json                   # UPDATED — add "pdf" script, puppeteer devDep
.gitignore                     # UPDATED — ignore dist-pdf/
```

### Component: `PrintLayout.astro`

Minimal HTML shell:
- `<head>` with charset, viewport, the same Google Fonts link used by `Main.astro`, and `global.css` + `components.css` + `print.css`
- No `ClientRouter`, no sidebar, no drawer, no lightbox script
- `<body>` contains a single `<slot />`

### Page: `src/pages/print/all.astro`

```
1. Use getCollection('sections') to fetch all entries
2. Sort by entry.data.order ascending
3. Wrap output in <PrintLayout>
4. For each entry:
     - Render a SectionHead using the same header-num logic as [...slug].astro
       (honor entry.data.headerNum if set)
     - Call render(entry) to get <Content>
     - Pass the print override components map (see below)
     - After the section, emit <hr class="section-break" />
```

### Print component overrides

The page passes the same 28 content components to `<Content components={...} />` as `[...slug].astro` does, with three substitutions:

- `MolViewer` → `PrintMolPlaceholder`
- `PlantIndigoViewer` → `PrintMolPlaceholder` (pre-wrapped with its molecule name)
- `MoleculeShowcase` → `PrintMolPlaceholder` (rendered once; the web version shows three molecules, the print fallback shows a single "see online" note)

`PrintMolPlaceholder` accepts an optional `label` prop and renders a framed `<figure>` with:
- A muted "3D model" indicator
- The label (molecule name) if provided
- Caption: "Interactive 3D model — view online version"

This placeholder is the MVP fallback. Pre-captured PNG screenshots are a future enhancement: the placeholder component will accept an `imageSrc` prop later and render the image when present.

### Stylesheet: `src/styles/print.css`

Loaded only by `PrintLayout.astro`. Key rules:

```css
@page {
  size: Letter;
  margin: 0.75in;
}

@media print, screen {
  /* Applies to print route on screen AND in Puppeteer's print mode */
  .section-break { page-break-before: always; }
  .callout, .dp, .term, .aramaic-block { page-break-inside: avoid; }
  img { max-height: 85vh; page-break-inside: avoid; }
  .sidebar, .navbar, .nav-buttons, #lb-overlay, .no-print { display: none !important; }
}
```

Additional rules handle:
- Body type bump for paper readability (if needed after visual inspection)
- Hiding any DaisyUI drawer machinery that might leak in
- Forcing `printBackground` support (parchment backgrounds)

### Script: `scripts/build-pdf.mjs`

Node ESM script invoked by `npm run pdf`.

```
1. Spawn `astro preview --port 4322 --host 127.0.0.1` as a child process
2. Poll http://127.0.0.1:4322/print/all until 200 OK or 30s timeout
3. puppeteer.launch({ headless: 'new' })
4. page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 })
5. await page.evaluate(() => document.fonts.ready)
6. Ensure dist-pdf/ exists
7. page.pdf({
     path: 'dist-pdf/shiur.pdf',
     format: 'Letter',
     printBackground: true,
     margin: { top: '0.75in', right: '0.75in', bottom: '0.75in', left: '0.75in' },
     preferCSSPageSize: true
   })
8. browser.close()
9. kill preview subprocess
10. exit 0 on success; exit 1 with a clear error message on any failure
```

Always kills the preview subprocess, even on error (try/finally).

### package.json

```json
{
  "scripts": {
    "pdf": "npm run build && node scripts/build-pdf.mjs"
  },
  "devDependencies": {
    "puppeteer": "^23.x"
  }
}
```

Puppeteer downloads its bundled Chromium on install (~200MB). This is a dev-only dependency; it does not affect Vercel deploys.

## Data flow

```
MDX sections
    │
    ├──► existing /[...slug] routes  (web)
    │
    └──► /print/all route (new)
              │
              ▼
         npm run build → dist/
              │
              ▼
         astro preview (localhost:4322)
              │
              ▼
         Puppeteer → Chrome → page.pdf()
              │
              ▼
         dist-pdf/shiur.pdf
```

## Error handling

- Build failure → `npm run pdf` fails at the build step; Puppeteer never runs.
- Preview server doesn't come up within 30s → script exits 1 with "preview server did not start"; subprocess killed.
- `page.goto` times out → script exits 1 with the URL that failed; subprocess killed.
- `page.pdf` throws → script exits 1 with the underlying error; subprocess killed.
- Any uncaught exception in the script → logged, subprocess killed, exit 1.

No silent half-success. If the PDF isn't at `dist-pdf/shiur.pdf` after a successful run, the script exited non-zero.

## Verification

MVP has no automated test. Post-run manual checks:

1. `dist-pdf/shiur.pdf` exists and is > 1MB
2. Open in a PDF reader; scroll through
3. All 24 sections present in order (opening → light-and-color → sources-history-loss-recovery → the-chemistry → return-to-the-sources)
4. Hebrew/Aramaic renders (not tofu boxes)
5. No blank pages
6. Diagrams (SVG and raster images) render
7. Callouts, TermDefs, AramaicBlocks keep their framing and colors
8. 3D viewer slots show `PrintMolPlaceholder`, not broken/empty
9. No sidebar or navigation chrome leaking through

If any of these fail, iterate on `print.css` and re-run. If output quality is structurally insufficient after reasonable tuning (e.g. page breaks in the middle of diagrams are unavoidable), re-evaluate Paged.js as an upgrade path.

## Open questions

None at this stage; all deferred items are explicitly in Non-Goals.

## Risk and mitigation

- **Risk:** Puppeteer install fails in the author's environment. **Mitigation:** Author does not run `npm run pdf`; this is a dev-side tool. If/when this becomes author-triggered, we revisit as a separate feature.
- **Risk:** Some existing `@media` rules in `global.css`/`components.css` interfere with print layout. **Mitigation:** `print.css` loads last and uses targeted overrides; further debugging during implementation.
- **Risk:** Hebrew font (`Noto Serif Hebrew`) fails to load in time and text renders in a fallback. **Mitigation:** `document.fonts.ready` is awaited before `page.pdf()`.
- **Risk:** Raw-HTML-layout patterns in `sources-history-loss-recovery/*.mdx` (floated figures, inline flex grids) break across page boundaries. **Mitigation:** Visual inspection drives targeted `page-break-inside: avoid` rules. Separately tracked as a known tech-debt item (extract `FloatFigure` / `ImageTextRow` components), not blocking this MVP.
