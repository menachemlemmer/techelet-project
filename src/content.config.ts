import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const sections = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/sections' }),
  schema: z.object({
    sectionNum: z.string(),       // Short form for sidebar ("§ 1", "Intro")
    title: z.string(),             // Full title for page header
    navTitle: z.string().optional(), // Short title for sidebar (defaults to title)
    subtitle: z.string().optional(),
    movement: z.string(),
    movementLabel: z.string(),
    headerNum: z.string().optional(), // Override computed "movementLabel · sectionNum" on page header
    order: z.number(),
    editingNotes: z.string().optional(),
    needs3Dmol: z.boolean().optional(),
    hideHeader: z.boolean().optional(),
  }),
});

export const collections = { sections };
