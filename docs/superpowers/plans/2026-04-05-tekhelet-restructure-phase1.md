# Tekhelet Project Restructure — Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the monolithic tekhelet HTML file into an Astro project with markdown content, preserving the exact visual output while enabling section-level editing.

**Architecture:** Astro SSG with MDX content files (one per movement), Astro components for custom content types (aramaic blocks, callouts, terms, diagrams), 3Dmol.js loaded as a client-side island. Single-page layout with show/hide navigation matching the current behavior.

**Tech Stack:** Astro 5.x, MDX, 3Dmol.js, vanilla CSS (migrated from current), vanilla JS for navigation.

**Source files:**
- `tekhelet_chemistry_v5_9_8.html` — the monolithic HTML (4,118 lines: ~940 CSS, ~200 JS, ~3000 content)
- `tekhelet_master_reference_v3.md` — author's reference document

---

## File Map

### New files to create

```
astro.config.mjs                    # Astro config with MDX integration
package.json                        # Dependencies: astro, @astrojs/mdx
tsconfig.json                       # TypeScript config (Astro default)
CLAUDE.md                           # Project guide for Claude Code
.gitignore                          # node_modules, dist, .astro

src/
  styles/
    tokens.css                      # CSS custom properties (lines 14-43 of HTML)
    base.css                        # Reset, body, typography (lines 49-58, 170-244)
    components.css                  # All component styles (lines 246-937)

  layouts/
    Main.astro                      # Sidebar + main content area + navigation JS

  components/
    Sidebar.astro                   # Navigation sidebar (from lines 949-1057)
    SectionHead.astro               # Section header: num, title, subtitle
    AramaicBlock.astro              # Hebrew/Aramaic citation with translation
    Callout.astro                   # Callout boxes (gold, blue, thesis, etc.)
    TermDef.astro                   # Term definition boxes
    DiagramPanel.astro              # SVG diagram wrapper with num, title, caption
    MolViewer.astro                 # 3Dmol.js viewer (client:visible island)
    MolGrid.astro                   # Grid of 3D molecule cards
    CompoundGrid.astro              # Grid of compound info cards
    StepFlow.astro                  # Step arrow flow diagrams
    NavButtons.astro                # Prev/next section navigation
    InlineHeb.astro                 # Inline Hebrew text span (or handled via MDX)

  pages/
    index.astro                     # Main page: loads all movements, renders sections

content/
  m0-opening.mdx                   # M0: sec-0 through sec-3 (prose + aramaic)
  m1-light-color.mdx               # M1: sec-4 through sec-10 (prose + SVG diagrams)
  m3-chemistry.mdx                 # M3: sec-11 through sec-16 (prose + 3D viewers + SVGs)
  m4-sources.mdx                   # M4: sec-17 through sec-21 (prose + SVGs + decision trees)

diagrams/                           # Extracted SVG files (one per diagram)
  d01-chromophore.svg
  d02-hydrogen-bonding.svg
  ...                               # ~18 diagram files total

data/
  molecules/
    ind.sdf                         # Indigotin SDF data
    mbi.sdf                         # 6-Bromoindigo SDF data
    dbi.sdf                         # 6,6'-Dibromoindigo SDF data
  navigation.json                   # Sidebar structure: movements, sections, order
```

### Files preserved (moved to archive)
```
archive/
  tekhelet_chemistry_v5_9_8.html    # Original monolithic file (reference)
  tekhelet_master_reference_v3.md   # Author's reference doc
```

---

## Task 1: Initialize Astro Project

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `.gitignore`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "tekhelet-project",
  "type": "module",
  "version": "0.1.0",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  },
  "dependencies": {
    "astro": "^5.7.0",
    "@astrojs/mdx": "^4.2.0"
  }
}
```

- [ ] **Step 2: Create astro.config.mjs**

```js
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  integrations: [mdx()],
});
```

- [ ] **Step 3: Create tsconfig.json**

```json
{
  "extends": "astro/tsconfigs/strict"
}
```

- [ ] **Step 4: Create .gitignore**

```
node_modules/
dist/
.astro/
*.Zone.Identifier
```

- [ ] **Step 5: Install dependencies**

Run: `npm install`
Expected: node_modules created, package-lock.json generated.

- [ ] **Step 6: Create directory structure**

Run:
```bash
mkdir -p src/{styles,layouts,components,pages}
mkdir -p content
mkdir -p diagrams
mkdir -p data/molecules
mkdir -p archive
```

- [ ] **Step 7: Create a minimal index page to verify Astro works**

Create `src/pages/index.astro`:
```astro
---
---
<html lang="en">
  <head><title>Tekhelet</title></head>
  <body><h1>Tekhelet Project</h1></body>
