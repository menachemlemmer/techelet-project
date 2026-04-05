import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const sections = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/sections' }),
  schema: z.object({
    sectionNum: z.string(),
    title: z.string(),
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
