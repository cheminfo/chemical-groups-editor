import { readFileSync, renameSync, writeFileSync } from 'node:fs';

import type { Group } from 'chemical-groups';

/**
 * `src/groups.ts` is this header, then the whole list of groups as compact JSON
 * on a single line, then this footer. The file is in `.prettierignore` and in
 * the eslint ignores so that it keeps that layout and an untouched group
 * produces no diff.
 */
const HEADER = `import type { Group } from './types.ts';

export const groups: Group[] = `;
const FOOTER = ';\n';

/**
 * Parse the groups out of `src/groups.ts`.
 * @param filePath - Absolute path of `groups.ts`.
 * @returns The groups it contains.
 */
export function readGroups(filePath: string): Group[] {
  const content = readFileSync(filePath, 'utf8');
  if (!content.startsWith(HEADER) || !content.endsWith(FOOTER)) {
    throw new Error(`${filePath} does not have the expected layout`);
  }
  const json = content.slice(HEADER.length, content.length - FOOTER.length);
  return JSON.parse(json) as Group[];
}

/**
 * Write the groups back to `src/groups.ts`, keeping the exact original layout
 * so that untouched entries produce no diff.
 * @param filePath - Absolute path of `groups.ts`.
 * @param groups - Complete list of groups to serialize.
 * @returns The number of groups written.
 */
export function writeGroups(filePath: string, groups: unknown): number {
  const checked = checkGroups(groups);
  const temporaryPath = `${filePath}.tmp`;
  writeFileSync(temporaryPath, HEADER + JSON.stringify(checked) + FOOTER);
  renameSync(temporaryPath, filePath);
  return checked.length;
}

function checkGroups(groups: unknown): Group[] {
  if (!Array.isArray(groups)) {
    throw new Error('groups must be an array');
  }
  if (groups.length === 0) {
    throw new Error('groups must not be empty');
  }
  for (let i = 0; i < groups.length; i++) {
    const group = groups[i] as Group;
    if (typeof group !== 'object' || group === null) {
      throw new Error(`group ${i} is not an object`);
    }
    for (const key of ['symbol', 'name', 'mf'] as const) {
      if (typeof group[key] !== 'string' || group[key] === '') {
        throw new Error(`group ${i} has no ${key}`);
      }
    }
  }
  return groups as Group[];
}
