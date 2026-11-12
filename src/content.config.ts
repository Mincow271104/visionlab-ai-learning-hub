import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import {
  DIFFICULTY_LEVELS,
  PUBLICATION_STATUSES,
  TRACK_IDS,
} from './utils/tracks';

/**
 * Validated schema for VisionLab lessons.
 *
 * Every published lesson under `src/content/lessons/` must conform to this
 * contract and follow the section structure in `docs/templates/lesson-template.mdx`.
 */
const lessons = defineCollection({
  loader: glob({
    base: './src/content/lessons',
    pattern: '**/*.{md,mdx}',
  }),
  schema: z.object({
    title: z.string().min(3),
    description: z.string().min(10),
    track: z.enum(TRACK_IDS),
    difficulty: z.enum(DIFFICULTY_LEVELS),
    estimatedMinutes: z.number().int().positive().max(120),
    order: z.number().int().positive(),
    tags: z.array(z.string().min(1)).min(1),
    status: z.enum(PUBLICATION_STATUSES).default('draft'),
  }),
});

export const collections = { lessons };
