# Tekhelet Project Restructure — Design Spec

**Date:** 2026-04-05
**Status:** Draft

---

## Context

A non-technical author has been building a multi-movement scholarly shiur on tekhelet chemistry as a single monolithic HTML file (~4,100 lines), using Claude.ai artifacts. The current workflow has hit scaling limits:

- **Context window exhaustion:** The full HTML exceeds what Claude can hold in a single conversation.
- **Regeneration risk:** Every edit causes Claude to regenerate the entire artifact, risking unintended changes to working sections.
- **No version control:** Changes are tracked only by downloading successive HTML files.
- **No section isolation:** Claude must operate on the entire document, even for small edits.
- **No PDF export:** Generating a printable version requires a separate manual effort each time.

The project contains 22 sections across 4 built movements (M0, M1, M3, M4), with M2 and M5 still unbuilt. Content includes prose in English, Hebrew, and Aramaic; inline SVG diagrams; 3D molecular viewers (3Dmol.js); and a sophisticated design system.

**Goal:** Restructure into a proper project where content is separated from presentation, sections can be edited independently, changes are tracked, and PDF export is automated — while keeping the workflow simple enough for a non-technical author.

---

## Approach: Markdown + Astro Static Site Generator

Content lives in markdown files (one per movement). Astro builds these into the final HTML site. Interactive elements (3D molecules) load as Astro "islands." The existing design system carries over with minimal changes.

---

## Content Architecture

### File Structure

```
content/
  m0-opening.md          # M0: Theological Opening (sec-0 through sec-3)
  m1-light-color.md      # M1: Physics of Light & Color (sec-4 through sec-10)
  m3-chemistry.md        # M3: The Chemistry (sec-11 through sec-16)
  m4-sources.md          # M4: Return to the Sources (sec-17 through sec-21)
```

One file per movement. Sections within a file are separated by heading markers. This can be split into per-section files later if any movement grows too large.

### Markdown Format

Each file starts with YAML frontmatter:

```markdown
---
movement: 0
id: "m0"
title: "Theological Opening"
displayTitle: "לִבְנַת הַסַּפִּיר"
subtitle: "The vision at Sinai - The chain of resemblances - Physics and chemistry as lens"
status: "built"
editingNotes: "Extensive editing needed. Prose is structural draft only."
sections:
  - id: "sec-0"
    title: "Introduction"
    sectionNum: "Intro"
  - id: "sec-1"
    title: "The Chain"
    sectionNum: "§ 1"
    subtitle: "Menachot 43b - The resemblance sequence - Rashi on the sea"
  - id: "sec-2"
    title: "Two Manifestations"
    sectionNum: "§ 2"
    subtitle: "Rashi on Shemot 20:2 - The Mechilta - A sapphire and the sky"
  - id: "sec-3"
    title: "The Face and the Back"
    sectionNum: "§ 3"
    subtitle: "Shemot 33 - Moses asks to see - What vision is"
---
```

### Custom Markdown Components

**Aramaic/Hebrew citations:**

```markdown
:::aramaic
תַּנְיָא, הָיָה רַבִּי מֵאִיר אוֹמֵר...
---
It was taught: Rabbi Meir would say...
:::
```

Rendered as the dark-background aramaic-block with Hebrew text above and English translation below, separated by the gold divider.

**Callouts:**

```markdown
:::callout{type="thesis"}
**Our position on the halachic question:** Both modern methods are valid...
:::

:::callout{type="gold"}
Key principle text here...
:::
```

Types: `gold`, `blue`, `violet`, `green`, `red`, `thesis`. Maps directly to existing CSS classes.

**Term definitions:**

```markdown
:::term{word="Chromophore"}
The part of a molecule responsible for absorbing visible light...
:::
```

**Inline Hebrew:**

```markdown
The word <heb>תְּכֵלֶת</heb> refers to...
```

**Section breaks within a movement:**

```markdown
## sec-1
<!-- Section metadata is in frontmatter -->
```

### Diagrams

**SVG diagrams** are stored as separate files:

