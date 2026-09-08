import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { afterAll, expect, test, vi } from 'vitest';

import type { Group } from '../../src/types.ts';
import { readGroups, resolveGroupsFile, writeGroups } from '../groupsFile.ts';

const realGroupsPath = resolveGroupsFile();
/** The library of a sibling `mass-tools` checkout, absent from a lone clone. */
const skipWithoutLibrary = {
  skip:
    Boolean(process.env.CHEMICAL_GROUPS_FILE) || !existsSync(realGroupsPath),
};

const HEADER = `import type { Group } from './types.js';

export const groups: Group[] = `;
const HEADER_TS = `import type { Group } from './types.ts';

export const groups: Group[] = `;
const FOOTER = ';\n';

const temporaryDirectory = mkdtempSync(join(tmpdir(), 'chemical-groups-'));

afterAll(() => {
  rmSync(temporaryDirectory, { force: true, recursive: true });
});

function temporaryFile(name: string): string {
  return join(temporaryDirectory, name);
}

function minimalGroup(symbol: string): Group {
  return {
    symbol,
    name: `${symbol} group`,
    mf: 'CH2',
    mass: 14.0266,
    monoisotopicMass: 14.0157,
    unsaturation: 2,
    elements: [
      { symbol: 'C', number: 1 },
      { symbol: 'H', number: 2 },
    ],
  };
}

function messageOf(run: () => unknown): string {
  try {
    run();
  } catch (error) {
    return (error as Error).message;
  }
  throw new Error('the call was expected to throw and did not');
}

test('resolveGroupsFile points at the library of the sibling checkout', () => {
  vi.stubEnv('CHEMICAL_GROUPS_FILE', undefined);

  expect(resolveGroupsFile(join('/tmp', 'chemical-groups-editor'))).toBe(
    join(
      '/tmp',
      'mass-tools',
      'packages',
      'chemical-groups',
      'src',
      'groups.ts',
    ),
  );

  vi.unstubAllEnvs();
});

test('CHEMICAL_GROUPS_FILE names the file to edit instead', () => {
  vi.stubEnv('CHEMICAL_GROUPS_FILE', join('elsewhere', 'groups.ts'));

  expect(resolveGroupsFile(join('/tmp', 'chemical-groups-editor'))).toBe(
    resolve('elsewhere', 'groups.ts'),
  );

  vi.unstubAllEnvs();
});

test('readGroups says where it looked when the file is missing', () => {
  const target = temporaryFile('missing.ts');

  expect(messageOf(() => readGroups(target))).toBe(
    `${target} does not exist. Check out cheminfo/mass-tools next to this repository, or set CHEMICAL_GROUPS_FILE to the groups.ts to edit.`,
  );
});

test('readGroups parses the real groups.ts', skipWithoutLibrary, () => {
  const groups = readGroups(realGroupsPath);

  expect(groups.length).toBeGreaterThan(250);
  expect(groups.at(0)?.symbol).toBe('Abu');

  const alanine = groups.find((group) => group.symbol === 'Ala');

  expect(alanine).toStrictEqual({
    symbol: 'Ala',
    name: 'Alanine diradical',
    mf: 'C3H5NO',
    kind: 'aa',
    oneLetter: 'A',
    alternativeOneLetter: 'α',
    ocl: {
      value: 'gNyDBaxmqR[fZjZ@',
      coordinates: '!BbOr~@H`}bOr~Wxb}',
    },
    mass: 71.07801959624871,
    monoisotopicMass: 71.03711378515,
    unsaturation: 2,
    elements: [
      { symbol: 'C', number: 3 },
      { symbol: 'H', number: 5 },
      { symbol: 'N', number: 1 },
      { symbol: 'O', number: 1 },
    ],
  });
});

test(
  'writeGroups reproduces groups.ts byte for byte',
  skipWithoutLibrary,
  () => {
    const target = temporaryFile('round-trip.ts');
    writeGroups(target, readGroups(realGroupsPath));

    expect(readFileSync(target, 'utf8')).toBe(
      readFileSync(realGroupsPath, 'utf8'),
    );
  },
);

test(
  'writeGroups returns the number of groups written',
  skipWithoutLibrary,
  () => {
    const groups = readGroups(realGroupsPath);

    expect(writeGroups(temporaryFile('count-all.ts'), groups)).toBe(
      groups.length,
    );
    expect(
      writeGroups(temporaryFile('count-two.ts'), [
        minimalGroup('Me'),
        minimalGroup('Et'),
      ]),
    ).toBe(2);
  },
);

test('writeGroups keeps the layout and leaves no temporary file behind', () => {
  const target = temporaryFile('atomic.ts');
  const groups = [minimalGroup('Me')];
  writeGroups(target, groups);

  expect(existsSync(`${target}.tmp`)).toBe(false);
  expect(readFileSync(target, 'utf8')).toBe(
    `${HEADER}${JSON.stringify(groups)}${FOOTER}`,
  );
});

test('readGroups accepts both the .js and the .ts types specifier', () => {
  const groups = [minimalGroup('Me')];
  const target = temporaryFile('types-ts.ts');
  writeFileSync(target, `${HEADER_TS}${JSON.stringify(groups)}${FOOTER}`);

  expect(readGroups(target)).toStrictEqual(groups);
});

