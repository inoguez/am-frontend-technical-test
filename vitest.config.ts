import path from 'node:path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/shared/test/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@/app': path.resolve(__dirname, 'src/app'),
      '@/features': path.resolve(__dirname, 'src/features'),
      '@/shared': path.resolve(__dirname, 'src/shared'),
      '@/store': path.resolve(__dirname, 'src/store'),
    },
  },
});