</html>
```

- [ ] **Step 8: Verify Astro starts**

Run: `npm run dev`
Expected: Astro dev server starts on localhost:4321, page shows "Tekhelet Project".

---

## Task 2: Migrate CSS Design System

**Files:**
- Create: `src/styles/tokens.css`
- Create: `src/styles/base.css`
- Create: `src/styles/components.css`

The CSS is extracted directly from lines 10-937 of `tekhelet_chemistry_v5_9_8.html`. Split into three files by responsibility.

- [ ] **Step 1: Create tokens.css**

Extract lines 14-43 (the `:root` block) from the HTML into `src/styles/tokens.css`. This contains all CSS custom properties: colors, fonts, layout values.

```css
/* src/styles/tokens.css */
:root {
  --bg:      #f7f4ee;
  --paper:   #fefcf8;
  --dark:    #1a1208;
  --ink:     #2a1e0e;
  --muted:   #7a6a50;
  --faint:   #ece5d4;
  --border:  #d0c4a8;
  --accent:  #1a4a8a;
  --gold:    #b8860b;
  --gold2:   #d4a020;

  --ind:     #1e5fa8;
  --mbi:     #5b2d8a;
  --dbi:     #7a2060;
  --leuco:   #9a8a30;
  --br-col:  #7a3800;

  --green:   #1a6a2a;
  --crimson: #a01818;
  --teal:    #0a6060;

  --ff-disp: 'EB Garamond', 'Palatino Linotype', Palatino, serif;
  --ff-body: 'EB Garamond', Georgia, 'Times New Roman', serif;
  --ff-mono: 'Courier New', Courier, monospace;
  --ff-heb:  'Noto Serif Hebrew', 'Frank Ruhl Libre', 'David', serif;

  --sidebar-w: 210px;
  --radius: 8px;
}
```

- [ ] **Step 2: Create base.css**

Extract the reset, body, main content area, and typography rules (lines 49-244 of the HTML) into `src/styles/base.css`.

This includes: `*` reset, `html`/`body`, `#main`, `#content`, `.sec-head`, `.sec-num`, `.sec-title`, `.sec-sub`, `.sub-head`, `.bt`, `.heb-inline`, responsive base rules.

- [ ] **Step 3: Create components.css**

Extract all component styles (lines 246-937 of the HTML) into `src/styles/components.css`.

This includes styles for: `.term`, `.callout` (all variants), `.dp`, `.svg-wrap`, `.mol-3d-*`, `.mol-grid`, `.mol-card`, `.cpd-grid`, `.cpd-card`, `.steps`, `.step-box`, `.two-col`, `.ph-*`, `.resist-*`, `.threshold-diagram`, `.aramaic-block`, `.heb-block`, `.heb-trans`, `.ing-grid`, `.ing-card`, `.term-with-image`, `#nav-btns`, `.nb`, `.intro-*`, `.dtree`, `.dnode`, utility classes, responsive overrides.

- [ ] **Step 4: Update index.astro to import styles**

```astro
---
import '../styles/tokens.css';
import '../styles/base.css';
import '../styles/components.css';
---
<html lang="en">
  <head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width,initial-scale=1"/>
    <title>The Chemistry of Tekhelet</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;1,400&family=Noto+Serif+Hebrew&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="main">
      <div id="content">
        <h1 class="sec-title">Styles loaded</h1>
        <p class="bt">If this text uses EB Garamond, CSS is working.</p>
        <div class="callout gold"><b>Test callout.</b> Gold callout style.</div>
      </div>
    </div>
  </body>
</html>
```

- [ ] **Step 5: Verify styles load**

Run: `npm run dev`
Expected: Page shows styled text with EB Garamond font, gold callout renders with yellow background and gold left border.

---

## Task 3: Layout, Sidebar, and Navigation

**Files:**
- Create: `data/navigation.json`
- Create: `src/components/Sidebar.astro`
- Create: `src/layouts/Main.astro`

- [ ] **Step 1: Create navigation.json**