test('writeGroups keeps the specifier the file already carries', () => {
  const target = temporaryFile('keep-types-ts.ts');
  writeFileSync(
    target,
    `${HEADER_TS}${JSON.stringify([minimalGroup('Me')])}${FOOTER}`,
  );

  const edited = [minimalGroup('Et')];
  writeGroups(target, edited);

  expect(readFileSync(target, 'utf8')).toBe(
    `${HEADER_TS}${JSON.stringify(edited)}${FOOTER}`,
  );
});

test('readGroups rejects a file that does not start with the header', () => {
  const target = temporaryFile('bad-header.ts');
  writeFileSync(target, `export const groups = [];${FOOTER}`);

  expect(messageOf(() => readGroups(target))).toBe(
    `${target} does not have the expected layout`,
  );
});

test('readGroups rejects a file that does not end with the footer', () => {
  const target = temporaryFile('bad-footer.ts');
  writeFileSync(target, `${HEADER}[]`);

  expect(messageOf(() => readGroups(target))).toBe(
    `${target} does not have the expected layout`,
  );
});

test('writeGroups rejects a payload that is not an array', () => {
  const target = temporaryFile('not-an-array.ts');

  expect(messageOf(() => writeGroups(target, { symbol: 'Me' }))).toBe(
    'groups must be an array',
  );
  expect(messageOf(() => writeGroups(target, null))).toBe(
    'groups must be an array',
  );
  expect(existsSync(target)).toBe(false);
  expect(existsSync(`${target}.tmp`)).toBe(false);
});

test('writeGroups rejects an empty array', () => {
  const target = temporaryFile('empty.ts');

  expect(messageOf(() => writeGroups(target, []))).toBe(
    'groups must not be empty',
  );
  expect(existsSync(target)).toBe(false);
});

test('writeGroups rejects an entry that is not an object', () => {
  const target = temporaryFile('not-an-object.ts');

  expect(messageOf(() => writeGroups(target, ['Me']))).toBe(
    'group 0 is not an object',
  );
  expect(messageOf(() => writeGroups(target, [minimalGroup('Me'), null]))).toBe(
    'group 1 is not an object',
  );
  expect(existsSync(target)).toBe(false);
});

test('writeGroups rejects an entry with a missing or empty symbol', () => {
  const target = temporaryFile('no-symbol.ts');

  expect(
    messageOf(() =>
      writeGroups(target, [{ ...minimalGroup('Me'), symbol: '' }]),
    ),
  ).toBe('group 0 has no symbol');

  const { symbol, ...withoutSymbol } = minimalGroup('Me');

  expect(symbol).toBe('Me');
  expect(
    messageOf(() =>
      writeGroups(target, [
        minimalGroup('Et'),
        withoutSymbol,
        minimalGroup('Pr'),
      ]),
    ),
  ).toBe('group 1 has no symbol');
  expect(existsSync(target)).toBe(false);
});

test('writeGroups rejects an entry with a missing or empty name', () => {
  const target = temporaryFile('no-name.ts');

  expect(
    messageOf(() => writeGroups(target, [{ ...minimalGroup('Me'), name: '' }])),
  ).toBe('group 0 has no name');

  const { name, ...withoutName } = minimalGroup('Me');

  expect(name).toBe('Me group');
  expect(messageOf(() => writeGroups(target, [withoutName]))).toBe(
    'group 0 has no name',
  );
  expect(existsSync(target)).toBe(false);
});

test('writeGroups rejects an entry with a missing or empty mf', () => {
  const target = temporaryFile('no-mf.ts');

  expect(
    messageOf(() => writeGroups(target, [{ ...minimalGroup('Me'), mf: '' }])),
  ).toBe('group 0 has no mf');

  const { mf, ...withoutMf } = minimalGroup('Me');

  expect(mf).toBe('CH2');
  expect(messageOf(() => writeGroups(target, [withoutMf]))).toBe(
    'group 0 has no mf',
  );
  expect(existsSync(target)).toBe(false);
});

test(
  'an edited group round-trips and leaves every other group untouched',
  skipWithoutLibrary,
  () => {
    const original = readGroups(realGroupsPath);
    const expectedChanged = original
      .filter((group) => group.symbol === 'Ph')
      .map((group) => ({ ...group, name: 'Phenyl, edited' }));

    expect(expectedChanged.map((group) => group.mf)).toStrictEqual(['C6H5']);

    const edited = original.map((group) =>
      group.symbol === 'Ph' ? { ...group, name: 'Phenyl, edited' } : group,
    );
    const target = temporaryFile('edited.ts');

    expect(writeGroups(target, edited)).toBe(original.length);

    const rereadGroups = readGroups(target);

    expect(rereadGroups).toHaveLength(original.length);

    const changed = rereadGroups.filter(
      (group, index) =>
        JSON.stringify(group) !== JSON.stringify(original[index]),
    );

    expect(changed).toStrictEqual(expectedChanged);

    expect(readFileSync(target, 'utf8')).toBe(
      readFileSync(realGroupsPath, 'utf8').replace(
        '"name":"Phenyl"',
        '"name":"Phenyl, edited"',
      ),
    );
  },
);
