# Tekhelet Shiur Project

An interactive multi-movement shiur on the chemistry of tekhelet, built with Astro 6 + MDX.

## Commands

- `npm run dev` — Start dev server (localhost:4321)
- `npm run build` — Build static site to dist/
- `npm run preview` — Preview built site

## Project Structure

```
src/content/sections/           # MDX content — one file per section
  opening/                      # M0: Theological Opening (4 sections)
  light-and-color/              # M1: Physics of Light & Color (7 sections)
  the-chemistry/                # M3: The Chemistry (6 sections)
  return-to-the-sources/        # M4: Return to the Sources (5 sections)

src/content.config.ts           # Content collection schema
src/pages/[...slug].astro       # Dynamic route — renders each section
src/pages/index.astro           # Redirects to /opening/introduction

src/layouts/Main.astro          # Page layout: sidebar + content area
src/components/                 # Astro components for content types
src/lib/navigation.ts           # Navigation helpers (prev/next, sidebar data)
src/styles/                     # CSS: tokens.css, base.css, components.css

public/data/molecules/          # SDF files for 3D molecular viewers
docs/original_ref/              # Original monolithic HTML + reference doc
```

## Content Format

Each section is an MDX file with YAML frontmatter:

```yaml
---
sectionNum: "§ 1"              # Display number in sidebar and header
title: "The Chain"             # Section title
subtitle: "Menachot 43b · ..." # Optional subtitle
movement: "opening"            # Folder name — groups sections in sidebar
movementLabel: "Opening"       # Display label for the movement
order: 1                       # Global sort order (0-21)
editingNotes: "..."            # Optional notes about editing status
needs3Dmol: true               # Set true if section uses MolViewer
---
```

The body is MDX — markdown with embedded Astro components and raw HTML.

## Components

Import from `@components/` in MDX files. Only import what you use.

### AramaicBlock
Hebrew/Aramaic citations with translation.
```mdx
import AramaicBlock from '@components/AramaicBlock.astro'

<AramaicBlock segments={[
  {
    hebrew: "תַּנְיָא, הָיָה רַבִּי מֵאִיר אוֹמֵר...",
    translation: "It was taught: Rabbi Meir would say..."
  },
  {
    hebrew: "Second passage...",
    translation: "Second translation..."
  }
]} />
```
Multiple segments are separated by a gold divider line.

### Callout
Colored callout boxes.
```mdx
import Callout from '@components/Callout.astro'

<Callout type="gold"><b>Key point.</b> Explanation text.</Callout>
<Callout type="thesis"><b>Author position.</b> Dark background style.</Callout>
```
Types: `gold`, `blue`, `violet`, `green`, `red`, `thesis`

### TermDef
Term definition boxes.
```mdx
import TermDef from '@components/TermDef.astro'

<TermDef word="Chromophore">Definition text with <b>formatting</b>.</TermDef>
```

### SubHead
Sub-section headings.
```mdx
import SubHead from '@components/SubHead.astro'

<SubHead text="Part 1 — Color: the chromophore" />
```

### DiagramPanel
Wrapper for SVG diagrams with number, title, and caption.
```mdx
import DiagramPanel from '@components/DiagramPanel.astro'

<DiagramPanel num="Diagram 5" title="Lapis lazuli spectrum" caption="Caption text...">
  <svg viewBox="0 0 700 200" xmlns="http://www.w3.org/2000/svg">
    <!-- SVG content -->
  </svg>
</DiagramPanel>
```

### MolViewer
3D molecular viewer using 3Dmol.js. Loads lazily when scrolled into view.
```mdx
import MolViewer from '@components/MolViewer.astro'

<MolViewer divId="mol-ind" sdfPath="/data/molecules/ind.sdf" />
<MolViewer divId="mol-mbi" sdfPath="/data/molecules/mbi.sdf" hasBromine={true} />
```

### Inline HTML
Body paragraphs and inline Hebrew use raw HTML directly:
```mdx
<p class="bt">Text with <span class="heb-inline">תְּכֵלֶת</span> inline Hebrew.</p>
```

## Routing

Each MDX file becomes a page at `/{movement}/{section-slug}`. For example:
- `src/content/sections/opening/the-chain.mdx` → `/opening/the-chain`
- `src/content/sections/the-chemistry/plant-indigo.mdx` → `/the-chemistry/plant-indigo`

Navigation (sidebar, prev/next) is automatic based on the `order` field in frontmatter.

## Adding a New Section

1. Create an MDX file in the appropriate movement folder
2. Add frontmatter with the correct `order` number (adjust other sections if inserting)
3. Write content using the components above
4. The section appears automatically in the sidebar and navigation

## Design System

CSS custom properties in `src/styles/tokens.css`:
- `--accent` (#1a4a8a) — headings
- `--gold` (#b8860b) — section numbers, highlights
- `--ind` (#1e5fa8) — indigotin blue
- `--mbi` (#5b2d8a) — 6-bromoindigo violet
- `--dbi` (#7a2060) — dibromoindigo purple

Fonts: EB Garamond (display/body), Noto Serif Hebrew (Hebrew text), Courier New (mono).

## Do NOT

- Modify `src/styles/` without understanding the full CSS — styles are interdependent
- Change the `order` numbering without updating ALL affected sections
- Remove the `movement` or `movementLabel` fields — they drive sidebar grouping
