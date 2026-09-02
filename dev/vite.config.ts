import { join } from 'node:path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import { groupsFileApi } from './server/groupsFileApi.ts';

/**
 * Derived from the creation date of the repository (2026-09-02), so that this
 * playground never fights with another checkout over a port.
 */
const PORT = 10902;

export default defineConfig({
  plugins: [react(), groupsFileApi()],
  resolve: {
    // Run the sources of the package, so that a change in `src` is hot reloaded
    // and nothing has to be built first.
    alias: {
      'chemical-groups': join(import.meta.dirname, '..', 'src', 'index.ts'),
    },
  },
  server: {
    port: PORT,
    // Fail loudly instead of drifting to the next free port.
    strictPort: true,
    open: true,
  },
  preview: {
    port: PORT,
    strictPort: true,
  },
});
