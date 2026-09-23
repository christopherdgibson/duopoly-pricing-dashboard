import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/duopoly-pricing-dashboard/',
  build: {
    outDir: 'dist',
  },
});