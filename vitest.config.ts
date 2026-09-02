import { join } from 'node:path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    // The playground tests import the package the way the application does;
    // resolve it to the sources so that nothing has to be built first.
    alias: {
      'chemical-groups': join(import.meta.dirname, 'src', 'index.ts'),
    },
  },
  test: {
    coverage: {
      // Only the published library is measured; `dev` is a local playground
      // that is never packed. The include glob is unanchored, so it matches
      // `dev/src` too unless the playground is excluded.
      include: ['src/**/*.ts'],
      exclude: ['dev/**'],
      // openchemlib is loaded by the tests that check every structure of
      // `groups.ts`, and the v8 provider profiles it on every call.
      provider: 'istanbul',
    },
    snapshotFormat: {
      maxOutputLength: Number.MAX_SAFE_INTEGER,
    },
  },
});
