import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const sections = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/sections' }),
  schema: z.object({
    sectionNum: z.string(),       // Short form for sidebar ("§ 1", "Intro", "M4 · §1")
    title: z.string(),             // Full title for page header
    navTitle: z.string().optional(), // Short title for sidebar (defaults to title)
    headerNum: z.string().optional(), // Full section number for page header (defaults to sectionNum)
    subtitle: z.string().optional(),
    movement: z.string(),
    movementLabel: z.string(),
    order: z.number(),
    editingNotes: z.string().optional(),
    needs3Dmol: z.boolean().optional(),
    hideHeader: z.boolean().optional(),
  }),
});

export const collections = { sections };
