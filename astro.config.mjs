// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  site: 'https://mincow271104.github.io',
  base: '/visionlab-ai-learning-hub',
  output: 'static',
  integrations: [react(), mdx()],
});
