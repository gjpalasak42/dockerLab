import { defineConfig } from 'astro/config';
import tailwindcss from '@astrojs/tailwind';

export default defineConfig({
  // Static output for maximum PageSpeed performance
  output: 'static',
  
  integrations: [
    tailwindcss({
      // Apply base styles for proper defaults
      applyBaseStyles: true,
    }),
  ],
  
  // Build optimizations
  build: {
    // Inline small assets for fewer HTTP requests
    inlineStylesheets: 'auto',
  },
});