```
diagrams/
  d01-wavelength.svg
  d02-visible-spectrum.svg
  d03-prism.svg
  d04-absorption.svg
  d05-lapis-spectrum.svg
  d06-rayleigh.svg
  d07-sea-reflection.svg
  d08-three-blues.svg
  ...
  d17-two-path-dyeing.svg
  d18-sequential-test.svg
```

Referenced from markdown:

```markdown
::diagram{src="d17-two-path-dyeing" num="Diagram 17" title="TWO-PATH DYEING" caption="Left - Path A: the precursor enters..."}
```

**3D molecular viewers** use an Astro island component:

```markdown
::molecule-viewer{molecule="mbi" label="6-Bromoindigo (MBI)" hasBromine=true}
```

SDF data stored in:

```
data/molecules/
  ind.sdf
  mbi.sdf
  dbi.sdf
```

**Future improvement:** Explore Mermaid for flowcharts, D3.js for data visualizations, and RDKit.js for molecular structure diagrams. These replace hand-crafted SVGs over time. Astro's island architecture means React-based libraries can be used for specific components without making the whole project React.

---

## Project Structure

```
tekhelet-project/
  astro.config.mjs
  package.json
  tsconfig.json
  CLAUDE.md

  content/                    # Author-editable content
    m0-opening.md
    m1-light-color.md
    m3-chemistry.md
    m4-sources.md

  diagrams/                   # SVG diagram files
    d01-wavelength.svg
    ...

  data/
    molecules/                # SDF molecular data
      ind.sdf
      mbi.sdf
      dbi.sdf
    navigation.json           # Sidebar structure, movement/section order

  src/
    layouts/
      Main.astro              # Sidebar + content area layout

    components/
      Sidebar.astro           # Navigation sidebar
      NavButtons.astro        # Prev/next section navigation
      AramaicBlock.astro      # Hebrew/Aramaic citation block
      Callout.astro           # Callout boxes (gold, blue, thesis, etc.)
      TermDef.astro           # Term definition boxes
      DiagramPanel.astro      # SVG diagram wrapper with caption
      MolViewer.astro         # 3Dmol.js viewer (client:visible island)
      MolGrid.astro           # Grid of molecule cards
      StepFlow.astro          # Step arrow diagrams
      SectionHead.astro       # Section header (num, title, subtitle)

    styles/
      tokens.css              # CSS custom properties (from current :root)
      base.css                # Reset, typography, body layout
      components.css          # Component-specific styles
      print.css               # Print/PDF stylesheet

    pages/
      index.astro             # Main page: renders all movements

  scripts/
    export-pdf.mjs            # Puppeteer PDF generation script
```

### CLAUDE.md

The CLAUDE.md file will document:
- Project purpose and structure
- How content files are organized
- Custom markdown syntax for aramaic blocks, callouts, terms, diagrams
- Component patterns and when to use each
- How to add new sections or movements
- Build and preview commands
- Design token reference

This is critical for Claude Code to work effectively on the project.

---

## Design System

The existing design system migrates almost unchanged:

### CSS Tokens

All current CSS custom properties (`--bg`, `--paper`, `--ink`, `--accent`, `--ind`, `--mbi`, `--dbi`, etc.) move to `tokens.css`. No changes to values.

### Typography

- Display: EB Garamond
- Body: EB Garamond
- Mono: Courier New
- Hebrew: Noto Serif Hebrew

### Component Styles

All existing CSS classes (`.callout`, `.aramaic-block`, `.dp`, `.mol-grid`, `.cpd-grid`, etc.) are preserved and organized into `components.css`.

### Responsive Behavior

Existing mobile breakpoints (768px, 480px) carry over. Sidebar collapses to hamburger menu on mobile.

---

## PDF Export

### Approach

Print stylesheet + Puppeteer headless capture.

### Print Stylesheet (`print.css`)

- Hides sidebar, hamburger, navigation buttons
- Reformats for A4/Letter page size
- Inserts page breaks between sections
- Adjusts typography for print (slightly larger, higher contrast)
- Replaces 3D viewer containers with static fallback images
- SVG diagrams render natively

