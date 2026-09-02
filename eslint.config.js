import { defineConfig, globalIgnores } from 'eslint/config';
// `/base` is the react layer alone; the default export also brings the plain
// JavaScript config, which the typescript one already covers.
import react from 'eslint-config-cheminfo-react/base';
import ts from 'eslint-config-cheminfo-typescript';

export default defineConfig(
  // `src/groups.ts` is a single line of generated JSON, see `.prettierignore`.
  globalIgnores(['coverage', 'dev/dist', 'lib', 'src/groups.ts']),
  ts,
  {
    files: ['dev/**'],
    extends: [react],
  },
);
