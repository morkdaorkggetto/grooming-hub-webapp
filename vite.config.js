import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * vite.config.js — Configurazione Vite
 * https://vitejs.dev/config/
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: false,
    open: true, // Apri automaticamente il browser
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
