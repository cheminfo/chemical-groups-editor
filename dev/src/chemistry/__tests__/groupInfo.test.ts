import type { Group } from 'chemical-groups';
import { groupsObject } from 'chemical-groups';
import { expect, test } from 'vitest';

import {
  canonicalMf,
  createGroup,
  getDerivedInfo,
  isValidMf,
  updateGroup,
} from '../groupInfo.ts';
import { analyzeGroup } from '../validate.ts';

const ALANINE_KEYS = [
  'symbol',
  'name',
  'mf',
  'kind',
  'oneLetter',
  'alternativeOneLetter',
  'ocl',
  'mass',
  'monoisotopicMass',
  'unsaturation',
  'elements',
];

test('getDerivedInfo gives the numbers stored in the data', () => {
  expect(getDerivedInfo('C3H5NO')).toStrictEqual({
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
  expect(getDerivedInfo('C6H11N4O')).toStrictEqual({
    mass: 155.1779814451265,
    monoisotopicMass: 155.09328599182,
    unsaturation: 5,
    elements: [
      { symbol: 'C', number: 6 },
      { symbol: 'H', number: 11 },
      { symbol: 'N', number: 4 },
      { symbol: 'O', number: 1 },
    ],
  });
});

test('getDerivedInfo reports an unknown unsaturation as null', () => {
  const selenouridine = getDerivedInfo('C10H14N3O7PSe');

  expect(selenouridine.unsaturation).toBeNull();
  expect(selenouridine.mass).toBe(398.1676241841323);
  expect(selenouridine.monoisotopicMass).toBe(398.97345859992004);
});

test('getDerivedInfo matches the fields already stored in a group', () => {
  for (const symbol of ['Ala', 'Argp', 'Msu', 'Ph', 'Xle']) {
    const { mass, monoisotopicMass, unsaturation, elements } =
      groupBySymbol(symbol);

    expect(getDerivedInfo(groupBySymbol(symbol).mf)).toStrictEqual({
      mass,
      monoisotopicMass,
      unsaturation,
      elements,
    });
  }
});

test('canonicalMf sorts with the Hill system and names the isotopes', () => {
  expect(canonicalMf('HOCH3')).toBe('CH4O');
  expect(canonicalMf('CH3D')).toBe('CH3[2H]');
  expect(canonicalMf('C6H5')).toBe('C6H5');
});

test('isValidMf accepts a formula that parses', () => {
  expect(isValidMf('C3H5NO')).toBe(true);
  expect(isValidMf('CH3D')).toBe(true);
});

test('isValidMf rejects an unbalanced parenthesis', () => {
  expect(isValidMf('((')).toBe(false);
  expect(isValidMf('C6H5)')).toBe(false);
});

test('updateGroup recomputes the derived fields when the mf changes', () => {
  const alanine = groupBySymbol('Ala');
  const updated = updateGroup(alanine, { mf: 'C6H6' });

  expect(updated).toStrictEqual({
    ...alanine,
    mf: 'C6H6',
    mass: 78.11205990474615,
    monoisotopicMass: 78.04695019338,
    unsaturation: 6,
    elements: [
      { symbol: 'C', number: 6 },
      { symbol: 'H', number: 6 },
    ],
  });
  expect(Object.keys(updated)).toStrictEqual(ALANINE_KEYS);
});

test('updateGroup keeps the derived fields when the mf is unchanged', () => {
  const stale: Group = { ...groupBySymbol('Ala'), mass: 42, unsaturation: 99 };
  const renamed = updateGroup(stale, { name: 'Renamed', mf: stale.mf });

  expect(renamed.name).toBe('Renamed');
  expect(renamed.mass).toBe(42);
  expect(renamed.unsaturation).toBe(99);
  expect(renamed.monoisotopicMass).toBe(71.03711378515);
});

test('updateGroup keeps the previous numbers while the mf is unparsable', () => {
  const alanine = groupBySymbol('Ala');

  expect(updateGroup(alanine, { mf: '((' })).toStrictEqual({
    ...alanine,
    mf: '((',
  });
});

test('updateGroup drops an optional field that was emptied', () => {
  const withoutAlternative = updateGroup(groupBySymbol('Ala'), {
    alternativeOneLetter: '',
  });

  expect(withoutAlternative.alternativeOneLetter).toBeUndefined();
  expect(Object.keys(withoutAlternative)).toStrictEqual([
    'symbol',
    'name',
    'mf',
    'kind',
    'oneLetter',
    'ocl',
    'mass',
    'monoisotopicMass',
    'unsaturation',
    'elements',
  ]);
});

test('updateGroup drops the toVerify flag once it is unset', () => {
  const statine = groupBySymbol('Stap');

  expect(statine.toVerify).toBe(true);

  const verified = updateGroup(statine, { toVerify: false });

  expect(verified.toVerify).toBeUndefined();
  expect(Object.keys(verified)).toStrictEqual([
    'symbol',
    'name',
    'mf',
    'ocl',
    'mass',
    'monoisotopicMass',
    'unsaturation',
    'elements',
  ]);
  expect(verified.mf).toBe(statine.mf);
  expect(verified.mass).toBe(statine.mass);
});

test('createGroup builds a group whose fields match its formula', () => {
  const created = createGroup('Xx');

  expect(created).toStrictEqual({
    symbol: 'Xx',
    name: 'New group',
    mf: 'CH2',
    ocl: { value: 'eMACqWEIh@', coordinates: '!B_vq?Dp' },
    mass: 14.026617404846803,
    monoisotopicMass: 14.01565006446,
    unsaturation: 0,
    elements: [
      { symbol: 'C', number: 1 },
      { symbol: 'H', number: 2 },
    ],
  });

  const { mf, mass, monoisotopicMass, unsaturation, elements } = created;

  expect({ mass, monoisotopicMass, unsaturation, elements }).toStrictEqual(
    getDerivedInfo(mf),
  );
  expect(Object.keys(created)).toStrictEqual([
    'symbol',
    'name',
    'mf',
    'ocl',
    'mass',
    'monoisotopicMass',
    'unsaturation',
    'elements',
  ]);
});

test('createGroup builds a group the editor reports as valid', () => {
  const analysis = analyzeGroup(createGroup('Xx'));

  expect(analysis.issues).toStrictEqual([]);
  expect(analysis.rAtoms).toBe(2);
  expect(analysis.mfFromStructure).toBe('CH2');
  expect(analysis.mfMatches).toBe(true);
});

/**
 * Group of the published data, so that the checks run against the real numbers
 * instead of a copy that could drift.
 * @param symbol - Symbol of the group.
 * @returns The group carrying that symbol.
 */
function groupBySymbol(symbol: string): Group {
  const group = groupsObject[symbol];
  if (!group) throw new Error(`no group with the symbol ${symbol}`);
  return group;
}
