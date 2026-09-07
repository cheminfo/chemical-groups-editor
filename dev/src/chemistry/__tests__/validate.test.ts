import type { Group } from 'chemical-groups';
import { groupsObject } from 'chemical-groups';
import { expect, test } from 'vitest';

import { analyzeGroup, getDuplicateSymbols, getIssues } from '../validate.ts';

/** Benzene: a whole molecule, so it carries no attachment point. */
const BENZENE_IDCODE = 'gFp@DiTt@@@';

const ALANINE_DERIVED = {
  mass: 71.07801959624871,
  monoisotopicMass: 71.03711378515,
  unsaturation: 2,
  elements: [
    { symbol: 'C', number: 3 },
    { symbol: 'H', number: 5 },
    { symbol: 'N', number: 1 },
    { symbol: 'O', number: 1 },
  ],
};

test('a group of the data has no issue', () => {
  expect(analyzeGroup(groupBySymbol('Ala'))).toStrictEqual({
    issues: [],
    mfFromStructure: 'C3H5NO',
    mfMatches: true,
    derived: ALANINE_DERIVED,
    rAtoms: 2,
  });
});

test('analyzeGroup returns the same analysis for the same group', () => {
  const arginine = groupBySymbol('Argp');

  expect(analyzeGroup(arginine)).toBe(analyzeGroup(arginine));
});

test('a wrong mass is an error naming the field and both values', () => {
  const analysis = analyzeGroup({ ...groupBySymbol('Ala'), mass: 42 });

  expect(analysis.issues).toStrictEqual([
    {
      level: 'error',
      message: 'mass is 42 but C3H5NO gives 71.07801959624871',
    },
  ]);
  expect(analysis.mfMatches).toBe(true);
});

test('a wrong monoisotopic mass is an error of its own', () => {
  expect(
    analyzeGroup({ ...groupBySymbol('Ala'), monoisotopicMass: 71 }).issues,
  ).toStrictEqual([
    {
      level: 'error',
      message: 'monoisotopicMass is 71 but C3H5NO gives 71.03711378515',
    },
  ]);
});

test('a structure that disagrees with the mf is an error', () => {
  const analysis = analyzeGroup({
    ...groupBySymbol('Ala'),
    ocl: groupBySymbol('Ph').ocl,
  });

  expect(analysis.mfFromStructure).toBe('C6H5');
  expect(analysis.mfMatches).toBe(false);
  expect(analysis.rAtoms).toBe(1);
  expect(analysis.issues).toStrictEqual([
    {
      level: 'error',
      message: 'the structure gives C6H5 but mf is C3H5NO',
    },
  ]);
});

test('wrong elements are an error listing both sides', () => {
  expect(
    analyzeGroup({
      ...groupBySymbol('Ala'),
      elements: [{ symbol: 'C', number: 3 }],
    }).issues,
  ).toStrictEqual([
    {
      level: 'error',
      message: 'elements are C3 but C3H5NO gives C3 H5 N1 O1',
    },
  ]);
});

test('a oneLetter longer than one character is an error', () => {
  expect(
    analyzeGroup({ ...groupBySymbol('Ala'), oneLetter: 'Al' }).issues,
  ).toStrictEqual([
    { level: 'error', message: 'oneLetter must be one character' },
  ]);
});

test('a group without a structure gives the no structure warning', () => {
  expect(analyzeGroup(groupBySymbol('Xle'))).toStrictEqual({
    issues: [{ level: 'warning', message: 'no structure' }],
    mfFromStructure: null,
    mfMatches: false,
    derived: {
      mass: 113.15787181078912,
      monoisotopicMass: 113.08406397853,
      unsaturation: 2,
      elements: [
        { symbol: 'C', number: 6 },
        { symbol: 'H', number: 11 },
        { symbol: 'N', number: 1 },
        { symbol: 'O', number: 1 },
      ],
    },
    rAtoms: 0,
  });
});

test('a group flagged toVerify gives the warning that asks for a check', () => {
  const toVerify = { ...groupBySymbol('Abu'), toVerify: true };
  const analysis = analyzeGroup(toVerify);

  expect(analysis.issues).toStrictEqual([
    {
      level: 'warning',
      message: 'the structure was generated and still has to be checked',
    },
  ]);
  expect(analysis.mfFromStructure).toBe('C4H7NO');
  expect(analysis.rAtoms).toBe(2);
});

test('a structure without an R atom gives a warning', () => {
  const analysis = analyzeGroup({
    symbol: 'Bnz',
    name: 'Benzene',
    mf: 'C6H6',
    ocl: { value: BENZENE_IDCODE },
    mass: 78.11205990474615,
    monoisotopicMass: 78.04695019338,
    unsaturation: 6,
    elements: [
      { symbol: 'C', number: 6 },
      { symbol: 'H', number: 6 },
    ],
  });

  expect(analysis.issues).toStrictEqual([
    {
      level: 'warning',
      message: 'the structure has no R attachment point',
    },
  ]);
  expect(analysis.mfFromStructure).toBe('C6H6');
  expect(analysis.rAtoms).toBe(0);
});

test('a group without a name gives a warning', () => {
  expect(
    analyzeGroup({ ...groupBySymbol('Ala'), name: '' }).issues,
  ).toStrictEqual([{ level: 'warning', message: 'no name' }]);
});

test('getDuplicateSymbols only reports a symbol used twice', () => {
  const alanine = groupBySymbol('Ala');
  const glycine = groupBySymbol('Gly');

  expect(getDuplicateSymbols([alanine, glycine])).toStrictEqual(
    new Set<string>(),
  );
  expect(
    getDuplicateSymbols([alanine, glycine, { ...alanine, name: 'A copy' }]),
  ).toStrictEqual(new Set(['Ala']));
});

test('getIssues prepends the duplicate symbol error', () => {
  const duplicates = new Set(['Ala']);

  expect(getIssues(groupBySymbol('Ala'), duplicates)).toStrictEqual([
    { level: 'error', message: 'the symbol Ala is used twice' },
  ]);
  expect(getIssues(groupBySymbol('Gly'), duplicates)).toStrictEqual([]);
  expect(getIssues(groupBySymbol('Xle'), duplicates)).toStrictEqual([
    { level: 'warning', message: 'no structure' },
  ]);
});

/**
 * Group of the published data, so that the checks run against the real groups
 * instead of a copy that could drift.
 * @param symbol - Symbol of the group.
 * @returns The group carrying that symbol.
 */
function groupBySymbol(symbol: string): Group {
  const group = groupsObject[symbol];
  if (!group) throw new Error(`no group with the symbol ${symbol}`);
  return group;
}
