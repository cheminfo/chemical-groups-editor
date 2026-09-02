import type { Group, GroupOcl } from 'chemical-groups';
import { groupsObject } from 'chemical-groups';
import { expect, test } from 'vitest';

import {
  countRAtoms,
  getMfFromStructure,
  moleculeFromOcl,
  oclFromIdcode,
} from '../structure.ts';

const ACETYL_IDCODE = 'gCaHDEeIi`@';
const ACETYL_COORDINATES = '!BbOq~@Ha}';

test('getMfFromStructure drops the R attachment points', () => {
  expect(getMfFromStructure(oclOf('Acet'))).toBe('C2H3O');
  expect(getMfFromStructure(oclOf('Ala'))).toBe('C3H5NO');
  expect(getMfFromStructure(oclOf('Argp'))).toBe('C6H11N4O');
});

test('getMfFromStructure gives back the stored formula', () => {
  for (const symbol of ['Acet', 'Ala', 'Argp', 'Bz', 'Gly', 'Msu']) {
    expect(getMfFromStructure(oclOf(symbol))).toBe(groupBySymbol(symbol).mf);
  }
});

test('openchemlib still writes the R atoms in its own formula', () => {
  expect(moleculeFromOcl(oclOf('Acet')).getMolecularFormula().formula).toBe(
    'C2H3OR',
  );
  expect(moleculeFromOcl(oclOf('Ala')).getMolecularFormula().formula).toBe(
    'C3H5NOR1R2',
  );
  expect(moleculeFromOcl(oclOf('Argp')).getMolecularFormula().formula).toBe(
    'C6H11N4OR1R2R3',
  );
});

test('countRAtoms counts the attachment points', () => {
  expect(countRAtoms(oclOf('Acet'))).toBe(1);
  expect(countRAtoms(oclOf('Ala'))).toBe(2);
  expect(countRAtoms(oclOf('Argp'))).toBe(3);
  expect(countRAtoms(oclOf('Pqb'))).toBe(0);
});

test('moleculeFromOcl rebuilds the atoms and the bonds', () => {
  const molecule = moleculeFromOcl(oclOf('Ala'));

  expect(molecule.getAllAtoms()).toBe(7);
  expect(molecule.getAllBonds()).toBe(6);

  const labels: string[] = [];
  for (let atom = 0; atom < molecule.getAllAtoms(); atom++) {
    labels.push(molecule.getAtomLabel(atom));
  }

  expect(labels).toStrictEqual(['R2', 'C', 'O', 'C', 'N', 'C', 'R1']);
});

test('moleculeFromOcl keeps the stored coordinates', () => {
  const alanine = oclOf('Ala');

  expect(moleculeFromOcl(alanine).getIDCodeAndCoordinates()).toStrictEqual({
    idCode: alanine.value,
    coordinates: alanine.coordinates,
  });
});

test('moleculeFromOcl lays the atoms out when there are no coordinates', () => {
  const acetyl = oclOf('Acet');

  expect(acetyl).toStrictEqual({
    value: ACETYL_IDCODE,
    coordinates: ACETYL_COORDINATES,
  });
  expect(
    moleculeFromOcl({ value: acetyl.value }).getIDCodeAndCoordinates(),
  ).toStrictEqual({ idCode: ACETYL_IDCODE, coordinates: '!Bb@K~@Hc}' });
});

test('oclFromIdcode splits the idcode from the coordinates', () => {
  expect(oclFromIdcode(`${ACETYL_IDCODE} ${ACETYL_COORDINATES}`)).toStrictEqual(
    {
      value: ACETYL_IDCODE,
      coordinates: ACETYL_COORDINATES,
    },
  );
});

test('oclFromIdcode omits the coordinates when the canvas gives none', () => {
  expect(oclFromIdcode(ACETYL_IDCODE)).toStrictEqual({
    value: ACETYL_IDCODE,
  });
  expect(oclFromIdcode('')).toStrictEqual({ value: '' });
});

test('oclFromIdcode rebuilds the stored structure of a group', () => {
  const arginine = oclOf('Argp');

  expect(
    oclFromIdcode(`${arginine.value} ${arginine.coordinates}`),
  ).toStrictEqual(arginine);
});

/**
 * Group of the published data, so that the checks run against the real
 * structures instead of a copy that could drift.
 * @param symbol - Symbol of the group.
 * @returns The group carrying that symbol.
 */
function groupBySymbol(symbol: string): Group {
  const group = groupsObject[symbol];
  if (!group) throw new Error(`no group with the symbol ${symbol}`);
  return group;
}

/**
 * Structure of a group of the published data.
 * @param symbol - Symbol of the group.
 * @returns The idcode and the coordinates of that group.
 */
function oclOf(symbol: string): GroupOcl {
  const { ocl } = groupBySymbol(symbol);
  if (!ocl) throw new Error(`the group ${symbol} has no structure`);
  return ocl;
}
