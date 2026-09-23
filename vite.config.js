import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/duopoloy-pricing-dashboard/',
  build: {
    outDir: 'dist',
  },
});