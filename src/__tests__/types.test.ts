import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { expect, test } from 'vitest';

import { resolveGroupsFile } from '../../server/groupsFile.ts';

/**
 * The editor carries its own copy of the types so that it installs and runs
 * without the library checkout. The two copies must stay identical: the editor
 * writes the file the library declares.
 */
const libraryTypes = join(dirname(resolveGroupsFile()), 'types.ts');
const skipWithoutLibrary = {
  skip: Boolean(process.env.CHEMICAL_GROUPS_FILE) || !existsSync(libraryTypes),
};

test('types.ts is the one the library declares', skipWithoutLibrary, () => {
  const own = readFileSync(join(import.meta.dirname, '..', 'types.ts'), 'utf8');

  expect(readFileSync(libraryTypes, 'utf8')).toBe(own);
});