```json
{
  "movements": [
    {
      "id": "m0",
      "label": "Opening",
      "sections": [
        { "id": "sec-0", "num": "Intro", "title": "Introduction", "index": 0 },
        { "id": "sec-1", "num": "§ 1", "title": "The Chain", "index": 1 },
        { "id": "sec-2", "num": "§ 2", "title": "Two Manifestations", "index": 2 },
        { "id": "sec-3", "num": "§ 3", "title": "The Face and the Back", "index": 3 }
      ]
    },
    {
      "id": "m1",
      "label": "Light & Color",
      "sections": [
        { "id": "sec-4", "num": "Intro", "title": "Introduction", "index": 4 },
        { "id": "sec-5", "num": "§ 1", "title": "What is Color?", "index": 5 },
        { "id": "sec-6", "num": "§ 2", "title": "White Light", "index": 6 },
        { "id": "sec-7", "num": "§ 3", "title": "Lapis Lazuli", "index": 7 },
        { "id": "sec-8", "num": "§ 4", "title": "The Sky", "index": 8 },
        { "id": "sec-9", "num": "§ 5", "title": "The Sea", "index": 9 },
        { "id": "sec-10", "num": "§ 6", "title": "The Inversion", "index": 10 }
      ]
    },
    {
      "id": "m3",
      "label": "The Chemistry",
      "sections": [
        { "id": "sec-11", "num": "Intro", "title": "Introduction", "index": 11 },
        { "id": "sec-12", "num": "§ 1", "title": "The Chemistry", "index": 12 },
        { "id": "sec-13", "num": "§ 2", "title": "Plant Indigo — Kala Ilan", "index": 13 },
        { "id": "sec-14", "num": "§ 3", "title": "Murex Trunculus", "index": 14 },
        { "id": "sec-15", "num": "§ 4", "title": "Ptil Tekhelet", "index": 15 },
        { "id": "sec-16", "num": "§ 5", "title": "Ziderman's Process", "index": 16 }
      ]
    },
    {
      "id": "m4",
      "label": "Return to the Sources",
      "sections": [
        { "id": "sec-17", "num": "M4", "title": "Introduction", "index": 17 },
        { "id": "sec-18", "num": "M4 · §1", "title": "Shabbat 75a", "index": 18 },
        { "id": "sec-19", "num": "M4 · §2", "title": "Menachot 42b", "index": 19 },
        { "id": "sec-20", "num": "M4 · §3", "title": "Menachot 43a", "index": 20 },
        { "id": "sec-21", "num": "M4 · §4", "title": "Logical Conclusions", "index": 21 }
      ]
    }
  ]
}
```

- [ ] **Step 2: Create Sidebar.astro**

```astro
---
import navData from '../../data/navigation.json';
---
<div id="sidebar">
  <div id="sidebar-head">
    <div class="t1">The Chemistry<br/>of Tekhelet</div>
    <div class="t2">Movements 0 · I · III · IV</div>
  </div>
  <nav id="nav">
    {navData.movements.map(movement => (
      <>
        <div style="padding:6px 16px 2px;font-family:var(--ff-mono);font-size:0.6rem;color:#7a6040;text-transform:uppercase;letter-spacing:.08em;">
          {movement.label}
        </div>
        {movement.sections.map((sec, i) => (
          <button
            class={`nav-btn${sec.index === 0 ? ' active' : ''}`}
            onclick={`show(${sec.index})`}
          >
            <span class="nav-sec-num">{sec.num}</span>
            {sec.title}
          </button>
        ))}
      </>
    ))}
  </nav>
  <div id="sidebar-foot">
    <div style="margin-bottom:9px;color:#7a6030;letter-spacing:.08em;text-transform:uppercase;font-size:.63rem">Atom key</div>
    <!-- Atom color key circles - same as original -->
    <div style="display:flex;flex-direction:column;gap:6px">
      <div style="display:flex;align-items:center;gap:8px">
        <div style="width:13px;height:13px;border-radius:50%;background:#909090;flex-shrink:0"></div>
        <span style="color:#8a7a60;font-size:.65rem">C — Carbon</span>
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        <div style="width:13px;height:13px;border-radius:50%;background:#3366dd;flex-shrink:0"></div>
        <span style="color:#8a7a60;font-size:.65rem">N — Nitrogen</span>
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        <div style="width:13px;height:13px;border-radius:50%;background:#dd2222;flex-shrink:0"></div>
        <span style="color:#8a7a60;font-size:.65rem">O — Oxygen</span>
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        <div style="width:13px;height:13px;border-radius:50%;background:#ffffff;border:1px solid #888;flex-shrink:0"></div>
        <span style="color:#8a7a60;font-size:.65rem">H — Hydrogen</span>
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        <div style="width:13px;height:13px;border-radius:50%;background:#c07030;flex-shrink:0"></div>
        <span style="color:#8a7a60;font-size:.65rem">Br — Bromine</span>
      </div>
    </div>
    <div style="margin-top:12px;color:#4a3820;font-size:.6rem">Shiur materials<br/>Movements III-IV · v5.10</div>
  </div>
</div>
```

- [ ] **Step 3: Create Main.astro layout**

```astro
---
import '../styles/tokens.css';
import '../styles/base.css';
import '../styles/components.css';
import Sidebar from '../components/Sidebar.astro';
---
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>The Chemistry of Tekhelet — Shiur Materials v5.9</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/3Dmol/2.0.1/3Dmol-min.js"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;1,400&family=Noto+Serif+Hebrew&display=swap" rel="stylesheet">
</head>
<body>
  <!-- Hamburger for mobile -->
  <button id="hamburger" onclick="toggleSidebar()" aria-label="Navigation">
    <span></span><span></span><span></span>
  </button>
  <div id="overlay" onclick="toggleSidebar()"></div>

  <Sidebar />

  <div id="main">
    <div id="content">
      <slot />
    </div>
  </div>

  <script is:inline>
    let active = 0;
    function show(i) {
      const secs = document.querySelectorAll('.sec');
      const navBtns = document.querySelectorAll('.nav-btn');
      secs[active].style.display = 'none';
      navBtns[active].classList.remove('active');
      active = i;
      secs[active].style.display = 'block';
      navBtns[active].classList.add('active');
      document.getElementById('main').scrollTo(0, 0);
      window.scrollTo(0, 0);
      // 3D viewer init hook — will be extended in Task 7
      if (window.initViewersForSection) window.initViewersForSection(i);
    }

    function toggleSidebar() {
      document.getElementById('sidebar').classList.toggle('open');
      document.getElementById('overlay').classList.toggle('visible');
    }
  </script>
</body>
</html>
```

