import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Static output for maximum PageSpeed performance
  output: 'static',
  
  vite: {
    plugins: [tailwindcss()],
  },
  
  // Build optimizations
  build: {
    // Inline small assets for fewer HTTP requests
    inlineStylesheets: 'auto',
  },
});
