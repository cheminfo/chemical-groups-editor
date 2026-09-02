import type { GroupOcl } from 'chemical-groups';
import { Molecule } from 'openchemlib';

/**
 * `R`, `R1`, `R2`, … are the attachment points of a group. They are real atoms
 * of the structure but they are not part of the molecular formula.
 */
const R_ATOM = /^R\d*$/;

/** Matches `R`, `R1`, `R2` in a formula but not `Ru`, `Rh`, `Rn`, … */
const R_IN_FORMULA = /R\d*(?![a-z])/g;

/**
 * Rebuild the openchemlib molecule of a group.
 * @param ocl - Structure of the group, as stored in `groups.ts`.
 * @returns The molecule, with its 2D coordinates when the group carries some.
 */
export function moleculeFromOcl(ocl: GroupOcl): Molecule {
  return ocl.coordinates
    ? Molecule.fromIDCode(ocl.value, ocl.coordinates)
    : Molecule.fromIDCode(ocl.value);
}

/**
 * Split the `idcode coordinates` string returned by the canvas editor.
 * @param idcodeAndCoordinates - Idcode and 2D coordinates, separated by a space.
 * @returns The structure, carrying `coordinates` only when the string has some.
 */
export function oclFromIdcode(idcodeAndCoordinates: string): GroupOcl {
  const [value = '', coordinates] = idcodeAndCoordinates.split(' ');
  return coordinates ? { value, coordinates } : { value };
}

/**
 * Molecular formula of a structure, ignoring the R attachment points, which is
 * what the `mf` field of a group must contain.
 * @param ocl - Structure of the group.
 * @returns The molecular formula of the structure, R atoms excluded.
 */
export function getMfFromStructure(ocl: GroupOcl): string {
  const molecule = moleculeFromOcl(ocl);
  const formula = molecule.getMolecularFormula().formula;
  return formula.replaceAll(R_IN_FORMULA, '');
}

/**
 * Number of R attachment points of a structure. A group is a monoradical when
 * it has one, a diradical when it has two, …
 * @param ocl - Structure of the group.
 * @returns The number of `R`, `R1`, `R2`, … atoms of the structure.
 */
export function countRAtoms(ocl: GroupOcl): number {
  const molecule = moleculeFromOcl(ocl);
  let count = 0;
  for (let atom = 0; atom < molecule.getAllAtoms(); atom++) {
    if (R_ATOM.test(molecule.getAtomLabel(atom))) count++;
  }
  return count;
}