- [ ] **Step 4: Update index.astro to use the layout**

```astro
---
import Main from '../layouts/Main.astro';
---
<Main>
  <div id="sec-0" class="sec">
    <div class="sec-head">
      <div class="sec-num">Opening</div>
      <div class="sec-title">Test Section</div>
    </div>
    <p class="bt">Layout and sidebar test.</p>
  </div>
</Main>
```

- [ ] **Step 5: Verify layout renders**

Run: `npm run dev`
Expected: Dark sidebar on left with navigation, content area on right with test section, mobile hamburger hidden on desktop. Clicking nav buttons doesn't error (only one section so nothing to switch).

---

## Task 4: Core Content Components

**Files:**
- Create: `src/components/SectionHead.astro`
- Create: `src/components/AramaicBlock.astro`
- Create: `src/components/Callout.astro`
- Create: `src/components/TermDef.astro`
- Create: `src/components/NavButtons.astro`
- Create: `src/components/DiagramPanel.astro`
- Create: `src/components/SubHead.astro`

- [ ] **Step 1: Create SectionHead.astro**

```astro
---
interface Props {
  num: string;        // e.g. "Opening · § 1" or "§ 1"
  title: string;      // e.g. "The Chain"
  subtitle?: string;  // e.g. "Menachot 43b · The resemblance sequence"
}
const { num, title, subtitle } = Astro.props;
---
<div class="sec-head">
  <div class="sec-num">{num}</div>
  <div class="sec-title" set:html={title} />
  {subtitle && <div class="sec-sub">{subtitle}</div>}
</div>
```

- [ ] **Step 2: Create AramaicBlock.astro**

```astro
---
interface Props {
  segments: Array<{ hebrew: string; translation: string }>;
}
const { segments } = Astro.props;
---
<div class="aramaic-block">
  {segments.map((seg, i) => (
    <>
      {i > 0 && <hr class="aram-sep" />}
      <div class="heb-block" set:html={seg.hebrew} />
      <div class="heb-trans" set:html={seg.translation} />
    </>
  ))}
</div>
```

- [ ] **Step 3: Create Callout.astro**

```astro
---
interface Props {
  type: 'gold' | 'blue' | 'violet' | 'green' | 'red' | 'thesis';
}
const { type } = Astro.props;
---
<div class={`callout ${type}`}>
  <slot />
</div>
```

- [ ] **Step 4: Create TermDef.astro**

```astro
---
interface Props {
  word: string;
}
const { word } = Astro.props;
---
<div class="term">
  <div class="term-w">{word}</div>
  <div class="term-d"><slot /></div>
</div>
```

- [ ] **Step 5: Create SubHead.astro**

```astro
---
interface Props {
  text: string;
}
const { text } = Astro.props;
---
<div class="sub-head">{text}</div>
```

- [ ] **Step 6: Create NavButtons.astro**

```astro
---
interface Props {
  prev?: { index: number; label: string };
  next?: { index: number; label: string };
}
const { prev, next } = Astro.props;
---
<div id="nav-btns">
  {prev ? (
    <button class="nb prev" onclick={`show(${prev.index})`}>← {prev.label}</button>
  ) : <span />}
  {next ? (
    <button class="nb next" onclick={`show(${next.index})`}>{next.label} →</button>
  ) : <span />}
</div>
```

- [ ] **Step 7: Create DiagramPanel.astro**

```astro
---
interface Props {
  num?: string;      // e.g. "Diagram 5"
  title?: string;    // e.g. "Lapis lazuli — what wavelengths are absorbed and reflected"
  caption?: string;  // Caption text below the diagram
}
const { num, title, caption } = Astro.props;
---
<div class="dp">
  {num && <div class="dp-num">{num}</div>}
  {title && <div class="dp-title">{title}</div>}
  <div class="svg-wrap">
    <slot />
  </div>
  {caption && <div class="dp-cap">{caption}</div>}
</div>
```

- [ ] **Step 8: Create a test page using all components**

Update `src/pages/index.astro` to render a sample section with each component to verify they all work:

