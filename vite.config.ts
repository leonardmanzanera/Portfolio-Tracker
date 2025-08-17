import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use relative paths so the app can be served from GitHub Pages
  // or any subdirectory without broken asset links
  base: './',
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
