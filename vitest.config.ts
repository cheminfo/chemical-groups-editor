import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      include: ['src/**/*.{ts,tsx}', 'server/**/*.ts'],
      // openchemlib is loaded by the tests that check the structures of the
      // groups, and the v8 provider profiles it on every call.
      provider: 'istanbul',
    },
    snapshotFormat: {
      maxOutputLength: Number.MAX_SAFE_INTEGER,
    },
  },
});