```astro
---
import Main from '../layouts/Main.astro';
import SectionHead from '../components/SectionHead.astro';
import AramaicBlock from '../components/AramaicBlock.astro';
import Callout from '../components/Callout.astro';
import TermDef from '../components/TermDef.astro';
import NavButtons from '../components/NavButtons.astro';
---
<Main>
  <div id="sec-0" class="sec">
    <SectionHead num="Opening · § 1" title="The Chain" subtitle="Menachot 43b · Test" />

    <AramaicBlock segments={[{
      hebrew: "תַּנְיָא, הָיָה רַבִּי מֵאִיר אוֹמֵר",
      translation: "It was taught: Rabbi Meir would say"
    }]} />

    <p class="bt">Test paragraph with <span class="heb-inline">תְּכֵלֶת</span> inline Hebrew.</p>

    <Callout type="gold"><b>Test callout.</b> Gold style.</Callout>
    <Callout type="thesis"><b>Thesis callout.</b> Dark style.</Callout>

    <TermDef word="Chromophore">Test definition text.</TermDef>

    <NavButtons next={{ index: 1, label: "§ 2 — Test Next" }} />
  </div>
</Main>
```

- [ ] **Step 9: Verify all components render**

Run: `npm run dev`
Expected: Section header with gold number and blue title. Dark aramaic block with Hebrew in gold and translation in cream. Body text with inline Hebrew. Gold callout with gold border. Dark thesis callout. Term definition box. Navigation button at bottom.

---

## Task 5: Extract M0 (Opening) Content

**Files:**
- Create: `content/m0-opening.mdx`
- Modify: `src/pages/index.astro`

M0 is the simplest movement — mostly prose and aramaic blocks, no diagrams. 4 sections (sec-0 through sec-3).

- [ ] **Step 1: Create content/m0-opening.mdx**

Extract all content from sec-0 through sec-3 in the HTML (lines 1077-1197). Convert HTML elements to component usage:

- `<p class="bt">text</p>` becomes just `<p class="bt">text</p>` (MDX passes through HTML)
- `<span class="heb-inline">...</span>` stays as-is
- Aramaic blocks become `<AramaicBlock segments={[...]} />`
- Nav buttons become `<NavButtons prev={...} next={...} />`
- Section headers become `<SectionHead ... />`
- Warning boxes become `<Callout type="red">...</Callout>` or stay as styled divs

The file structure:

```mdx
---
movement: 0
id: "m0"
title: "Theological Opening"
---
import SectionHead from '../src/components/SectionHead.astro';
import AramaicBlock from '../src/components/AramaicBlock.astro';
import Callout from '../src/components/Callout.astro';
import NavButtons from '../src/components/NavButtons.astro';

{/* ===== sec-0: Introduction ===== */}
<div id="sec-0" class="sec">

<p class="bt" style="background:#2a1a08;border-left:3px solid #c8a040;padding:0.7rem 1rem;border-radius:4px;font-size:0.85rem;color:#c8b080;">
  ⚠ <em>Opening movement — extensive editing needed. Prose is structural draft only.</em>
</p>

<SectionHead
  num="Opening"
  title="לִבְנַת הַסַּפִּיר"
  subtitle="The vision at Sinai · The chain of resemblances · Physics and chemistry as lens"
/>

<p class="bt">At Sinai, the Jewish people stood at the foot of the mountain...</p>

<p class="bt">The color of that vision did not disappear with the moment...</p>

<NavButtons next={{ index: 1, label: "§ 1 — The Chain" }} />
</div>

{/* ===== sec-1: The Chain ===== */}
<div id="sec-1" class="sec" style="display:none">
  {/* ... full content from HTML sec-1 ... */}
</div>

{/* ===== sec-2: Two Manifestations ===== */}
<div id="sec-2" class="sec" style="display:none">
  {/* ... full content from HTML sec-2 ... */}
</div>

{/* ===== sec-3: The Face and the Back ===== */}
<div id="sec-3" class="sec" style="display:none">
  {/* ... full content from HTML sec-3 ... */}
</div>
```

Each section is extracted verbatim from the HTML, converting only the custom elements to components. Prose paragraphs (`<p class="bt">`) stay as raw HTML in MDX.

- [ ] **Step 2: Update index.astro to render M0**

```astro
---
import Main from '../layouts/Main.astro';
import M0 from '../content/m0-opening.mdx';
---
<Main>
  <M0 />
</Main>
```

- [ ] **Step 3: Verify M0 renders correctly**

Run: `npm run dev`
Expected: sec-0 (Introduction) visible. Click "§ 1" in sidebar — shows The Chain with aramaic block. Click through all 4 sections. Compare visually with the original HTML file.

---

## Task 6: Extract M1 (Light & Color) Content

**Files:**
- Create: `content/m1-light-color.mdx`
- Modify: `src/pages/index.astro`

M1 has 7 sections (sec-4 through sec-10) with inline SVG diagrams (D1-D8), term definitions, and the author's thesis text (sec-10). No 3D viewers.

