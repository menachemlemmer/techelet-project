# Tekhelet Shiur Project

An interactive multi-movement shiur on the chemistry of tekhelet, built with Astro 6 + MDX + Tailwind CSS + DaisyUI.

## Who Works Here

This project has two users. Identify which mode applies and follow the corresponding rules.

### Author Mode (the shiur's author)

The author is non-technical. He writes and edits content, works with Hebrew/Aramaic text, and develops the shiur's arguments. Claude handles ALL technical operations for him:

- **Git:** Commit after completing a logical group of changes (e.g. finishing edits to a section, adding a new component, completing a requested task) — not after every small edit. Use clear commit messages describing what changed in content terms. Push when the author says he's done for the session, or when he asks.
- **Builds:** The build hook runs automatically after edits. If a build fails, fix the issue yourself — do not ask the author to debug MDX syntax errors.
- **Packages:** If a new package is needed, install it yourself and explain what you added.
- **Errors:** Diagnose and fix. The author should never see a stack trace or be asked to run a terminal command.
- **Tone:** Explain changes in terms of the content ("I moved your paragraph about the chromophore into a callout box"), not the technology ("I wrapped the JSX in a Callout component").

The author can be recognized by: discussing content/prose/theology/chemistry, editing MDX files, asking about formatting or layout, not identifying as the developer.

### Developer Mode (the author's son)

The developer manages the technical architecture. He will typically identify himself at the start of a conversation, or the context will make it obvious (discussing components, CSS, build config, project structure, etc.).

- **Git:** Never commit or push unless explicitly asked.
- **Packages:** Never install packages without asking first.
- **Builds:** The build hook runs automatically. Report failures; don't silently fix architectural issues.
- **Autonomy:** The developer makes his own technical decisions. Explain options, don't decide for him.

When in doubt about which mode, ask.

## Commands

- `npm run dev` — Start dev server (localhost:4321)
- `npm run build` — Build static site to dist/
- `npm run preview` — Preview built site

## Workflow

- A PostToolUse hook automatically runs `npm run build` after editing .mdx, .astro, .css, or .ts files
- MDX is fragile — unclosed tags, missing blank lines between paragraphs, and stray JSX syntax will break builds
- If a build fails, read the error to find the file and line, fix it, and rebuild before moving on
- Deployed to Vercel — pushes to main auto-deploy

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

src/layouts/Main.astro          # Page layout: DaisyUI drawer + sidebar + content
src/components/                 # Astro components for content types
src/lib/navigation.ts           # Navigation helpers (prev/next, sidebar data)

src/styles/
  global.css                    # Tailwind + DaisyUI + palette tokens + base typography
  components.css                # Component-specific styles (callout, aramaic, diagram, etc.)

public/diagrams/                # SVG diagram files (m1/, m3/, m4/)
public/images/                  # Extracted images (plant photos, shell)
public/data/molecules/          # SDF files for 3D molecular viewers
docs/original_ref/              # Archived HTML snapshot + master reference doc