### Export Script

`npm run pdf` runs a Puppeteer script that:
1. Builds the site
2. Opens all sections (removes `display:none`)
3. Applies print stylesheet
4. Captures to PDF with proper page settings

### Static Fallbacks for 3D Viewers

Pre-captured PNG screenshots of each molecule in its default orientation, stored alongside the SDF data. These display in print mode via CSS `@media print` rules.

---

## Version Control

### Phase 1: Git (Initial Setup)

- Git repo initialized with `.gitignore` (excludes `node_modules/`, `dist/`, `.astro/`)
- Initial commit contains the migrated project
- Standard git workflow when using Claude Code

### Phase 2: Simplified Commands

Wrapper scripts for non-technical use:

- `npm run save -- "description of changes"` — stages all content changes and commits
- `npm run history` — shows recent commits in plain English
- `npm run undo` — reverts the last commit (with confirmation)

These are thin wrappers around git commands, designed to be memorable and safe.

### Phase 3: Auto-save (Optional)

A file watcher that auto-commits content changes on save, with debouncing. Low priority — may not be needed if the simplified commands are sufficient.

---

## Build & Dev Commands

| Command | What it does |
|---------|-------------|
| `npm run dev` | Starts Astro dev server with hot reload |
| `npm run build` | Builds static site to `dist/` |
| `npm run preview` | Serves the built site locally |
| `npm run pdf` | Generates PDF from built site |
| `npm run save -- "msg"` | Git commit with message |
| `npm run history` | Show recent changes |

---

## Migration Strategy

### Phase 1: Faithful Port (Priority)

Goal: The site looks and works identically to the current HTML, but content lives in markdown files.

1. Initialize Astro project with dependencies
2. Migrate CSS design system to `tokens.css`, `base.css`, `components.css`
3. Create Astro components for all content types
4. Extract content from HTML into markdown files (one per movement)
5. Extract SVG diagrams to separate files
6. Extract SDF molecular data to separate files
7. Build the main page layout with sidebar navigation
8. Integrate 3Dmol.js as an Astro island
9. Visual verification against current HTML
10. Set up CLAUDE.md

### Phase 2: PDF Export

1. Create print stylesheet
2. Capture static molecule screenshots
3. Build Puppeteer export script
4. Test PDF output

### Phase 3: Developer Experience

1. Git wrapper scripts (`save`, `history`, `undo`)
2. Documentation for the author
3. File watcher for auto-rebuild (if not using `npm run dev`)

### Phase 4: Diagram Improvements (Optional)

1. Evaluate Mermaid for flowcharts
2. Evaluate D3.js for data visualizations
3. Replace hand-crafted SVGs with library-generated diagrams where beneficial

---

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| SSG framework | Astro | Static output, markdown-native, supports islands for interactivity |
| Content format | Markdown with custom directives | Author-friendly, Claude-friendly, keeps content separate from presentation |
| File granularity | One file per movement | Balances isolation vs. simplicity; can split later |
| Diagram storage | Separate files by ID | Independent versioning, Claude edits diagrams without touching prose |
| 3D molecules | 3Dmol.js via Astro island | Already works well, loads only when visible |
| PDF approach | Print CSS + Puppeteer | Simple, reliable, works with existing layout |
| Version control | Git with wrapper scripts | Full power available, simplified UX for non-technical use |

---

## Open Questions

1. **Claude.ai integration:** Can the author continue using Claude.ai for some tasks (e.g., prose drafting) while the project lives in a file-based structure? May need a workflow where Claude.ai output is pasted into the markdown files.
2. **M2 and M5:** These movements aren't built yet. The new structure should make building them easier. Should the empty content files be scaffolded now?
3. **Master reference doc:** Does `tekhelet_master_reference_v3.md` continue to live in the project, or does its information migrate entirely into frontmatter and CLAUDE.md?
4. **Hosting:** When the time comes, Astro builds to static HTML that can be hosted on any static host (Netlify, Vercel, GitHub Pages, etc.). No special infrastructure needed.
