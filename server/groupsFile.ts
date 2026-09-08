import {
  closeSync,
  existsSync,
  openSync,
  readFileSync,
  readSync,
  renameSync,
  writeFileSync,
} from 'node:fs';
import { resolve } from 'node:path';

import type { Group } from '../src/types.ts';

/**
 * `groups.ts` is this header, then the whole list of groups as compact JSON on
 * a single line, then this footer. The file is in the prettier and the eslint
 * ignores of the library so that it keeps that layout and an untouched group
 * produces no diff.
 */
const HEADER_JS = `import type { Group } from './types.js';

export const groups: Group[] = `;

/**
 * The same file with the extension a repository that runs its sources uses.
 * Both are read, and a file is written back with the one it already carries, so
 * that neither convention breaks the editor.
 */
const HEADER_TS = `import type { Group } from './types.ts';

export const groups: Group[] = `;

const HEADERS = [HEADER_JS, HEADER_TS];
const FOOTER = ';\n';

/** Path of the library, relative to the root of this repository. */
const SIBLING_PATH = [
  '..',
  'mass-tools',
  'packages',
  'chemical-groups',
  'src',
  'groups.ts',
];

/**
 * Absolute path of the `groups.ts` this editor reads and writes: the library of
 * a `mass-tools` checkout sitting next to this repository, unless
 * `CHEMICAL_GROUPS_FILE` names another file.
 * @param repositoryRoot - Root of this repository, deduced from this file by
 * default.
 * @returns The absolute path of the file to edit.
 */
export function resolveGroupsFile(
  repositoryRoot: string = resolve(import.meta.dirname, '..'),
): string {
  const override = process.env.CHEMICAL_GROUPS_FILE;
  if (override) return resolve(override);
  return resolve(repositoryRoot, ...SIBLING_PATH);
}

/**
 * Parse the groups out of `groups.ts`.
 * @param filePath - Absolute path of `groups.ts`.
 * @returns The groups it contains.
 */
export function readGroups(filePath: string): Group[] {
  if (!existsSync(filePath)) {
    throw new Error(
      `${filePath} does not exist. Check out cheminfo/mass-tools next to this repository, or set CHEMICAL_GROUPS_FILE to the groups.ts to edit.`,
    );
  }
  const content = readFileSync(filePath, 'utf8');
  const header = HEADERS.find((candidate) => content.startsWith(candidate));
  if (!header || !content.endsWith(FOOTER)) {
    throw new Error(`${filePath} does not have the expected layout`);
  }
  const json = content.slice(header.length, content.length - FOOTER.length);
  return JSON.parse(json) as Group[];
}

/**
 * Write the groups back to `groups.ts`, keeping the exact original layout so
 * that untouched entries produce no diff.
 * @param filePath - Absolute path of `groups.ts`.
 * @param groups - Complete list of groups to serialize.
 * @returns The number of groups written.
 */
export function writeGroups(filePath: string, groups: unknown): number {
  const checked = checkGroups(groups);
  const temporaryPath = `${filePath}.tmp`;
  writeFileSync(
    temporaryPath,
    headerOf(filePath) + JSON.stringify(checked) + FOOTER,
  );
  renameSync(temporaryPath, filePath);
  return checked.length;
}

function headerOf(filePath: string): string {
  if (existsSync(filePath)) {
    const start = readStart(filePath, HEADER_JS.length);
    const header = HEADERS.find((candidate) => start.startsWith(candidate));
    if (header) return header;
  }
  return HEADER_JS;
}

function readStart(filePath: string, length: number): string {
  const file = openSync(filePath, 'r');
  try {
    const buffer = Buffer.alloc(length);
    const read = readSync(file, buffer, 0, length, 0);
    return buffer.toString('utf8', 0, read);
  } finally {
    closeSync(file);
  }
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