- [ ] **Step 1: Extract SVG diagrams D1-D8 to separate files**

For each diagram in M1:
- Find the `<svg>` element inside the `.dp` div
- Save it to `diagrams/m1-dNN-name.svg` (e.g. `diagrams/m1-d05-lapis-spectrum.svg`)
- Ensure each SVG has a proper `viewBox` attribute and `xmlns`

Diagrams to extract:
- D1: Wavelength/frequency (sec-5) — if present
- D2: Visible spectrum (sec-5) — if present
- D3: Prism / white light (sec-6) — if present
- D4: Absorption — white/blue/black (sec-6)
- D5: Lapis lazuli spectrum (sec-7)
- D6: Rayleigh scattering (sec-8)
- D7: Sea reflection (sec-9)
- D8: Three blues compared (sec-9)

Note: Some diagrams may have been built as descriptions in the master reference but may not be in the current HTML. Only extract what exists in the HTML.

- [ ] **Step 2: Create content/m1-light-color.mdx**

Same pattern as M0. Each section is a `<div id="sec-N" class="sec">` block. Diagrams are referenced using DiagramPanel:

```mdx
import DiagramPanel from '../src/components/DiagramPanel.astro';
import SvgD05 from '../diagrams/m1-d05-lapis-spectrum.svg?raw';

<DiagramPanel
  num="Diagram 5"
  title="Lapis lazuli — what wavelengths are absorbed and reflected"
  caption="Lazurite absorbs wavelengths from roughly 530nm upward..."
>
  <Fragment set:html={SvgD05} />
</DiagramPanel>
```

Alternatively, if Astro SVG imports are simpler, use inline SVG includes. The key constraint: the SVG content should live in its own file, not inline in the MDX.

- [ ] **Step 3: Update index.astro to include M1**

```astro
---
import Main from '../layouts/Main.astro';
import M0 from '../content/m0-opening.mdx';
import M1 from '../content/m1-light-color.mdx';
---
<Main>
  <M0 />
  <M1 />
</Main>
```

- [ ] **Step 4: Verify M1 renders correctly**

Run: `npm run dev`
Expected: Navigate from M0 sec-3 to sec-4 (M1 intro). All 7 M1 sections render. SVG diagrams display correctly (absorption diagram, Rayleigh scattering, three blues comparison). Term definitions render. Sec-10 (The Inversion) shows the full thesis text.

---

## Task 7: Extract M3 (Chemistry) Content + 3D Viewers

**Files:**
- Create: `content/m3-chemistry.mdx`
- Create: `src/components/MolViewer.astro`
- Create: `data/molecules/ind.sdf`
- Create: `data/molecules/mbi.sdf`
- Create: `data/molecules/dbi.sdf`
- Modify: `src/pages/index.astro`

M3 is the most complex movement: 6 sections (sec-11 through sec-16) with inline SVG diagrams, 3D molecular viewers, compound grids, step flows, pH visualizations, and more.

- [ ] **Step 1: Extract SDF molecular data**

From lines 4060-4062 of the HTML, extract the three SDF data strings into separate files:

- `data/molecules/ind.sdf` — Indigotin (IND) SDF data
- `data/molecules/mbi.sdf` — 6-Bromoindigo (MBI) SDF data
- `data/molecules/dbi.sdf` — 6,6'-Dibromoindigo (DBI) SDF data

Each file contains the raw SDF text (the string content from `SDF_IND`, `SDF_MBI`, `SDF_DBI` variables, with `\n` converted to actual newlines).

- [ ] **Step 2: Create MolViewer.astro (client-side island)**

```astro
---
interface Props {
  divId: string;
  sdfPath: string;
  hasBromine?: boolean;
  bgColor?: string;
}
const { divId, sdfPath, hasBromine = false, bgColor } = Astro.props;
---
<div class="mol-3d-outer">
  <div class="mol-3d-wrap">
    <div id={divId}></div>
    <div id={`${divId}-loading`} class="mol-loading">Loading 3D model...</div>
  </div>
  <div class="mol-guide">
    <span>Drag</span> rotate <span>Scroll</span> zoom <span>Right-drag</span> pan
  </div>
</div>

<script define:vars={{ divId, sdfPath, hasBromine, bgColor }}>
  // Lazy-load when visible
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        observer.disconnect();
        loadMolecule();
      }
    });
  });

  const el = document.getElementById(divId);
  if (el) observer.observe(el);

  async function loadMolecule() {
    const resp = await fetch(sdfPath);
    const sdfData = await resp.text();
    const bg = bgColor || (hasBromine ? '#0d0a1e' : '#080f1c');
    const v = $3Dmol.createViewer(document.getElementById(divId), {
      backgroundColor: bg, antialias: true
    });
    const elemColors = {
      C: '#909090', N: '#3366dd', O: '#dd2222', H: '#ffffff', Br: '#c07030'
    };
    const colMap = { prop: 'elem', map: elemColors };
    v.addModel(sdfData, 'sdf');
    v.setStyle({}, {
      stick: { radius: 0.12, colorscheme: colMap },
      sphere: { scale: 0.24, colorscheme: colMap }
    });
    if (hasBromine) {
      v.setStyle({ elem: 'Br' }, {
        sphere: { radius: 0.62, color: '#c07030', opacity: 1.0 },
        stick: { radius: 0.20, color: '#c07030', opacity: 1.0 }
      });
    }
    v.zoomTo(); v.zoom(0.78); v.rotate(15, 'x'); v.rotate(-20, 'y'); v.render();
    const loadEl = document.getElementById(divId + '-loading');
    if (loadEl) loadEl.style.opacity = '0';
  }
</script>
```

