import type { Group, GroupElement } from 'chemical-groups';
import { MF } from 'mf-parser';

import { GROUP_KEYS } from '../groupKeys.ts';

export interface DerivedInfo {
  mass: number;
  monoisotopicMass: number;
  /** Number of missing hydrogens, twice the double bond equivalent */
  unsaturation: number | null;
  elements: GroupElement[];
}

/**
 * Compute the fields of a group that only depend on its molecular formula.
 * The formulas are the same as the ones of the cheminfo view that used to
 * generate `groups.ts`, in particular `unsaturation` is stored as the number
 * of missing hydrogens rather than as the double bond equivalent.
 * @param mf - Molecular formula, without the R atoms.
 * @returns The mass, the monoisotopic mass, the unsaturation and the elements
 * of the formula.
 */
export function getDerivedInfo(mf: string): DerivedInfo {
  const parsed = new MF(mf);
  const info = parsed.getInfo();
  return {
    mass: info.mass,
    monoisotopicMass: info.monoisotopicMass,
    unsaturation:
      info.unsaturation === undefined ? null : (info.unsaturation - 1) * 2,
    elements: parsed.getElements(),
  };
}

/**
 * Rewrite a molecular formula the way it is stored in `groups.ts`: atoms sorted
 * with the Hill system and isotopes written `[2H]` instead of `D`.
 * @param mf - Molecular formula to rewrite.
 * @returns The same formula, in the form used in `groups.ts`.
 */
export function canonicalMf(mf: string): string {
  return new MF(mf).toMF();
}

/**
 * Whether a molecular formula can be parsed, and therefore displayed.
 * @param mf - Molecular formula to parse.
 * @returns `true` when the formula is parsable.
 */
export function isValidMf(mf: string): boolean {
  try {
    new MF(mf).toParts();
    return true;
  } catch {
    return false;
  }
}

/**
 * Apply a change to a group, keeping the derived fields in sync with the
 * molecular formula and the keys in the order used in `groups.ts`.
 * @param group - Group to update.
 * @param changes - Fields to overwrite.
 * @returns A new group carrying the changes, its derived fields recomputed when
 * the formula changed, and its keys in the order of `groups.ts`.
 */
export function updateGroup(group: Group, changes: Partial<Group>): Group {
  const updated: Group = { ...group, ...changes };
  if (changes.mf !== undefined && changes.mf !== group.mf) {
    try {
      Object.assign(updated, getDerivedInfo(changes.mf));
    } catch {
      // an invalid formula is reported by the validation, the previous derived
      // values are kept until it becomes parsable again
    }
  }
  return orderKeys(updated);
}

/** A `CH2` carrying the two attachment points of a diradical, `R1` and `R2`. */
const NEW_GROUP_OCL = { value: 'eMACqWEIh@', coordinates: '!B_vq?Dp' };

/**
 * Create a new group, ready to be edited.
 * @param symbol - Symbol of the new group.
 * @returns A group with a `CH2` formula, its structure and its derived fields.
 */
export function createGroup(symbol: string): Group {
  return orderKeys({
    symbol,
    name: 'New group',
    mf: 'CH2',
    ocl: { ...NEW_GROUP_OCL },
    ...getDerivedInfo('CH2'),
  });
}

function orderKeys(group: Group): Group {
  const ordered: Partial<Group> = {};
  for (const key of GROUP_KEYS) {
    const value = group[key];
    // an empty string or a false flag is dropped instead of being written
    if (value !== undefined && value !== '' && value !== false) {
      Object.assign(ordered, { [key]: value });
    }
  }
  return ordered as Group;
}
