import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import { groupsFileApi } from './server/groupsFileApi.ts';

/**
 * Derived from the creation date of the repository (2026-09-02), so that this
 * editor never fights with another checkout over a port.
 */
const PORT = 10902;

export default defineConfig({
  plugins: [react(), groupsFileApi()],
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