- [ ] **Step 3: Extract M3 SVG diagrams**

Extract all SVG diagrams from M3 sections to `diagrams/`:
- Flat molecule structure SVGs (chromophore diagram, hydrogen bonding, etc.)
- pH bar visualization
- Step flow diagrams
- Any other inline SVGs

- [ ] **Step 4: Create content/m3-chemistry.mdx**

Extract all M3 content (sec-11 through sec-16) from the HTML. Use components:

```mdx
import MolViewer from '../src/components/MolViewer.astro';
import DiagramPanel from '../src/components/DiagramPanel.astro';

{/* 3D viewer usage */}
<MolViewer divId="mol-ind" sdfPath="/data/molecules/ind.sdf" />

{/* Compound grid stays as raw HTML in MDX */}
<div class="cpd-grid">
  <div class="cpd-card">...</div>
</div>
```

For complex one-off layouts (pH bar, ingredient cards, resistance grid), keep the HTML inline in the MDX. Only create components for patterns used more than once.

- [ ] **Step 5: Copy SDF files to public directory**

SDF files need to be fetchable at runtime. Place them in `public/data/molecules/`:

```bash
mkdir -p public/data/molecules
cp data/molecules/*.sdf public/data/molecules/
```

Or configure Astro to serve from `data/` — depends on Astro's static asset handling.

- [ ] **Step 6: Update index.astro to include M3**

```astro
---
import Main from '../layouts/Main.astro';
import M0 from '../content/m0-opening.mdx';
import M1 from '../content/m1-light-color.mdx';
import M3 from '../content/m3-chemistry.mdx';
---
<Main>
  <M0 />
  <M1 />
  <M3 />
</Main>
```

- [ ] **Step 7: Verify M3 renders correctly**

Run: `npm run dev`
Expected: M3 sections render with all content. 3D molecular viewers load when scrolled into view (or when section is navigated to). Flat molecule SVGs display. Compound grids, step flows, and specialized layouts render. Compare key sections visually with original HTML.

---

## Task 8: Extract M4 (Return to the Sources) Content

**Files:**
- Create: `content/m4-sources.mdx`
- Modify: `src/pages/index.astro`

M4 has 5 sections (sec-17 through sec-21) with SVG diagrams (D17 two-path dyeing, D18 sequential test flowchart), aramaic blocks, and prose.

- [ ] **Step 1: Extract M4 SVG diagrams**

- `diagrams/m4-d17-two-path-dyeing.svg`
- `diagrams/m4-d18-sequential-test.svg`

- [ ] **Step 2: Create content/m4-sources.mdx**

Extract sec-17 through sec-21. Same pattern as previous movements.

- [ ] **Step 3: Update index.astro to include M4**

```astro
---
import Main from '../layouts/Main.astro';
import M0 from '../content/m0-opening.mdx';
import M1 from '../content/m1-light-color.mdx';
import M3 from '../content/m3-chemistry.mdx';
import M4 from '../content/m4-sources.mdx';
---
<Main>
  <M0 />
  <M1 />
  <M3 />
  <M4 />
</Main>
```

- [ ] **Step 4: Verify M4 renders correctly**

Run: `npm run dev`
Expected: All M4 sections render. D17 (two-path dyeing) and D18 (sequential test) SVG diagrams display correctly. Full aramaic sugya text in sec-20 renders. Navigation through all 22 sections works end-to-end.

---

## Task 9: Full Verification and Archive

**Files:**
- Move: `tekhelet_chemistry_v5_9_8.html` → `archive/`
- Move: `tekhelet_master_reference_v3.md` → `archive/`
- Remove: `*.Zone.Identifier` files

- [ ] **Step 1: Full end-to-end navigation test**

Run: `npm run dev`
Navigate through all 22 sections sequentially. Verify:
- Sidebar highlights update correctly
- Section transitions work (show/hide)
- Scroll position resets on section change
- Mobile hamburger menu works (resize browser)

- [ ] **Step 2: Visual comparison of key sections**