.claude/settings.json           # Shared hooks and permissions (tracked in git)
vercel.json                     # Vercel deployment config (redirect / → /opening/introduction)
```

## Styling Architecture

**Two CSS files, one source of truth:**
- `global.css` — Tailwind, DaisyUI theme, palette scales, base typography, responsive rules
- `components.css` — Component-specific styles (callout variants, aramaic block, diagram panel, etc.)

**Palette system:** Five color scales defined as CSS custom properties in `global.css`:
- `--parch-*` (50–400) — parchment/reading surfaces
- `--brown-*` (50–500) — depth, leather, dark surfaces (sidebar, aramaic blocks, thesis callouts)
- `--blue-*` (50–500) — tekhelet blue, headings, primary accent
- `--gold-*` (50–500) — illumination, section markers, highlights
- `--violet-*` (50–400) — MBI violet

Semantic aliases for backwards compatibility: `--paper`, `--ink`, `--accent`, `--gold`, `--border`, etc.

**DaisyUI:** Custom `tekhelet` theme defined in `global.css` via `@plugin "daisyui/theme"`. Used for buttons (NavButtons), drawer (mobile sidebar), and future interactive components.

**Tailwind:** Available for utility classes in `.astro` components. Sidebar uses scoped `<style>` blocks to avoid specificity conflicts with Tailwind.

**When adding new styles:**
- Use palette variables (`--brown-400`, `--gold-100`, etc.) not hardcoded hex values
- For new UI components (buttons, toggles, etc.), use DaisyUI classes
- For new content components (callouts, blocks, etc.), add to `components.css`
- For complex layouts inside MDX, create an Astro component — never raw HTML divs

## Content Format

Each section is an MDX file with YAML frontmatter:

```yaml
---
sectionNum: "§ 1"              # Short form for sidebar ("§ 1", "Intro")
title: "The Chain"             # Full title for page header
navTitle: "The Chain"          # Short title for sidebar (defaults to title if omitted)
subtitle: "Menachot 43b · ..." # Optional subtitle
movement: "opening"            # Folder name — groups sections in sidebar
movementLabel: "Opening"       # Display label for the movement
order: 1                       # Global sort order (0-21)
editingNotes: "..."            # Optional notes about editing status
needs3Dmol: true               # Set true if section uses MolViewer
hideHeader: true               # Set true to suppress the standard section header
---
```

Page headers are computed automatically from `movementLabel` + `sectionNum`:
- Intro pages show: "Opening", "Light & Color", etc.
- Section pages show: "Opening · § 1", "The Chemistry · § 3", etc.

## MDX Formatting Rules

MDX processes content as markdown + JSX. These rules MUST be followed to avoid rendering bugs.

### Paragraphs

Write prose as plain text. Blank lines create paragraph breaks. No `<p>` tags needed.

```mdx
First paragraph text here.

Second paragraph text here.
```

**CRITICAL:** Every line within the same paragraph must be consecutive — no blank lines. A blank line ALWAYS means a new paragraph.

### Inline HTML

Inline elements (`<span>`, `<b>`, `<em>`) must be on the SAME LINE as the surrounding text. If an inline element is separated by a blank line, MDX treats it as a block element and breaks the layout.

WRONG:
```mdx
The cascade begins immediately.

<span style="color:var(--muted)">
  [Note about something.]
</span>
```

RIGHT:
```mdx
The cascade begins immediately. <span style="color:var(--muted)">[Note about something.]</span>
```

### Inline Hebrew

Use `<span class="heb-inline">` on the same line as surrounding text:

```mdx
The word <span class="heb-inline">תְּכֵלֶת</span> refers to the blue dye.
```

### Components

All components are globally available — NO import statements needed. Components are registered in `src/pages/[...slug].astro` via the `components` prop.

### Component content rules

Content inside component tags must NOT have blank lines. Blank lines inside a component cause MDX to insert `<p>` tags, breaking the layout.

WRONG:
```mdx
<TermDef word="Chromophore">
  First part of definition.

  Second part of definition.
