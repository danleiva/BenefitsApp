import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base so the build works on GitHub Pages, Netlify, or any static host/subpath.
export default defineConfig({
  base: './',
  plugins: [react()],
});