Open the original HTML file in one browser tab and the Astro dev server in another. Compare:
- sec-0: Introduction text and warning box
- sec-1: Aramaic block rendering (Hebrew text, translation, gold divider)
- sec-7: Lapis lazuli diagram (D5)
- sec-10: The Inversion (longest prose section)
- sec-12: Chemistry with flat molecule SVG diagrams
- sec-13: 3D molecular viewer (if applicable)
- sec-20: Menachot 43a with long aramaic text and D18 flowchart

- [ ] **Step 3: Move original files to archive**

```bash
mv tekhelet_chemistry_v5_9_8.html archive/
mv tekhelet_master_reference_v3.md archive/
rm -f *.Zone.Identifier
```

- [ ] **Step 4: Verify build succeeds**

Run: `npm run build`
Expected: Static site generated in `dist/` without errors.

---

## Task 10: CLAUDE.md

**Files:**
- Create: `CLAUDE.md`

- [ ] **Step 1: Write CLAUDE.md**

```markdown
# Tekhelet Shiur Project

An interactive multi-movement shiur on the chemistry of tekhelet, built with Astro.

## Project Structure

- `content/` — MDX content files, one per movement (m0, m1, m3, m4)
- `diagrams/` — SVG diagram files, referenced from content
- `data/molecules/` — SDF molecular data for 3D viewers
- `data/navigation.json` — Sidebar structure and section order
- `src/components/` — Astro components for content types
- `src/layouts/Main.astro` — Page layout with sidebar and navigation
- `src/styles/` — CSS: tokens.css (variables), base.css (typography), components.css (all component styles)
- `archive/` — Original monolithic HTML and reference doc

## Commands

- `npm run dev` — Start dev server (localhost:4321)
- `npm run build` — Build static site to dist/
- `npm run preview` — Preview built site

## Content Format

Content files are MDX (Markdown + JSX components). Each movement is one file.
Sections within a file are `<div id="sec-N" class="sec">` blocks.

### Components available in MDX:

- `<SectionHead num="§ 1" title="The Chain" subtitle="..." />` — Section header
- `<AramaicBlock segments={[{ hebrew: "...", translation: "..." }]} />` — Hebrew/Aramaic citation
- `<Callout type="gold|blue|violet|green|red|thesis">...</Callout>` — Callout box
- `<TermDef word="Chromophore">definition text</TermDef>` — Term definition
- `<SubHead text="Part 1 — Color" />` — Sub-heading
- `<NavButtons prev={{ index: 0, label: "Intro" }} next={{ index: 2, label: "§ 2" }} />` — Navigation
- `<DiagramPanel num="Diagram 5" title="..." caption="..."><svg>...</svg></DiagramPanel>` — Diagram
- `<MolViewer divId="mol-ind" sdfPath="/data/molecules/ind.sdf" />` — 3D molecule viewer

### Inline HTML in MDX:

- `<p class="bt">` — Body text paragraph
- `<span class="heb-inline">תְּכֵלֶת</span>` — Inline Hebrew
- Standard HTML div layouts for one-off elements (pH bar, grids, etc.)

## Editing Content

To edit a section:
1. Open the relevant content file (e.g. `content/m1-light-color.mdx`)
2. Find the section by its `id` (e.g. `sec-7` for Lapis Lazuli)
3. Edit the prose, add/modify components
4. Save — dev server hot-reloads

To add a new section:
1. Add the section div to the appropriate content file
2. Add the section to `data/navigation.json`
3. Update NavButtons in the surrounding sections

## Design System

CSS custom properties are in `src/styles/tokens.css`. Key colors:
- `--accent` (#1a4a8a) — headings
- `--gold` (#b8860b) — section numbers, highlights
- `--ind` (#1e5fa8) — indigotin/blue
- `--mbi` (#5b2d8a) — 6-bromoindigo/violet
- `--dbi` (#7a2060) — dibromoindigo/purple

Fonts: EB Garamond (display/body), Noto Serif Hebrew (Hebrew text), Courier New (mono).

## Architecture Notes

- Single-page app: all sections render on one page, show/hide via JavaScript
- 3D viewers: 3Dmol.js loads from CDN, SDF data fetched at runtime
- SVG diagrams: static files, embedded via Astro imports
- Navigation: `show(index)` function in Main.astro controls section visibility
```

- [ ] **Step 2: Verify CLAUDE.md is accurate**

Read through the CLAUDE.md and cross-check against the actual project structure. Ensure all component names, file paths, and commands match.

---

## Verification Plan

After all tasks are complete:

1. **Build test:** `npm run build` succeeds with no errors
2. **Dev server:** `npm run dev` starts and all 22 sections are navigable
3. **Visual parity:** Key sections match the original HTML in appearance
4. **3D viewers:** Molecular viewers load and are interactive (rotate, zoom)
5. **Mobile:** Sidebar collapses to hamburger on narrow viewport
6. **Content isolation:** Each content file can be edited independently without affecting others
7. **Claude Code test:** Open a content file, ask Claude Code to edit a paragraph — it should only need to see that one file