</TermDef>
```

RIGHT:
```mdx
<TermDef word="Chromophore">First part of definition.
Second part of definition.</TermDef>
```

Or for short definitions:
```mdx
<TermDef word="Chromophore">The part of a molecule responsible for absorbing visible light.</TermDef>
```

### Raw HTML blocks

**Do NOT put raw HTML layout blocks (divs with styles, grids, etc.) directly in MDX files.** MDX will process text content inside them as markdown, inserting `<p>` tags that break layouts.

Instead, create an Astro component in `src/components/` and use it in the MDX. The component renders its HTML directly without markdown processing.

See existing examples: `EnzymeCascade.astro`, `ResistGrid.astro`, `ThresholdDiagram.astro`, etc.

### What IS safe as raw HTML in MDX

- Self-closing tags on one line: `<img src="..." alt="..." />`
- Simple wrappers with no text content: `<div class="some-class"></div>`
- The `<br/>` tag

## Components Reference

### Content Components (globally available)

**AramaicBlock** — Hebrew/Aramaic citations with translation
```mdx
<AramaicBlock segments={[
  { hebrew: "Hebrew text...", translation: "English translation..." }
]} />
```
- Multiple segments are separated by a gold divider
- Omit `translation` for Hebrew-only blocks (e.g. Rashi glosses)
- Use `style` on a segment for custom styling: `{ hebrew: "...", style: "font-size:.85em;color:#c8a040;" }`

**Callout** — Colored callout boxes
```mdx
<Callout type="gold"><b>Header label.</b> Explanation text.</Callout>
```
Types: `gold`, `blue`, `violet`, `green`, `red`, `thesis`

**REQUIRED:** Every callout MUST open with a bolded header — a short declarative label or sentence in `<b>...</b>`. No callout should begin with unbolded prose.

**TermDef** — Term definition boxes
```mdx
<TermDef word="Chromophore">Definition text.</TermDef>
```

**SubHead** — Sub-section headings
```mdx
<SubHead text="Part 1 — Color: the chromophore" />
```

**DiagramPanel** — Wrapper for diagrams with number, title, caption
```mdx
<DiagramPanel num="Diagram 5" title="Lapis lazuli spectrum" caption="Caption...">
  <img src="/diagrams/m1/d05-lapis-spectrum.svg" alt="..." style="width:100%;display:block;border-radius:6px" />
</DiagramPanel>
```

**MolViewer** — 3D molecular viewer (lazy-loading)
```mdx
<MolViewer divId="mol-ind" sdfPath="/data/molecules/ind.sdf" />
<MolViewer divId="mol-mbi" sdfPath="/data/molecules/mbi.sdf" hasBromine={true} />
```

**ImageTextGrid** — Image on left, text on right
```mdx
<ImageTextGrid imageSrc="/images/murex-shell.png" imageAlt="..." caption="Caption text">
Prose text here — this IS processed as markdown, so paragraphs work normally.
</ImageTextGrid>
```

**TermWithImage** — Term definition with image
```mdx
<TermWithImage imageSrc="/images/woad-plant.jpg" imageAlt="..." word="Woad" definition="HTML definition text..." />
```

### Layout Components (fixed content, no props)

These encapsulate complex HTML layouts that would break if placed directly in MDX:

- `EnzymeCascade` — Diagram 8 step flow
- `DimerGrid` — Diagram 9 dimerization table
- `MoleculeShowcase` — Diagram 10 three-molecule 3D grid
- `FlatMolComparison` — Diagram 10b flat structure comparison
- `BromineShield` — Diagram 11 two-panel comparison
- `ResistGrid` — Resistance comparison grid
- `ThresholdDiagram` — Diagram 12 threshold bar
- `PtilProcessSteps` — Ptil process step flow
- `PhotostabilityComparison` — Diagram 13 comparison
- `PtilThreshold` — Diagram 14 threshold
- `TwoKeysComparison` — Diagram 4 two-keys
- `ZidermanPaths` — Two-path comparison
- `ZidermanLevers` — Two-lever comparison
- `ZidermanThreshold` — Ziderman threshold bar

Usage: `<EnzymeCascade />` (inside a `<DiagramPanel>` wrapper when appropriate)

## Routing

Each MDX file becomes a page at `/{movement}/{section-slug}`:
- `opening/the-chain.mdx` → `/opening/the-chain`
- `the-chemistry/plant-indigo.mdx` → `/the-chemistry/plant-indigo`

Navigation (sidebar, prev/next) is automatic based on the `order` field.

## Adding a New Section

1. Create an MDX file in the appropriate movement folder
2. Add frontmatter with correct `order` (adjust others if inserting)
3. Write prose as plain text with blank lines between paragraphs
4. Use components for special elements — no imports needed
5. For complex HTML layouts, create a component in `src/components/`
6. Run `npm run build` to verify

## Do NOT

- Put raw HTML layout blocks directly in MDX — create components instead
- Put blank lines inside component tags — it breaks rendering
- Separate inline HTML elements from their surrounding text with blank lines
- Use hardcoded hex colors — use palette variables (`--brown-400`, `--gold-100`, etc.)
- Change `order` numbering without updating ALL affected sections
- Remove `movement` or `movementLabel` — they drive sidebar grouping
